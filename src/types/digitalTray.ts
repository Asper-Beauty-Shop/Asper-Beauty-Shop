/**
 * Digital Tray Types
 * ==================
 * Type definitions for the Digital Tray "3-Click Solution" system.
 * These types define the contract between the Edge Function and frontend.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

/**
 * Valid skin concern tags for the Digital Tray
 */
export type SkinConcern =
  | "Concern_Acne"
  | "Concern_Hydration"
  | "Concern_AntiAging"
  | "Concern_Brightening"
  | "Concern_Sensitivity"
  | "Concern_SunProtection"
  | "Concern_DarkCircles";

/**
 * Array of all valid skin concerns (for validation)
 */
export const SKIN_CONCERNS: readonly SkinConcern[] = [
  "Concern_Acne",
  "Concern_Hydration",
  "Concern_AntiAging",
  "Concern_Brightening",
  "Concern_Sensitivity",
  "Concern_SunProtection",
  "Concern_DarkCircles",
] as const;

/**
 * Regimen steps with descriptive naming
 */
export type RegimenStep =
  | "Step_1_Cleanser"
  | "Step_2_Treatment"
  | "Step_3_Protection";

/**
 * Array of all regimen steps in order
 */
export const REGIMEN_STEPS: readonly RegimenStep[] = [
  "Step_1_Cleanser",
  "Step_2_Treatment",
  "Step_3_Protection",
] as const;

/**
 * Step display labels (bilingual: English/Arabic)
 */
export const STEP_LABELS: Record<RegimenStep, { en: string; ar: string; number: number }> = {
  Step_1_Cleanser: {
    en: "Cleanse",
    ar: "تنظيف",
    number: 1,
  },
  Step_2_Treatment: {
    en: "Treat",
    ar: "علاج",
    number: 2,
  },
  Step_3_Protection: {
    en: "Protect",
    ar: "حماية",
    number: 3,
  },
} as const;

/**
 * Concern display labels (bilingual: English/Arabic)
 */
export const CONCERN_LABELS: Record<SkinConcern, { en: string; ar: string }> = {
  Concern_Acne: { en: "Acne & Blemishes", ar: "حب الشباب والبقع" },
  Concern_Hydration: { en: "Hydration", ar: "الترطيب" },
  Concern_AntiAging: { en: "Anti-Aging", ar: "مكافحة الشيخوخة" },
  Concern_Brightening: { en: "Brightening", ar: "التفتيح والإشراق" },
  Concern_Sensitivity: { en: "Sensitivity", ar: "البشرة الحساسة" },
  Concern_SunProtection: { en: "Sun Protection", ar: "الحماية من الشمس" },
  Concern_DarkCircles: { en: "Dark Circles", ar: "الهالات السوداء" },
} as const;

// ============================================================================
// Slot Types
// ============================================================================

/**
 * A product slot in the Digital Tray (when product is available)
 */
export interface DigitalTrayProductSlot {
  available: true;
  id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  handle: string;
  title: string;
  description: string | null;
  vendor: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  step: RegimenStep;
  step_label: {
    en: string;
    ar: string;
  };
  is_hero: boolean;
  is_bestseller: boolean;
  inventory_total: number;
}

/**
 * A fallback slot in the Digital Tray (when product is unavailable)
 * Displays "Consult Pharmacist" card that opens Gorgias chat
 */
export interface DigitalTrayFallbackSlot {
  available: false;
  step: RegimenStep;
  step_label: {
    en: string;
    ar: string;
  };
  fallback_message: {
    en: string;
    ar: string;
  };
  fallback_action: "open_chat";
}

/**
 * Union type for any slot in the Digital Tray
 */
export type DigitalTraySlot = DigitalTrayProductSlot | DigitalTrayFallbackSlot;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Successful API response from the Digital Tray Edge Function
 */
export interface DigitalTrayResponse {
  success: true;
  data: {
    concern: {
      key: SkinConcern;
      label: {
        en: string;
        ar: string;
      };
    };
    regimen: {
      Step_1_Cleanser: DigitalTraySlot;
      Step_2_Treatment: DigitalTraySlot;
      Step_3_Protection: DigitalTraySlot;
    };
    generated_at: string;
  };
  meta: {
    version: string;
    cache_ttl: number;
  };
}

/**
 * Error response from the Digital Tray Edge Function
 */
export interface DigitalTrayErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    valid_concerns: readonly SkinConcern[];
  };
}

/**
 * Union type for API response (success or error)
 */
export type DigitalTrayAPIResponse = DigitalTrayResponse | DigitalTrayErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a slot has an available product
 * @param slot - The slot to check
 * @returns true if the slot contains a product, false if it's a fallback
 * 
 * @example
 * ```tsx
 * if (isSlotAvailable(slot)) {
 *   // TypeScript knows slot is DigitalTrayProductSlot here
 *   return <ProductCard product={slot} />;
 * } else {
 *   // TypeScript knows slot is DigitalTrayFallbackSlot here
 *   return <ConsultPharmacistCard slot={slot} />;
 * }
 * ```
 */
export function isSlotAvailable(slot: DigitalTraySlot): slot is DigitalTrayProductSlot {
  return slot.available === true;
}

/**
 * Type guard to check if an API response is successful
 * @param response - The API response to check
 * @returns true if the response is successful
 */
export function isSuccessResponse(
  response: DigitalTrayAPIResponse
): response is DigitalTrayResponse {
  return response.success === true;
}

/**
 * Type guard to check if a string is a valid SkinConcern
 * @param value - The string to validate
 * @returns true if the string is a valid SkinConcern
 */
export function isValidConcern(value: string | null | undefined): value is SkinConcern {
  return value !== null && value !== undefined && SKIN_CONCERNS.includes(value as SkinConcern);
}

/**
 * Type guard to check if a string is a valid RegimenStep
 * @param value - The string to validate
 * @returns true if the string is a valid RegimenStep
 */
export function isValidStep(value: string | null | undefined): value is RegimenStep {
  return value !== null && value !== undefined && REGIMEN_STEPS.includes(value as RegimenStep);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extracts just the slots from a DigitalTrayResponse
 */
export type DigitalTraySlots = DigitalTrayResponse["data"]["regimen"];

/**
 * Props for components that render a single slot
 */
export interface SlotProps {
  slot: DigitalTraySlot;
  language?: "en" | "ar";
}

/**
 * Props for components that render the full tray
 */
export interface TrayProps {
  slots: DigitalTraySlots;
  concernTag: SkinConcern;
  language?: "en" | "ar";
}
