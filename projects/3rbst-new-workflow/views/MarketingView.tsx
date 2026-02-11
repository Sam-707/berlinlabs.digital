
import React, { useState } from 'react';

interface MarketingViewProps {
  onTryDemo: () => void;
  onOwnerPortal: () => void;
}

const MarketingView: React.FC<MarketingViewProps> = ({ onTryDemo, onOwnerPortal }) => {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white animate-fade-in overflow-y-auto no-scrollbar relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(194,30,58,0.2),transparent)] pointer-events-none z-0"></div>
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <nav className="relative z-10 px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <span className="text-xl font-black tracking-tighter">menuflows<span className="text-primary">.app</span></span>
        </div>
        <button 
          onClick={onOwnerPortal}
          className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors"
        >
          Staff Login
        </button>
      </nav>

      <main className="relative z-10 px-8 pt-12 pb-32 space-y-20">
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
            Berlin High-End Operations
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-[0.9] text-white">
            The Digital Pulse of Your <span className="text-primary">Restaurant.</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-[300px] mx-auto opacity-80">
            Beyond static QR codes. A hand-crafted ecosystem for kitchens that care about the vibe.
          </p>
          <div className="pt-6 flex flex-col gap-4">
            <button 
              onClick={() => setShowForm(true)}
              className="w-full h-16 rounded-full bg-primary text-white font-black text-lg shadow-[0_15px_40px_rgba(194,30,58,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Start Stress Test
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button 
              onClick={onTryDemo}
              className="w-full h-14 rounded-full bg-white/5 border border-white/10 text-white font-black text-sm active:scale-95 transition-all"
            >
              View Consumer Demo
            </button>
          </div>
        </section>

        <section className="border-y border-white/5 py-6 overflow-hidden">
          <div className="flex items-center gap-10 animate-marquee whitespace-nowrap opacity-30">
            {['MITTE', 'KREUZBERG', 'NEUKÖLLN', 'PRENZLAUER BERG', 'FRIEDRICHSHAIN', 'CHARLOTTENBURG'].map((district) => (
              <span key={district} className="text-[10px] font-black tracking-[0.5em]">{district}</span>
            ))}
          </div>
        </section>

        <section className="space-y-12">
           <div className="space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Value Protocol</h2>
              <div className="space-y-6">
                 <div className="bg-[#241619] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                       <span className="material-symbols-outlined text-[32px]">sync_alt</span>
                    </div>
                    <h3 className="text-2xl font-black mb-3">Stop the walk.</h3>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                      Our proprietary <span className="text-white">Handshake Protocol</span> reduces waiter back-and-forth by 40%.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Pricing */}
        <section className="space-y-8">
           <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] text-center">Berlin Pricing</h2>
           <div className="grid grid-cols-1 gap-6">
              <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl text-center space-y-4 relative overflow-hidden">
                 <h4 className="text-lg font-black uppercase tracking-widest text-white/50">The Lab</h4>
                 <div className="text-5xl font-black">€39<span className="text-lg opacity-60">/mo</span></div>
                 <p className="text-xs text-white/80 font-medium">The full operational suite for busy Mitte kitchens.</p>
                 <button onClick={() => setShowForm(true)} className="w-full h-12 rounded-full bg-white text-primary font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                   Select Plan
                 </button>
              </div>
           </div>
        </section>

        <footer className="text-center space-y-4 opacity-40 pb-10 pt-10 border-t border-white/5">
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Berlin Quality since 2024</p>
        </footer>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center animate-fade-in p-4">
          <div className="w-full max-w-[340px] bg-[#1a0f11] rounded-[3rem] p-8 pb-12 animate-slide-up border border-white/10 shadow-3xl">
            {submitted ? (
              <div className="text-center space-y-6 animate-fade-in py-10">
                <div className="size-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                  <span className="material-symbols-outlined text-[48px]">call</span>
                </div>
                <h2 className="text-2xl font-black">Talk soon.</h2>
                <p className="text-text-secondary text-sm font-medium">We'll call you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tight leading-tight">Request<br/>Stress Test</h2>
                  <button onClick={() => setShowForm(false)} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required className="w-full bg-white/5 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary mt-1" placeholder="Restaurant Name" />
                  <input required type="tel" className="w-full bg-white/5 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary mt-1" placeholder="+49 ..." />
                  <button type="submit" className="w-full h-16 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-95 mt-4">
                    Send Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
    </div>
  );
};

export default MarketingView;
