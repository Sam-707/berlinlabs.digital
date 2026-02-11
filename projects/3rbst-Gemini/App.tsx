
import React, { useState } from 'react';
import { PRICING_TIERS, HOW_IT_WORKS_STEPS, TRUST_SIGNALS } from './constants';
import { Analyzer } from './components/Analyzer';
import { PaymentModal } from './components/PaymentModal';
import { LegalPages } from './components/LegalPages';
import { BrandLogo } from './components/BrandLogo'; // Imported Logo
import { PricingTier } from './types';

// --- CONFIGURATION CENTER ---
// Change this single number if you get banned or switch SIMs.
// The whole site will update instantly.
const BUSINESS_CONFIG = {
  PHONE_NUMBER: "4915100000000", // Replace with your current active SIM
  START_MESSAGE: "مرحباً 3rbst، عندي وثيقة ألمانية وأحتاج مساعدة 📄",
};

type ViewState = 'home' | 'impressum' | 'privacy' | 'terms';

function App() {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  
  const whatsappUrlEncoded = encodeURIComponent(BUSINESS_CONFIG.START_MESSAGE);
  const whatsappLink = `https://wa.me/${BUSINESS_CONFIG.PHONE_NUMBER}?text=${whatsappUrlEncoded}`;

  const scrollToDemo = () => {
    const element = document.getElementById('demo-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePricingClick = (tier: PricingTier) => {
    if (tier.id === 'trial') {
      window.open(whatsappLink, '_blank');
    } else {
      setSelectedTier(tier);
    }
  };

  // If we are on a legal page, show that component instead of the landing page
  if (currentView !== 'home') {
    return (
      <LegalPages 
        page={currentView} 
        onBack={() => setCurrentView('home')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* LOGO UPDATE */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
             <BrandLogo className="w-10 h-10 text-brand-600" withText={true} />
          </div>

          <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">كيف يعمل</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">الأسعار</a>
          </nav>
          <a 
            href={whatsappLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-5 py-2 rounded-full font-bold hover:bg-[#1ebc57] transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            تواصل معنا
          </a>
        </div>
      </header>

      {/* Hero Section (Split View) */}
      <section id="demo-section" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Copywriting (Right Side in RTL) */}
            <div className="text-center lg:text-right order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-brand-50 px-4 py-1.5 rounded-full mb-6 border border-brand-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-brand-700">متاح الآن: تحليل فوري بالذكاء الاصطناعي 🤖</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.2]">
                لا تدع اللغة الألمانية <br className="hidden md:block"/>
                <span className="text-brand-600 relative inline-block">
                  تضيع حقوقك
                  <svg className="absolute -bottom-2 w-full h-3 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none"/></svg>
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                هل وصلتك رسالة من الجوب سنتر أو البلدية؟ صورها وأرسلها عبر الواتساب.
                سنشرح لك المطلوب بالضبط، ونتأكد من أنك لن تفوت أي موعد مهم.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 transition-all hover:translate-y-[-2px]"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  ابدأ بوثيقة مجانية
                </a>
              </div>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                  خصوصية تامة
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                  بدون تحميل تطبيقات
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                  ذكاء اصطناعي متطور
                </div>
              </div>
            </div>

            {/* Interactive Demo (Left Side in RTL) */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
               <div className="relative z-10">
                 <div className="absolute -inset-4 bg-brand-200/30 rounded-full blur-3xl -z-10"></div>
                 <Analyzer whatsappUrl={whatsappLink} />
                 {/* Floating Badge */}
                 <div className="absolute top-1/2 -right-12 hidden lg:flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
                   <div className="bg-orange-100 p-2 rounded-full">🔔</div>
                   <div className="text-xs font-bold">
                     <div className="text-gray-800">تنبيه هام!</div>
                     <div className="text-gray-500">لديك موعد بعد يومين</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Security Stats */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100">
            {TRUST_SIGNALS.map((item, idx) => (
              <div key={idx} className="text-center pt-8 md:pt-0">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-paper">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-brand-600 font-bold mb-3 uppercase tracking-wider text-sm">بسيط وسريع</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">كيف يعمل 3rbst؟</h3>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div 
                key={step.number} 
                onClick={scrollToDemo}
                className="group relative p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
              >
                {/* Brand-Cohesive Icon (WhatsApp Style) */}
                <div className="relative w-20 h-20 mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300">
                   {/* Green 'App' Icon */}
                   <div className="w-full h-full bg-[#25D366] rounded-2xl flex items-center justify-center text-white shadow-lg">
                      {step.number === "1" && (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      )}
                      {step.number === "2" && (
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      )}
                      {step.number === "3" && (
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                      )}
                   </div>
                   
                   {/* Notification Badge */}
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                     {step.number}
                   </div>
                </div>

                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">{step.description}</p>
                
                <span className="text-brand-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  جرب الآن ←
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-paper">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">خطط تناسب الجميع</h2>
            <p className="text-xl text-gray-500">لا توجد رسوم خفية</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div 
                key={tier.id} 
                className={`
                  relative rounded-2xl p-6 transition-all duration-300
                  ${tier.highlight 
                    ? 'bg-white shadow-2xl scale-105 border-2 border-brand-500 z-10' 
                    : 'bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1'}
                `}
              >
                {tier.highlight && (
                  <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    الأكثر طلباً
                  </div>
                )}
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-500 text-sm block mt-1">/{tier.period}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handlePricingClick(tier)}
                  className={`w-full py-3 rounded-xl font-bold transition-colors
                    ${tier.highlight 
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20' 
                      : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'}
                  `}
                >
                  {tier.id === 'trial' ? 'ابدأ التجربة' : 'اشترك الآن'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 bg-white inline-block px-6 py-3 rounded-full shadow-sm mx-auto flex items-center gap-2 border border-gray-100">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             <p className="text-sm text-gray-600">
               دفع آمن عبر PayPal
             </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-[#075e54] text-white text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">جاهز لفهم وثائقك؟</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            أكثر من 1000 مستخدم يعتمدون علينا يومياً لفهم الرسائل الألمانية المعقدة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
               href={whatsappLink}
               className="bg-white text-[#075e54] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              ابدأ المحادثة الآن
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               {/* Small Footer Logo */}
               <BrandLogo className="w-6 h-6 text-gray-800" />
               <span className="font-bold text-xl text-gray-800">3rbst</span>
               <span className="text-gray-400">|</span>
               <span className="text-gray-500 flex items-center gap-1">
                 Powered by <strong className="text-gray-700">BridgeLab Digital</strong>
               </span>
            </div>
            <div className="flex gap-8 text-gray-500 cursor-pointer">
              <span onClick={() => setCurrentView('home')} className="hover:text-brand-600 transition-colors">اتصل بنا</span>
              <span onClick={() => setCurrentView('privacy')} className="hover:text-brand-600 transition-colors">الخصوصية (Datenschutz)</span>
              <span onClick={() => setCurrentView('terms')} className="hover:text-brand-600 transition-colors">الشروط (AGB)</span>
              <span onClick={() => setCurrentView('impressum')} className="hover:text-brand-600 transition-colors">Impressum</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Payment Modal */}
      {selectedTier && (
        <PaymentModal 
          isOpen={true} 
          onClose={() => setSelectedTier(null)} 
          tier={selectedTier} 
        />
      )}
    </div>
  );
}

export default App;
