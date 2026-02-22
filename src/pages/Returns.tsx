import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { RotateCcw, Shield, Clock, MessageCircle } from "lucide-react";

const Returns = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-36 pb-24">
        <div className="luxury-container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              {isArabic ? "الإرجاع والاستبدال" : "Returns & Exchanges"}
            </h1>
            <div className="w-16 h-px bg-gold mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <Clock className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "فترة الإرجاع" : "Return Window"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "30 يوم من تاريخ الاستلام"
                  : "30 days from the date of receipt"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <Shield className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "ضمان الجودة" : "Quality Guarantee"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "جميع منتجاتنا أصلية ومضمونة 100%"
                  : "All our products are 100% authentic and guaranteed"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <RotateCcw className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "شروط الإرجاع" : "Return Conditions"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "المنتج يجب أن يكون غير مفتوح وبحالته الأصلية"
                  : "Product must be unopened and in its original condition"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <MessageCircle className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "كيفية الإرجاع" : "How to Return"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "تواصل معنا عبر الواتساب أو الهاتف لترتيب الإرجاع"
                  : "Contact us via WhatsApp or phone to arrange the return"}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none font-body text-muted-foreground space-y-6">
            <h2 className="font-display text-xl text-foreground">
              {isArabic ? "سياسة الاستبدال" : "Exchange Policy"}
            </h2>
            <p>
              {isArabic
                ? "يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو أعلى (مع دفع الفرق). للاستبدال، يرجى التواصل معنا خلال 30 يوم من تاريخ الاستلام."
                : "You can exchange a product for another of the same or higher value (paying the difference). For exchanges, please contact us within 30 days of receipt."}
            </p>
            <h2 className="font-display text-xl text-foreground">
              {isArabic ? "استثناءات" : "Exceptions"}
            </h2>
            <p>
              {isArabic
                ? "لا يمكن إرجاع المنتجات المفتوحة أو المستخدمة لأسباب تتعلق بالنظافة والسلامة، باستثناء المنتجات التالفة أو المعيبة."
                : "Opened or used products cannot be returned for hygiene and safety reasons, except for damaged or defective products."}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
