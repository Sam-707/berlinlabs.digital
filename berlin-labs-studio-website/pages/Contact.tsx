import React, { useState } from 'react';
import { CONTACT_CONTENT } from '../data/content';
import { Logo } from '../components/Logo';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState(CONTACT_CONTENT.form.inquiryTypes[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-40 md:py-64 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-gold-glow border border-primary/20">
          <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
        </div>
        <h1 className="h1-hero text-white mb-8 uppercase tracking-tightest">{CONTACT_CONTENT.success.title}</h1>
        <p className="max-w-sm mx-auto text-lg md:text-xl font-light text-slate-400">
          {CONTACT_CONTENT.success.body}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-16 text-[10px] uppercase tracking-overline font-bold text-slate-600 hover:text-primary transition-colors"
        >
          Return to Index
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-[90vh] overflow-hidden">
      {/* Brand Watermark - Matches Home.tsx for continuity */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3/4 opacity-[0.015] pointer-events-none transition-all duration-1000">
        <Logo className="w-[85vh] h-[85vh] text-primary" />
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] orbital-glow rounded-full"></div>
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] orbital-glow opacity-30 rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-start">
          
          {/* Left Column: Context & Metadata */}
          <header className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <span className="overline-label">{CONTACT_CONTENT.header.overline}</span>
            <h1 className="h1-hero text-white mb-12 uppercase tracking-tightest">
              {CONTACT_CONTENT.header.title.split('.')[0]}<span className="gold-gradient-text">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-editorial mb-16 max-w-lg">
              {CONTACT_CONTENT.header.body}
            </p>

            <div className="pt-10 border-t border-white/5">
              <div className="flex gap-4 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-widest text-primary/40 font-mono">Accepting Q2-Q3 Projects</span>
              </div>
            </div>
          </header>

          {/* Right Column: Intake Terminal */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="glass-card rounded-[2.5rem] p-10 md:p-16 border-white/10 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all">
              <form onSubmit={handleSubmit} className="space-y-14 relative z-10">
                
                {/* Identity Field */}
                <div className="space-y-4 group">
                  <label className="text-[9px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold">
                    {CONTACT_CONTENT.form.labels.identity}
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder={CONTACT_CONTENT.form.placeholders.identity}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all text-white text-lg md:text-xl font-light placeholder:text-white/5 rounded-none"
                    aria-label={CONTACT_CONTENT.form.labels.identity}
                  />
                </div>

                {/* Inquiry Type (Custom-styled Select) */}
                <div className="space-y-4 group">
                  <label className="text-[9px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold">
                    {CONTACT_CONTENT.form.labels.focus}
                  </label>
                  <div className="relative">
                    <select 
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all text-white text-lg md:text-xl font-light appearance-none cursor-pointer rounded-none pr-10"
                      aria-label={CONTACT_CONTENT.form.labels.focus}
                    >
                      {CONTACT_CONTENT.form.inquiryTypes.map((type) => (
                        <option key={type} value={type} className="bg-[#121212] text-white py-4">{type}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-focus-within:text-primary transition-colors">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Specification Field */}
                <div className="space-y-4 group">
                  <label className="text-[9px] uppercase tracking-overline text-slate-500 group-focus-within:text-primary transition-colors font-display font-bold">
                    {CONTACT_CONTENT.form.labels.specification}
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder={CONTACT_CONTENT.form.placeholders.specification}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-primary transition-all text-white text-lg md:text-xl font-light placeholder:text-white/5 rounded-none resize-none"
                    aria-label={CONTACT_CONTENT.form.labels.specification}
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="btn-primary w-full group flex items-center justify-center gap-4"
                    aria-label={CONTACT_CONTENT.form.submitButton}
                  >
                    <span>{CONTACT_CONTENT.form.submitButton}</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_right_alt</span>
                  </button>
                </div>
              </form>

              {/* Decorative detail */}
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center opacity-30">
                <span className="text-[9px] font-mono tracking-widest uppercase">Intake System v4.0</span>
                <span className="text-[9px] font-mono tracking-widest uppercase">Secure Terminal</span>
              </div>
            </div>
            
            <p className="mt-10 text-[10px] uppercase tracking-overline text-slate-700 font-mono font-bold italic text-center lg:text-left">
              {CONTACT_CONTENT.footer}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};