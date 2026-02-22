/**
 * useDigitalTray Hook
 * ====================
 * React hook for fetching Digital Tray regimens from the Edge Function.
 * Provides loading states, error handling, and TypeScript-safe responses.
 * 
 * @example
 * ```tsx
 * const { slots, concernTag, isLoading, error, refetch } = useDigitalTray("Concern_Acne");
 * 
 * if (isLoading) return <Skeleton />;
 * if (error || !slots) return <StaticRegimen />;
 * 
 * return <DigitalTray slots={slots} concernTag={concernTag} />;
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SkinConcern,
  DigitalTrayResponse,
  DigitalTraySlots,
  DigitalTrayAPIResponse,
} from "@/types/digitalTray";
import { isSuccessResponse, isValidConcern } from "@/types/digitalTray";

// ============================================================================
// Types
// ============================================================================

export interface UseDigitalTrayResult {
  /** The regimen slots (Step_1_Cleanser, Step_2_Treatment, Step_3_Protection) */
  slots: DigitalTraySlots | null;
  /** The current concern tag being fetched */
  concernTag: SkinConcern | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if the request failed */
  error: string | null;
  /** Refetch the tray data */
  refetch: () => Promise<void>;
  /** Full response data (includes meta) */
  response: DigitalTrayResponse | null;
}

export interface UseDigitalTrayOptions {
  /** Whether to fetch immediately on mount (default: true) */
  fetchOnMount?: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
}

// ============================================================================
// Cache
// ============================================================================

interface CacheEntry {
  data: DigitalTrayResponse;
  timestamp: number;
}

const cache = new Map<SkinConcern, CacheEntry>();

function getCachedResponse(concern: SkinConcern, ttl: number): DigitalTrayResponse | null {
  const entry = cache.get(concern);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > ttl;
  if (isExpired) {
    cache.delete(concern);
    return null;
  }
  
  return entry.data;
}

function setCachedResponse(concern: SkinConcern, data: DigitalTrayResponse): void {
  cache.set(concern, {
    data,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetches a Digital Tray regimen for a specific skin concern
 * 
 * @param concern - The skin concern to fetch products for (or null to skip)
 * @param options - Configuration options
 * @returns Object containing slots, loading state, error, and refetch function
 */
export function useDigitalTray(
  concern: SkinConcern | string | null,
  options: UseDigitalTrayOptions = {}
): UseDigitalTrayResult {
  const { fetchOnMount = true, cacheTTL = 5 * 60 * 1000 } = options;

  const [slots, setSlots] = useState<DigitalTraySlots | null>(null);
  const [response, setResponse] = useState<DigitalTrayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Validate and normalize the concern
  const validConcern: SkinConcern | null = isValidConcern(concern) ? concern : null;

  const fetchTray = useCallback(async () => {
    // Skip if no valid concern
    if (!validConcern) {
      setSlots(null);
      setResponse(null);
      setError(null);
      return;
    }

    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      console.error("[useDigitalTray] VITE_SUPABASE_URL is not configured");
      setError("Service configuration error: Missing SUPABASE_URL");
      setSlots(null);
      setResponse(null);
      return;
    }

    // Check cache first
    const cachedData = getCachedResponse(validConcern, cacheTTL);
    if (cachedData) {
      console.log("[useDigitalTray] Using cached response for:", validConcern);
      setResponse(cachedData);
      setSlots(cachedData.data.regimen);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build request headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth header if anon key is available
      if (supabaseAnonKey) {
        headers["apikey"] = supabaseAnonKey;
        headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
      }

      // Call the Edge Function
      const url = `${supabaseUrl}/functions/v1/tray?concern=${encodeURIComponent(validConcern)}`;
      console.log("[useDigitalTray] Fetching:", url);

      const fetchResponse = await fetch(url, {
        method: "GET",
        headers,
      });

      const data: DigitalTrayAPIResponse = await fetchResponse.json();

      // Check if component is still mounted
      if (!isMounted.current) return;

      if (!fetchResponse.ok || !isSuccessResponse(data)) {
        const errorMessage = !isSuccessResponse(data) 
          ? data.error?.message || "Failed to fetch tray"
          : `HTTP ${fetchResponse.status}`;
        throw new Error(errorMessage);
      }

      // Cache the successful response
      setCachedResponse(validConcern, data);

      setResponse(data);
      setSlots(data.data.regimen);
      setError(null);
    } catch (err) {
      if (!isMounted.current) return;
      
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("[useDigitalTray] Error:", message);
      setError(message);
      setSlots(null);
      setResponse(null);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [validConcern, cacheTTL]);

  // Fetch on mount/concern change
  useEffect(() => {
    isMounted.current = true;
    
    if (fetchOnMount) {
      fetchTray();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchTray, fetchOnMount]);

  return {
    slots,
    concernTag: validConcern,
    isLoading,
    error,
    refetch: fetchTray,
    response,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Clears the cache for a specific concern or all concerns
 * @param concern - Optional concern to clear (clears all if not provided)
 */
export function clearDigitalTrayCache(concern?: SkinConcern): void {
  if (concern) {
    cache.delete(concern);
  } else {
    cache.clear();
  }
}

/**
 * Prefetch tray data for a concern (useful for hover preloading)
 * @param concern - The concern to prefetch
 */
export async function prefetchDigitalTray(concern: SkinConcern): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !isValidConcern(concern)) return;

  // Check if already cached
  if (cache.has(concern)) return;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (supabaseAnonKey) {
      headers["apikey"] = supabaseAnonKey;
      headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/tray?concern=${encodeURIComponent(concern)}`,
      { method: "GET", headers }
    );

    const data: DigitalTrayAPIResponse = await response.json();

    if (response.ok && isSuccessResponse(data)) {
      setCachedResponse(concern, data);
      console.log("[useDigitalTray] Prefetched:", concern);
    }
  } catch (err) {
    console.warn("[useDigitalTray] Prefetch failed for:", concern, err);
  }
}
