
import { NavItem } from '../types';

export const NAV_CONTENT = {
  brand: { first: 'BERLIN', second: 'LABS' },
  items: [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Index' },
    { id: 'studio', label: 'Studio' },
    { id: 'contact', label: 'Contact', isCta: true }
  ] as NavItem[]
};

export const HOME_CONTENT = {
  hero: {
    overline: 'Operational Product Studio',
    titleMain: 'Building digital products',
    titleSecondary: 'That bridge communities',
    body: 'Berlin-based product studio building multilingual solutions (German/English/Arabic) that solve real problems for underserved communities.',
  },
  featured: {
    label: 'Operational Map',
  },
  studioWork: {
    label: 'How we build',
  }
};

export const STUDIO_CONTENT = {
  header: { overline: 'Studio', title: 'Structure & Intent' },
  constitution: {
    label: 'How we build',
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
      { date: 'Q1 2026', event: 'MenuFlows infrastructure enters Beta v2' },
      { date: 'Q4 2025', event: 'twimnc experiment protocol established' },
      { date: 'Q3 2025', event: 'BERLINLABS architectural framework codified' }
    ]
  },
  footer: 'Built for clarity.'
};

export const FOOTER_CONTENT = {
  copyright: `© ${new Date().getFullYear()} BERLINLABS`
};

export const CONTACT_CONTENT = {
  header: {
    overline: 'Contact',
    title: 'Initiate Connection.',
    body: 'We prioritize venues and partners looking for long-term operational stability. Describe your friction.'
  },
  form: {
    labels: {
      identity: 'Who are you?',
      focus: 'Primary Focus',
      email: 'Email Address',
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
    body: 'We review all inquiries for operational alignment. Expect a response within 48 hours.'
  },
  footer: 'Operational Excellence by BerlinLabs'
};

export const PRODUCTS_CONTENT = {
  header: {
    overline: 'Index',
    title: 'System Directory'
  },
  ctaSuffix: 'View System Details'
};
