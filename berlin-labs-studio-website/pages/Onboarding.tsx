
import React, { useState } from 'react';
import { api } from '../api/endpoints';
import { OnboardingFormData } from '../types';

export const Onboarding: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    restaurantName: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.submitOnboarding(formData);
      setSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-32 lg:py-40 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-primary/30 shadow-gold-glow">
          <span className="material-symbols-outlined text-primary text-4xl">done_all</span>
        </div>
        <h1 className="h2-section text-white mb-6 uppercase tracking-tightest">Application Received.</h1>
        <p className="max-w-md mx-auto text-lg font-light text-slate-300">
          We will review your operational requirements and reach out if there is a slot in the Berlin pilot program.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 py-32 animate-in fade-in">
      <header className="mb-24">
        <span className="overline-label">Onboarding</span>
        <h1 className="h1-hero text-white mb-10 uppercase tracking-tightest">Pilot Access.</h1>
        <p className="text-xl text-slate-300 font-light">MenuFlows is currently scaling via selected Berlin venues.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        <div className="space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Restaurant Name</label>
          <input
            required
            type="text"
            value={formData.restaurantName}
            onChange={e => setFormData({ ...formData, restaurantName: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Email</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Location (Berlin District)</label>
          <input
            required
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2 space-y-4 group">
          <label className="text-[10px] uppercase tracking-overline text-primary/40 group-focus-within:text-primary transition-colors font-bold">Operational Context</label>
          <textarea
            required
            rows={3}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary text-white font-light rounded-none resize-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="md:col-span-2 text-red-400 text-sm py-2 border-l-2 border-red-400 pl-4 bg-red-400/5">
            {error}
          </div>
        )}

        <div className="md:col-span-2 pt-10">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </main>
  );
};
