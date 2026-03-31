
import React from 'react';
import { System, Page } from '../types';
import { StateBadge } from '../components/StateBadge';

interface ProjectDetailProps {
  project: System & {
    fullTitle?: string;
    philosophy?: { label: string; text: string };
    capabilityLabel?: string;
    focusPoints?: Array<{ title: string; desc: string }>;
    highlights?: string[];
    tags?: string[];
    showPilotSection?: boolean;
    externalUrl?: string;
  };
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

/**
 * Project detail page with state-specific templates:
 * - LIVE: Shows friction → outcome → proof → pilot CTA
 * - EXPERIMENT: Shows hypothesis → signals → follow CTA
 * - ADVISORY: Shows scope → boundary → engagement CTA
 */
export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onNavigate }) => {
  const isLive = project.state === 'LIVE';
  const isExperiment = project.state === 'EXPERIMENT';
  const isAdvisory = project.state === 'ADVISORY';
  const isPilot = project.state === 'PILOT';
  const isMenuFlows = project.id === 'menuflows';

  // State-specific section labels
  const philosophyLabel = isExperiment ? 'Hypothesis' : project.philosophy?.label || 'Operational Focus';
  const secondaryLabel = isExperiment ? 'Signals' : project.capabilityLabel || 'Capabilities';

  // Handle CTA click - prioritize externalUrl
  const handleCtaClick = () => {
    if (project.externalUrl) {
      window.open(project.externalUrl, '_blank');
    } else if (project.href.startsWith('http')) {
      window.open(project.href, '_blank');
    } else if (project.href === 'contact' || project.href === 'onboarding') {
      onNavigate(project.href);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (project.href.startsWith('http')) {
      onBack();
    } else {
      onBack();
    }
  };

  return (
    <main className="layout-shell-narrow stack-section animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-3xl mx-auto">
        <header className="hero-shell stack-hero mb-16">
          <div className="flex items-center gap-4 mb-8">
            <StateBadge state={project.state} />
            {project.domain && (
              <span className="text-[9px] font-mono text-primary/40 font-bold tracking-overline uppercase">
                {project.domain}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="h1-hero text-white mb-8 uppercase tracking-tightest">
            {project.fullTitle || project.name}
          </h1>

          {/* SEO Summary Paragraph */}
          <div className="mb-8 p-6 border-l-2 border-primary/20 bg-white/[0.01]">
            <p className="text-lead text-measure text-slate-300 font-normal">
              {isMenuFlows
                ? "MenuFlows is a digital menu system designed specifically for independent restaurants in Berlin. It enables operators to replace printed menus with a simple, instantly updatable QR code system, reducing service friction and operational costs."
                : project.oneLiner}
            </p>
          </div>

          {/* Friction / Hypothesis Block */}
          <div className="text-sm italic text-slate-500 border-l border-primary/20 pl-6 py-2 font-mono flex items-start gap-4 bg-white/[0.01]">
            <span className="text-[9px] uppercase tracking-overline font-bold text-primary/40 pt-1">
              {isExperiment ? 'Hypothesis' : 'Friction'}
            </span>
            <span className="font-light">{project.friction}</span>
          </div>

          {/* Outcome Block (not for experiments) */}
          {!isExperiment && (
            <div className="mt-4 text-sm italic text-slate-500 border-l border-primary/20 pl-6 py-2 font-mono flex items-start gap-4 bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-overline font-bold text-primary/40 pt-1">
                Outcome
              </span>
              <span className="font-light">{project.outcome}</span>
            </div>
          )}

          {/* Proof (LIVE only) */}
          {isLive && project.proof && (
            <div className="mt-4 text-sm italic text-primary/80 border-l border-primary/40 pl-6 py-2 font-mono flex items-start gap-4 bg-primary/[0.02]">
              <span className="text-[9px] uppercase tracking-overline font-bold text-primary/60 pt-1">
                Proof
              </span>
              <span className="font-light">{project.proof}</span>
            </div>
          )}

          {/* Constraints (PILOT/ADVISORY only) */}
          {(isPilot || isAdvisory) && project.constraints && (
            <div className="mt-4 text-sm italic text-slate-500 border-l border-slate-700 pl-6 py-2 font-mono flex items-start gap-4 bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-overline font-bold text-slate-600 pt-1">
                Scope
              </span>
              <span className="font-light">{project.constraints}</span>
            </div>
          )}
        </header>

        {/* Philosophy / Hypothesis Section */}
        {project.philosophy && (
          <section className="mb-24 lg:mb-28">
            <span className="overline-label">{philosophyLabel}</span>
            <p className="text-2xl md:text-3xl font-display font-light leading-editorial text-slate-200">
              {project.philosophy.text}
            </p>
          </section>
        )}

        {/* Capabilities / Signals Section */}
        {project.focusPoints && project.focusPoints.length > 0 && (
          <section className="mb-24 lg:mb-28">
            <span className="overline-label">{secondaryLabel}</span>
            <div className="grid grid-cols-1 gap-8 lg:gap-10">
              {project.focusPoints.map((point, idx) => (
                <div key={idx} className="group p-8 rounded-2xl glass-card glass-card-hover">
                  <h3 className="text-sm font-display font-bold uppercase tracking-overline mb-4 text-white group-hover:text-primary transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-slate-400 font-light leading-editorial">{point.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pilot Section (PILOT state or when showPilotSection is true) */}
        {(isPilot || project.showPilotSection) && (
          <section className="mb-24 lg:mb-28 p-8 rounded-2xl glass-card glass-card-hover border-white/10 relative overflow-hidden group">
            <span className="overline-label">Pilot Program</span>
            <p className="text-slate-400 mb-12 font-light">
              {isMenuFlows
                ? 'MenuFlows is currently in pilot phase with a limited number of independent restaurants in Berlin. We\'re validating the core system before wider availability.'
                : `${project.name} is currently onboarding a limited number of partners for the pilot program. We prioritize local venues seeking to improve operational stability through digital infrastructure.`}
            </p>
            <button
              onClick={() => onNavigate('onboarding')}
              className="btn-primary w-full md:w-auto"
              aria-label={`Apply for ${project.name} Pilot`}
            >
              Apply for Pilot Program
            </button>
          </section>
        )}

        {/* Experiment Follow Section (EXPERIMENT state) */}
        {isExperiment && (
          <section className="mb-24 lg:mb-28 p-8 rounded-2xl glass-card glass-card-hover border-white/10 relative overflow-hidden">
            <span className="overline-label">Follow Progress</span>
            <p className="text-slate-400 mb-12 font-light">
              This is an active experiment. We're validating the hypothesis and gathering signals. No promises. No timeline. Just exploration.
            </p>
            <button
              onClick={handleCtaClick}
              className="btn-secondary w-full md:w-auto"
              aria-label={project.ctaLabel}
            >
              {project.ctaLabel}
            </button>
          </section>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-8 items-center pt-14 lg:pt-16 border-t border-white/10">
          <button
            onClick={handleCtaClick}
            className="btn-secondary w-full md:w-auto"
            aria-label={project.ctaLabel}
          >
            {project.ctaLabel}
          </button>

          <button
            onClick={handleBack}
            className="text-[11px] font-display font-bold uppercase tracking-overline text-slate-500 hover:text-white transition-colors"
            aria-label="Back to Systems"
          >
            Back to Systems
          </button>
        </div>
      </div>
    </main>
  );
};
