/**
 * Gorgias Chat Integration
 * ========================
 * Opens the Gorgias chat widget for the "Consult Pharmacist" fallback.
 * Supports multiple integration methods with graceful fallback.
 */

// Extend Window interface to include Gorgias types
declare global {
  interface Window {
    GorgiasChat?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      isOpen: () => boolean;
    };
    gorgias?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}

/**
 * Custom event name for Gorgias chat opening
 * Can be listened to by custom handlers if needed
 */
export const GORGIAS_OPEN_EVENT = "asper:open-gorgias-chat";

/**
 * Options for opening Gorgias chat
 */
export interface OpenGorgiasChatOptions {
  /** Pre-fill message to send to chat */
  prefillMessage?: string;
  /** Fallback URL if chat is unavailable */
  fallbackUrl?: string;
  /** Whether to dispatch custom event */
  dispatchEvent?: boolean;
}

/**
 * Opens the Gorgias chat widget
 * 
 * Tries multiple methods in order:
 * 1. window.GorgiasChat?.open() - Standard Gorgias widget API
 * 2. window.gorgias?.open() - Alternative Gorgias API
 * 3. Custom event dispatch - For custom handlers
 * 4. Fallback navigation to /contact
 * 
 * @param options - Configuration options
 * @returns true if chat was opened, false if fallback was used
 * 
 * @example
 * ```tsx
 * // Basic usage
 * openGorgiasChat();
 * 
 * // With prefill message
 * openGorgiasChat({ 
 *   prefillMessage: "I need help finding an alternative treatment" 
 * });
 * 
 * // With custom fallback
 * openGorgiasChat({ fallbackUrl: "/help" });
 * ```
 */
export function openGorgiasChat(options: OpenGorgiasChatOptions = {}): boolean {
  const {
    fallbackUrl = "/contact",
    dispatchEvent = true,
  } = options;

  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    console.warn("[Gorgias] Not in browser environment");
    return false;
  }

  // Try Method 1: Standard Gorgias Chat API
  if (window.GorgiasChat?.open) {
    try {
      window.GorgiasChat.open();
      console.log("[Gorgias] Opened via GorgiasChat.open()");
      return true;
    } catch (error) {
      console.warn("[Gorgias] GorgiasChat.open() failed:", error);
    }
  }

  // Try Method 2: Alternative Gorgias API
  if (window.gorgias?.open) {
    try {
      window.gorgias.open();
      console.log("[Gorgias] Opened via gorgias.open()");
      return true;
    } catch (error) {
      console.warn("[Gorgias] gorgias.open() failed:", error);
    }
  }

  // Try Method 3: Dispatch custom event for custom handlers
  if (dispatchEvent) {
    try {
      const event = new CustomEvent(GORGIAS_OPEN_EVENT, {
        bubbles: true,
        detail: { source: "digital-tray-fallback" },
      });
      const handled = window.dispatchEvent(event);
      
      // Check if any listener prevented default or handled it
      if (handled) {
        console.log("[Gorgias] Custom event dispatched:", GORGIAS_OPEN_EVENT);
        // Give custom handlers a chance to open chat
        // If they don't, we'll fall through to navigation
      }
    } catch (error) {
      console.warn("[Gorgias] Custom event dispatch failed:", error);
    }
  }

  // Method 4: Fallback - Navigate to contact page
  console.log("[Gorgias] Chat unavailable, navigating to:", fallbackUrl);
  
  // Use window.location for navigation (works in all contexts)
  if (fallbackUrl.startsWith("http")) {
    window.location.href = fallbackUrl;
  } else {
    // For relative URLs, try to use history API for SPA-friendly navigation
    window.location.href = fallbackUrl;
  }
  
  return false;
}

/**
 * Checks if Gorgias chat is available
 * @returns true if Gorgias chat widget is loaded
 */
export function isGorgiasAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.GorgiasChat?.open || window.gorgias?.open);
}

/**
 * Closes the Gorgias chat widget if open
 */
export function closeGorgiasChat(): void {
  if (typeof window === "undefined") return;
  
  if (window.GorgiasChat?.close) {
    window.GorgiasChat.close();
  } else if (window.gorgias?.close) {
    window.gorgias.close();
  }
}

/**
 * Toggles the Gorgias chat widget
 */
export function toggleGorgiasChat(): void {
  if (typeof window === "undefined") return;
  
  if (window.GorgiasChat?.toggle) {
    window.GorgiasChat.toggle();
  } else if (window.gorgias?.toggle) {
    window.gorgias.toggle();
  } else {
    // Fallback: try to open
    openGorgiasChat();
  }
}
