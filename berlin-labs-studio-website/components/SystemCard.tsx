
import React from 'react';
import { System, SystemState } from '../types';
import { StateBadge } from './StateBadge';

interface SystemCardProps {
  system: System;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

/**
 * Unified system card component with state-specific styling and behavior.
 *
 * Badge + CTA Rules:
 * - LIVE: Gold/high contrast badge, "Request Pilot Setup"/"View" CTA, shows proof
 * - PILOT: Muted gold badge, "Request Pilot" CTA, shows constraints
 * - EXPERIMENT: Neutral/muted badge, "View Concept"/"Follow" CTA, shows friction as hypothesis
 * - ADVISORY: Outline/neutral badge, "Request Engagement" CTA, shows constraints
 */
export const SystemCard: React.FC<SystemCardProps> = ({ system, onClick, variant = 'default' }) => {
  const isExternal = system.href.startsWith('http');
  const isCompact = variant === 'compact';

  // State-specific conditional rendering
  const showProof = system.state === 'LIVE' && system.proof;
  const showConstraints = (system.state === 'PILOT' || system.state === 'ADVISORY') && system.constraints;
  const isExperiment = system.state === 'EXPERIMENT';

  // For experiments, the friction line serves as the hypothesis
  const hypothesisLabel = isExperiment ? 'Hypothesis' : 'Friction';
  const frictionText = system.friction;

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl glass-card glass-card-hover border-white/10 flex flex-col justify-between transition-all duration-500 ${
        isCompact ? 'p-5' : 'p-7'
      }`}
    >
      <div>
        {/* Header: Icon & StateBadge */}
        <div className="flex justify-between items-start mb-8">
          <div
            className={`flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-primary/20 transition-all duration-300 ${
              isCompact ? 'w-12 h-12' : 'w-14 h-14'
            }`}
          >
            <span
              className={`material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors duration-300 ${
                isCompact ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {system.icon}
            </span>
          </div>
          <StateBadge state={system.state} />
        </div>

        {/* Title & Domain */}
        <h3
          className={`font-display font-bold text-heading transition-colors group-hover:text-primary tracking-tightest uppercase ${
            isCompact ? 'text-xl md:text-2xl mb-4' : 'text-2xl md:text-4xl mb-6'
          }`}
        >
          {system.name}
        </h3>

        {/* Domain tag */}
        {system.domain && (
          <span className="inline-block text-[9px] font-mono text-primary/40 font-bold tracking-overline uppercase mb-4">
            {system.domain}
          </span>
        )}

        {/* One-liner */}
        <p
          className={`text-body font-light leading-editorial max-w-sm group-hover:text-slate-300 transition-colors duration-300 ${
            isCompact ? 'text-sm mb-4' : 'text-sm md:text-base mb-8'
          }`}
        >
          {system.oneLiner}
        </p>

        {/* State-specific content */}
        <div className={`space-y-3 ${isCompact ? 'mb-4' : 'mb-8'}`}>
          {/* Friction / Hypothesis */}
          <div className="flex items-start gap-3">
            <span className="text-[9px] uppercase tracking-overline font-bold text-slate-600 pt-0.5 flex-shrink-0">
              {hypothesisLabel}
            </span>
            <p
              className={`text-slate-500 font-light leading-snug group-hover:text-slate-400 transition-colors ${
                isCompact ? 'text-xs' : 'text-sm'
              }`}
            >
              {frictionText}
            </p>
          </div>

          {/* Outcome (not for experiments) */}
          {!isExperiment && (
            <div className="flex items-start gap-3">
              <span className="text-[9px] uppercase tracking-overline font-bold text-slate-600 pt-0.5 flex-shrink-0">
                Outcome
              </span>
              <p
                className={`text-slate-500 font-light leading-snug group-hover:text-slate-400 transition-colors ${
                  isCompact ? 'text-xs' : 'text-sm'
                }`}
              >
                {system.outcome}
              </p>
            </div>
          )}

          {/* Proof (LIVE only) */}
          {showProof && (
            <div className="flex items-start gap-3">
              <span className="text-[9px] uppercase tracking-overline font-bold text-primary/60 pt-0.5 flex-shrink-0">
                Proof
              </span>
              <p
                className={`text-primary/80 font-light leading-snug ${
                  isCompact ? 'text-xs' : 'text-sm'
                }`}
              >
                {system.proof}
              </p>
            </div>
          )}

          {/* Constraints (PILOT/ADVISORY only) */}
          {showConstraints && (
            <div className="flex items-start gap-3">
              <span className="text-[9px] uppercase tracking-overline font-bold text-slate-600 pt-0.5 flex-shrink-0">
                Scope
              </span>
              <p
                className={`text-slate-500 font-light leading-snug group-hover:text-slate-400 transition-colors ${
                  isCompact ? 'text-xs' : 'text-sm'
                }`}
              >
                {system.constraints}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: CTA Label + Arrow */}
        <div
          className={`flex items-center justify-between border-t border-white/10 group-hover:border-primary/20 transition-all duration-300 ${
          isCompact ? 'pt-4 mt-3' : 'pt-7 mt-4'
        }`}
      >
        <span
          className={`uppercase tracking-overline font-display font-bold text-slate-500 group-hover:text-primary transition-colors duration-300 ${
            isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}
        >
          {system.ctaLabel}
        </span>
        <span
          className="material-symbols-outlined text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
          style={{ fontSize: isCompact ? '1rem' : '1.25rem' }}
        >
          {isExternal ? 'external_link' : 'arrow_forward'}
        </span>
      </div>
    </div>
  );
};
