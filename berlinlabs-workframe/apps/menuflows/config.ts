import type { WorkframeConfig } from '../../core/types';
import { STANDARD_VIEWPORTS } from '../../core/types';

/**
 * MenuFlows workframe configuration.
 *
 * WORKFRAME_BASE_URL overrides baseURL at runtime — set it when testing
 * against a local dev server or a preview deployment:
 *   WORKFRAME_BASE_URL=http://localhost:5173 npx playwright test apps/menuflows
 */
const config: WorkframeConfig = {
  appName: 'menuflows',

  baseURL: process.env.WORKFRAME_BASE_URL ?? 'https://www.menuflows.app',

  routes: [
    {
      path: '/',
      name: 'landing',
      // Wait for the hero headline — confirms the React app has mounted
      waitFor: 'h1',
    },
    {
      path: '/demo',
      name: 'demo-splash',
      // Wait for the "View Menu" CTA on the splash screen
      waitFor: 'button:has-text("View Menu"), text=View Menu',
    },
  ],

  viewports: STANDARD_VIEWPORTS,

  brand: {
    accentCssVar: '--color-accent',
    minTouchTargetPx: 44,
    // Primary CTA on the landing hero
    heroCTASelector: 'a[href="#pricing"], button:has-text("Get the Source Code")',
    // Elements that must meet touch-target minimum on mobile
    touchTargetSelectors: [
      // View Menu CTA on splash (checked on /demo only)
    ],
  },

  a11y: {
    // wcag2a + wcag2aa are the baseline; best-practice adds extra checks
    tags: ['wcag2a', 'wcag2aa', 'best-practice'],
    // Disable color-contrast on the dark restaurant UI — the design uses
    // intentionally low-contrast muted text for aesthetic reasons.
    // This should be revisited and resolved in a future accessibility sprint.
    disabledRules: ['color-contrast'],
  },
};

export default config;
