import { useState } from "react";
import { MessageCircle, X, Send, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_NUMBER = "962790656666";
const INSTAGRAM_URL = "https://www.instagram.com/asper.beauty.shop/";
const FACEBOOK_URL = "https://m.me/asper.beauty.shop";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const quickMessages = {
  en: [
    { label: "Product inquiry", message: "Hi, I'd like to ask about a product" },
    { label: "Order status", message: "Hi, I'd like to check my order status" },
    { label: "Skin consultation", message: "Hi, I'd like a skin care consultation" },
  ],
  ar: [
    { label: "استفسار عن منتج", message: "مرحباً، أريد الاستفسار عن منتج" },
    { label: "حالة الطلب", message: "مرحباً، أريد الاستفسار عن حالة طلبي" },
    { label: "استشارة بشرة", message: "مرحباً، أريد استشارة عناية بالبشرة" },
  ],
};

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, isRTL } = useLanguage();
  const isArabic = language === "ar";
  const messages = quickMessages[language];

  const openWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 lg:bottom-6 ${isRTL ? "right-4 lg:right-6" : "left-4 lg:left-6"} z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
        aria-label="Contact us on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-36 lg:bottom-24 ${isRTL ? "right-4 lg:right-6" : "left-4 lg:left-6"} z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gold/20 overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-[#075E54] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white">
                  Asper Beauty
                </h3>
                <p className="text-xs text-white/80 font-body">
                  {isArabic ? "متصل الآن • يرد عادة خلال دقائق" : "Online • Typically replies in minutes"}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome */}
          <div className="p-4 bg-cream/50">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm font-body text-foreground">
                {isArabic
                  ? "مرحباً! 👋 كيف يمكننا مساعدتك؟ اختر موضوعاً أو راسلنا مباشرة."
                  : "Hi there! 👋 How can we help you? Choose a topic or message us directly."}
              </p>
            </div>
          </div>

          {/* Quick Messages */}
          <div className="p-4 space-y-2">
            {messages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => openWhatsApp(msg.message)}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-gold/20 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-200 flex items-center justify-between group"
              >
                <span className="text-sm font-body text-foreground">{msg.label}</span>
                <Send className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] transition-colors" />
              </button>
            ))}
          </div>

          {/* Social Channels */}
          <div className="px-4 pb-4 border-t border-gold/10 pt-3">
            <p className="text-xs text-muted-foreground font-body mb-2 text-center">
              {isArabic ? "تواصل معنا أيضاً عبر" : "Also reach us on"}
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Facebook Messenger"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@asper.beauty.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
