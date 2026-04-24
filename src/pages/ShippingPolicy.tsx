import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const ShippingPolicy = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-36 pb-24">
        <div className="luxury-container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              {isArabic ? "سياسة الشحن" : "Shipping Policy"}
            </h1>
            <div className="w-16 h-px bg-gold mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <Truck className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "التوصيل داخل عمّان" : "Amman Delivery"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "التوصيل خلال 1-3 أيام عمل"
                  : "Delivery within 1-3 business days"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <MapPin className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "التوصيل للمحافظات" : "Nationwide Delivery"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "التوصيل خلال 2-5 أيام عمل لجميع محافظات الأردن"
                  : "Delivery within 2-5 business days to all Jordan governorates"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <Package className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "شحن مجاني" : "Free Shipping"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "شحن مجاني للطلبات فوق 50 دينار أردني"
                  : "Free shipping on orders over 50 JOD"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <Clock className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-lg mb-2">
                {isArabic ? "رسوم الشحن" : "Shipping Cost"}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {isArabic
                  ? "3 دينار أردني للطلبات أقل من 50 دينار"
                  : "3 JOD for orders under 50 JOD"}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none font-body text-muted-foreground space-y-6">
            <h2 className="font-display text-xl text-foreground">
              {isArabic ? "معلومات إضافية" : "Additional Information"}
            </h2>
            <p>
              {isArabic
                ? "جميع الطلبات يتم تغليفها بعناية لضمان وصول المنتجات بحالة ممتازة. سنتواصل معك عبر الهاتف أو الواتساب لتأكيد الطلب وموعد التوصيل."
                : "All orders are carefully packaged to ensure products arrive in excellent condition. We will contact you via phone or WhatsApp to confirm the order and delivery time."}
            </p>
            <p>
              {isArabic
                ? "الدفع عند الاستلام متاح لجميع المناطق داخل الأردن."
                : "Cash on delivery is available for all areas within Jordan."}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
