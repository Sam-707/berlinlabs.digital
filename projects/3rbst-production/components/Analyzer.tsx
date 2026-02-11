
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { BrandLogo } from './BrandLogo'; // Import the new logo

interface AnalyzerProps {
  whatsappUrl: string;
}

export const Analyzer: React.FC<AnalyzerProps> = ({ whatsappUrl }) => {
  // Animated auto-play demo
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const demoStartedRef = useRef(false);

  // Demo script
  const demoScript = [
    {
      type: 'bot' as const,
      content: 'أهلاً! 👋\n\nأنا *3rbst* - مساعدك الذكي للوثائق الألمانية',
      delay: 1000
    },
    {
      type: 'bot' as const,
      content: 'أرسل لي صورة أي وثيقة ألمانية\nوسأشرحها لك بالعربي في ثواني ⚡',
      delay: 2500
    },
    {
      type: 'user' as const,
      content: 'عندي رسالة من Jobcenter',
      delay: 2000
    },
    {
      type: 'user' as const,
      image: 'demo',
      delay: 1500
    },
    {
      type: 'typing' as const,
      delay: 2000
    },
    {
      type: 'bot' as const,
      content: '📄 *ملخص الوثيقة:*\nهذه رسالة من مكتب العمل (Jobcenter) بخصوص موعد مهم\n\n⚠️ *الإجراء المطلوب:*\nيجب الحضور شخصياً\n\n📅 *الموعد:*\n٢٠ ديسمبر - الساعة ١٠:٠٠ صباحاً\n\n💶 *تحذير:*\nقد يتأثر راتبك إذا لم تحضر!',
      delay: 3000
    },
    {
      type: 'bot' as const,
      content: '*رائع!* 🎉\n\nهكذا نشرح وثائقك بالعربي في أقل من 30 ثانية\n\nجاهز لتجربة الخدمة الحقيقية؟',
      delay: 2500
    }
  ];

  const scrollToBottom = () => {
    // Only scroll within the chat container, not the entire page
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-play demo script
  useEffect(() => {
    if (demoStartedRef.current) return;
    demoStartedRef.current = true;

    let timeoutId: NodeJS.Timeout;

    const playNextStep = (stepIndex: number) => {
      if (stepIndex >= demoScript.length) {
        // Demo finished - show CTA
        timeoutId = setTimeout(() => {
          const ctaMsg: ChatMessage = {
            id: `cta-${Date.now()}`,
            type: 'bot',
            content: '',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: 'read',
            actionLabel: 'ابدأ المحادثة الآن 💬',
            actionUrl: whatsappUrl
          };
          setMessages(prev => [...prev, ctaMsg]);
        }, 1000);
        return;
      }

      const step = demoScript[stepIndex];

      timeoutId = setTimeout(() => {
        if (step.type === 'typing') {
          setIsTyping(true);
          timeoutId = setTimeout(() => {
            setIsTyping(false);
            playNextStep(stepIndex + 1);
          }, step.delay);
        } else {
          const newMessage: ChatMessage = {
            id: `${step.type}-${stepIndex}-${Date.now()}`,
            type: step.type === 'user' ? 'user' : 'bot',
            content: step.content,
            image: step.image === 'demo' ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext x="150" y="60" font-family="Arial" font-size="16" fill="%23374151" text-anchor="middle" font-weight="bold"%3EJobcenter%3C/text%3E%3Ctext x="150" y="90" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle"%3ETernineinladung%3C/text%3E%3Ctext x="150" y="120" font-family="Arial" font-size="10" fill="%23999" text-anchor="middle"%3EDatum: 20.12.2024%3C/text%3E%3Ctext x="150" y="140" font-family="Arial" font-size="10" fill="%23999" text-anchor="middle"%3EUhrzeit: 10:00 Uhr%3C/text%3E%3Ctext x="150" y="170" font-family="Arial" font-size="9" fill="%23ef4444" text-anchor="middle" font-weight="bold"%3EWICHTIG: Persönliches Erscheinen%3C/text%3E%3C/svg%3E' : undefined,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: step.type === 'user' ? 'sent' : 'read'
          };

          setMessages(prev => [...prev, newMessage]);

          // Update status for user messages
          if (step.type === 'user') {
            setTimeout(() => {
              setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: 'read' } : m
              ));
            }, 800);
          }

          playNextStep(stepIndex + 1);
        }
      }, step.delay);
    };

    // Start demo after 500ms
    timeoutId = setTimeout(() => playNextStep(0), 500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [whatsappUrl]);

  // Demo mode - no file upload needed

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

  // Demo mode - always show chat interface
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Phone Mockup */}
      <div className="w-full max-w-[380px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden relative h-[600px] flex flex-col">
        
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
        <div className="flex-1 bg-[#efeae2] overflow-y-auto p-4 flex flex-col gap-4 overscroll-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', overscrollBehavior: 'contain' }}>
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

              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
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

        {/* Demo Indicator */}
        <div className="bg-gradient-to-r from-[#075e54] to-[#128C7E] p-3 flex items-center justify-center gap-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
            <span>ديمو تفاعلي • شاهد كيف يعمل 3rbst</span>
          </div>
        </div>
      </div>
    </div>
  );
};