
import React, { useState } from 'react';
import { Page } from '../types';
// Fix: Import from data/content.ts as constants.tsx is deprecated
import { NAV_CONTENT } from '../data/content';
import { Logo } from './Logo';

interface NavigationProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-[60] bg-surface-bg/65 border-b border-white/[0.03] backdrop-blur-sm transition-all duration-300">
        <div className="layout-shell px-4 py-2 md:px-6 md:py-2.5 lg:px-6 lg:py-2.5 flex justify-between items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group" 
            onClick={() => handleNavigate('home')}
          >
            <Logo className="w-6 h-6 text-primary transition-transform duration-1000 group-hover:rotate-180" />
            <span className="font-display font-bold text-base md:text-lg tracking-tightest text-white transition-colors group-hover:text-primary">
              {NAV_CONTENT.brand.first}<span className="font-light text-primary/40">{NAV_CONTENT.brand.second}</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_CONTENT.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`text-[10px] font-display font-bold uppercase tracking-overline transition-all hover:text-primary ${
                  currentPage === item.id ? 'text-primary' : 'text-slate-400'
                } ${item.isCta ? 'px-3.5 py-1.5 border border-primary/15 rounded-full hover:bg-primary/5' : ''}`}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3 rounded-full transition-all duration-300 border min-h-[44px] min-w-[44px] ${isMenuOpen ? 'bg-primary text-black border-primary' : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'}`}
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isMenuOpen}
            >
              <span className="material-symbols-outlined align-middle text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[55] bg-surface-bg/95 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center p-6 lg:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        <div className="flex flex-col items-center gap-10">
          <span className="overline-label mb-2 opacity-50">Navigation</span>
          {NAV_CONTENT.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`text-3xl md:text-5xl font-display font-bold transition-all hover:text-primary tracking-tightest uppercase ${currentPage === item.id ? 'text-primary' : 'text-white'}`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="mt-12 flex items-center gap-6">
            <div className="w-12 h-px bg-white/10"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
            <div className="w-12 h-px bg-white/10"></div>
          </div>
        </div>
      </div>
    </>
  );
};
