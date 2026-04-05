import React, { useEffect } from 'react';
import {
  ArrowRight,
  Palette,
  QrCode,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Plus,
  Code2,
  Database,
  Shield,
  CreditCard,
  Zap,
  GitFork,
} from 'lucide-react';
import { useBranding } from '../contexts';

// ─── Lemon Squeezy checkout URLs ─────────────────────────────────────────────
const SOURCE_CODE_CHECKOUT_URL = 'https://bld.lemonsqueezy.com/checkout/buy/70f50a09-0cfe-4c85-9bd9-efa58c968f22?embed=1&discount=0';
const WHITE_GLOVE_CHECKOUT_URL = 'https://bld.lemonsqueezy.com/checkout/buy/a7178acb-00ac-4913-984a-c70faffce557?embed=1';

interface LandingViewProps {
  onDemo?: () => void;
  activeOrderCode?: string | null;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

// ─── Reusable accent-aware primitives ────────────────────────────────────────

const AccentButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; href?: string }> = ({
  children, onClick, className = '', href,
}) => {
  const cls = `inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white bg-[var(--color-accent)] hover:opacity-90 transition-all shadow-lg shadow-[var(--color-accent)]/25 active:scale-95 ${className}`;
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  }
  return <button onClick={onClick} className={cls}>{children}</button>;
};

const GhostButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; href?: string }> = ({
  children, onClick, className = '', href,
}) => {
  const cls = `inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 ${className}`;
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  }
  return <button onClick={onClick} className={cls}>{children}</button>;
};

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
            <div className="text-base font-black text-white leading-tight">Sample Bistro</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Open Now</span>
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

  // Initialise Lemon Squeezy overlay after mount so dynamically-rendered
  // lemonsqueezy-button elements are picked up by the SDK.
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).createLemonSqueezy === 'function') {
      (window as any).createLemonSqueezy();
    }
  }, []);

  const logoText = branding.company.logoText || branding.company.name.toLowerCase();
  const splitIdx = Math.ceil(logoText.length / 2);
  const logoFirst = logoText.slice(0, splitIdx);
  const logoSecond = logoText.slice(splitIdx);

  const features = [
    {
      icon: <Palette className="w-5 h-5" />,
      title: 'One-File White-Label',
      desc: 'Edit one JSON file to change logo, colors, and company name. Redeploy in seconds. No admin UI needed.',
      dark: true,
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      title: 'QR Ordering Flow',
      desc: 'Table QR → mobile menu → cart → order placed. The complete customer journey, ready to deploy.',
      dark: false,
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Real-Time Kitchen Display',
      desc: 'Orders appear the instant they are placed. Kitchen sees new tickets live — no polling, no refresh.',
      dark: false,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure Multi-Tenant Architecture',
      desc: 'Each restaurant sees only its own data — enforced at the database level. Safe by default.',
      dark: false,
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Payment-Ready Hooks',
      desc: 'Payment integration scaffolding is included. Connect your preferred payment provider and go.',
      dark: false,
    },
  ];

  const steps = [
    {
      n: '01',
      icon: <GitFork className="w-5 h-5" />,
      title: 'Get the Code',
      desc: 'Download the template to your own account. You own the complete codebase from day one.',
    },
    {
      n: '02',
      icon: <Database className="w-5 h-5" />,
      title: 'Configure & Host',
      desc: 'Initialize the database, set two environment variables, and push to your hosting provider. Live in under 15 minutes.',
    },
    {
      n: '03',
      icon: <Palette className="w-5 h-5" />,
      title: 'Brand & Sell',
      desc: 'Edit the branding file with your client\'s logo and colors. Redeploy. Charge €99/mo.',
    },
  ];

  const advantages = [
    {
      icon: <Code2 className="w-5 h-5" />,
      title: 'Full Source Ownership',
      desc: 'You get the complete production codebase. Modify it, extend it, ship it under your own brand. No license checks, no vendor lock-in.',
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Your Own Database',
      desc: 'Every restaurant runs on your own database infrastructure. You own every row. No shared infrastructure, no data exposure between clients.',
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'Zero Platform Fees',
      desc: 'No per-order cut. No monthly SaaS fee to us. Pay your hosting providers directly — that\'s it. Margins are yours to set.',
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
            <a href="#features" className="hover:text-accent transition-colors">What's Included</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
            <a href="https://www.menuflows.app/demo" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Live Demo</a>
          </nav>

          {/* CTA */}
          <AccentButton href="https://www.menuflows.app/demo" className="hidden sm:inline-flex">
            See Live Demo <ArrowRight className="w-4 h-4" />
          </AccentButton>
        </div>
      </header>

      <main id="main-content">

      {/* ── 2. HERO ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-12 md:pt-24 md:pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">
          <span
            className="size-1.5 rounded-full"
            style={{ background: 'var(--color-accent)' }}
          />
          Production-Ready SaaS Template
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6 text-slate-900">
          Own Your Own<br />
          <span style={{ color: 'var(--color-accent)' }}>Restaurant Ordering SaaS</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          A complete, deployable QR ordering system — full source code, your own database,
          your own hosting. White-label it for any restaurant client in under 15 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <AccentButton href="#pricing" className="text-base px-8 py-4">
            Get the Source Code <ArrowRight className="w-4 h-4" />
          </AccentButton>
          <GhostButton href="https://www.menuflows.app/demo" className="text-base px-8 py-4">
            View Live Demo <ChevronRight className="w-4 h-4" />
          </GhostButton>
        </div>
      </section>

      {/* ── 3. STATS BAR ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10 md:py-14 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 text-center">
          {[
            { num: '200+', label: 'hours of engineering work — forked in one click' },
            { num: '100%', label: 'source code ownership — no licensing restrictions' },
            { num: '15 min', label: 'from setup to live deployment, start to finish' },
          ].map(({ num, label }) => (
            <div key={num}>
              <div className="text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--color-accent)' }}>
                {num}
              </div>
              <div className="text-sm text-slate-500 font-medium max-w-[200px] mx-auto leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FEATURES GRID ──────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
            What's In the Repo
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
            Everything you need to ship day one
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            Not a prototype. A production-ready system already handling real restaurant orders.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dark feature card (spans 2 cols on md) */}
          <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
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

          {/* QR Ordering */}
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

          {/* Real-Time Kitchen */}
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

          {/* Secure Multi-Tenant */}
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

          {/* Payment-Ready */}
          <div className="col-span-1 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between min-h-[180px] hover:border-slate-200 hover:shadow-md transition-all">
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
      <section className="bg-slate-50 border-y border-slate-100 py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-accent)' }}>
              The Customer Experience
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              A mobile ordering experience your clients will be proud of.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Customers scan the table QR code and land on a fast, mobile-optimized menu.
              They browse, add items, and place their order — no download, no account required.
              The kitchen sees the ticket the moment it's placed.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'No app download — works in any mobile browser',
                'Real-time order push to kitchen display',
                'Table-side QR with waiter handshake protocol',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <GhostButton href="https://www.menuflows.app/demo">
              Try the live demo <ArrowRight className="w-4 h-4" />
            </GhostButton>
          </div>

          {/* Right: phone mockup */}
          <div className="flex justify-center items-center py-6">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
            Setup Process
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Live in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="relative flex flex-col items-center text-center">
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

      {/* ── 7. PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
              Pricing
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              One-time payment. No subscriptions.
            </h2>
            <p className="text-lg text-slate-500 mt-4 max-w-lg mx-auto">
              Buy the source code once and own it forever. Upgrade to White-Glove if you'd rather we handle the setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

            {/* Card 1: The Source Code */}
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-slate-200 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Standard</p>
                <h3 className="text-2xl font-black text-slate-900">The Source Code</h3>
                <p className="text-slate-500 text-sm mt-1.5">One-time payment. Deploy it yourself.</p>
              </div>

              <div className="mb-8 pb-8 border-b border-slate-100">
                <span className="text-5xl font-black text-slate-900">€497</span>
                <span className="text-slate-400 text-sm ml-2">one-time</span>
              </div>

              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Lifetime commercial use license',
                  'Full React + Supabase source code',
                  'branding.json white-label engine',
                  'Step-by-step deployment documentation',
                  '1 year of GitHub code updates',
                  '1 year of private community support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={SOURCE_CODE_CHECKOUT_URL}
                className="lemonsqueezy-button inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-full font-bold text-base text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
              >
                Get the Code <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-slate-400 text-center mt-3">
                Delivered as a private GitHub repository
              </p>
            </div>

            {/* Card 2: White-Glove Setup */}
            <div className="bg-slate-900 rounded-3xl p-5 md:p-8 flex flex-col relative overflow-hidden">
              {/* Subtle accent glow at top-right */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 60%)' }}
              />

              <div className="relative flex flex-col flex-1">
                {/* Header row: title + badge */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>Premium</p>
                    <h3 className="text-2xl font-black text-white">White-Glove Setup</h3>
                    <p className="text-slate-400 text-sm mt-1.5">One-time payment. We handle the tech.</p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    Most Popular
                  </span>
                </div>

                <div className="mb-8 pb-8 border-b border-white/10">
                  <span className="text-5xl font-black text-white">€997</span>
                  <span className="text-slate-400 text-sm ml-2">one-time</span>
                </div>

                <ul className="space-y-3.5 mb-10 flex-1">
                  {[
                    { text: 'Everything in the Source Code tier', highlight: false },
                    { text: 'We deploy the code to Vercel & Supabase for you', highlight: true },
                    { text: 'We connect your custom agency domain', highlight: true },
                    { text: 'We configure the admin database', highlight: true },
                    { text: 'Handed over fully live in 48 hours', highlight: true },
                  ].map(({ text, highlight }) => (
                    <li key={text} className={`flex items-start gap-3 text-sm ${highlight ? 'text-white' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                      {text}
                    </li>
                  ))}
                </ul>

                <a
                  href={WHITE_GLOVE_CHECKOUT_URL}
                  className="lemonsqueezy-button inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-full font-bold text-base text-white bg-[var(--color-accent)] hover:opacity-90 transition-all shadow-lg shadow-[var(--color-accent)]/25 active:scale-95"
                >
                  Book Setup Call <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-xs text-slate-500 text-center mt-3">
                  Live in 48 hours · Includes full handover call
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. TECHNICAL ADVANTAGE ────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
              Why Own the Code
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              No lock-in. Ever.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-5 md:p-8 hover:border-slate-200 hover:shadow-md transition-all"
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
      <section className="bg-slate-900 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            Deploy your first client today
          </h2>
          <p className="text-lg text-slate-400 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
            Full source code. Your database. Your infrastructure. One file to white-label.
            Get it, deploy it, sell it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <AccentButton href="#" className="text-base px-8 py-4">
              Get the Source Code — €197 <ArrowRight className="w-4 h-4" />
            </AccentButton>
            <a
              href={`mailto:${branding.company.supportEmail}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Ask a question
            </a>
          </div>
        </div>
      </section>

      </main>

      {/* ── TECH SPECS ────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 border-t border-white/5 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Tech Stack — For Technical Buyers</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['React 19 + TypeScript', 'Vite', 'Tailwind CSS', 'Supabase (Postgres + Realtime + RLS)', 'Vercel-ready', 'Stripe-ready hooks'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-400 border border-slate-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} {branding.company.name}</span>
            <span className="text-slate-700">·</span>
            <button onClick={onPrivacy} className="hover:text-accent transition-colors">Privacy</button>
            <span className="text-slate-700">·</span>
            <button onClick={onTerms} className="hover:text-accent transition-colors">Terms</button>
            <span className="text-slate-700">·</span>
            <a href="mailto:hello@menuflows.app" className="hover:text-accent transition-colors">Contact</a>
          </div>
          <a
            href="https://berlinlabs.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >Built by <span className="font-semibold group-hover:text-accent transition-colors">Berlin Labs</span></a>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
