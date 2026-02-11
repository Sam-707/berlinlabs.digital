
import React from 'react';
import { RestaurantConfig } from '../types';

interface SplashViewProps {
  config: RestaurantConfig;
  onContinue: () => void;
  onEnterOwner: () => void;
}

const SplashView: React.FC<SplashViewProps> = ({ config, onContinue, onEnterOwner }) => {
  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white relative view-transition overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(194,30,58,0.15),transparent)] pointer-events-none z-0"></div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>

      {/* Phone-like centered shell for desktop */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[520px] mx-auto">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-20">
        <div className="size-20 mb-8 rounded-[2rem] bg-surface-dark border border-white/10 flex items-center justify-center text-primary shadow-2xl animate-pulse-soft">
          <span className="material-symbols-outlined text-[40px]">lunch_dining</span>
        </div>
        
        <h1 className="text-5xl font-black tracking-tighter leading-[0.85] text-white mb-4">
          {config.name.split(' ').slice(0, 1)}<br/>
          <span className="text-primary">{config.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        
        <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-[240px] opacity-70">
          Hand-crafted burgers and cold brews in the heart of Berlin.
        </p>

        <div className="mt-16 relative w-full aspect-[4/3] max-h-[280px] group">
          <div className="absolute inset-10 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-3xl border-[8px] border-white/5 transform transition-transform duration-1000 hover:scale-[1.02]">
            <img
              src={config.logo}
              alt={config.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-0 right-0 px-6">
              <span className="inline-block px-3 py-1 bg-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-white/10 mb-2">
                Today's Special
              </span>
              <h2 className="text-white font-black text-2xl tracking-tight">Double Trouble</h2>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-20 w-full px-8 pb-16">
        <button 
          onClick={onContinue}
          className="group relative flex w-full items-center justify-center gap-4 rounded-full bg-primary h-18 py-5 px-6 text-white shadow-[0_15px_40px_rgba(194,30,58,0.4)] transition-all active:scale-[0.97]"
        >
          <span className="text-xl font-black tracking-tight">Enter The Lab</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>

        <div className="mt-10 flex flex-col items-center gap-6">
          <button 
            onClick={onEnterOwner}
            className="text-[10px] font-black text-text-secondary/40 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Staff Access
          </button>
          
          <div className="flex items-center gap-2 opacity-30">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Powered by</span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <span className="text-[11px] font-black tracking-tighter text-white uppercase">Menuflows<span className="text-primary">.app</span></span>
            </div>
          </div>
        </div>
      </div>
      </div> {/* Close phone-like centered shell */}
    </div>
  );
};

export default SplashView;
