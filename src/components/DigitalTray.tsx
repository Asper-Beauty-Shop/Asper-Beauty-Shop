/**
 * DigitalTray Component
 * ======================
 * Renders a 3-step skincare regimen based on the user's skin concern.
 * Displays product cards for available products and "Consult Pharmacist"
 * fallback cards for unavailable slots.
 * 
 * This is the main UI component for the "3-Click Solution" Digital Concierge.
 */

import { Link } from "react-router-dom";
import { ShoppingBag, Star, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConsultPharmacistCard } from "@/components/ConsultPharmacistCard";
import { LazyImage } from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import type {
  DigitalTraySlots,
  DigitalTraySlot,
  DigitalTrayProductSlot,
  SkinConcern,
  RegimenStep,
} from "@/types/digitalTray";
import { isSlotAvailable, STEP_LABELS, CONCERN_LABELS, REGIMEN_STEPS } from "@/types/digitalTray";

// ============================================================================
// Types
// ============================================================================

interface DigitalTrayProps {
  /** The regimen slots to display */
  slots: DigitalTraySlots;
  /** The current skin concern */
  concernTag: SkinConcern;
  /** Optional className for the container */
  className?: string;
  /** Layout mode */
  layout?: "horizontal" | "vertical" | "grid";
  /** Show step numbers */
  showStepNumbers?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

interface ProductSlotCardProps {
  /** The product slot data */
  slot: DigitalTrayProductSlot;
  /** The step key */
  step: RegimenStep;
  /** Compact mode */
  compact?: boolean;
}

// ============================================================================
// Product Slot Card
// ============================================================================

function ProductSlotCard({ slot, step, compact = false }: ProductSlotCardProps) {
  const { language, isRTL } = useLanguage();
  
  const stepLabel = language === "ar" ? slot.step_label.ar : slot.step_label.en;
  const stepNumber = STEP_LABELS[step].number;
  
  // Calculate discount percentage if compare_at_price exists
  const hasDiscount = slot.compare_at_price && slot.compare_at_price > slot.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - slot.price / slot.compare_at_price!) * 100)
    : 0;

  return (
    <Link
      to={`/product/${slot.handle}`}
      className={cn(
        "group block relative overflow-hidden rounded-2xl",
        "bg-white border border-gray-100",
        "hover:border-shiny-gold/30 hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-shiny-gold/50"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Step indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-shiny-gold text-white text-xs font-bold shadow-md">
          {stepNumber}
        </span>
        <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 uppercase tracking-wider">
          {stepLabel}
        </span>
      </div>

      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {slot.is_hero && (
          <span className="flex items-center gap-1 px-2 py-1 bg-shiny-gold text-white text-xs font-semibold rounded-full shadow-md">
            <Star className="w-3 h-3 fill-current" />
            {language === "ar" ? "مميز" : "Hero"}
          </span>
        )}
        {slot.is_bestseller && !slot.is_hero && (
          <span className="flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full shadow-md">
            <Tag className="w-3 h-3" />
            {language === "ar" ? "الأكثر مبيعاً" : "Bestseller"}
          </span>
        )}
        {hasDiscount && (
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className={cn(
        "relative overflow-hidden bg-gray-50",
        compact ? "aspect-square" : "aspect-[4/5]"
      )}>
        {slot.image_url ? (
          <LazyImage
            src={slot.image_url}
            alt={slot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div className={cn("p-4", compact && "p-3")}>
        {/* Vendor */}
        {slot.vendor && (
          <p className="text-xs font-medium text-shiny-gold uppercase tracking-wider mb-1">
            {slot.vendor}
          </p>
        )}

        {/* Title */}
        <h3 className={cn(
          "font-display text-dark-charcoal line-clamp-2 mb-2",
          "group-hover:text-shiny-gold transition-colors duration-200",
          compact ? "text-sm" : "text-base"
        )}>
          {slot.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-semibold text-dark-charcoal",
            compact ? "text-base" : "text-lg"
          )}>
            {slot.price.toFixed(2)} JOD
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {slot.compare_at_price!.toFixed(2)} JOD
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {slot.inventory_total <= 5 && slot.inventory_total > 0 && (
          <p className="text-xs text-orange-500 mt-2">
            {language === "ar" 
              ? `${slot.inventory_total} فقط متبقي` 
              : `Only ${slot.inventory_total} left`}
          </p>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DigitalTray({
  slots,
  concernTag,
  className,
  layout = "horizontal",
  showStepNumbers = true,
  compact = false,
}: DigitalTrayProps) {
  const { language, isRTL } = useLanguage();

  const concernLabel = CONCERN_LABELS[concernTag];
  const displayLabel = language === "ar" ? concernLabel.ar : concernLabel.en;

  // Render a single slot
  const renderSlot = (step: RegimenStep, slot: DigitalTraySlot) => {
    if (isSlotAvailable(slot)) {
      return (
        <ProductSlotCard
          key={step}
          slot={slot}
          step={step}
          compact={compact}
        />
      );
    } else {
      return (
        <ConsultPharmacistCard
          key={step}
          slot={slot}
          compact={compact}
        />
      );
    }
  };

  // Layout classes
  const layoutClasses = {
    horizontal: "flex flex-col md:flex-row gap-4 md:gap-6",
    vertical: "flex flex-col gap-4",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
  };

  return (
    <div className={cn("w-full", className)} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-block px-3 py-1 bg-shiny-gold/10 text-shiny-gold text-xs font-medium rounded-full uppercase tracking-wider mb-2">
          {language === "ar" ? "روتينك المخصص" : "Your Custom Regimen"}
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-dark-charcoal">
          {displayLabel}
        </h2>
        <p className="font-body text-gray-600 mt-2">
          {language === "ar" 
            ? "ثلاث خطوات بسيطة لبشرة مثالية" 
            : "Three simple steps for perfect skin"}
        </p>
      </div>

      {/* Slots Grid */}
      <div className={layoutClasses[layout]}>
        {REGIMEN_STEPS.map((step) => {
          const slot = slots[step];
          return (
            <div key={step} className={layout === "horizontal" ? "flex-1" : ""}>
              {renderSlot(step, slot)}
            </div>
          );
        })}
      </div>

      {/* Total Price */}
      {layout !== "vertical" && (
        <TrayTotal slots={slots} compact={compact} />
      )}
    </div>
  );
}

// ============================================================================
// Tray Total Component
// ============================================================================

interface TrayTotalProps {
  slots: DigitalTraySlots;
  compact?: boolean;
}

function TrayTotal({ slots, compact = false }: TrayTotalProps) {
  const { language } = useLanguage();

  // Calculate total from available products
  let total = 0;
  let originalTotal = 0;
  let availableCount = 0;

  REGIMEN_STEPS.forEach((step) => {
    const slot = slots[step];
    if (isSlotAvailable(slot)) {
      total += slot.price;
      originalTotal += slot.compare_at_price || slot.price;
      availableCount++;
    }
  });

  if (availableCount === 0) return null;

  const hasSavings = originalTotal > total;
  const savings = originalTotal - total;

  return (
    <div className={cn(
      "mt-6 p-4 rounded-xl bg-soft-ivory border border-shiny-gold/20",
      "flex items-center justify-between",
      compact && "p-3"
    )}>
      <div>
        <p className="text-sm text-gray-600">
          {language === "ar" 
            ? `${availableCount} منتجات في روتينك` 
            : `${availableCount} products in your regimen`}
        </p>
        {hasSavings && (
          <p className="text-sm text-green-600 font-medium">
            {language === "ar" 
              ? `وفري ${savings.toFixed(2)} دينار` 
              : `Save ${savings.toFixed(2)} JOD`}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "المجموع" : "Total"}
        </p>
        <p className={cn(
          "font-display font-bold text-dark-charcoal",
          compact ? "text-xl" : "text-2xl"
        )}>
          {total.toFixed(2)} JOD
        </p>
      </div>
    </div>
  );
}

export default DigitalTray;
