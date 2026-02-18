
import { ProjectItem } from '../types';

export const PROJECTS: ProjectItem[] = [
  { 
    id: 'menuflows', 
    slug: 'menuflows',
    title: 'MenuFlows', 
    icon: 'restaurant_menu', 
    state: 'LIVE',
    type: 'product',
    promise: 'A digital menu system designed to replace printed menus for independent restaurants.',
    detail: {
      fullTitle: 'MenuFlows',
      tagline: 'Simple digital menu system for independent restaurants in Berlin.',
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
