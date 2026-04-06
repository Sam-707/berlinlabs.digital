
import { NavItem, Page } from '../types';

export const NAV_CONTENT = {
  brand: { first: 'BERLIN', second: 'LABS' },
  items: [
    { id: 'home', label: 'Home' },
    { id: 'systems', label: 'Systems' },
    { id: 'studio', label: 'Studio' },
    { id: 'contact', label: 'Contact', isCta: true }
  ] as NavItem[]
};

export const HOME_CONTENT = {
  hero: {
    overline: 'Est. 2024 // Berlin',
    titleMain: 'Building digital',
    titleSecondary: 'Infrastructure',
    body: 'Operational software for independent businesses. Durable digital systems — starting in Berlin.',
  },
  featured: {
    label: 'Systems',
  },
  studioWork: {
    label: 'Method',
  }
};

export const STUDIO_CONTENT = {
  header: { overline: 'Studio', title: 'Method' },
  constitution: {
    label: 'Method',
    items: [
      { title: 'PROOF', body: 'Build something real. Small. Usable. Testable.' },
      { title: 'SHIP', body: 'Deploy into real workflows. The smallest version that works.' },
      { title: 'ITERATE', body: 'Refine through usage. Driven by data. Not assumptions.' }
    ]
  },
  model: {
    label: 'Operational Model',
    steps: ['Audit', 'Design', 'Deploy']
  },
  log: {
    label: 'Studio Log',
    items: [
      { date: 'Q1 2026', event: 'MenuFlows Pilot Program' },
      { date: 'Q4 2025', event: 'twimnc protocol established' },
      { date: 'Q3 2025', event: 'Framework codified' }
    ]
  },
  footer: 'Built for clarity.'
};

export const FOOTER_CONTENT = {
  copyright: `© ${new Date().getFullYear()} BERLINLABS`,
  tagline: 'Operational Product Studio',
  location: 'Berlin, Germany',
  timezone: 'CET',
  social: {
    linkedin: {
      url: 'https://linkedin.com/company/berlinlabs',
      label: 'LinkedIn',
      icon: 'linkedin'
    },
    email: {
      url: 'mailto:hello@berlinlabs.com',
      label: 'Email',
      icon: 'mail'
    }
  },
  navigation: ['systems', 'studio', 'contact'] as Page[]
};

export const CONTACT_CONTENT = {
  header: {
    overline: 'Contact',
    title: 'Initiate Connection.',
    body: 'We prioritize operational stability. Describe your friction.',
    location: 'Berlin, Germany',
    coordinates: '52.5200° N, 13.4050° E',
    availability: 'Accepting Q2-Q3 Projects'
  },
  services: [
    'Product Development',
    'Multilingual Solutions',
    'AI-Powered Tools'
  ],
  form: {
    labels: {
      identity: 'Identity',
      email: 'Email',
      focus: 'Focus',
      specification: 'Specification'
    },
    placeholders: {
      identity: 'Name or Venue',
      email: 'your@email.com',
      specification: 'Briefly describe the operational challenge...'
    },
    inquiryTypes: ['Pilot Program', 'Advisory', 'Experiment Feedback', 'General Inquiry'],
    submitButton: 'Send Request'
  },
  success: {
    title: 'Request Received.',
    body: 'We review for alignment. Response within 48 hours.',
    backLabel: 'Return to Systems'
  },
  meta: {
    version: 'Intake System v4.0',
    security: 'Secure Terminal'
  }
};

export const SYSTEMS_CONTENT = {
  header: {
    overline: 'Systems',
    title: 'SYSTEMS',
    description: 'Operational systems. Multiple stages of maturity.'
  },
  ctaSuffix: 'View Details'
};
