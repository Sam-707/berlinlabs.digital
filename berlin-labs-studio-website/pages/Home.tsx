
import React from 'react';
import { SYSTEMS } from '../data/systems';
import { HOME_CONTENT, STUDIO_CONTENT } from '../data/content';
import { Page } from '../types';
import { SystemCard } from '../components/SystemCard';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Find the featured system (MenuFlows) for the capability showcase
  const featuredSystem = SYSTEMS.find(s => s.id === 'menuflows');
  const currentFeatures = featuredSystem?.focusPoints || [];

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
    <main className="relative z-10">
      {/* Hero Section - 7/5 Grid Layout */}
      <section className="w-full relative hero-shell stack-hero">
        <div className="relative z-10 layout-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="flex flex-col items-start max-w-4xl lg:col-span-8">
              {/* Overline: technical prefix + editorial sub-line */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="overline-label !mb-2">{HOME_CONTENT.hero.overline}</span>
                <p className="text-[10px] font-mono text-slate-600 tracking-wider">
                  Berlin-first product studio.
                </p>
              </div>

              {/* Hero heading */}
              <h1 className="h1-hero mb-8 animate-in fade-in slide-in-from-bottom-6 zoom-in-[0.97] duration-700">
                {HOME_CONTENT.hero.titleMain} <br className="hidden sm:block" />
                <span className="gold-gradient-text">{HOME_CONTENT.hero.titleSecondary}.</span>
              </h1>

              {/* Body text */}
              <p className="text-lead mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                {HOME_CONTENT.hero.body}
              </p>

              {/* CTA row — onboarding-first */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <button onClick={() => onNavigate('onboarding')} className="btn-primary" aria-label="Start Onboarding">
                  Start Onboarding
                  <span className="material-symbols-outlined text-lg ml-2 align-middle">arrow_forward</span>
                </button>
                <button onClick={() => onNavigate('systems')} className="btn-secondary" aria-label="View Index">
                  View Index
                </button>
              </div>

              {/* Metadata strip */}
              <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-x-6 gap-y-2 animate-in fade-in duration-1000 delay-500">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Berlin, DE</span>
                <span className="text-[9px] font-mono text-white/10">·</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Est. 2024</span>
                <span className="text-[9px] font-mono text-white/10">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/60"></span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Systems Active</span>
                </div>
              </div>
            </div>

            {/* Right column: Operational Vitals — desktop only */}
            <div className="hidden lg:flex lg:col-span-4 items-center justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
              <div className="glass-card glass-card-hover rounded-3xl p-8 w-full max-w-[260px] relative overflow-hidden">
                {/* Ambient top glow — gold, very subtle */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                {/* Card header — terminal chrome */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/10"></span>
                      <span className="w-2 h-2 rounded-full bg-white/10"></span>
                      <span className="w-2 h-2 rounded-full bg-primary/30"></span>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Status</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </div>

                {/* Vitals rows */}
                <dl className="space-y-0">
                  <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                    <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Systems</dt>
                    <dd className="text-sm font-display font-bold text-white">02</dd>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                    <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Live</dt>
                    <dd className="text-[9px] font-mono uppercase tracking-widest text-primary/80">Active</dd>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                    <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Region</dt>
                    <dd className="text-[9px] font-mono text-slate-500">EU-Central</dd>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Intake</dt>
                    <dd className="text-[9px] font-mono uppercase tracking-widest text-primary/60">Q2–Q3 2026</dd>
                  </div>
                </dl>

                {/* Card footer */}
                <div className="mt-7 pt-5 border-t border-white/[0.06]">
                  <span className="text-[8px] font-mono text-slate-700 tracking-widest uppercase">v2.0 // BLX-001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Feature Showcase: Current Build Deep Dive */}
      {currentFeatures.length > 0 && (
        <section className="stack-section relative">
          <div className="layout-shell">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-14 lg:gap-20">
              <div className="text-center lg:text-left">
                <span className="overline-label">Current Build</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  {featuredSystem?.name}
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-primary/70">Pilot Active · Berlin</span>
                </div>
                <p className="max-w-xs mx-auto lg:mx-0 text-slate-500">
                  {featuredSystem?.oneLiner}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {currentFeatures.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="group p-8 rounded-2xl glass-card glass-card-hover">
                    <div className="flex items-center gap-4 mb-6">
                       <span className="text-[10px] font-mono text-primary/30 font-bold tracking-widest group-hover:text-primary/60 transition-colors">0{idx + 1}</span>
                       <div className="flex-grow h-px bg-white/5 group-hover:bg-primary/10 transition-colors"></div>
                    </div>
                    <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors mb-4 uppercase tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-light leading-editorial text-slate-400 group-hover:text-slate-300 transition-colors">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Systems Section - Unified Directory */}
      <section className="stack-section border-y border-white/10 bg-black/40 relative">
        <div className="layout-shell">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="overline-label mb-1">Systems</span>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{SYSTEMS.length} systems · multiple stages</p>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-700 hidden sm:block">Berlin · EU-Central</span>
          </div>

          {/* Unified systems grid - all states in one layout using SystemCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {SYSTEMS.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                variant="compact"
                onClick={() => handleSystemClick(system)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Principles Rhythm Section */}
      <section className="stack-section">
        <div className="layout-shell">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-14 lg:gap-20">
            <header className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="overline-label">{HOME_CONTENT.studioWork.label}</span>
              <h2 className="h2-section mb-6 text-white">How we<br /><span className="gold-gradient-text">build.</span></h2>
              <p className="text-slate-500 max-w-xs font-light">
                Ship working software. Refine from real usage.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              {STUDIO_CONTENT.constitution.items.map((item, idx) => (
                <div key={idx} className="relative p-8 rounded-2xl glass-card glass-card-hover group overflow-hidden">
                  {/* Decorative phase number - restored for visual hierarchy */}
                  <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">
                     <span className="text-8xl font-display font-bold text-primary">0{idx + 1}</span>
                  </div>
                  <span className="overline-label mb-6">PHASE 0{idx + 1}</span>
                  <h3 className="text-2xl font-display font-bold mb-6 text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[15px] font-light group-hover:text-slate-300 transition-colors">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — editorial split layout */}
      <section className="stack-section border-t border-white/[0.06]">
        <div className="layout-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left: editorial headline */}
            <div>
              <span className="overline-label">Intake</span>
              <h2 className="h2-section mb-6 text-white">
                Operational<br /><span className="gold-gradient-text">Stability.</span>
              </h2>
              <p className="text-lead max-w-sm">
                Studio capacity: one project monthly.
              </p>
            </div>

            {/* Right: CTA + live indicator */}
            <div className="flex flex-col items-start lg:items-end gap-6">
              <button
                onClick={() => onNavigate('contact')}
                className="btn-primary"
                aria-label="Initiate Connection"
              >
                Initiate Connection
                <span className="material-symbols-outlined text-lg ml-2 align-middle">arrow_forward</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">Q2–Q3 2026 · Intake Open</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};
