/**
 * useDigitalTray Hook
 * ====================
 * React hook for fetching Digital Tray regimens from the Edge Function.
 * Provides loading states, error handling, and TypeScript-safe responses.
 * 
 * Usage:
 * ```tsx
 * const { tray, loading, error, refetch } = useDigitalTray("Concern_Acne");
 * 
 * // Check if a slot has a product available
 * if (tray?.data.regimen.step_1.available) {
 *   // Render product card
 * } else {
 *   // Render "Consult Pharmacist" fallback
 * }
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  SkinConcern,
  DigitalTrayResponse,
  DigitalTrayErrorResponse,
} from "@/integrations/supabase/types";

interface UseDigitalTrayResult {
  /** The Digital Tray response data */
  tray: DigitalTrayResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error message if the request failed */
  error: string | null;
  /** Refetch the tray data */
  refetch: () => Promise<void>;
}

/**
 * Fetches a Digital Tray regimen for a specific skin concern
 * @param concern - The skin concern to fetch products for
 * @returns Object containing tray data, loading state, error, and refetch function
 */
export function useDigitalTray(concern: SkinConcern | null): UseDigitalTrayResult {
  const [tray, setTray] = useState<DigitalTrayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTray = useCallback(async () => {
    if (!concern) {
      setTray(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the Supabase URL from the client
      const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl 
        || import.meta.env.VITE_SUPABASE_URL;

      if (!supabaseUrl) {
        throw new Error("Supabase URL not configured");
      }

      // Call the Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-digital-tray?concern=${encodeURIComponent(concern)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as DigitalTrayErrorResponse;
        throw new Error(errorData.error?.message || "Failed to fetch tray");
      }

      setTray(data as DigitalTrayResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setTray(null);
    } finally {
      setLoading(false);
    }
  }, [concern]);

  useEffect(() => {
    fetchTray();
  }, [fetchTray]);

  return {
    tray,
    loading,
    error,
    refetch: fetchTray,
  };
}

/**
 * Helper function to check if a tray slot is available
 * Type guard for DigitalTrayProduct vs DigitalTrayFallback
 */
export function isSlotAvailable(
  slot: DigitalTrayResponse["data"]["regimen"]["step_1"]
): slot is DigitalTrayResponse["data"]["regimen"]["step_1"] & { available: true } {
  return slot.available === true;
}

/**
 * Opens the Gorgias chat widget
 * Used when user clicks on a "Consult Pharmacist" fallback card
 */
export function openGorgiasChat(): void {
  // Check if Gorgias chat widget is loaded
  if (typeof window !== "undefined" && (window as unknown as { GorgiasChat?: { open: () => void } }).GorgiasChat) {
    (window as unknown as { GorgiasChat: { open: () => void } }).GorgiasChat.open();
  } else {
    // Fallback: Open WhatsApp or contact page if Gorgias isn't available
    console.warn("Gorgias chat not available, implement fallback");
  }
}
