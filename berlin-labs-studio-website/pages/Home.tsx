import React from 'react';
import { PROJECTS } from '../data/projects';
import { HOME_CONTENT, STUDIO_CONTENT } from '../data/content';
import { Page } from '../types';
import { Logo } from '../components/Logo';
import { StateBadge } from '../components/StateBadge';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const currentBuild = PROJECTS.find(p => p.title === HOME_CONTENT.hero.titleSecondary);
  const currentFeatures = currentBuild?.detail?.focusPoints || [];

  return (
    <main className="relative z-10">
      {/* Hero Section with Dynamic Glows */}
      <section className="relative px-6 py-32 lg:py-56 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3/4 opacity-[0.015] pointer-events-none transition-all duration-1000">
          <Logo className="w-[85vh] h-[85vh] text-primary" />
        </div>

        {/* Dynamic Glows */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] orbital-glow rounded-full"></div>
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] orbital-glow opacity-60 rounded-full"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-overline uppercase mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {HOME_CONTENT.hero.overline}
              </div>

              <h1 className="h1-hero mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {HOME_CONTENT.hero.titleMain} <br className="hidden lg:block" />
                <span className="gold-gradient-text">{HOME_CONTENT.hero.titleSecondary}.</span>
              </h1>

              <p className="text-lg md:text-xl mb-14 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 font-light">
                {HOME_CONTENT.hero.body}
              </p>

              <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <button
                  onClick={() => onNavigate(currentBuild?.id || 'products')}
                  className="btn-primary"
                  aria-label={`View ${HOME_CONTENT.hero.titleSecondary} Demo`}
                >
                  See the demo
                  <span className="material-symbols-outlined text-lg ml-2 align-middle">arrow_forward</span>
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="btn-secondary"
                  aria-label="View System Index"
                >
                  System Index
                </button>
              </div>
            </div>

            {/* Desktop-only spatial block */}
            <div className="hidden lg:block relative h-full">
              {/* This space is intentionally kept open for spatial balance */}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Feature Showcase: Current Build Deep Dive */}
      {currentFeatures.length > 0 && (
        <section className="px-6 py-24 lg:py-32 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20">
              <div className="text-center lg:text-left">
                <span className="overline-label">Core Capabilities</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                  {currentBuild?.title} <span className="text-primary/40 font-light">v2.0</span>
                </h2>
                <p className="max-w-xs mx-auto lg:mx-0 text-slate-500">
                  A high-level overview of the architectural focus within the current sprint cycle.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {currentFeatures.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="group p-8 glass-card glass-card-hover rounded-2xl">
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

      {/* Featured Projects Section */}
      <section className="px-6 py-32 border-y border-white/10 bg-black/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="overline-label mb-4">{HOME_CONTENT.featured.label}</span>
            <div className="w-12 h-1 bg-primary/30 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => (
              <div
                key={project.id}
                onClick={() => onNavigate(project.id)}
                className="group flex flex-col p-8 rounded-2xl glass-card glass-card-hover cursor-pointer h-full"
              >
                {/* Header: Icon & StateBadge */}
                <div className="flex justify-between items-start mb-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-primary/10 transition-all border border-white/10 group-hover:border-primary/20">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                      {project.icon}
                    </span>
                  </div>
                  <StateBadge state={project.state} />
                </div>

                {/* Content Body */}
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-display font-bold text-slate-200 group-hover:text-primary transition-colors tracking-tight mb-4">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-light line-clamp-2 group-hover:text-slate-300 transition-colors">
                    {project.promise || project.intent}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 group-hover:border-primary/20 transition-all">
                  <span className="text-[9px] uppercase tracking-overline font-bold group-hover:text-primary transition-colors">Details</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Rhythm Section */}
      <section className="px-6 py-32 md:py-48">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20">
            <header className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="h2-section mb-6 text-white">{HOME_CONTENT.studioWork.label}</h2>
              <div className="w-12 h-1.5 bg-primary rounded-full mb-8"></div>
              <p className="text-slate-500 max-w-xs font-light">
                Our methodology is rooted in operational discipline and structural clarity.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
              {STUDIO_CONTENT.constitution.items.map((item, idx) => (
                <div key={idx} className="relative p-10 rounded-3xl glass-card glass-card-hover group overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                     <span className="text-7xl font-display font-black text-white">0{idx + 1}</span>
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
      <section className="px-6 pb-48">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 text-center relative overflow-hidden group shadow-2xl transition-all hover:border-primary/20 hover:shadow-gold-glow">
            <div className="absolute -top-20 -right-20 w-80 h-80 orbital-glow opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>

            <h2 className="text-4xl md:text-6xl font-display font-bold mb-10 text-white leading-tight tracking-tightest">
              Ready for <br className="hidden md:block" /> <span className="gold-gradient-text">Operational Stability?</span>
            </h2>
            <p className="mb-14 max-w-md mx-auto text-lg font-light text-slate-400 group-hover:text-slate-300 transition-colors">
              Each request is reviewed for operational fit. We prioritize venues looking to eliminate friction.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full md:w-auto btn-primary px-20"
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
