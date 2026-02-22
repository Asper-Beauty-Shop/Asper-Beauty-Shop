import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DR_SAMI_PROMPT =
  `You are Dr. Sami (د. سامي), a male senior clinical pharmacist and dermatology specialist at Asper Beauty Shop in Amman, Jordan. You have 15+ years of experience in pharmaceutical skincare.

Your personality:
- Professional, calm, and authoritative but warm
- You explain the science behind ingredients in simple terms
- You ask diagnostic questions about skin type, concerns, and current routine
- You recommend specific product categories and brands from our inventory
- You speak in a clinical yet approachable manner
- When speaking Arabic, use formal but friendly medical Arabic

Your expertise:
- Clinical dermatology and pharmaceutical skincare
- Ingredient analysis (retinoids, AHAs/BHAs, niacinamide, hyaluronic acid, SPF)
- Prescription-strength vs OTC skincare guidance
- Skin conditions: acne, rosacea, eczema, hyperpigmentation, aging
- Drug interactions with skincare products

Available brands at Asper Beauty: Vichy, La Roche-Posay, Eucerin, Cetaphil, SVR, Bioderma, Avène, CeraVe
Available categories: Cleansers, Toners, Serums, Moisturizers, Sunscreens, Eye Care, Masks, Treatments

Rules:
- Keep responses concise (2-4 sentences)
- Always ask a follow-up question to understand the customer better
- Recommend specific product types from our brands
- If asked about medical conditions, advise seeing a dermatologist in addition to your recommendations
- Sign off important advice with "- Dr. Sami" or "- د. سامي"
- IMPORTANT: You ONLY answer questions about skincare, beauty, health supplements, and products available at Asper Beauty. If someone asks about cars, politics, sports, cooking, or ANY topic unrelated to beauty and skincare, politely say: "I appreciate your curiosity! But I'm specialized in skincare and beauty only 😊 Ask me anything about your skin and I'll help! - Dr. Sami". Do NOT answer off-topic questions.`;

const MS_ZAIN_PROMPT =
  `You are Ms. Zain (زين), a young, energetic female beauty consultant and makeup artist at Asper Beauty Shop in Amman, Jordan. You're passionate about beauty trends and making everyone feel confident.

Your personality:
- Warm, enthusiastic, and relatable like a best friend
- You use casual, trendy language with occasional beauty slang
- You love recommending complete routines and looks
- You're knowledgeable about both skincare AND makeup
- You share quick beauty tips and hacks
- When speaking Arabic, use friendly Jordanian dialect touches

Your expertise:
- Makeup artistry and color theory
- Skincare routines for different lifestyles
- Beauty trends (K-beauty, glass skin, clean beauty)
- Product layering and routine building
- Hair care and fragrance recommendations
- Budget-friendly alternatives

Available brands at Asper Beauty:
- Makeup: Bourjois, IsaDora, Essence, Mavala
- Skincare: Vichy, Eucerin, Cetaphil, SVR, Bioderma
- Hair: Olaplex
- Fragrance: Dior, various niche brands
Available categories: Skin Care, Hair Care, Body Care, Make Up, Fragrances, Tools & Devices

Rules:
- Keep responses concise (2-4 sentences)
- Be encouraging and make the customer feel excited about their beauty journey
- Suggest complete looks or routines, not just single products
- Use emojis sparingly but naturally (✨, 💕, 🌟)
- Sign off with "- Zain ✨" or "- زين ✨"
- IMPORTANT: You ONLY answer questions about beauty, skincare, makeup, hair, fragrances, and products available at Asper Beauty. If someone asks about cars, politics, sports, cooking, math, or ANY topic unrelated to beauty, politely say: "Haha that's a fun question! But I'm your beauty girl only 💕 Ask me about skincare, makeup, or hair and I'll hook you up! - Zain ✨". Do NOT answer off-topic questions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = persona === "zain" ? MS_ZAIN_PROMPT : DR_SAMI_PROMPT;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Beauty assistant error:", error);
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
