
import { client } from './client';
import { ContactFormData, OnboardingFormData } from '../types';

export const api = {
  submitContact: (data: ContactFormData) => client.post('/contact', data),
  submitOnboarding: (data: OnboardingFormData) => client.post('/onboarding', data),
  getProjects: () => client.get('/projects'),
};
