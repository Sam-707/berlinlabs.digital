import React, { createContext, useContext, useEffect, useState } from 'react';

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

// Fallback used while /branding.json loads (one render frame)
const DEFAULT_BRANDING: Branding = {
  company: {
    name: 'MenuFlows',
    tagline: 'Digital Restaurant Ordering',
    supportEmail: 'hello@menuflows.app',
    domain: 'menuflows.app',
    logoText: 'menuflows',
    logoUrl: '',
  },
  colors: {
    primary: '#c21e3a',
    background: '#0d0d0d',
    surface: '#141414',
    surfaceElevated: '#1a1a1a',
    border: '#262626',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    darkBg: '#170e10',
    cardBg: '#241619',
  },
};

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

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    fetch('/branding.json')
      .then(res => res.json())
      .then((data: Branding) => {
        setBranding(data);
        applyCssVars(data.colors);
        // Update document title and meta description from branding
        document.title = data.company.name;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.company.tagline);
      })
      .catch(() => {
        // branding.json missing or malformed — use defaults
        applyCssVars(DEFAULT_BRANDING.colors);
      });
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
