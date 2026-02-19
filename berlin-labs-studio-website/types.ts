
/**
 * Valid page routes for the application.
 * @example 'home' | 'systems' | 'studio' | 'contact' | 'onboarding'
 */
export type Page = 'home' | 'systems' | 'studio' | 'contact' | 'onboarding' | string;

/**
 * System lifecycle state.
 * - LIVE: Fully launched and operational
 * - PILOT: Testing with real customers
 * - EXPERIMENT: Validating a hypothesis
 * - ADVISORY: Service offering, not a product
 */
export type SystemState = 'LIVE' | 'PILOT' | 'EXPERIMENT' | 'ADVISORY';

/**
 * Unified system entity schema.
 * Used across all system cards and detail pages.
 *
 * @example
 * const system: System = {
 *   id: 'menuflows',
 *   name: 'MenuFlows',
 *   state: 'LIVE',
 *   domain: 'Hospitality',
 *   oneLiner: 'Digital menus built for speed, clarity, and calm service.',
 *   friction: 'Menu updates that break service rhythm and cost staff time.',
 *   outcome: 'Menus stay current without printing, delays, or confusion.',
 *   proof: 'Berlin pilot partners onboarding.',
 *   href: 'menuflows',
 *   ctaLabel: 'Request Pilot Setup'
 * };
 */
export interface System {
  /**
   * Unique identifier for the system.
   * Must be lowercase and hyphenated. Used for routing and data references.
   * @example 'menuflows' | 'twimnc' | 'advisory'
   */
  id: string;

  /** Display name shown on system cards and headings */
  name: string;

  /** System lifecycle state: 'LIVE' | 'PILOT' | 'EXPERIMENT' | 'ADVISORY' */
  state: SystemState;

  /** Domain category: e.g., "Hospitality" | "Language" | "Publishing" | "Advisory" */
  domain: string;

  /**
   * 8–14 words. What it is.
   * Clear, factual description without sales language.
   * @example "Digital menus built for speed, clarity, and calm service."
   */
  oneLiner: string;

  /**
   * 8–14 words. What it removes.
   * The operational friction this system addresses.
   * @example "Menu updates that break service rhythm and cost staff time."
   */
  friction: string;

  /**
   * 8–14 words. What changes operationally.
   * The resulting state after using the system.
   * @example "Menus stay current without printing, delays, or confusion."
   */
  outcome: string;

  /**
   * Optional proof of viability (LIVE systems only).
   * Evidence that the system works.
   * @example "Berlin pilot partners onboarding." | "Processing documents daily."
   */
  proof?: string;

  /**
   * Optional constraint line (PILOT/ADVISORY states).
   * Clear boundaries on availability or scope.
   * @example "Berlin only" | "Invite-only" | "Not a dev agency. Fixed scope."
   */
  constraints?: string;

  /**
   * Page route or external URL.
   * Internal pages use slug (e.g., 'menuflows'), external URLs use full https://.
   * Special routes: 'contact', 'onboarding'.
   */
  href: string;

  /**
   * State-dependent CTA button label.
   * Must follow badge rules for each state.
   * @example "Request Pilot Setup" | "View Concept" | "Request Engagement"
   */
  ctaLabel: string;

  /**
   * Material Symbols icon name.
   * Must be a valid Google Material Symbols icon name.
   * @example 'restaurant_menu' | 'science' | 'architecture' | 'translate'
   * @see https://fonts.google.com/icons
   */
  icon: string;
}

/**
 * A single focus point or feature for a system detail page.
 * Renders as a card with title and description.
 */
export interface FocusPoint {
  /** Heading displayed on the feature card */
  title: string;
  /** Detailed description of the feature or focus area */
  desc: string;
}

/**
 * Extended system data for detail pages.
 * Optional properties that provide additional content for full system pages.
 */
export interface SystemDetail {
  /** Full system name (can be longer than card title) */
  fullTitle?: string;

  /** Philosophy/hypothesis section explaining the approach */
  philosophy?: {
    /** Section heading label (e.g., "Hypothesis", "Process", "Operational Focus") */
    label: string;
    /** Full paragraph explaining the philosophy or approach */
    text: string;
  };

  /** Section label for capabilities/features (e.g., "Capabilities", "Parameters") */
  capabilityLabel?: string;

  /** Array of key features or focus points (2-6 items recommended) */
  focusPoints?: FocusPoint[];

  /** SEO keywords for searchability */
  highlights?: string[];

  /** Category tags for filtering and organization */
  tags?: string[];

  /** Show pilot recruitment section (only for state: 'PILOT') */
  showPilotSection?: boolean;

  /** Optional external URL for secondary outbound link */
  externalUrl?: string;
}

/**
 * System with optional detail page content.
 * Union type for cards-only and full detail systems.
 */
export type SystemWithDetail = System & (SystemDetail | { detail?: never });

/**
 * Navigation item structure for the main menu.
 */
export interface NavItem {
  /** Page route identifier */
  id: Page;
  /** Display label for the navigation link */
  label: string;
  /** Whether this nav item should render as a CTA button */
  isCta?: boolean;
}

/**
 * Form data structure for the contact form submission.
 */
export interface ContactFormData {
  /** Sender's full name */
  name: string;
  /** Sender's email address */
  email: string;
  /** Message content */
  message: string;
  /** Type of inquiry (e.g., "general", "product", "advisory") */
  inquiryType: string;
}

/**
 * Form data structure for the MenuFlows onboarding form.
 */
export interface OnboardingFormData {
  /** Contact person's full name */
  name: string;
  /** Restaurant or establishment name */
  restaurantName: string;
  /** Contact email address */
  email: string;
  /** Contact phone number */
  phone: string;
  /** Restaurant location (city/address) */
  location: string;
  /** Additional message or requirements */
  message: string;
}
