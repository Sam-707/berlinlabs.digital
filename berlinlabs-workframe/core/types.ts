/**
 * BerlinLabs Workframe — shared type definitions.
 *
 * Each app in /apps/* exports a WorkframeConfig that drives the
 * smoke, responsive, a11y, and brand test suites.
 */

export interface Viewport {
  /** Human-readable label used in test names and snapshot filenames */
  name: string;
  width: number;
  height: number;
}

export interface RouteConfig {
  /** URL path, e.g. "/" or "/demo" */
  path: string;
  /** Short label used in test names */
  name: string;
  /**
   * CSS selector the test waits to be visible before asserting.
   * Defaults to "body" if omitted.
   */
  waitFor?: string;
  /** Skip accessibility scan for this route */
  skipA11y?: boolean;
  /** Skip smoke assertion for this route */
  skipSmoke?: boolean;
  /** Skip responsive screenshots for this route */
  skipResponsive?: boolean;
}

export interface BrandConfig {
  /** Expected CSS custom property name for the accent color, e.g. "--color-accent" */
  accentCssVar: string;
  /** Minimum acceptable touch target size in pixels (default: 44) */
  minTouchTargetPx: number;
  /** CSS selector for the primary hero CTA button */
  heroCTASelector: string;
  /** CSS selector(s) for buttons that must meet touch-target minimum */
  touchTargetSelectors: string[];
}

export interface A11yConfig {
  /**
   * axe-core rule tags to enforce.
   * @see https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags
   */
  tags: string[];
  /** axe rule IDs to disable (use sparingly, document the reason) */
  disabledRules?: string[];
}

export interface WorkframeConfig {
  /** App display name, used in test reports */
  appName: string;
  /**
   * Base URL for the app under test.
   * Overridden at runtime by the WORKFRAME_BASE_URL environment variable.
   */
  baseURL: string;
  /** Routes to cover in smoke, responsive, and a11y suites */
  routes: RouteConfig[];
  /** Viewport matrix for responsive checks */
  viewports: Viewport[];
  /** Brand and design-system assertions */
  brand: BrandConfig;
  /** Accessibility scan settings */
  a11y: A11yConfig;
}

/** Standard viewport presets — apps can import and extend these */
export const STANDARD_VIEWPORTS: Viewport[] = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];
