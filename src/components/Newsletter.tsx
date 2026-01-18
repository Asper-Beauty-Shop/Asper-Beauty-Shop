import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatedSection } from "./AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          language: language,
          source: 'homepage'
        });

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          toast.info(
            isArabic ? 'أنت مشترك بالفعل!' : 'You are already subscribed!',
            { 
              description: isArabic ? 'هذا البريد الإلكتروني مسجل في قائمتنا' : 'This email is already on our list',
              position: 'top-center'
            }
          );
        } else {
          throw error;
        }
      } else {
        toast.success(
          isArabic ? 'مرحباً بك في عائلة آسبر!' : 'Welcome to Asper Beauty!',
          { 
            description: isArabic ? 'ستصلك آخر العروض والأخبار الحصرية' : "You'll receive our exclusive updates soon.",
            position: 'top-center'
          }
        );
      }
      setEmail("");
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error(
        isArabic ? 'حدث خطأ' : 'Something went wrong',
        { 
          description: isArabic ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later',
          position: 'top-center'
        }
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section id="contact" className="py-24 bg-taupe">
      <div className="luxury-container">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="luxury-subheading text-gold mb-4">
            {isArabic ? 'ابقي على تواصل' : 'Stay Connected'}
          </p>
          <h2 style={{
            background: 'linear-gradient(135deg, hsl(46 100% 45%), hsl(46 100% 60%), hsl(46 100% 45%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }} className="font-display text-4xl md:text-5xl mb-6 text-rose-800">
            {isArabic ? 'انضمي إلى عالمنا' : 'Join Our World'}
          </h2>
          <p className="font-body text-charcoal/70 mb-10 leading-relaxed">
            {isArabic 
              ? 'اشتركي لتحصلي على العروض الحصرية، وصول مبكر للمنتجات الجديدة، ونصائح الجمال المتخصصة.'
              : 'Subscribe to receive exclusive offers, early access to new arrivals, and expert beauty insights delivered to your inbox.'
            }
          </p>

          <AnimatedSection animation="fade-up" delay={200}>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} 
                className="flex-1 px-6 py-4 bg-cream border border-gold/30 text-charcoal placeholder:text-charcoal/40 font-body text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50" 
                required 
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="luxury-gold" 
                size="luxury" 
                className="whitespace-nowrap bg-gold text-charcoal hover:bg-gold-light shadow-md shadow-gold/30 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isArabic ? 'اشترك' : 'Subscribe'}
              </Button>
            </form>
          </AnimatedSection>

          <p className="text-xs text-charcoal/50 font-body mt-6">
            {isArabic 
              ? 'بالاشتراك، أنتِ توافقين على سياسة الخصوصية. يمكنك إلغاء الاشتراك في أي وقت.'
              : 'By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.'
            }
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};