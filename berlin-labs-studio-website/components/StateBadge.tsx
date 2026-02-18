
import React from 'react';
import { ProjectState } from '../types';

interface StateBadgeProps {
  state: ProjectState;
  className?: string;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state, className = "" }) => {
  const styles: Record<ProjectState, string> = {
    LIVE: "bg-primary text-black border-primary",
    PILOT: "bg-primary/10 text-primary border-primary/20",
    EXPERIMENT: "bg-white/5 text-slate-500 border-white/10",
    ADVISORY: "bg-transparent text-slate-600 border-white/10",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-mono font-bold tracking-overline uppercase transition-all duration-300 ${styles[state]} ${className}`}>
      {state}
    </span>
  );
};
