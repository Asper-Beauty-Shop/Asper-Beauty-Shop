import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadCaptureRequest {
  contact_type: "email" | "phone";
  contact_value: string;
  chat_history: Array<{ role: string; content: string }>;
  recommended_products?: string[];
  concern?: string;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: LeadCaptureRequest = await req.json();
    const {
      contact_type,
      contact_value,
      chat_history,
      recommended_products,
      concern,
      source = "dr_rose_chat",
    } = body;

    if (!contact_type || !contact_value) {
      return new Response(
        JSON.stringify({ error: "Missing contact information" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate contact info
    if (contact_type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_value)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else if (contact_type === "phone") {
      const phoneRegex = /^(\+962|00962|0)?(7[789]\d{7})$/;
      if (!phoneRegex.test(contact_value.replace(/\s/g, ""))) {
        return new Response(
          JSON.stringify({ error: "Invalid Jordanian phone number" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Extract key concerns from chat history
    const extractedConcerns = extractConcernsFromChat(chat_history);

    // Extract product recommendations from chat
    const extractedProducts =
      recommended_products || extractProductsFromChat(chat_history);

    // Normalize phone number to international format
    let normalizedContact = contact_value;
    if (contact_type === "phone") {
      normalizedContact = normalizeJordanianPhone(contact_value);
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from("customer_leads")
      .select("id, interaction_count")
      .eq("contact_value", normalizedContact)
      .single();

    let result;

    if (existingLead) {
      // Update existing lead with new interaction
      const { data, error } = await supabase
        .from("customer_leads")
        .update({
          last_chat_history: chat_history,
          recommended_products: extractedProducts,
          concerns: extractedConcerns,
          interaction_count: existingLead.interaction_count + 1,
          last_interaction_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLead.id)
        .select()
        .single();

      if (error) throw error;
      result = { ...data, is_new: false };
    } else {
      // Create new lead
      const { data, error } = await supabase
        .from("customer_leads")
        .insert({
          contact_type,
          contact_value: normalizedContact,
          original_contact_value: contact_value,
          last_chat_history: chat_history,
          recommended_products: extractedProducts,
          concerns: extractedConcerns,
          source,
          status: "new",
          interaction_count: 1,
          first_interaction_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = { ...data, is_new: true };
    }

    console.log(
      `Lead captured: ${contact_type} - ${normalizedContact} (${result.is_new ? "new" : "returning"})`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: result.id,
        is_new: result.is_new,
        message: result.is_new
          ? "New lead captured successfully"
          : "Existing lead updated",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Lead capture error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function normalizeJordanianPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/-/g, "");

  if (cleaned.startsWith("+962")) {
    return cleaned;
  }
  if (cleaned.startsWith("00962")) {
    return "+" + cleaned.slice(2);
  }
  if (cleaned.startsWith("0")) {
    return "+962" + cleaned.slice(1);
  }
  if (cleaned.startsWith("7")) {
    return "+962" + cleaned;
  }

  return cleaned;
}

function extractConcernsFromChat(
  chatHistory: Array<{ role: string; content: string }>,
): string[] {
  const concerns: Set<string> = new Set();

  const concernKeywords: Record<string, string[]> = {
    acne: ["acne", "pimple", "breakout", "حب", "بثور", "حبوب"],
    "anti-aging": [
      "wrinkle",
      "aging",
      "fine line",
      "تجاعيد",
      "شيخوخة",
      "خطوط",
    ],
    hydration: ["dry", "hydrat", "moistur", "جفاف", "ترطيب", "جافة"],
    sensitivity: ["sensitive", "redness", "irritat", "حساس", "احمرار", "تهيج"],
    brightening: ["dark spot", "pigment", "bright", "تصبغ", "بقع", "تفتيح"],
    "sun-protection": ["sun", "spf", "uv", "شمس", "واقي"],
    "dark-circles": ["dark circle", "eye", "هالات", "عين"],
    hair: ["hair", "frizz", "damage", "شعر", "تقصف", "جفاف الشعر"],
  };

  const allText = chatHistory
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  for (const [concern, keywords] of Object.entries(concernKeywords)) {
    if (keywords.some((kw) => allText.includes(kw))) {
      concerns.add(concern);
    }
  }

  return Array.from(concerns);
}

function extractProductsFromChat(
  chatHistory: Array<{ role: string; content: string }>,
): string[] {
  const products: Set<string> = new Set();

  const brandPatterns = [
    "Eucerin",
    "La Roche-Posay",
    "Vichy",
    "CeraVe",
    "Bioderma",
    "Avène",
    "Kérastase",
    "Olaplex",
    "Cetaphil",
    "SVR",
    "يوسرين",
    "لاروش",
    "فيشي",
    "سيراف",
    "بيوديرما",
    "أفين",
  ];

  const assistantMessages = chatHistory
    .filter((m) => m.role === "assistant")
    .map((m) => m.content);

  for (const message of assistantMessages) {
    for (const brand of brandPatterns) {
      if (message.includes(brand)) {
        products.add(brand);
      }
    }

    const digitalTrayMatch = message.match(
      /Step \d[^:]*:\s*([^\n]+)|خطوة \d[^:]*:\s*([^\n]+)/gi,
    );
    if (digitalTrayMatch) {
      digitalTrayMatch.forEach((match) => {
        const product = match.replace(/Step \d[^:]*:\s*|خطوة \d[^:]*:\s*/i, "");
        if (product.trim()) {
          products.add(product.trim());
        }
      });
    }
  }

  return Array.from(products);
}
