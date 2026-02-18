
import { ProjectItem } from '../types';

export const PROJECTS: ProjectItem[] = [
  { 
    id: 'menuflows', 
    slug: 'menuflows',
    title: 'MenuFlows', 
    icon: 'restaurant_menu', 
    state: 'LIVE',
    type: 'product',
    promise: 'Facebook for Restaurants - Complete restaurant profile management platform.',
    detail: {
      fullTitle: 'MenuFlows',
      tagline: 'Facebook for Restaurants - Complete restaurant profile management platform.',
      philosophy: {
        label: 'Operational Focus',
        text: 'Fast to update. Clear to read. Designed for independent operators who need to update their restaurant menu instantly.'
      },
      capabilityLabel: 'Capabilities',
      focusPoints: [
        { title: 'Instant Updates', desc: 'Update prices or daily specials across your QR code menu in seconds.' },
        { title: 'Designed for Independents', desc: 'Optimized for small teams. No app downloads or complex onboarding required.' },
        { title: 'Cost Reduction', desc: 'Eliminate the friction and recurring costs of reprinting paper menus.' },
        { title: 'Berlin Pilot', desc: 'Currently providing localized support for independent restaurants within the Berlin market.' }
      ],
      highlights: ['independent restaurants', 'QR code menu Berlin', 'instant updates'],
      tags: ['hospitality', 'Berlin', 'infrastructure'],
      ctaLabel: 'Apply for Berlin Pilot →',
      externalUrl: 'onboarding',
      showPilotSection: true
    }
  },
  {
    id: '3rbst',
    slug: '3rbst',
    title: '3rbst',
    icon: 'translate',
    state: 'LIVE',
    type: 'product',
    promise: 'WhatsApp Document Translation for Arabic Speakers.',
    detail: {
      fullTitle: '3rbst',
      tagline: 'WhatsApp Document Translation for Arabic Speakers',
      philosophy: {
        label: 'Mission',
        text: 'Breaking language barriers for Arabic-speaking communities in Germany. Instant German document analysis and translation via WhatsApp.'
      },
      capabilityLabel: 'Capabilities',
      focusPoints: [
        { title: 'WhatsApp Integration', desc: 'Simply send a photo of your document. No apps to download, no accounts to create.' },
        { title: 'Instant Analysis', desc: 'AI-powered document analysis extracts and translates key information within seconds.' },
        { title: 'Arabic-German Focus', desc: 'Specialized in documents commonly needed by Arabic speakers: letters from authorities, contracts, certificates.' },
        { title: 'Privacy-First', desc: 'Documents are processed securely and not stored after translation. Your data remains yours.' }
      ],
      highlights: ['translation', 'WhatsApp', 'Arabic', 'German documents'],
      tags: ['AI', 'translation', 'community', 'WhatsApp'],
      ctaLabel: 'Try 3rbst →',
      externalUrl: 'https://3rbst.com'
    }
  },
  {
    id: 'twimnc',
    slug: 'twimnc',
    title: 'twimnc',
    icon: 'science',
    state: 'EXPERIMENT',
    type: 'experiment',
    intent: 'Testing whether text-only publishing deepens reflection.',
    detail: {
      fullTitle: 'twimnc',
      tagline: 'A protocol experiment in low-noise digital publishing.',
      philosophy: {
        label: 'Hypothesis',
        text: 'By stripping away imagery and infinite scroll, can we recover the ability to think deeply about a single text?'
      },
      capabilityLabel: 'Parameters',
      focusPoints: [
        { title: 'Visual Silence', desc: 'Eliminating aesthetic distraction to prioritize the logic of the word.' },
        { title: 'Reflection Loops', desc: 'Interaction systems designed for slow-time thinking.' }
      ],
      highlights: ['publishing', 'reflection'],
      tags: ['experiment', 'protocol'],
      ctaLabel: 'Visit twimnc →',
      externalUrl: 'https://twimnc.com'
    }
  },
  { 
    id: 'system-design', 
    slug: 'advisory',
    title: 'Product Architecture Advisory', 
    icon: 'architecture', 
    state: 'ADVISORY',
    type: 'advisory',
    promise: 'Applying BerlinLabs product frameworks to improve clarity in operational systems.',
    detail: {
      fullTitle: 'Product Architecture Advisory',
      tagline: 'Applying BerlinLabs product frameworks to improve clarity in operational systems.',
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
      tags: ['advisory', 'operations'],
      ctaLabel: 'Request Audit →',
      externalUrl: 'contact'
    }
  }
];
