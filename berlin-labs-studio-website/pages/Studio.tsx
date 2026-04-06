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

      {/* Studio Constraints */}
      <section className="mb-24 lg:mb-32">
        <span className="overline-label mb-12 block">Studio Constraints</span>
        <dl className="border-t border-white/[0.06]">
          {([
            { label: 'Type', value: 'Operational Product Studio — not an agency' },
            { label: 'Location', value: 'Berlin, Germany' },
            { label: 'Languages', value: 'German · English · Arabic' },
            { label: 'Model', value: 'Build, ship, operate — not advise' },
            { label: 'Intake', value: 'One new project per month. Selective.' },
          ] as { label: string; value: string }[]).map((item) => (
            <div key={item.label} className="flex items-baseline justify-between py-5 border-b border-white/[0.06] hover:bg-white/[0.01] transition-colors px-1 -mx-1">
              <dt className="text-[9px] font-mono uppercase tracking-overline text-slate-600 shrink-0 mr-8">{item.label}</dt>
              <dd className="text-sm font-light text-slate-300 text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
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
