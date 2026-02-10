/**
 * get-digital-tray Edge Function
 * ================================
 * The "Head Pharmacist" - validates requests and returns curated skincare regimens.
 * 
 * Endpoint: GET /functions/v1/get-digital-tray?concern=Concern_Acne
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

// Step labels for the regimen
const STEP_LABELS: Record<string, { en: string; ar: string }> = {
  step_1: { en: "Cleanse", ar: "تنظيف" },
  step_2: { en: "Treat", ar: "علاج" },
  step_3: { en: "Protect", ar: "حماية" },
};

// Concern display names
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
 * Enriches the tray response with additional metadata
 */
function enrichTrayResponse(
  trayData: Record<string, unknown>,
  concern: ValidConcern
): Record<string, unknown> {
  const concernLabel = CONCERN_LABELS[concern];
  
  // Process each step to add labels and handle null products
  const processedSteps: Record<string, unknown> = {};
  
  for (const stepKey of ["step_1", "step_2", "step_3"]) {
    const stepData = trayData[stepKey];
    const stepLabel = STEP_LABELS[stepKey];
    
    if (stepData && stepData !== "null" && typeof stepData === "object") {
      // Product exists - enrich with step metadata
      processedSteps[stepKey] = {
        ...(stepData as Record<string, unknown>),
        step_label: stepLabel,
        available: true,
      };
    } else {
      // Product unavailable - return fallback structure for "Consult Pharmacist" card
      processedSteps[stepKey] = {
        available: false,
        step_label: stepLabel,
        fallback_message: {
          en: "Specific treatment temporarily unavailable. Chat with us for a custom alternative.",
          ar: "العلاج المحدد غير متوفر مؤقتاً. تحدثي معنا للحصول على بديل مخصص.",
        },
        fallback_action: "open_chat",
      };
    }
  }

  return {
    success: true,
    data: {
      concern: {
        key: concern,
        label: concernLabel,
      },
      regimen: processedSteps,
      generated_at: trayData.generated_at,
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
    console.log(`Fetching digital tray for concern: ${concern}`);
    
    const { data: trayData, error: rpcError } = await supabase.rpc(
      "get_tray_by_concern",
      { concern_tag: concern }
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return errorResponse(
        "Failed to retrieve regimen data",
        500,
        "DATABASE_ERROR"
      );
    }

    // ==================== PROCESS RESPONSE ====================
    // Enrich the response with metadata and fallback structures
    const enrichedResponse = enrichTrayResponse(
      trayData as Record<string, unknown>,
      concern
    );

    // Return the structured tray object with 200 OK
    return new Response(JSON.stringify(enrichedResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // 5 minute cache
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      "INTERNAL_ERROR"
    );
  }
});
