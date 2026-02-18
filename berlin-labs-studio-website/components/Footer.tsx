
import React from 'react';
import { Page } from '../types';
import { Logo } from './Logo';
// Fix: Import from data/content.ts as constants.tsx is deprecated
import { NAV_CONTENT, FOOTER_CONTENT } from '../data/content';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="px-6 py-16 lg:py-20 mt-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 lg:gap-16">
        {/* Footer Brand Logo Section - Synced with Navigation.tsx hover behavior */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <Logo className="w-6 h-6 text-primary transition-transform duration-1000 group-hover:rotate-180" />
          <span className="font-display font-bold text-[10px] tracking-overline text-white transition-colors group-hover:text-primary uppercase">
            {NAV_CONTENT.brand.first}<span className="font-light text-primary/60 ml-0.5">{NAV_CONTENT.brand.second}</span>
          </span>
        </div>
        
        <nav className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {['products', 'studio', 'contact'].map((page) => (
            <button 
              key={page}
              onClick={() => onNavigate(page as Page)} 
              className="text-[10px] font-bold tracking-overline text-slate-600 hover:text-primary transition-colors uppercase font-display"
            >
              {page === 'products' ? 'Index' : page}
            </button>
          ))}
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[10px] font-bold tracking-overline text-slate-600 hover:text-primary transition-colors uppercase font-display"
          >
            Linkedin
          </a>
        </nav>

        <div className="flex flex-col items-center gap-6 pt-10">
          <p className="text-[10px] text-slate-800 uppercase tracking-overline font-mono font-bold">
            {FOOTER_CONTENT.copyright}
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
          <p className="text-[9px] text-slate-900 uppercase tracking-[0.2em] font-mono italic">
            Operational Excellence by BerlinLabs
          </p>
        </div>
      </div>
    </footer>
  );
};
