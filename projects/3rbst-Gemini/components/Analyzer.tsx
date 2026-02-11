
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { BrandLogo } from './BrandLogo'; // Import the new logo

interface AnalyzerProps {
  whatsappUrl: string;
}

export const Analyzer: React.FC<AnalyzerProps> = ({ whatsappUrl }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [hasPhone, setHasPhone] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [credits, setCredits] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'أهلاً بك! 👋 \nأنا مساعدك الذكي للوثائق الألمانية.\nأرسل صورة أي رسالة (Jobcenter, التأمين, المالك) وسأشرحها لك.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'read'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const validatePhone = (phone: string): boolean => {
    // Accept international format with + or country code
    const phoneRegex = /^(\+|00)?[1-9]\d{7,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handlePhoneSubmit = async () => {
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

    if (!validatePhone(cleanPhone)) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح (مثال: +491234567890)');
      return;
    }

    setPhoneError('');
    setLoading(true);

    try {
      // Check credits with backend
      const response = await fetch('/api/check-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      });

      const data = await response.json();
      setCredits(data.credits);
      setHasPhone(true);

      // Welcome message with credits info
      const welcomeMsg: ChatMessage = {
        id: (Date.now() + 3).toString(),
        type: 'bot',
        content: `مرحباً! 🎉\n\nلديك *${data.credits} تحليل مجاني*.\nأرسل صورة الوثيقة الألمانية الآن.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'read'
      };
      setMessages(prev => [...prev, welcomeMsg]);
    } catch (error) {
      setPhoneError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // 1. Add User Image Message
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          image: base64String,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'sent'
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        // Simulate network delay for realism
        setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
        }, 1000);

        try {
          // 2. Call AI via API (Secure Proxy) with phone number
          const base64Data = base64String.split(',')[1];

          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64Data,
                mimeType: file.type,
                phoneNumber: phoneNumber.replace(/[\s-]/g, '')
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "API Failed");
          }

          const data = await response.json();
          const aiResponseText = data.text;

          // Update credits if returned
          if (data.creditsRemaining !== undefined) {
            setCredits(data.creditsRemaining);
          }

          // 3. Add Bot Response
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: aiResponseText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: 'read'
          };
          setMessages(prev => [...prev, botMsg]);

          // 4. Add "Move to WhatsApp" CTA after a short delay
          setTimeout(() => {
             const ctaMsg: ChatMessage = {
              id: (Date.now() + 2).toString(),
              type: 'bot',
              content: "هل أعجبك الشرح؟ 🚀\nانتقل الآن إلى الواتساب الرسمي لإرسال بقية وثائقك في بيئة آمنة.",
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              status: 'read',
              actionLabel: "الانتقال للمحادثة الآمنة 🔒",
              actionUrl: whatsappUrl
            };
            setMessages(prev => [...prev, ctaMsg]);
          }, 1500);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "عذراً، الشبكة ضعيفة حالياً. يرجى المحاولة مرة أخرى.";

          // Check if it's a "no credits" error
          if (errorMessage.includes('credits') || errorMessage.includes('رصيد')) {
            setCredits(0);
            const noCreditsMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: "⚠️ عذراً، انتهى رصيدك المجاني.\n\nللمتابعة، يمكنك:\n✅ شراء المزيد من التحليلات\n✅ الانتقال للواتساب للحصول على باقات مخفضة",
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              status: 'read',
              actionLabel: "شراء رصيد 💳",
              actionUrl: "#buy-credits"  // Will trigger payment modal
            };
            setMessages(prev => [...prev, noCreditsMsg]);
          } else {
            const errorMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: errorMessage,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            };
            setMessages(prev => [...prev, errorMsg]);
          }
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Could add a toast notification here
  };

  // Helper to render text with bold formatting similar to WhatsApp
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <div key={i} className="min-h-[1.2em]">
        {line.split(/(\*[^*]+\*)/g).map((part, j) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return <strong key={j}>{part.slice(1, -1)}</strong>;
          }
          return part;
        })}
      </div>
    ));
  };

  // If no phone number yet, show phone input screen
  if (!hasPhone) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-[380px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden relative h-[600px] flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>

          {/* Phone Input Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#075e54] to-[#128C7E]">
            {/* Logo */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <BrandLogo className="w-12 h-12 text-[#075e54]" theme="light" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              مرحباً بك في 3rbst
            </h2>
            <p className="text-white/90 text-center mb-8 px-4">
              أدخل رقم هاتفك للحصول على *تحليل مجاني واحد* 🎁
            </p>

            {/* Phone Input */}
            <div className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  placeholder="+49 123 4567890"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl text-center text-lg border-2 border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                  dir="ltr"
                />
                {phoneError && (
                  <p className="text-red-200 text-sm mt-2 text-center">{phoneError}</p>
                )}
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={loading || !phoneNumber}
                className="w-full bg-white text-[#075e54] font-bold py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                {loading ? '⏳ جاري التحقق...' : 'ابدأ الآن →'}
              </button>

              <p className="text-white/70 text-xs text-center mt-4">
                🔒 رقمك آمن ولن يتم مشاركته مع أي طرف ثالث
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Phone Mockup */}
      <div className="w-full max-w-[380px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden relative h-[600px] flex flex-col transform transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>

        {/* Header - Updated for "Expert" Trust Signal with NEW LOGO */}
        <div className="bg-[#075e54] p-4 pt-8 flex items-center gap-3 text-white shadow-md z-10">
           <div className="relative">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold overflow-hidden border-2 border-green-300">
                {/* Replaced Image with BrandLogo component */}
                <BrandLogo className="w-6 h-6 text-[#075e54]" theme="light" />
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#075e54] rounded-full"></div>
           </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm flex items-center gap-1">
              3rbst - المساعد الذكي
              <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </h3>
            <p className="text-[10px] text-green-100 opacity-90">متصل الآن 🤖</p>
          </div>
          <div className="flex gap-4">
             <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#efeae2] overflow-y-auto p-4 space-y-4 scrollbar-hide" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
              <div 
                className={`max-w-[85%] rounded-lg p-2 shadow-sm relative text-sm
                  ${msg.type === 'user' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                `}
              >
                {msg.image && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-green-200 relative">
                    <img src={msg.image} alt="Document" className="w-full h-auto object-cover max-h-48" />
                    {/* Privacy Blur Effect hint for user uploads */}
                    {msg.type === 'user' && (
                       <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">🔒 مشفر</span>
                       </div>
                    )}
                  </div>
                )}
                
                {msg.content && (
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed px-1">
                    {renderContent(msg.content)}
                  </div>
                )}

                {/* CTA Button Logic */}
                {msg.actionUrl && msg.actionLabel && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <a 
                      href={msg.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-[#25D366] text-white py-2 rounded-md font-bold text-sm hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    {msg.actionLabel}
                    </a>
                  </div>
                )}

                <div className="flex justify-end items-center gap-1 mt-1 opacity-60">
                  <span className="text-[10px]">{msg.timestamp}</span>
                  {msg.type === 'user' && (
                    <span>
                      {msg.status === 'read' ? (
                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>
                      ) : (
                         <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      )}
                    </span>
                  )}
                </div>

                {/* Copy Button (Only shows on hover for bot messages) */}
                {msg.type === 'bot' && msg.content && (
                  <button 
                    onClick={() => copyToClipboard(msg.content!)}
                    className="absolute -left-8 top-2 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:text-green-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="نسخ النص"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
             <div className="flex justify-start">
               <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200">
          <button className="text-gray-500 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          
          <button onClick={triggerFileInput} className="text-gray-500 p-1 hover:text-[#008069] transition-colors relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
              disabled={loading}
            />
            {/* Pulsing effect to guide user */}
            {!loading && messages.length < 2 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <svg className="w-6 h-6 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          </button>

          <div className="flex-1 bg-white rounded-full px-4 py-2 text-gray-400 text-sm shadow-sm border border-gray-100">
             اختر صورة الوثيقة...
          </div>

          <button className="text-[#008069] p-2 bg-white rounded-full shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};