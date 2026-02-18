
import React from 'react';
import { ProjectItem, Page } from '../types';
import { StateBadge } from '../components/StateBadge';

interface ProjectDetailProps {
  project: ProjectItem;
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onNavigate }) => {
  const { detail } = project;

  if (!detail) return null;

  const isExperiment = project.type === 'experiment';
  const isMenuFlows = project.id === 'menuflows';

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 py-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-3xl mx-auto">
        <header className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <StateBadge state={project.state} />
          </div>
          {/* Title reverted from gradient back to white */}
          <h1 className="h1-hero text-white mb-10 uppercase tracking-tightest">
            {detail.fullTitle}
          </h1>
          
          {/* Definitive Summary Paragraph for SEO & AI Search */}
          <div className="mb-10 p-6 border-l-2 border-primary/20 bg-white/[0.01]">
            <p className="text-lg text-slate-300 font-normal leading-editorial">
              {isMenuFlows 
                ? "MenuFlows is a digital menu system designed specifically for independent restaurants in Berlin. It enables operators to replace printed menus with a simple, instantly updatable QR code system, reducing service friction and operational costs."
                : detail.tagline}
            </p>
          </div>

          <div className="text-sm italic text-slate-500 border-l border-primary/30 pl-6 py-2 font-mono flex items-start gap-4 bg-white/[0.01]">
            <span className="text-[9px] uppercase tracking-overline font-bold text-primary/40 pt-1">
              {isExperiment ? 'Hypothesis' : 'Outcome'}
            </span>
            <span className="font-light">{isExperiment ? project.intent : project.promise}</span>
          </div>
        </header>

        <section className="mb-32">
          <span className="overline-label">{detail.philosophy.label}</span>
          <p className="text-2xl md:text-3xl font-display font-light leading-editorial text-slate-200">
            {detail.philosophy.text}
          </p>
        </section>

        <section className="mb-32">
          <span className="overline-label">{detail.capabilityLabel}</span>
          <div className="grid grid-cols-1 gap-14">
            {detail.focusPoints.map((point, idx) => (
              <div key={idx} className="group p-8 glass-card rounded-2xl border-white/10 hover:border-primary/20 transition-all">
                <h3 className="text-sm font-display font-bold uppercase tracking-overline mb-4 text-white group-hover:text-primary transition-colors">
                  {point.title}
                </h3>
                <p className="text-slate-400 font-light leading-editorial">{point.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {detail.showPilotSection && (
          <section className="mb-32 p-12 md:p-16 rounded-3xl glass-card border-white/10 hover:border-primary/20 shadow-gold-glow relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 orbital-glow opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
            <span className="overline-label">Berlin Pilot Onboarding</span>
            <p className="text-slate-400 mb-12 font-light">
              MenuFlows is currently onboarding a limited number of independent restaurants in Berlin for our Beta v2 program. We prioritize local venues seeking to improve operational stability through digital infrastructure.
            </p>
            <button 
              onClick={() => onNavigate('onboarding')}
              className="btn-primary w-full md:w-auto px-20"
              aria-label="Apply for MenuFlows Berlin Pilot"
            >
              Apply for Pilot Program
            </button>
          </section>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-center pt-20 border-t border-white/10">
          <button 
            onClick={() => {
              if (detail.externalUrl === 'contact') onNavigate('contact');
              else if (detail.externalUrl === 'onboarding') onNavigate('onboarding');
              else if (detail.externalUrl) window.open(detail.externalUrl, '_blank');
            }}
            className="btn-secondary w-full md:w-auto px-12"
            aria-label={detail.ctaLabel}
          >
            {detail.ctaLabel}
          </button>
          <button 
            onClick={onBack}
            className="text-[11px] font-display font-bold uppercase tracking-overline text-slate-500 hover:text-white transition-colors"
            aria-label="Back to System Index"
          >
            Back to System Index
          </button>
        </div>
      </div>
    </main>
  );
};
