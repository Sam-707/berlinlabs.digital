
/**
 * Valid page routes for the application.
 * @example 'home' | 'products' | 'studio' | 'contact' | 'onboarding'
 */
export type Page = 'home' | 'products' | 'studio' | 'contact' | 'onboarding' | string;

/**
 * Project lifecycle state.
 * - LIVE: Fully launched and operational
 * - PILOT: Testing with real customers
 * - EXPERIMENT: Validating a hypothesis
 * - ADVISORY: Service offering, not a product
 */
export type ProjectState = 'LIVE' | 'PILOT' | 'EXPERIMENT' | 'ADVISORY';

/**
 * A single focus point or feature for a project detail page.
 * Renders as a card with title and description.
 */
export interface FocusPoint {
  /** Heading displayed on the feature card */
  title: string;
  /** Detailed description of the feature or focus area */
  desc: string;
}

/**
 * Philosophy or approach section for a project.
 * Explains the guiding principles or hypothesis behind the work.
 */
export interface ProjectPhilosophy {
  /** Section heading label (e.g., "Hypothesis", "Process", "Operational Focus") */
  label: string;
  /** Full paragraph explaining the philosophy or approach */
  text: string;
}

/**
 * Log entry for tracking events or updates.
 * Currently unused but available for future changelog features.
 */
export interface LogEntry {
  /** Date of the event (ISO string or formatted date) */
  date: string;
  /** Description of the event or update */
  event: string;
}

/**
 * Complete detail page content for a project.
 * Include this object when you want a dedicated project detail page.
 */
export interface ProjectDetailData {
  /** Full project name (can be longer than card title) */
  fullTitle: string;
  /** One-line tagline displayed below the title */
  tagline: string;
  /** Philosophy/hypothesis section explaining the approach */
  philosophy: ProjectPhilosophy;
  /** Section label for capabilities/features (e.g., "Capabilities", "Parameters") */
  capabilityLabel: string;
  /** Array of key features or focus points (2-6 items recommended) */
  focusPoints: FocusPoint[];
  /** SEO keywords for searchability */
  highlights: string[];
  /** Category tags for filtering and organization */
  tags: string[];
  /** Call-to-action button label (include arrow if desired: "→") */
  ctaLabel: string;
  /** External link or page reference: URL, 'contact', 'onboarding', or omit for no CTA */
  externalUrl?: string;
  /** Show pilot recruitment section (only for state: 'PILOT') */
  showPilotSection?: boolean;
}

/**
 * Project category type.
 * - product: Commercial product or service
 * - experiment: R&D project testing a hypothesis
 * - advisory: Consulting or service offering
 */
export type ProjectType = 'product' | 'experiment' | 'advisory';

/**
 * Complete project data structure.
 * All fields are required except intent/promise (choose one) and detail.
 *
 * @example
 * const project: ProjectItem = {
 *   id: 'menuflows',
 *   slug: 'menuflows',
 *   title: 'MenuFlows',
 *   icon: 'restaurant_menu',
 *   state: 'LIVE',
 *   type: 'product',
 *   promise: 'A digital menu system for restaurants.',
 *   detail: { ... }
 * };
 */
export interface ProjectItem {
  /**
   * Unique identifier for the project.
   * Must be lowercase and hyphenated. Used for routing and data references.
   * @example 'menuflows' | 'twimnc' | 'my-new-project'
   */
  id: string;

  /**
   * URL slug for navigation.
   * Usually matches the id exactly. Used in the URL path.
   * @example If id is 'menuflows', slug should also be 'menuflows'
   */
  slug: string;

  /** Display name shown on project cards and headings */
  title: string;

  /**
   * Material Symbols icon name.
   * Must be a valid Google Material Symbols icon name.
   * @example 'restaurant_menu' | 'science' | 'architecture' | 'shopping_cart'
   * @see https://fonts.google.com/icons
   */
  icon: string;

  /** Project lifecycle state: 'LIVE' | 'PILOT' | 'EXPERIMENT' | 'ADVISORY' */
  state: ProjectState;

  /** Project category type: 'product' | 'experiment' | 'advisory' */
  type: ProjectType;

  /**
   * Hypothesis being tested (for experiments only).
   * Omit if using 'promise'. Choose exactly one: intent OR promise.
   */
  intent?: string;

  /**
   * Value proposition (for products and advisory).
   * Omit if using 'intent'. Choose exactly one: promise OR intent.
   */
  promise?: string;

  /**
   * Optional detail page content.
   * Omit for card-only projects (simple experiments).
   * Include for full project detail pages.
   */
  detail?: ProjectDetailData;
}

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
