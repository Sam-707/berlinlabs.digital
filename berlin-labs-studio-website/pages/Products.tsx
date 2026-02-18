
import React from 'react';
import { PROJECTS } from '../data/projects';
import { PRODUCTS_CONTENT } from '../data/content';
import { Page } from '../types';
import { StateBadge } from '../components/StateBadge';

interface ProductsProps {
  onNavigate: (page: Page) => void;
}

export const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-12 py-32 animate-in fade-in duration-1000">
      <header className="mb-16 md:mb-32 text-center lg:text-left flex flex-col items-center lg:items-start">
        <span className="overline-label">{PRODUCTS_CONTENT.header.overline}</span>
        <h1 className="h1-hero text-white uppercase tracking-tightest">{PRODUCTS_CONTENT.header.title}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {PROJECTS.map(item => (
          <div 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group cursor-pointer p-8 md:p-12 glass-card rounded-2xl border-white/10 hover:border-primary/20 hover:shadow-gold-glow transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all">
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary text-3xl transition-colors duration-300">
                    {item.icon}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StateBadge state={item.state} />
                </div>
              </div>
              
              {/* Title reverted to white with primary hover */}
              <h3 className="text-2xl md:text-4xl font-display font-bold mb-6 text-white transition-colors group-hover:text-primary tracking-tightest uppercase">
                {item.title}
              </h3>
              
              <p className="text-sm md:text-base text-slate-400 font-light leading-editorial mb-8 max-w-sm group-hover:text-slate-300 transition-colors">
                {item.detail?.tagline || item.promise || item.intent}
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between pt-8 border-t border-white/10 group-hover:border-primary/20 transition-all">
               <span className="text-[10px] uppercase tracking-overline font-display font-bold text-slate-500 group-hover:text-primary transition-colors">
                 {PRODUCTS_CONTENT.ctaSuffix}
               </span>
               <span className="material-symbols-outlined text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all text-lg">
                 arrow_forward
               </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-8 opacity-40">
        <div className="max-w-xs">
          <p className="text-[10px] uppercase tracking-overline font-bold mb-2">Directory Logic</p>
          <p className="text-xs leading-relaxed font-light">The index tracks current operational status across the BerlinLabs ecosystem. Verified systems are marked with high-visibility badges.</p>
        </div>
        <div className="text-[10px] uppercase tracking-overline font-mono font-bold">
          Ref: BL-INDEX-2026
        </div>
      </div>
    </main>
  );
};
