import React, { useState } from 'react';
import { useBranding } from '../../contexts';

interface AdminLoginViewProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLogin, onBack }) => {
  const branding = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const success = await onLogin(email, password);

    if (!success) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11090a] text-white animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

      <header className="px-6 pt-12 flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/60">Platform Admin</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex size-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Admin Portal</h1>
          <p className="text-text-secondary text-xs font-medium opacity-60">Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@menuflows.app"
              className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Signing in...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </>
            )}
          </button>
        </form>
      </main>

      <footer className="p-10 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">{branding.company.name} Platform</p>
      </footer>
    </div>
  );
};

export default AdminLoginView;
