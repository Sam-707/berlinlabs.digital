import React from 'react';
import { STUDIO_CONTENT } from '../data/content';

export const Studio: React.FC = () => {
  return (
    <main className="layout-shell-narrow stack-section animate-in fade-in duration-1000">
      <header className="hero-shell stack-hero mb-16 flex flex-col justify-center">
        <span className="overline-label">{STUDIO_CONTENT.header.overline}</span>
        <h1 className="h1-hero text-white uppercase tracking-tightest"><span className="gold-gradient-text">{STUDIO_CONTENT.header.title}</span></h1>
      </header>

      <section className="mb-24 lg:mb-32">
        <span className="overline-label mb-12">{STUDIO_CONTENT.constitution.label}</span>
        <div className="space-y-14 lg:space-y-16">
          {STUDIO_CONTENT.constitution.items.map((item, idx) => (
            <div key={idx} className="group">
              <h3 className="text-sm uppercase tracking-overline text-white font-display font-bold mb-6 flex items-center gap-4">
                <span className="w-6 h-px bg-primary/30 group-hover:bg-primary transition-all"></span>
                {item.title}
              </h3>
              <p className="text-xl md:text-2xl font-display font-light text-slate-300 leading-editorial pl-10">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-24 lg:mb-32 p-8 rounded-2xl glass-card glass-card-hover border-white/10">
        <span className="overline-label mb-14 text-center">{STUDIO_CONTENT.model.label}</span>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6 max-w-2xl mx-auto">
          {STUDIO_CONTENT.model.steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="text-center group">
                <div className={`text-[10px] font-mono font-bold mb-3 transition-all ${idx === 1 ? 'text-primary' : 'text-slate-800'} group-hover:text-primary`}>0{idx + 1}</div>
                <div className="text-sm font-display font-bold uppercase tracking-overline text-white group-hover:text-primary transition-colors">{step}</div>
              </div>
              {idx < STUDIO_CONTENT.model.steps.length - 1 && (
                <span className="material-symbols-outlined text-white/5 hidden md:block">east</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* The Architect Protocol - New Section */}
      <section className="mb-24 lg:mb-32 p-8 rounded-2xl glass-card glass-card-hover border-white/10">
        <span className="overline-label mb-14 text-center">The Architect Protocol</span>
        <div className="max-w-3xl mx-auto text-center space-y-9">
          <p className="text-xl md:text-2xl font-display font-light text-slate-300 leading-editorial">
            An <span className="text-primary font-semibold">Operational Product Studio</span> is not an agency. We build and ship systems that address friction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-4xl mb-4">🏛️</div>
              <h4 className="text-sm font-display font-bold uppercase tracking-overline text-white mb-2">Berlin-Based</h4>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-sm font-display font-bold uppercase tracking-overline text-white mb-2">Multilingual</h4>
              <p className="text-xs text-slate-500 font-light">German, English, Arabic</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-sm font-display font-bold uppercase tracking-overline text-white mb-2">Community-First</h4>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-24 lg:mb-32">
        <span className="overline-label mb-12">{STUDIO_CONTENT.log.label}</span>
        <div className="space-y-2">
          {STUDIO_CONTENT.log.items.map((log, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-16 sm:items-baseline py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-all px-6 -mx-6 rounded-2xl">
              <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-overline whitespace-nowrap opacity-60">{log.date}</span>
              <span className="text-base text-slate-300 font-light">{log.event}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-20 border-t border-white/10 text-center">
        <p className="text-[10px] uppercase tracking-overline text-primary font-display font-bold opacity-30">BerlinLabs — Operational Product Studio</p>
      </footer>
    </main>
  );
};
