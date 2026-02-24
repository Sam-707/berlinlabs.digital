
import React from 'react';
import { SYSTEMS } from '../data/systems';
import { SYSTEMS_CONTENT } from '../data/content';
import { Page } from '../types';
import { SystemCard } from '../components/SystemCard';

interface SystemsProps {
  onNavigate: (page: Page) => void;
}

export const Systems: React.FC<SystemsProps> = ({ onNavigate }) => {
  // Handle navigation - check if href is external or internal
  const handleSystemClick = (system: (typeof SYSTEMS)[number]) => {
    if (system.href.startsWith('http')) {
      window.open(system.href, '_blank');
    } else if (system.href === 'contact' || system.href === 'onboarding') {
      onNavigate(system.href);
    } else {
      onNavigate(system.id);
    }
  };

  return (
    <main className="layout-shell stack-section animate-in fade-in duration-1000">
      <header className="hero-shell stack-hero mb-12 text-center lg:text-left flex flex-col justify-center items-center lg:items-start">
        <span className="overline-label">{SYSTEMS_CONTENT.header.overline}</span>
        <h1 className="h1-hero text-white uppercase tracking-tightest">{SYSTEMS_CONTENT.header.title}</h1>
        <p className="text-lead text-measure">Operational systems at different stages of maturity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-standard">
        {SYSTEMS.map(system => (
          <SystemCard
            key={system.id}
            system={system}
            onClick={() => handleSystemClick(system)}
          />
        ))}
      </div>

      <div className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-8 opacity-40">
        <div className="max-w-xs">
          <p className="text-[10px] uppercase tracking-overline font-bold mb-2">Systems Directory</p>
          <p className="text-xs leading-relaxed font-light">Tracks current operational status across the BerlinLabs ecosystem.</p>
        </div>
        <div className="text-[10px] uppercase tracking-overline font-mono font-bold">
          Ref: BL-SYSTEMS-2026
        </div>
      </div>
    </main>
  );
};
