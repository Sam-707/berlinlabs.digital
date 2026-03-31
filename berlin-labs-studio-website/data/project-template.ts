/**
 * PROJECT TEMPLATE - Copy this and add to data/projects.ts
 *
 * ============================================================================
 * HOW TO USE THIS TEMPLATE
 * ============================================================================
 *
 * STEP 1: Copy the entire NEW_PROJECT_TEMPLATE object below
 * STEP 2: Replace all PLACEHOLDER values with your project content
 * STEP 3: Paste into the PROJECTS array in data/projects.ts
 * STEP 4: Remove the 'template_' prefix from field names
 * STEP 5: Run npm run dev to verify
 *
 * ============================================================================
 * FIELD GUIDES
 * ============================================================================
 *
 * STATE OPTIONS:
 * - 'LIVE': Fully launched product, stable and operational
 * - 'PILOT': Testing with real customers (use showPilotSection: true)
 * - 'EXPERIMENT': Validating a hypothesis, may not have full detail page
 * - 'ADVISORY': Service offering, not a standalone product
 *
 * TYPE OPTIONS:
 * - 'product': Commercial product or service
 * - 'experiment': R&D project testing a hypothesis
 * - 'advisory': Consulting or service offering
 *
 * ICON NAMES:
 * Use Material Symbols icon names. Common options:
 * - restaurant_menu, science, architecture, shopping_cart
 * - hub, notifications, analytics, dashboard, settings
 * - lightningbolt, rocket_launch, psychology, construction
 * Full list: https://fonts.google.com/icons
 *
 * PROMISE vs INTENT:
 * - promise: Use for products/advisory - clear value proposition
 * - intent: Use for experiments - hypothesis being tested
 *
 * EXTERNAL URL OPTIONS:
 * - 'https://example.com': Opens external link
 * - 'contact': Opens contact form with project pre-selected
 * - 'onboarding': Opens onboarding form (MenuFlows-style)
 *
 * ============================================================================
 */

import { ProjectItem } from '../types';

export const NEW_PROJECT_TEMPLATE: ProjectItem = {
  // ==========================================================================
  // REQUIRED FIELDS (must be present for all projects)
  // ==========================================================================

  /**
   * Unique identifier for the project
   * - Must be unique across all projects
   * - Use lowercase, hyphenated format (e.g., 'my-project-name')
   * - This is used for routing and data references
   */
  id: 'template_unique-id',

  /**
   * URL slug for navigation
   * - Usually matches the id exactly
   * - Used in the URL path for the project detail page
   */
  slug: 'template_unique-id',

  /**
   * Display name shown on project cards
   * - Short, memorable name (e.g., 'MenuFlows', 'twimnc')
   * - This is what users see first
   */
  title: 'TEMPLATE: Project Title',

  /**
   * Material Symbols icon name
   * - Must be a valid Google Material Symbols icon name
   * - Renders on project cards and detail pages
   * - Examples: 'restaurant_menu', 'science', 'architecture', 'shopping_cart'
   */
  icon: 'template_icon_name',

  /**
   * Project lifecycle state
   * - LIVE: Fully launched and operational
   * - PILOT: Testing with real customers, not yet fully launched
   * - EXPERIMENT: R&D phase, validating hypothesis
   * - ADVISORY: Service offering rather than a product
   */
  state: 'LIVE', // 'LIVE' | 'PILOT' | 'EXPERIMENT' | 'ADVISORY'

  /**
   * Project category type
   * - product: Commercial product or service
   * - experiment: R&D project testing a hypothesis
   * - advisory: Consulting or service offering
   */
  type: 'product', // 'product' | 'experiment' | 'advisory'

  // ==========================================================================
  // VALUE PROPOSITION (choose exactly one: promise OR intent)
  // ==========================================================================

  /**
   * Promise (for products and advisory)
   * - One-line value proposition
   * - What problem does this solve?
   * - What value does it deliver?
   * - Omit if using 'intent' (experiments only)
   */
  promise: 'TEMPLATE: A clear one-line value proposition for your project.',

  /**
   * Intent (for experiments only)
   * - Hypothesis being tested
   * - What are you trying to learn?
   * - Use this instead of 'promise' for experiments
   * - Omit if using 'promise'
   */
  // intent: 'TEMPLATE: Testing whether [hypothesis].',

  // ==========================================================================
  // OPTIONAL: DETAIL PAGE CONTENT
  // ==========================================================================
  // Include this section if you want a dedicated detail page for the project.
  // If omitted, the project will only show a card on the main view.

  detail: {
    /**
     * Full project name
     * - Can be longer than the 'title' field
     * - Used as the main heading on the detail page
     */
    fullTitle: 'TEMPLATE: Full Project Name Here',

    /**
     * One-line tagline
     * - Short description below the title
     * - Should complement the promise/intent
     */
    tagline: 'TEMPLATE: A brief one-line description of what this project does.',

    /**
     * Philosophy section
     * - Explains the approach or hypothesis
     * - Label is the section heading
     * - Text is the detailed explanation
     */
    philosophy: {
      label: 'TEMPLATE: Section Label',
      text: 'TEMPLATE: Write a paragraph explaining the philosophy, approach, or hypothesis behind this project. This should give context for why this project exists and what principles guide it.',
    },

    /**
     * Capability/feature section label
     * - Heading for the features/parameters list
     * - Common values: 'Capabilities', 'Features', 'Parameters', 'Focus Areas'
     */
    capabilityLabel: 'TEMPLATE: Capabilities/Features',

    /**
     * Key features or focus points
     * - Array of features, each with title and description
     * - These render as cards on the detail page
     * - Include 2-6 items for best layout
     */
    focusPoints: [
      {
        title: 'TEMPLATE: Feature One',
        desc: 'TEMPLATE: Clear description of what this feature does and why it matters to the user.',
      },
      {
        title: 'TEMPLATE: Feature Two',
        desc: 'TEMPLATE: Clear description of what this feature does and why it matters to the user.',
      },
      {
        title: 'TEMPLATE: Feature Three',
        desc: 'TEMPLATE: Clear description of what this feature does and why it matters to the user.',
      },
    ],

    /**
     * SEO highlights
     * - Keywords for searchability
     * - Short phrases that describe the project
     * - Used for metadata and search
     */
    highlights: ['template_keyword1', 'template_keyword2', 'template_keyword3'],

    /**
     * Category tags
     * - Used for filtering and organization
     * - Examples: 'hospitality', 'Berlin', 'infrastructure', 'experiment'
     */
    tags: ['template_category1', 'template_category2'],

    /**
     * Call-to-action button label
     * - Text shown on the main CTA button
     * - Include arrow if desired: '→'
     * - Examples: 'Apply Now →', 'Visit Site →', 'Request Access →'
     */
    ctaLabel: 'TEMPLATE: Call to Action →',

    /**
     * External link or page reference
     * - If URL: Opens in new tab
     * - If 'contact': Opens contact form
     * - If 'onboarding': Opens onboarding form
     * - If omitted: No CTA button rendered
     */
    externalUrl: 'https://example.com',

    /**
     * Show pilot recruitment section
     * - Only relevant for state: 'PILOT'
     * - Shows additional information about pilot program
     * - Defaults to false if omitted
     */
    showPilotSection: false,
  },
};

/**
 * ============================================================================
 * MINIMAL PROJECT EXAMPLE (no detail page)
 * ============================================================================
 *
 * Use this format for experiments or projects that don't need a full page.
 *
 * export const MINIMAL_EXAMPLE: ProjectItem = {
 *   id: 'my-experiment',
 *   slug: 'my-experiment',
 *   title: 'My Experiment',
 *   icon: 'science',
 *   state: 'EXPERIMENT',
 *   type: 'experiment',
 *   intent: 'Testing whether a hypothesis is true.',
 *   // No 'detail' object - project card only
 * };
 *
 */

/**
 * ============================================================================
 * COMPLETE CHECKLIST
 * ============================================================================
 *
 * After adding your project:
 * [ ] Replaced all 'template_' prefixes with actual values
 * [ ] Kept 'id' and 'slug' identical
 * [ ] Chose exactly one: promise (product) OR intent (experiment)
 * [ ] Verified icon name exists in Material Symbols
 * [ ] Set appropriate state and type
 * [ ] Included detail object if detail page is needed
 * [ ] Added project to PROJECTS array in data/projects.ts
 * [ ] Tested with npm run dev
 *
 * ============================================================================
 */
