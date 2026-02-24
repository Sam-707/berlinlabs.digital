
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
        {/* Glow positioned right - hidden on mobile for fold compliance */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] orbital-glow rounded-full opacity-60 hidden lg:block"></div>

        <div className="relative z-10 layout-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="flex flex-col items-start max-w-4xl lg:col-span-8">
              {/* Overline badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-overline uppercase mb-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {HOME_CONTENT.hero.overline}
              </div>

              {/* Hero heading */}
              <h1 className="h1-hero mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {HOME_CONTENT.hero.titleMain} <br className="hidden sm:block" />
                <span className="gold-gradient-text">{HOME_CONTENT.hero.titleSecondary}.</span>
              </h1>

              {/* Body text */}
              <p className="text-lead mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                {HOME_CONTENT.hero.body}
              </p>

              {/* Single CTA - View Systems (primary/gold) */}
              <button
                onClick={() => onNavigate('systems')}
                className="btn-primary animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300"
                aria-label="View Systems"
              >
                View Systems
                <span className="material-symbols-outlined text-lg ml-2 align-middle">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Feature Showcase: Current Build Deep Dive */}
      {currentFeatures.length > 0 && (
        <section className="section-standard px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
              <div className="text-center lg:text-left">
                <span className="overline-label">Capabilities</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                  {featuredSystem?.name} <span className="text-primary/40 font-light">v2.0</span>
                </h2>
                <p className="max-w-xs mx-auto lg:mx-0 text-slate-500">
                  Current operational focus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {currentFeatures.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="group p-8 rounded-2xl glass-card glass-card-hover">
                    <div className="flex items-center gap-4 mb-6">
                       <span className="text-[10px] font-mono text-primary/40 font-bold tracking-widest group-hover:text-primary transition-colors">PART 0{idx + 1}</span>
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
      <section className="section-standard px-6 border-y border-white/10 bg-black/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col items-start">
            <span className="overline-label mb-4">Systems</span>
            <div className="w-12 h-1 bg-primary/30 rounded-full"></div>
          </div>

          {/* Unified systems grid - all states in one layout using SystemCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <section className="section-standard px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
            <header className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="h2-section mb-6 text-white">{HOME_CONTENT.studioWork.label}</h2>
              <div className="w-12 h-1.5 bg-primary rounded-full mb-8"></div>
              <p className="text-slate-500 max-w-xs font-light">
                Discipline. Structure.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
              {STUDIO_CONTENT.constitution.items.map((item, idx) => (
                <div key={idx} className="relative p-8 rounded-2xl glass-card glass-card-hover group overflow-hidden">
                  {/* Decorative phase number - restored for visual hierarchy */}
                  <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                     <span className="text-7xl font-display font-bold text-primary">0{idx + 1}</span>
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

      {/* CTA Rhythm Section */}
      <section className="section-spacious px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 text-center relative overflow-hidden shadow-2xl transition-all hover:border-primary/20">

            <h2 className="h2-section mb-8 text-white">
              Operational <br className="hidden md:block" /> <span className="text-white">Stability.</span>
            </h2>
            <p className="text-lead mb-12 max-w-md mx-auto group-hover:text-slate-300 transition-colors">
              We review for fit. Venues seeking friction reduction only.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full md:w-auto btn-secondary"
              aria-label="Initiate Inquiry"
            >
              Initiate Connection
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
