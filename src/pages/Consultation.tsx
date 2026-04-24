import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Consultation = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-36 pb-24">
        <div className="luxury-container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              {isArabic ? "استشارة البشرة" : "Skin Consultation"}
            </h1>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              {isArabic
                ? "احصلي على استشارة مجانية مع خبيرة التجميل لدينا لاكتشاف أفضل المنتجات لبشرتك"
                : "Get a free consultation with our beauty expert to discover the best products for your skin"}
            </p>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gold/20 text-center">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "تحليل البشرة" : "Skin Analysis"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "نحلل نوع بشرتك ومشاكلها لنقدم لك الحلول المثالية"
                  : "We analyze your skin type and concerns to provide ideal solutions"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20 text-center">
              <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "روتين مخصص" : "Custom Routine"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "نبني لك روتين عناية بالبشرة مصمم خصيصاً لاحتياجاتك"
                  : "We build a skincare routine tailored specifically to your needs"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20 text-center">
              <ShieldCheck className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "متابعة مستمرة" : "Ongoing Support"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "نتابع معك النتائج ونعدل الروتين حسب الحاجة"
                  : "We follow up on results and adjust your routine as needed"}
              </p>
            </div>
          </div>

          <div className="bg-burgundy rounded-lg p-8 text-center">
            <h2 className="font-display text-2xl text-white mb-4">
              {isArabic ? "ابدأي استشارتك المجانية الآن" : "Start Your Free Consultation Now"}
            </h2>
            <p className="font-body text-cream/80 mb-6">
              {isArabic
                ? "تواصلي معنا عبر الواتساب أو جرّبي مساعد الجمال الذكي"
                : "Contact us via WhatsApp or try our AI Beauty Assistant"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/962790656666?text=Hi%2C%20I%27d%20like%20a%20skin%20consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-body"
              >
                <MessageCircle className="w-5 h-5" />
                {isArabic ? "واتساب" : "WhatsApp"}
              </a>
              <Link
                to="/skin-concerns"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-burgundy rounded-lg hover:bg-gold-light transition-colors font-body"
              >
                <Sparkles className="w-5 h-5" />
                {isArabic ? "مساعد الجمال" : "Beauty Assistant"}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Consultation;
