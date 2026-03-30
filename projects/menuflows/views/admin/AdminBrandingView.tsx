import React, { useState } from 'react';
import { useBranding, Branding } from '../../contexts/BrandingContext';

interface AdminBrandingViewProps {
  onBack: () => void;
}

const ColorSwatch: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
    <div className="relative shrink-0">
      <div
        className="size-10 rounded-xl border-2 border-white/20 cursor-pointer shadow-lg"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">{label}</div>
      <div className="font-mono text-sm font-bold text-white/80">{value}</div>
    </div>
  </div>
);

const AdminBrandingView: React.FC<AdminBrandingViewProps> = ({ onBack }) => {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [saved, setSaved] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleColorChange = (key: keyof Branding['colors'], value: string) => {
    updateBranding({ colors: { ...branding.colors, [key]: value } });
    setSaved(false);
  };

  const handleCompanyChange = (key: keyof Branding['company'], value: string) => {
    updateBranding({ company: { ...branding.company, [key]: value } });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(branding, null, 2));
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-white animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Admin</div>
            <div className="text-base font-black">White-Label Branding</div>
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-primary/20 text-primary border border-primary/30 active:scale-95'
            }`}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">

        {/* Live Preview */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 px-1">Live Preview</h2>
          <div
            className="rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: branding.colors.darkBg }}
          >
            {/* Mock nav */}
            <div
              className="px-5 py-4 flex items-center justify-between border-b border-white/5"
              style={{ background: branding.colors.cardBg }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-8 rounded-lg flex items-center justify-center"
                  style={{ background: branding.colors.primary }}
                >
                  <span className="material-symbols-outlined text-white text-sm">bolt</span>
                </div>
                {branding.company.logoUrl ? (
                  <img src={branding.company.logoUrl} alt="logo" className="h-6 object-contain" />
                ) : (
                  <span className="font-black text-base tracking-tight">
                    {branding.company.logoText || branding.company.name.toLowerCase()}
                  </span>
                )}
              </div>
              <div
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: `${branding.colors.primary}20`, color: branding.colors.primary }}
              >
                Platform Admin
              </div>
            </div>
            {/* Mock content */}
            <div className="p-5 space-y-3">
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: branding.colors.cardBg, border: `1px solid ${branding.colors.border}` }}
              >
                <div
                  className="size-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${branding.colors.primary}20` }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: branding.colors.primary }}>storefront</span>
                </div>
                <div>
                  <div className="text-sm font-bold">{branding.company.name} Platform</div>
                  <div className="text-xs" style={{ color: branding.colors.textSecondary }}>{branding.company.domain}</div>
                </div>
              </div>
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: branding.colors.primary }}
              >
                <span className="text-xs font-black uppercase tracking-widest text-white">Primary Button</span>
              </div>
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 px-1">Company Info</h2>
          <div className="space-y-3">
            {[
              { key: 'name' as const, label: 'Agency / Product Name', placeholder: 'MenuFlows' },
              { key: 'tagline' as const, label: 'Tagline', placeholder: 'Digital Restaurant Platform' },
              { key: 'supportEmail' as const, label: 'Support Email', placeholder: 'hello@yourapp.com' },
              { key: 'domain' as const, label: 'Domain', placeholder: 'yourapp.com' },
              { key: 'logoText' as const, label: 'Logo Text (if no image)', placeholder: 'yourapp' },
              { key: 'logoUrl' as const, label: 'Logo Image URL (optional)', placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-1">{label}</label>
                <input
                  type="text"
                  value={branding.company[key]}
                  onChange={(e) => handleCompanyChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 px-1">Brand Colors</h2>
          <div className="space-y-2">
            <ColorSwatch
              label="Primary / Accent"
              value={branding.colors.primary}
              onChange={(v) => handleColorChange('primary', v)}
            />
            <ColorSwatch
              label="App Background"
              value={branding.colors.background}
              onChange={(v) => handleColorChange('background', v)}
            />
            <ColorSwatch
              label="Card Surface"
              value={branding.colors.surface}
              onChange={(v) => handleColorChange('surface', v)}
            />
            <ColorSwatch
              label="Dark Background (panels)"
              value={branding.colors.darkBg}
              onChange={(v) => handleColorChange('darkBg', v)}
            />
            <ColorSwatch
              label="Card Background"
              value={branding.colors.cardBg}
              onChange={(v) => handleColorChange('cardBg', v)}
            />
          </div>
        </section>

        {/* JSON Config */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Raw Config JSON</h2>
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              {showJson ? 'Hide' : 'Show'}
            </button>
          </div>
          {showJson && (
            <div className="relative">
              <pre className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/60 font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(branding, null, 2)}
              </pre>
              <button
                onClick={handleCopyJson}
                className="absolute top-3 right-3 size-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          )}
          <p className="text-[11px] text-white/30 px-1 leading-relaxed">
            Copy this JSON and paste it into <code className="text-primary/80">config/branding.json</code> to make your branding permanent across deployments.
          </p>
        </section>

        {/* Reset */}
        <section>
          <button
            onClick={() => { resetBranding(); setSaved(false); }}
            className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/40 active:scale-95 transition-all"
          >
            Reset to Defaults
          </button>
        </section>
      </main>
    </div>
  );
};

export default AdminBrandingView;
