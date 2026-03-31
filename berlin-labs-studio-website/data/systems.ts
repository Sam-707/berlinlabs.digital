
import { System, SystemDetail } from '../types';

/**
 * Unified systems directory for BerlinLabs.
 * Source of truth for all system entity data.
 */
export const SYSTEMS: (System & SystemDetail)[] = [
  {
    // === MenuFlows (PILOT) ===
    id: 'menuflows',
    name: 'MenuFlows',
    state: 'PILOT',
    domain: 'Hospitality',
    oneLiner: 'Digital menus built for speed, clarity, and calm service.',
    friction: 'Menu updates that break service rhythm and cost staff time.',
    outcome: 'Menus stay current without printing, delays, or confusion.',
    constraints: 'Limited Berlin onboarding.',
    href: 'menuflows',
    ctaLabel: 'Request Pilot Access',
    icon: 'restaurant_menu',

    // Detail page content
    fullTitle: 'MenuFlows',
    philosophy: {
      label: 'Operational Focus',
      text: 'Instant updates. Clear display. Designed for independent operators.'
    },
    capabilityLabel: 'Capabilities',
    focusPoints: [
      { title: 'Instant Updates', desc: 'Update prices and specials in seconds.' },
      { title: 'Designed for Independents', desc: 'Small teams. No app downloads.' },
      { title: 'Cost Reduction', desc: 'Eliminate reprint costs.' },
      { title: 'Berlin Pilot', desc: 'Berlin market only.' }
    ],
    highlights: ['independent restaurants', 'QR code menu Berlin', 'instant updates'],
    tags: ['hospitality', 'Berlin', 'infrastructure'],
    showPilotSection: true
  },
  {
    // === twimnc (EXPERIMENT) ===
    id: 'twimnc',
    name: 'twimnc',
    state: 'EXPERIMENT',
    domain: 'Publishing',
    oneLiner: 'A minimal publishing protocol for controlled, low-noise output.',
    friction: 'Publishing workflows diluted by visual clutter and infinite scroll.',
    outcome: 'Content stays readable. No distraction. No exit cues.',
    href: 'twimnc',
    externalUrl: 'https://twimnc.com',
    ctaLabel: 'View Concept',
    icon: 'science',

    // Detail page content
    fullTitle: 'twimnc',
    philosophy: {
      label: 'Hypothesis',
      text: 'Remove imagery. Remove infinite scroll. Recover focus.'
    },
    capabilityLabel: 'Parameters',
    focusPoints: [
      { title: 'Text-Only Display', desc: 'No images. No layout decisions. Just writing.' },
      { title: 'Single-Page Flow', desc: 'No infinite scroll. One entry. One completion state.' }
    ],
    highlights: ['publishing', 'reflection'],
    tags: ['experiment', 'protocol']
  },
  {
    // === Product Architecture Advisory (ADVISORY) ===
    id: 'advisory',
    name: 'Product Architecture Advisory',
    state: 'ADVISORY',
    domain: 'Advisory',
    oneLiner: 'Short engagements to make structural product decisions under constraints.',
    friction: 'Clarify scope, architecture, and operating model before building.',
    outcome: 'Decisions that reduce rework and complexity debt.',
    constraints: 'Not a dev agency. Fixed scope. Selective intake.',
    href: 'contact',
    ctaLabel: 'Request Engagement',
    icon: 'architecture',

    // Detail page content
    fullTitle: 'Product Architecture Advisory',
    philosophy: {
      label: 'Process',
      text: 'Structured reviews. Practical outcomes.'
    },
    capabilityLabel: 'Focus Areas',
    focusPoints: [
      { title: 'Operational Audits', desc: 'Identifying where your digital tools are fighting your real-world workflow.' },
      { title: 'System Alignment', desc: 'Defining the clear relationship between data, people, and daily outcomes.' }
    ],
    highlights: ['structured reviews', 'practical outcomes'],
    tags: ['advisory', 'operations']
  }
];
