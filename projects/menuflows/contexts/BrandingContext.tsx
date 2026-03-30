import React, { createContext, useContext, useEffect, useState } from 'react';
import defaultBranding from '../config/branding.json';

export interface BrandingColors {
  primary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textSecondary: string;
  textMuted: string;
  darkBg: string;
  cardBg: string;
}

export interface BrandingCompany {
  name: string;
  tagline: string;
  supportEmail: string;
  domain: string;
  logoText: string;
  logoUrl: string;
}

export interface Branding {
  company: BrandingCompany;
  colors: BrandingColors;
}

interface BrandingContextValue {
  branding: Branding;
  updateBranding: (patch: Partial<Branding>) => void;
  resetBranding: () => void;
}

const STORAGE_KEY = 'menuflows_branding_override';

function loadBranding(): Branding {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Branding;
    }
  } catch {
    // ignore
  }
  return defaultBranding as Branding;
}

function applyCssVars(colors: BrandingColors) {
  const root = document.documentElement;
  root.style.setProperty('--color-accent', colors.primary);
  root.style.setProperty('--color-bg', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-elevated', colors.surfaceElevated);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: defaultBranding as Branding,
  updateBranding: () => {},
  resetBranding: () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<Branding>(loadBranding);

  useEffect(() => {
    applyCssVars(branding.colors);
  }, [branding.colors]);

  const updateBranding = (patch: Partial<Branding>) => {
    setBranding(prev => {
      const next: Branding = {
        company: { ...prev.company, ...(patch.company || {}) },
        colors: { ...prev.colors, ...(patch.colors || {}) },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetBranding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBranding(defaultBranding as Branding);
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
