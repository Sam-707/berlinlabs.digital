
import React, { useRef } from 'react';
import { RestaurantConfig } from '../../types';
import { multiTenantApi as api } from '../../api.multitenant';
import { useBranding } from '../../contexts';

interface BrandingViewProps {
  config: RestaurantConfig;
  setConfig: (config: RestaurantConfig) => void;
  onBack: () => void;
}

const BrandingView: React.FC<BrandingViewProps> = ({ config, setConfig, onBack }) => {
  const branding = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await api.uploadImage(file);
      setConfig({ ...config, logo: base64 });
    } catch (error) {
      alert('Failed to upload logo. Please try again.');
      console.error('[BrandingView] Failed to upload logo:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a0f11] text-white animate-fade-in overflow-hidden">
      <header className="sticky top-0 z-50 bg-[#1a0f11]/80 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-primary font-medium">
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            <span className="text-lg">Settings</span>
          </button>
          <h1 className="text-lg font-bold">Branding</h1>
          <button onClick={onBack} className="text-primary font-bold text-lg">Save</button>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-8 overflow-y-auto no-scrollbar">
        <section className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="size-28 rounded-full border-4 border-[#2d1b1f] overflow-hidden shadow-2xl bg-[#2d1b1f] flex items-center justify-center">
              <img src={config.logo} alt="Restaurant logo" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary size-9 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1a0f11] active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg">Restaurant Identity</h2>
            <p className="text-slate-400 text-sm">Upload your circular logo preview</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-[#2d1b1f] rounded-[1.25rem] p-5 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Restaurant Name</label>
              <input 
                className="w-full bg-[#3d272b] border-none rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary transition-all" 
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Google Review URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">link</span>
                <input 
                  className="w-full bg-[#3d272b] border-none rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-primary transition-all" 
                  value={config.reviewUrl}
                  onChange={(e) => setConfig({ ...config, reviewUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#2d1b1f] rounded-[1.25rem] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Brand Accent Color</h3>
                <p className="text-slate-400 text-xs">Used for buttons and primary accents</p>
              </div>
              <div 
                className="size-10 rounded-full border-2 border-white/20 shadow-inner"
                style={{ backgroundColor: config.accentColor }}
              ></div>
            </div>
            <div className="flex items-center justify-between gap-3">
              {['#e6193c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                <button 
                  key={color}
                  onClick={() => setConfig({ ...config, accentColor: color })}
                  className={`size-8 rounded-full transition-all ${config.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2d1b1f]' : ''}`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
              <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-900 text-[18px]">add</span>
              </button>
            </div>
          </div>
        </section>

        <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-start gap-3 border border-white/5">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Changes made here will be instantly reflected across your digital menu and customer-facing touchpoints.
          </p>
        </div>
      </main>

      <footer className="p-6 bg-gradient-to-t from-[#1a0f11] to-transparent">
        <button 
          onClick={onBack}
          className="w-full bg-primary py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          Save All Changes
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Powered by</span>
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span className="text-xs font-bold tracking-tight">{branding.company.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrandingView;
