import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

type Message = { role: 'user' | 'assistant'; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rgehleqcubtmcwyipyvi.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZWhsZXFjdWJ0bWN3eWlweXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM5MDEsImV4cCI6MjA4MzQxOTkwMX0.8BEpVzIvWc2do2v8v3pOP3txcTs52HsM4F7KVavlQNU";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;

const RoseIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="rose">🌹</span>
);

const translations = {
  en: {
    name: 'Dr. Rose',
    title: 'Beauty Pharmacist',
    welcome: "Hello! I'm Dr. Rose, your beauty pharmacist at Asper Beauty 🌹 Whether you need clinical skincare advice, makeup tips, or help building your perfect routine — I'm here for you! What's on your mind today?",
    placeholder: 'Ask Dr. Rose anything about beauty...',
    buttonText: 'Dr. Rose 🌹',
  },
  ar: {
    name: 'د. روز',
    title: 'صيدلانية التجميل',
    welcome: "أهلاً! أنا د. روز، صيدلانية التجميل في آسبر بيوتي 🌹 سواء كنتِ تحتاجين نصيحة طبية للبشرة، نصائح مكياج، أو مساعدة في بناء روتينك المثالي — أنا هنا لمساعدتك! شو بتحبي تسألي اليوم؟",
    placeholder: 'اسألي د. روز عن الجمال...',
    buttonText: 'د. روز 🌹',
  },
};

const quickPrompts = {
  en: [
    { label: 'Skincare Routine', message: 'I want a complete skincare routine for my skin type. Can you help?' },
    { label: 'Acne Help', message: 'I have acne-prone skin. What products do you recommend from your pharmacy?' },
    { label: 'Makeup Tips ✨', message: 'What is a quick everyday makeup look for work?' },
    { label: 'Anti-Aging', message: 'I want to start an anti-aging routine. What ingredients should I look for?' },
  ],
  ar: [
    { label: 'روتين بشرة', message: 'أريد روتين عناية كامل لنوع بشرتي. ممكن تساعديني؟' },
    { label: 'علاج حب الشباب', message: 'بشرتي معرضة لحب الشباب. ما المنتجات اللي تنصحيني فيها؟' },
    { label: 'نصائح مكياج ✨', message: 'ما هو مكياج يومي سريع للعمل؟' },
    { label: 'مكافحة الشيخوخة', message: 'أريد أبدأ روتين مكافحة شيخوخة. ما المكونات المهمة؟' },
  ],
};

export const BeautyAssistant = () => {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const t = translations[language];
  const prompts = quickPrompts[language];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.welcome }]);
    }
  }, [isOpen, messages.length, t.welcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error((errorData as Record<string, string>).error || 'Failed to connect');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages.filter(m => m.content !== t.welcome));
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isArabic
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى 🌹'
          : 'Sorry, something went wrong. Please try again 🌹',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 lg:bottom-6 ${isRTL ? 'left-4 lg:left-6' : 'right-4 lg:right-6'} z-50 flex items-center gap-2.5 px-5 py-3 bg-white border-2 border-gold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Talk to Dr. Rose"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-burgundy to-pink-700 flex items-center justify-center">
          <RoseIcon className="text-lg" />
        </div>
        <span className="font-body text-sm font-semibold text-burgundy whitespace-nowrap">
          {t.buttonText}
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 lg:bottom-6 ${isRTL ? 'left-4 lg:left-6' : 'right-4 lg:right-6'} z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gold/30 overflow-hidden transition-all duration-400 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy to-pink-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🌹
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">{t.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs text-white/80 font-body">{t.title}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[300px] p-4 bg-cream/30" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-burgundy to-pink-700 flex items-center justify-center text-xs shrink-0 mr-2 mt-1">
                    🌹
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-burgundy text-white rounded-br-sm'
                      : 'bg-white border border-gold/20 text-foreground rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-burgundy to-pink-700 flex items-center justify-center text-xs shrink-0 mr-2 mt-1">
                  🌹
                </div>
                <div className="bg-white border border-gold/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 pt-2 bg-cream/30 border-t border-gold/10">
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt.message)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-body bg-white border border-gold/30 rounded-full text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy transition-all duration-300 disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gold/20 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 rounded-full bg-cream/50 border-gold/30 focus-visible:ring-gold font-body text-sm"
              disabled={isLoading}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-gradient-to-r from-burgundy to-pink-700 hover:opacity-90 shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2 font-body flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-pink-400" />
            {isArabic ? 'بواسطة آسبر بيوتي' : 'Powered by Asper Beauty'}
          </p>
        </div>
      </div>
    </>
  );
};

export default BeautyAssistant;
