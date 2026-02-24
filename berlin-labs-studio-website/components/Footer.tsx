
import React from 'react';
import { Page } from '../types';
import { Logo } from './Logo';
import { NAV_CONTENT, FOOTER_CONTENT } from '../data/content';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="glass-card border-t border-white/10 backdrop-blur-xl py-10 lg:py-12 mt-14">
      <div className="layout-shell">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">

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
          <nav className="flex flex-wrap justify-center lg:justify-end items-center gap-6 md:gap-8">
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
            {/* LinkedIn - Custom SVG */}
            <a
              href={FOOTER_CONTENT.social.linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 flex items-center justify-center transition-all duration-300 group"
              aria-label={FOOTER_CONTENT.social.linkedin.label}
            >
              <svg className="w-[18px] h-[18px] text-slate-500 group-hover:text-primary transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            {/* Email - Material Symbol */}
            <a
              href={FOOTER_CONTENT.social.email.url}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 flex items-center justify-center transition-all duration-300 group"
              aria-label={FOOTER_CONTENT.social.email.label}
            >
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors duration-300 text-[18px]">
                mail
              </span>
            </a>
          </div>
        </div>

        {/* Meta Section - Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
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
