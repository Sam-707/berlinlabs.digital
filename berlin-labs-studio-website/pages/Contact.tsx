
import React, { useState } from 'react';
import { CONTACT_CONTENT } from '../data/content';
import { Page } from '../types';

interface ContactProps {
  onNavigate: (page: Page) => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState(CONTACT_CONTENT.form.inquiryTypes[0]);
  const [formData, setFormData] = useState({
    identity: '',
    email: '',
    specification: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-32 lg:py-40 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-primary/30 shadow-gold-glow">
          <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
        </div>
        <h1 className="h1-hero text-white mb-8 uppercase tracking-tightest">{CONTACT_CONTENT.success.title}</h1>
        <p className="max-w-sm mx-auto text-lg md:text-xl font-light text-slate-400 leading-editorial">
          {CONTACT_CONTENT.success.body}
        </p>
        <button
          onClick={() => onNavigate('systems')}
          className="mt-16 px-6 py-3 text-[10px] uppercase tracking-overline font-bold text-white bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-full transition-all duration-300"
          aria-label={CONTACT_CONTENT.success.backLabel}
        >
          {CONTACT_CONTENT.success.backLabel}
        </button>
      </main>
    );
  }

  return (
    <main className="relative hero-shell stack-hero overflow-hidden">
      {/* Ambient glow - positioned for depth */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] orbital-glow rounded-full opacity-40"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl opacity-30"></div>

      <div className="layout-shell relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">

          {/* Left Column: Context & Metadata - 5 cols */}
          <header className="lg:col-span-5 animate-in fade-in slide-in-from-left-8 duration-1000">
            <span className="overline-label block mb-6">{CONTACT_CONTENT.header.overline}</span>
            <h1 className="h1-hero text-white mb-8 uppercase tracking-tightest">
              {CONTACT_CONTENT.header.title}
            </h1>
            <p className="text-lead text-measure mb-12">
              {CONTACT_CONTENT.header.body}
            </p>

            {/* Location Card */}
            <div className="glass-card p-6 rounded-2xl mb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                </div>
                <div>
                  <p className="text-sm text-white font-display font-semibold mb-1">{CONTACT_CONTENT.header.location}</p>
                  <p className="text-xs text-slate-600 font-mono tracking-wider">{CONTACT_CONTENT.header.coordinates}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="glass-card p-6 rounded-2xl mb-5">
              <p className="text-[10px] uppercase tracking-overline text-slate-600 mb-4 font-display font-bold">
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_CONTENT.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-[9px] font-mono bg-white/5 text-slate-400 rounded-full border border-white/5"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability Indicator */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-primary/5 border border-primary/10 w-fit">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-primary/60 font-mono font-semibold">
                {CONTACT_CONTENT.header.availability}
              </span>
            </div>
          </header>

          {/* Right Column: Intake Terminal - 7 cols */}
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="glass-card p-8 md:p-10 rounded-3xl border-white/10 relative overflow-hidden">
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

              <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
                {/* Identity Field */}
                <div className="space-y-3 group">
                  <label htmlFor="identity" className="text-[10px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold block">
                    {CONTACT_CONTENT.form.labels.identity}
                  </label>
                  <input
                    id="identity"
                    required
                    type="text"
                    value={formData.identity}
                    onChange={(e) => handleInputChange('identity', e.target.value)}
                    placeholder={CONTACT_CONTENT.form.placeholders.identity}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-white text-lg font-light placeholder:text-white/5 rounded-none"
                    aria-label={CONTACT_CONTENT.form.labels.identity}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-3 group">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold block">
                    {CONTACT_CONTENT.form.labels.email}
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={CONTACT_CONTENT.form.placeholders.email}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-white text-lg font-light placeholder:text-white/5 rounded-none"
                    aria-label={CONTACT_CONTENT.form.labels.email}
                  />
                </div>

                {/* Inquiry Type Select */}
                <div className="space-y-3 group">
                  <label htmlFor="focus" className="text-[10px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold block">
                    {CONTACT_CONTENT.form.labels.focus}
                  </label>
                  <div className="relative">
                    <select
                      id="focus"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-white text-lg font-light appearance-none cursor-pointer rounded-none pr-10"
                      aria-label={CONTACT_CONTENT.form.labels.focus}
                    >
                      {CONTACT_CONTENT.form.inquiryTypes.map((type) => (
                        <option key={type} value={type} className="bg-[#0a0a0a] text-white py-3">{type}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-focus-within:text-primary transition-colors duration-300">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Specification Field */}
                <div className="space-y-3 group">
                  <label htmlFor="specification" className="text-[10px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold block">
                    {CONTACT_CONTENT.form.labels.specification}
                  </label>
                  <textarea
                    id="specification"
                    required
                    rows={3}
                    value={formData.specification}
                    onChange={(e) => handleInputChange('specification', e.target.value)}
                    placeholder={CONTACT_CONTENT.form.placeholders.specification}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all duration-300 text-white text-lg font-light placeholder:text-white/5 rounded-none resize-none"
                    aria-label={CONTACT_CONTENT.form.labels.specification}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn-primary w-full group flex items-center justify-center gap-3 py-5"
                    aria-label={CONTACT_CONTENT.form.submitButton}
                  >
                    <span>{CONTACT_CONTENT.form.submitButton}</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1 duration-300">arrow_right_alt</span>
                  </button>
                </div>
              </form>

              {/* Meta Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-widest uppercase text-slate-700">
                  {CONTACT_CONTENT.meta.version}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-slate-700">
                    {CONTACT_CONTENT.meta.security}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[10px] uppercase tracking-overline text-slate-700 font-mono font-bold italic text-center lg:text-left">
              BerlinLabs — Operational Product Studio
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
