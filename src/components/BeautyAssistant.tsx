import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Stethoscope, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

type Message = { role: 'user' | 'assistant'; content: string };
type Persona = 'dr-sami' | 'zain' | null;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rgehleqcubtmcwyipyvi.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZWhsZXFjdWJ0bWN3eWlweXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM5MDEsImV4cCI6MjA4MzQxOTkwMX0.8BEpVzIvWc2do2v8v3pOP3txcTs52HsM4F7KVavlQNU";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;

const personas = {
  'dr-sami': {
    en: {
      name: 'Dr. Sami',
      title: 'Clinical Pharmacist',
      welcome: "Hello, I'm Dr. Sami, your clinical skincare pharmacist. Tell me about your skin concern — whether it's acne, dryness, aging, or sensitivity — and I'll prescribe the right routine for you. What's troubling your skin today?",
      buttonLabel: 'Dr. Sami',
      description: 'Clinical skincare advice from a pharmacist',
    },
    ar: {
      name: 'د. سامي',
      title: 'صيدلي سريري',
      welcome: "مرحباً، أنا د. سامي، صيدليك المتخصص في العناية بالبشرة. أخبرني عن مشكلة بشرتك — سواء كانت حب شباب، جفاف، شيخوخة، أو حساسية — وسأصف لك الروتين المناسب. ما الذي يقلقك في بشرتك اليوم؟",
      buttonLabel: 'د. سامي',
      description: 'نصائح طبية من صيدلي متخصص',
    },
    icon: Stethoscope,
    color: 'bg-burgundy',
    apiPersona: 'dr-sami',
  },
  'zain': {
    en: {
      name: 'Ms. Zain',
      title: 'Beauty Consultant',
      welcome: "Hey there! ✨ I'm Zain, your beauty bestie at Asper! Whether you need a full skincare routine, makeup tips, or help picking a fragrance — I've got you! What are we working on today?",
      buttonLabel: 'Ms. Zain',
      description: 'Beauty tips, makeup & routines',
    },
    ar: {
      name: 'زين',
      title: 'خبيرة تجميل',
      welcome: "أهلاً! ✨ أنا زين، صديقتك في عالم الجمال من آسبر! سواء كنتِ تحتاجين روتين عناية بالبشرة، نصائح مكياج، أو مساعدة في اختيار عطر — أنا هنا! على شو نشتغل اليوم؟",
      buttonLabel: 'زين',
      description: 'نصائح جمال ومكياج وروتين',
    },
    icon: Sparkles,
    color: 'bg-pink-600',
    apiPersona: 'zain',
  },
};

const quickPrompts = {
  'dr-sami': {
    en: [
      { label: 'Acne Routine', message: 'I have acne-prone oily skin. What clinical routine do you recommend?' },
      { label: 'Anti-Aging', message: 'I want to start an anti-aging routine. What ingredients should I look for?' },
      { label: 'Sensitive Skin', message: 'My skin is very sensitive and reacts to most products. Help!' },
    ],
    ar: [
      { label: 'روتين حب الشباب', message: 'عندي بشرة دهنية ومعرضة لحب الشباب. ما الروتين الذي تنصح به؟' },
      { label: 'مكافحة الشيخوخة', message: 'أريد أن أبدأ روتين مكافحة شيخوخة. ما المكونات المهمة؟' },
      { label: 'بشرة حساسة', message: 'بشرتي حساسة جداً وتتفاعل مع معظم المنتجات. ساعدني!' },
    ],
  },
  'zain': {
    en: [
      { label: 'Glass Skin ✨', message: 'How do I get that glass skin look? Give me a full routine!' },
      { label: 'Everyday Makeup', message: 'What is a quick everyday makeup routine for work?' },
      { label: 'Gift Ideas 🎁', message: "I need a beauty gift set for my friend's birthday. What do you suggest?" },
    ],
    ar: [
      { label: 'بشرة زجاجية ✨', message: 'كيف أحصل على بشرة زجاجية؟ أعطيني روتين كامل!' },
      { label: 'مكياج يومي', message: 'ما هو روتين مكياج سريع للعمل؟' },
      { label: 'أفكار هدايا 🎁', message: 'أحتاج مجموعة هدية جمال لعيد ميلاد صديقتي. ما رأيك؟' },
    ],
  },
};

export const BeautyAssistant = () => {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectPersona = (persona: Persona) => {
    if (!persona) return;
    setSelectedPersona(persona);
    const p = personas[persona];
    const t = p[language];
    setMessages([{ role: 'assistant', content: t.welcome }]);
  };

  const resetChat = () => {
    setSelectedPersona(null);
    setMessages([]);
    setInput('');
  };

  const streamChat = async (userMessages: Message[]) => {
    if (!selectedPersona) return;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages,
        persona: personas[selectedPersona].apiPersona,
      }),
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

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedPersona) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const p = personas[selectedPersona];
    const t = p[language];
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
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (message: string) => {
    if (isLoading || !selectedPersona) return;
    setInput(message);
    const p = personas[selectedPersona];
    const t = p[language];
    const userMsg: Message = { role: 'user', content: message };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    streamChat(newMessages.filter(m => m.content !== t.welcome))
      .catch(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: isArabic
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            : 'Sorry, something went wrong. Please try again.',
        }]);
      })
      .finally(() => {
        setIsLoading(false);
        setInput('');
      });
  };

  const currentPersona = selectedPersona ? personas[selectedPersona] : null;
  const currentT = currentPersona ? currentPersona[language] : null;
  const currentPrompts = selectedPersona ? quickPrompts[selectedPersona][language] : [];
  const PersonaIcon = currentPersona?.icon || Stethoscope;

  return (
    <>
      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 lg:bottom-6 ${isRTL ? 'left-4 lg:left-6' : 'right-4 lg:right-6'} z-50 flex items-center gap-3 px-5 py-3 bg-white border-2 border-gold rounded-full shadow-lg hover:shadow-xl transition-all duration-400 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open beauty assistant"
      >
        <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-gold" />
        </div>
        <span className="font-body text-sm font-medium text-burgundy whitespace-nowrap">
          {isArabic ? 'استشارة مجانية' : 'Free Consult'}
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 lg:bottom-6 ${isRTL ? 'left-4 lg:left-6' : 'right-4 lg:right-6'} z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gold/30 overflow-hidden transition-all duration-400 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className={`${currentPersona?.color || 'bg-burgundy'} p-4 flex items-center justify-between transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            {selectedPersona && (
              <button onClick={resetChat} className="text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <PersonaIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">
                {currentT?.name || (isArabic ? 'آسبر بيوتي' : 'Asper Beauty')}
              </h3>
              <p className="text-xs text-white/80 font-body">
                {currentT?.title || (isArabic ? 'استشارة تجميل مجانية' : 'Free Beauty Consultation')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setIsOpen(false); }}
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Persona Selection */}
        {!selectedPersona && (
          <div className="p-5 space-y-4">
            <p className="text-center font-body text-sm text-muted-foreground">
              {isArabic ? 'اختر خبيرك:' : 'Choose your expert:'}
            </p>

            {/* Dr. Sami Card */}
            <button
              onClick={() => selectPersona('dr-sami')}
              className="w-full p-4 rounded-xl border-2 border-gold/20 hover:border-burgundy hover:bg-burgundy/5 transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground group-hover:text-burgundy transition-colors">
                    {personas['dr-sami'][language].name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-body">
                    {personas['dr-sami'][language].description}
                  </p>
                </div>
              </div>
            </button>

            {/* Ms. Zain Card */}
            <button
              onClick={() => selectPersona('zain')}
              className="w-full p-4 rounded-xl border-2 border-gold/20 hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground group-hover:text-pink-600 transition-colors">
                    {personas['zain'][language].name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-body">
                    {personas['zain'][language].description}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Chat Messages */}
        {selectedPersona && (
          <>
            <ScrollArea className="h-[280px] p-4 bg-cream/30" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? `${currentPersona?.color || 'bg-burgundy'} text-white rounded-br-sm`
                          : 'bg-white border border-gold/20 text-foreground rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gold/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-gold" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 pt-2 bg-cream/30 border-t border-gold/10">
                <div className="flex flex-wrap gap-2">
                  {currentPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt.message)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-body bg-white border border-gold/30 rounded-full text-foreground hover:bg-gold hover:text-burgundy hover:border-gold transition-all duration-300 disabled:opacity-50"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gold/20 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isArabic ? 'اكتب رسالتك...' : 'Type your message...'}
                  className="flex-1 rounded-full bg-cream/50 border-gold/30 focus-visible:ring-gold font-body text-sm"
                  disabled={isLoading}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className={`rounded-full ${currentPersona?.color || 'bg-burgundy'} hover:opacity-90 shrink-0`}
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BeautyAssistant;
