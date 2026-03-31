import React from 'react';
import {
  ArrowRight,
  Palette,
  QrCode,
  BarChart3,
  ShoppingBag,
  Users,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useBranding } from '../contexts';

interface LandingViewProps {
  onDemo?: () => void;
  activeOrderCode?: string | null;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

// ─── Reusable accent-aware primitives ────────────────────────────────────────

const AccentButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({
  children, onClick, className = '',
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white bg-[var(--color-accent)] hover:opacity-90 transition-all shadow-lg shadow-[var(--color-accent)]/25 active:scale-95 ${className}`}
  >
    {children}
  </button>
);

const GhostButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({
  children, onClick, className = '',
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 ${className}`}
  >
    {children}
  </button>
);

// ─── Phone Mockup ─────────────────────────────────────────────────────────────

const PhoneMockup: React.FC = () => {
  const accent = 'var(--color-accent)';
  const bg = '#0d0d0d';
  const card = '#181818';

  const items = [
    { name: 'Double Trouble', price: '€14.50', desc: 'Two smash patties, caramelized onions, house sauce', emoji: '🍔' },
    { name: 'Spicy Chicken', price: '€12.00', desc: 'Crispy breast, spicy slaw, chipotle mayo', emoji: '🌶️' },
    { name: 'Mushroom Swiss', price: '€15.50', desc: 'Sautéed wild mushrooms, truffle aioli', emoji: '🍄' },
    { name: 'Smoke & Cheese', price: '€13.90', desc: 'Smoked brisket, aged cheddar, pickles', emoji: '🧀' },
  ];

  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Glow */}
      <div className="absolute inset-0 blur-3xl opacity-15 rounded-[40px] scale-110" style={{ background: accent }} />

      {/* Phone shell */}
      <div className="relative rounded-[36px] p-[10px] shadow-2xl" style={{ background: '#111', boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        {/* Notch */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-16 h-[18px] rounded-full z-20" style={{ background: '#0a0a0a' }} />

        {/* Screen */}
        <div className="rounded-[28px] overflow-hidden flex flex-col relative" style={{ background: bg, height: 570 }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-9 pb-2 relative z-10 shrink-0">
            <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex items-end gap-px">
                {[3, 4, 5, 6].map(h => (
                  <div key={h} className="w-[3px] rounded-sm" style={{ height: h, background: 'rgba(255,255,255,0.5)' }} />
                ))}
              </div>
              <div className="w-4 h-[10px] rounded-[2px] ml-0.5" style={{ border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          {/* Restaurant title */}
          <div className="px-4 pb-3 shrink-0">
            <div className="text-base font-black text-white leading-tight">The Burger Lab</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Open · Berlin Mitte</span>
            </div>
          </div>

          {/* Menu grid — 2 columns */}
          <div className="flex-1 overflow-hidden px-3 grid grid-cols-2 gap-2 content-start pb-2">
            {items.map((item) => (
              <div
                key={item.name}
                className="rounded-3xl overflow-hidden flex flex-col"
                style={{ background: card, border: '1px solid rgba(255,255,255,0.04)' }}
              >
                {/* Image area */}
                <div
                  className="relative flex items-center justify-center text-4xl"
                  style={{ height: 90, background: 'rgba(255,255,255,0.03)' }}
                >
                  <span>{item.emoji}</span>
                  {/* + button top-right */}
                  <div
                    className="absolute top-2 right-2 size-7 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ background: accent }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
                {/* Info */}
                <div className="px-2.5 pt-2 pb-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-black text-white leading-tight mb-0.5">{item.name}</div>
                    <div className="text-[8px] leading-tight line-clamp-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.desc}</div>
                  </div>
                  <div className="text-[11px] font-black mt-1.5" style={{ color: accent }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom nav pill — MENU + TABLE */}
          <div className="px-6 pb-5 pt-2 shrink-0">
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* MENU — active */}
              <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: accent }}>
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2" /><path d="M18 15a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: accent }}>Menu</span>
              </div>
              {/* Divider */}
              <div className="w-px h-8 self-center" style={{ background: 'rgba(255,255,255,0.07)' }} />
              {/* TABLE — inactive */}
              <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <rect x="3" y="3" width="18" height="3" rx="1" /><path d="M9 6v13" /><path d="M15 6v13" /><path d="M6 19h12" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Table</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical side buttons */}
      <div className="absolute right-[-5px] top-24 w-[4px] h-10 rounded-full" style={{ background: '#222' }} />
      <div className="absolute left-[-5px] top-20 w-[4px] h-7 rounded-full" style={{ background: '#222' }} />
      <div className="absolute left-[-5px] top-32 w-[4px] h-7 rounded-full" style={{ background: '#222' }} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LandingView: React.FC<LandingViewProps> = ({ onDemo, onPrivacy, onTerms }) => {
  const branding = useBranding();
  const logoText = branding.company.logoText || branding.company.name.toLowerCase();
  const splitIdx = Math.ceil(logoText.length / 2);
  const logoFirst = logoText.slice(0, splitIdx);
  const logoSecond = logoText.slice(splitIdx);

  const features = [
    {
      icon: <Palette className="w-5 h-5" />,
      title: 'White-Label Branding',
      desc: 'Full brand control. Your logo, colors, and domain — zero trace of us.',
      dark: true,
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      title: 'QR Digital Menus',
      desc: 'Guests scan, browse, and order. No download, no friction.',
      dark: false,
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'Commission-Free Ordering',
      desc: 'No per-order fees. Your clients keep 100% of every transaction.',
      dark: false,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Revenue Analytics',
      desc: 'Real-time dashboards for orders, peak hours, and top items.',
      dark: false,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Agency Partner Portal',
      desc: 'Manage all your restaurant clients from one admin panel.',
      dark: false,
    },
  ];

  const steps = [
    { n: '01', title: 'Apply as a Partner', desc: 'Fill out a short form. We approve agency partners within 24 hours.' },
    { n: '02', title: 'Brand & Onboard Clients', desc: 'Upload your logo, set colors, and launch a client in under 5 minutes.' },
    { n: '03', title: 'Collect Monthly Revenue', desc: 'Set your own prices. Invoice clients. Keep 30–50% margins, every month.' },
  ];

  const revenueRows = [
    { clients: 5, rev: '$1,875', highlight: false },
    { clients: 10, rev: '$3,750', highlight: false },
    { clients: 20, rev: '$7,500', highlight: true },
    { clients: 30, rev: '$11,250', highlight: false },
  ];

  const advantages = [
    {
      icon: <Palette className="w-5 h-5" />,
      title: 'Zero Code Required',
      desc: 'Config-driven white-labeling via a visual UI. Any agency can do it.',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Enterprise Infrastructure',
      desc: 'Deployed on global edge. 99.9% uptime SLA. Scales automatically.',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Client Ownership',
      desc: "You own the billing relationship. We're invisible to your clients.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── 1. HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}
            >
              {branding.company.logoUrl
                ? <img src={branding.company.logoUrl} alt={branding.company.name} className="size-full object-contain rounded-lg" />
                : <span className="text-white font-black text-sm">✦</span>
              }
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              {logoFirst}<span style={{ color: 'var(--color-accent)' }}>{logoSecond}</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#agencies" className="hover:text-slate-900 transition-colors">For Agencies</a>
            <a href="https://menuflows-dun.vercel.app/demo" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Live Demo</a>
          </nav>

          {/* CTA */}
          <a href="https://menuflows-dun.vercel.app/demo" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
            <AccentButton>
              See Live Demo <ArrowRight className="w-4 h-4" />
            </AccentButton>
          </a>
        </div>
      </header>

      {/* ── 2. HERO ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">
          <span
            className="size-1.5 rounded-full"
            style={{ background: 'var(--color-accent)' }}
          />
          White-Label Menu Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6 text-slate-900">
          Turn Menus Into<br />
          <span style={{ color: 'var(--color-accent)' }}>Monthly Revenue</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The white-label menu platform agencies resell to restaurants — launch in 48 hours,
          keep 30–50% margins, and build recurring revenue from your existing clients.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <AccentButton className="text-base px-8 py-4">
            Start as an Agency <ArrowRight className="w-4 h-4" />
          </AccentButton>
          <a href="https://menuflows-dun.vercel.app/demo" target="_blank" rel="noopener noreferrer">
            <GhostButton className="text-base px-8 py-4">
              View Live Demo <ChevronRight className="w-4 h-4" />
            </GhostButton>
          </a>
        </div>

      </section>

      {/* ── 3. STATS BAR ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { num: '85%', label: 'of restaurants now use QR digital menus' },
            { num: '30–50%', label: 'reseller margins for agency partners' },
            { num: '$7,500', label: 'avg monthly MRR at 10 restaurant clients' },
          ].map(({ num, label }) => (
            <div key={num}>
              <div className="text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--color-accent)' }}>
                {num}
              </div>
              <div className="text-sm text-slate-500 font-medium max-w-[180px] mx-auto leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FEATURES GRID ──────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
            Platform Features
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
            Everything you need to resell
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            A complete white-label platform — built for agencies, loved by restaurants.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Dark feature card (spans 2 cols on md) */}
          <div className="col-span-2 md:col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] group">
            <div
              className="size-11 rounded-2xl flex items-center justify-center text-white mb-6"
              style={{ background: 'var(--color-accent)' }}
            >
              {features[0].icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-2">{features[0].title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{features[0].desc}</p>
            </div>
          </div>

          {/* QR Menus */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between min-h-[220px] hover:border-slate-200 hover:shadow-md transition-all">
            <div
              className="size-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              {features[1].icon}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">{features[1].title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[1].desc}</p>
            </div>
          </div>

          {/* Commission-Free */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between min-h-[180px] hover:border-slate-200 hover:shadow-md transition-all">
            <div
              className="size-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              {features[2].icon}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">{features[2].title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[2].desc}</p>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between min-h-[180px] hover:border-slate-200 hover:shadow-md transition-all">
            <div
              className="size-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              {features[3].icon}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">{features[3].title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[3].desc}</p>
            </div>
          </div>

          {/* Agency Portal */}
          <div className="col-span-2 md:col-span-1 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between min-h-[180px] hover:border-slate-200 hover:shadow-md transition-all">
            <div
              className="size-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              {features[4].icon}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">{features[4].title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[4].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. MOBILE DEMO SECTION ────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-accent)' }}>
              The Customer Experience
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              A flawless mobile ordering experience they can deploy instantly.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              When customers scan the QR code, they drop right into a beautiful,
              mobile-optimized menu. They can add items to their cart and checkout
              instantly. Your clients look like tech giants.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'No download required — works instantly in any browser',
                'Real-time order tracking to the kitchen',
                'Table-side QR with waiter handshake protocol',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <a href="https://menuflows-dun.vercel.app/demo" target="_blank" rel="noopener noreferrer">
              <GhostButton>
                See it live <ArrowRight className="w-4 h-4" />
              </GhostButton>
            </a>
          </div>

          {/* Right: phone mockup */}
          <div className="flex justify-center items-center py-6">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
            Simple Process
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Revenue in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="relative">
              <div
                className="size-12 rounded-2xl flex items-center justify-center text-white font-black text-base mb-5 shadow-lg shadow-[var(--color-accent)]/20"
                style={{ background: 'var(--color-accent)' }}
              >
                {n}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. REVENUE CALCULATOR ─────────────────────────────────────────── */}
      <section id="agencies" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-start">
          {/* Left: value prop */}
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-accent)' }}>
                For Agencies
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                A new revenue stream from clients you already have.
              </h2>
              <ul className="space-y-3 mt-6 mb-10">
                {[
                  'No technical skills needed to onboard clients',
                  'Set your own pricing and keep the margins',
                  'Fully white-labeled — clients see your brand only',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <AccentButton>
              Apply as a Partner <ArrowRight className="w-4 h-4" />
            </AccentButton>
          </div>

          {/* Right: calculator */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--color-accent)' }}>
              Agency Revenue Calculator
            </p>
            <p className="text-slate-400 text-sm mb-6">Based on €375/month per client (avg resale price)</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 pb-2 border-b border-white/5">
                <span>Clients</span>
                <span className="text-right">Monthly Revenue</span>
              </div>
              {revenueRows.map(({ clients, rev, highlight }) => (
                <div
                  key={clients}
                  className="grid grid-cols-2 items-center px-4 py-3 rounded-2xl transition-all"
                  style={highlight ? {
                    background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)',
                  } : { background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="text-sm font-bold text-slate-300">
                    {clients} clients
                    {highlight && (
                      <span
                        className="ml-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--color-accent)', color: '#fff' }}
                      >
                        Popular
                      </span>
                    )}
                  </span>
                  <span
                    className="text-right text-sm font-black"
                    style={highlight ? { color: 'var(--color-accent)' } : { color: '#fff' }}
                  >
                    {rev}/mo
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-slate-500 text-center">
              Margins of 30–50% after the platform license fee.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. AGENCY TECH ADVANTAGE ──────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
              Agency Advantage
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Ready for production from Day 1
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-slate-200 hover:shadow-md transition-all"
              >
                <div
                  className="size-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {icon}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            Start selling in 48 hours
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Join agencies earning recurring revenue from their restaurant clients.
            No technical skills required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <AccentButton className="text-base px-8 py-4">
              Apply as a Partner <ArrowRight className="w-4 h-4" />
            </AccentButton>
            <a
              href={`mailto:${branding.company.supportEmail}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <span className="text-white font-black text-xs">✦</span>
            </div>
            <span className="text-sm font-bold text-white/60">{branding.company.name}</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {branding.company.name}. Built by{' '}
            <a
              href="https://berlinlabs.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Berlin Labs Digital
            </a>
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button onClick={onPrivacy} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={onTerms} className="hover:text-white transition-colors">Terms</button>
            <a href={`mailto:${branding.company.supportEmail}`} className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
