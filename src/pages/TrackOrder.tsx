import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderData {
  order_number: string;
  status: string;
  customer_name: string;
  city: string;
  created_at: string;
  total: number;
}

const TrackOrder = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error(isArabic ? "الرجاء إدخال رقم الطلب" : "Please enter an order number");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from("cod_orders")
        .select("order_number, status, customer_name, city, created_at, total")
        .eq("order_number", orderNumber.trim())
        .single();

      if (error || !data) {
        setOrder(null);
      } else {
        setOrder(data as OrderData);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "shipped":
        return <Truck className="w-6 h-6 text-blue-600" />;
      case "processing":
        return <Package className="w-6 h-6 text-gold" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: "Pending", ar: "قيد الانتظار" },
      confirmed: { en: "Confirmed", ar: "مؤكد" },
      processing: { en: "Processing", ar: "قيد التحضير" },
      shipped: { en: "Shipped", ar: "تم الشحن" },
      delivered: { en: "Delivered", ar: "تم التوصيل" },
      cancelled: { en: "Cancelled", ar: "ملغى" },
    };
    const label = labels[status] || labels.pending;
    return isArabic ? label.ar : label.en;
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-36 pb-24">
        <div className="luxury-container max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              {isArabic ? "تتبع الطلب" : "Track Your Order"}
            </h1>
            <p className="font-body text-muted-foreground">
              {isArabic
                ? "أدخل رقم طلبك لمعرفة حالته"
                : "Enter your order number to check its status"}
            </p>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          <form onSubmit={handleTrack} className="flex gap-3 mb-12">
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={isArabic ? "رقم الطلب (مثال: ASP-12345678)" : "Order number (e.g., ASP-12345678)"}
              className="flex-1 border-gold/30 focus:border-gold"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-burgundy hover:bg-burgundy-light text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              {isArabic ? "تتبع" : "Track"}
            </Button>
          </form>

          {searched && !loading && order && (
            <div className="bg-white rounded-lg p-6 border border-gold/20">
              <div className="flex items-center gap-4 mb-6">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-display text-lg text-foreground">{order.order_number}</p>
                  <p className="font-body text-sm text-muted-foreground">
                    {getStatusLabel(order.status)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-body text-muted-foreground">{isArabic ? "الاسم" : "Name"}</p>
                  <p className="font-body text-foreground">{order.customer_name}</p>
                </div>
                <div>
                  <p className="font-body text-muted-foreground">{isArabic ? "المدينة" : "City"}</p>
                  <p className="font-body text-foreground">{order.city}</p>
                </div>
                <div>
                  <p className="font-body text-muted-foreground">{isArabic ? "التاريخ" : "Date"}</p>
                  <p className="font-body text-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-body text-muted-foreground">{isArabic ? "الإجمالي" : "Total"}</p>
                  <p className="font-body text-foreground font-medium">{order.total.toFixed(2)} JOD</p>
                </div>
              </div>
            </div>
          )}

          {searched && !loading && !order && (
            <div className="text-center py-12 bg-white rounded-lg border border-gold/20">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-body text-muted-foreground">
                {isArabic
                  ? "لم يتم العثور على طلب بهذا الرقم"
                  : "No order found with this number"}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                {isArabic
                  ? "تأكد من رقم الطلب وحاول مرة أخرى"
                  : "Please verify the order number and try again"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
