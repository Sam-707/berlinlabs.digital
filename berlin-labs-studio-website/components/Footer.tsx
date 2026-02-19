
import React from 'react';
import { Page } from '../types';
import { Logo } from './Logo';
import { NAV_CONTENT, FOOTER_CONTENT } from '../data/content';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="glass-card border-t border-white/10 backdrop-blur-xl px-6 py-16 lg:py-20 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 mb-16">

          {/* Brand Section */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <Logo className="w-6 h-6 text-primary transition-transform duration-1000 group-hover:rotate-180" />
            <span className="font-display font-bold text-[10px] tracking-overline text-white transition-colors group-hover:text-primary uppercase">
              {NAV_CONTENT.brand.first}<span className="font-light text-primary ml-0.5">{NAV_CONTENT.brand.second}</span>
            </span>
          </div>

          {/* Navigation Section */}
          <nav className="flex flex-wrap justify-center lg:justify-end items-center gap-8 md:gap-12">
            {FOOTER_CONTENT.navigation.map((page) => (
              <button
                key={page}
                onClick={() => onNavigate(page as Page)}
                className="text-[10px] font-bold tracking-overline text-slate-500 hover:text-primary transition-colors duration-300 uppercase font-display"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </nav>

          {/* Social Icons Section */}
          <div className="flex items-center gap-3">
            {Object.entries(FOOTER_CONTENT.social).map(([key, social]) => (
              <a
                key={key}
                href={social.url}
                target={key !== 'email' ? '_blank' : undefined}
                rel={key !== 'email' ? 'noreferrer' : undefined}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 flex items-center justify-center transition-all duration-300 group"
                aria-label={social.label}
              >
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors duration-300 text-[18px]">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Meta Section - Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-overline font-mono font-bold">
              {FOOTER_CONTENT.copyright}
            </p>
            <span className="hidden sm:block w-px h-3 bg-slate-700/50"></span>
            <p className="text-[9px] text-slate-700 uppercase tracking-[0.2em] font-mono">
              {FOOTER_CONTENT.tagline}
            </p>
          </div>

          {/* Location & Timezone */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-600 text-[14px]">location_on</span>
            <p className="text-[9px] text-slate-600 uppercase tracking-[0.15em] font-mono">
              {FOOTER_CONTENT.location} · {FOOTER_CONTENT.timezone}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
