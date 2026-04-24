/**
 * ConsultPharmacistCard Component
 * ================================
 * Displays a "Consult Pharmacist" fallback card when a product slot is unavailable.
 * Clicking opens the Gorgias chat widget for personalized assistance.
 * 
 * This component maintains the "Eternal Elegance" aesthetic while turning
 * an out-of-stock situation into a service opportunity.
 */

import { MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { openGorgiasChat } from "@/lib/openGorgiasChat";
import type { DigitalTrayFallbackSlot } from "@/types/digitalTray";
import { cn } from "@/lib/utils";

interface ConsultPharmacistCardProps {
  /** The fallback slot data */
  slot: DigitalTrayFallbackSlot;
  /** Optional className for styling */
  className?: string;
  /** Optional compact mode for smaller displays */
  compact?: boolean;
}

/**
 * A elegant fallback card displayed when a product is unavailable.
 * Clicking opens the Gorgias chat for personalized consultation.
 */
export function ConsultPharmacistCard({
  slot,
  className,
  compact = false,
}: ConsultPharmacistCardProps) {
  const { language, isRTL } = useLanguage();

  const handleClick = () => {
    openGorgiasChat({
      prefillMessage: `I need help finding an alternative for Step ${slot.step_label.en}`,
    });
  };

  const stepLabel = language === "ar" ? slot.step_label.ar : slot.step_label.en;
  const message = language === "ar" ? slot.fallback_message.ar : slot.fallback_message.en;

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base styles - elegant card appearance
        "group relative w-full overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-soft-ivory to-white",
        "border border-shiny-gold/20 hover:border-shiny-gold/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-shiny-gold/10",
        "focus:outline-none focus:ring-2 focus:ring-shiny-gold/50 focus:ring-offset-2",
        "cursor-pointer",
        // Height based on compact mode
        compact ? "p-4" : "p-6",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={`Consult pharmacist for ${stepLabel}`}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-shiny-gold rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-shiny-gold rounded-full blur-3xl" />
      </div>

      {/* Step indicator */}
      <div className="relative flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-shiny-gold/10 text-shiny-gold text-xs font-semibold">
          {slot.step.split("_")[1]}
        </span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {stepLabel}
        </span>
      </div>

      {/* Main content */}
      <div className="relative space-y-4">
        {/* Asper Seal Icon */}
        <div className={cn(
          "flex items-center justify-center",
          "w-16 h-16 mx-auto rounded-full",
          "bg-gradient-to-br from-shiny-gold/20 to-shiny-gold/5",
          "border border-shiny-gold/30",
          "group-hover:scale-110 transition-transform duration-300"
        )}>
          <Sparkles className="w-8 h-8 text-shiny-gold" />
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-display text-lg text-dark-charcoal text-center",
          compact && "text-base"
        )}>
          {language === "ar" ? "استشيري الصيدلي" : "Consult Pharmacist"}
        </h3>

        {/* Message */}
        <p className={cn(
          "font-body text-sm text-gray-600 text-center leading-relaxed",
          compact && "text-xs"
        )}>
          {message}
        </p>

        {/* CTA Button */}
        <div className={cn(
          "flex items-center justify-center gap-2 pt-2",
          "text-shiny-gold group-hover:text-shiny-gold/80",
          "transition-colors duration-200"
        )}>
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === "ar" ? "ابدأي المحادثة" : "Start Chat"}
          </span>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-shiny-gold/0 group-hover:bg-shiny-gold/5 transition-colors duration-300 pointer-events-none rounded-2xl" />
    </button>
  );
}

export default ConsultPharmacistCard;
