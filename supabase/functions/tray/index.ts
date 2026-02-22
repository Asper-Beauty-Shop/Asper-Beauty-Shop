/**
 * Digital Tray Edge Function
 * ===========================
 * The "Head Pharmacist" - validates requests and returns curated skincare regimens.
 * 
 * Endpoint: GET /functions/v1/tray?concern=Concern_Acne
 * 
 * This function acts as the validation layer before touching the database,
 * ensuring the "3-Click Solution" delivers a clean, predictable Regimen Object.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Valid concern tags (matching the database enum)
const VALID_CONCERNS = [
  "Concern_Acne",
  "Concern_Hydration",
  "Concern_AntiAging",
  "Concern_Brightening",
  "Concern_Sensitivity",
  "Concern_SunProtection",
  "Concern_DarkCircles",
] as const;

type ValidConcern = typeof VALID_CONCERNS[number];

// Regimen step keys
type RegimenStep = "Step_1_Cleanser" | "Step_2_Treatment" | "Step_3_Protection";

// Step labels for the regimen (bilingual)
const STEP_LABELS: Record<RegimenStep, { en: string; ar: string }> = {
  Step_1_Cleanser: { en: "Cleanse", ar: "تنظيف" },
  Step_2_Treatment: { en: "Treat", ar: "علاج" },
  Step_3_Protection: { en: "Protect", ar: "حماية" },
};

// Database step to API step mapping
const DB_TO_API_STEP: Record<string, RegimenStep> = {
  "Step_1": "Step_1_Cleanser",
  "Step_2": "Step_2_Treatment",
  "Step_3": "Step_3_Protection",
};

// Concern display names (bilingual)
const CONCERN_LABELS: Record<ValidConcern, { en: string; ar: string }> = {
  Concern_Acne: { en: "Acne & Blemishes", ar: "حب الشباب والبقع" },
  Concern_Hydration: { en: "Hydration", ar: "الترطيب" },
  Concern_AntiAging: { en: "Anti-Aging", ar: "مكافحة الشيخوخة" },
  Concern_Brightening: { en: "Brightening", ar: "التفتيح والإشراق" },
  Concern_Sensitivity: { en: "Sensitivity", ar: "البشرة الحساسة" },
  Concern_SunProtection: { en: "Sun Protection", ar: "الحماية من الشمس" },
  Concern_DarkCircles: { en: "Dark Circles", ar: "الهالات السوداء" },
};

/**
 * Validates that the concern parameter is a valid skin concern
 */
function isValidConcern(concern: string | null): concern is ValidConcern {
  return concern !== null && VALID_CONCERNS.includes(concern as ValidConcern);
}

/**
 * Creates an error response with proper formatting
 */
function errorResponse(
  message: string,
  status: number,
  code: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        valid_concerns: VALID_CONCERNS,
      },
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Creates a fallback slot structure for unavailable products
 */
function createFallbackSlot(step: RegimenStep): Record<string, unknown> {
  return {
    available: false,
    step,
    step_label: STEP_LABELS[step],
    fallback_message: {
      en: "Specific treatment temporarily unavailable. Chat with us for a custom alternative.",
      ar: "العلاج المحدد غير متوفر مؤقتاً. تحدثي معنا للحصول على بديل مخصص.",
    },
    fallback_action: "open_chat",
  };
}

/**
 * Enriches a product slot with additional metadata
 */
function enrichProductSlot(
  product: Record<string, unknown>,
  step: RegimenStep
): Record<string, unknown> {
  return {
    available: true,
    ...product,
    step,
    step_label: STEP_LABELS[step],
  };
}

/**
 * Transforms the RPC response into the API response format
 */
function transformTrayResponse(
  trayData: Record<string, unknown>,
  concern: ValidConcern
): Record<string, unknown> {
  const concernLabel = CONCERN_LABELS[concern];

  // Process each step
  const regimen: Record<string, unknown> = {};

  for (const [dbStep, apiStep] of Object.entries(DB_TO_API_STEP)) {
    const stepKey = dbStep.toLowerCase(); // step_1, step_2, step_3
    const stepData = trayData[stepKey];

    if (stepData && stepData !== "null" && typeof stepData === "object") {
      regimen[apiStep] = enrichProductSlot(stepData as Record<string, unknown>, apiStep);
    } else {
      regimen[apiStep] = createFallbackSlot(apiStep);
    }
  }

  return {
    success: true,
    data: {
      concern: {
        key: concern,
        label: concernLabel,
      },
      regimen,
      generated_at: trayData.generated_at || new Date().toISOString(),
    },
    meta: {
      version: "1.0",
      cache_ttl: 300, // 5 minutes cache suggestion
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return errorResponse(
      "Method not allowed. Use GET request.",
      405,
      "METHOD_NOT_ALLOWED"
    );
  }

  try {
    // Parse URL and extract concern parameter
    const url = new URL(req.url);
    const concern = url.searchParams.get("concern");

    // ==================== INPUT VALIDATION ====================
    // Validate that concern parameter exists
    if (!concern) {
      return errorResponse(
        "Missing required parameter: concern",
        400,
        "MISSING_PARAMETER"
      );
    }

    // Validate that concern is a valid Medical Indication
    if (!isValidConcern(concern)) {
      return errorResponse(
        `Invalid Medical Indication: "${concern}". Must be one of: ${VALID_CONCERNS.join(", ")}`,
        400,
        "INVALID_MEDICAL_INDICATION"
      );
    }

    // ==================== DATABASE CALL ====================
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return errorResponse(
        "Service configuration error",
        500,
        "CONFIGURATION_ERROR"
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call the RPC function to get the tray
    console.log(`[tray] Fetching digital tray for concern: ${concern}`);

    const { data: trayData, error: rpcError } = await supabase.rpc(
      "get_tray_by_concern",
      { concern_tag: concern }
    );

    if (rpcError) {
      console.error("[tray] RPC error:", rpcError);
      return errorResponse(
        "Failed to retrieve regimen data",
        500,
        "DATABASE_ERROR"
      );
    }

    // ==================== PROCESS RESPONSE ====================
    // Transform the response into the API format
    const response = transformTrayResponse(
      trayData as Record<string, unknown>,
      concern
    );

    // Return the structured tray object with 200 OK
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // 5 minute cache
      },
    });
  } catch (error) {
    console.error("[tray] Unexpected error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      "INTERNAL_ERROR"
    );
  }
});
