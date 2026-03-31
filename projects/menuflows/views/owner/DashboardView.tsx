
import React from 'react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
  pendingCount: number;
  readyCount?: number;
  restaurantName?: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onBack, pendingCount, restaurantName = 'Dashboard' }) => {
  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <header className="sticky top-0 z-40 bg-[#170e10]/80 backdrop-blur-xl px-6 py-4 pt-12 flex items-center justify-between border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Manager Portal</span>
          <h1 className="text-xl font-extrabold tracking-tight">{restaurantName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        {/* Value Reinforcement Card */}
        <section className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 flex items-center justify-between shadow-lg">
           <div>
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Weekly Staff Recovery</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">4.2</span>
                <span className="text-sm font-bold text-white/40">hours saved</span>
              </div>
           </div>
           <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
             <span className="material-symbols-outlined">bolt</span>
           </div>
        </section>

        {/* Floating Queue Action - HIGHEST PRIORITY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-xs font-black text-text-secondary/50 uppercase tracking-[0.2em]">Service Queue</h2>
             {pendingCount > 0 && <span className="text-[10px] font-black text-primary animate-pulse uppercase tracking-widest">Incoming Order</span>}
          </div>
          <button 
            onClick={() => onNavigate('owner-pending-orders')}
            className={`w-full rounded-[2rem] p-6 flex items-center gap-5 border shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${
              pendingCount > 0 ? 'bg-primary border-primary/20' : 'bg-[#241619] border-white/5 opacity-80'
            }`}
          >
            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[32px]">sync_alt</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-black tracking-tight text-white">Handshake Queue</h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                {pendingCount} waiting
              </p>
            </div>
            {pendingCount > 0 && (
               <div className="bg-white text-primary size-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                 {pendingCount}
               </div>
            )}
            <span className="material-symbols-outlined text-white/50">chevron_right</span>
          </button>
        </section>

        {/* Operations Grid */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-text-secondary/50 uppercase tracking-[0.2em] px-1">Operations</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('owner-kitchen')}
              className="bg-[#241619] p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl group"
            >
              <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">restaurant</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Kitchen Mode</span>
            </button>
            <button 
              onClick={() => onNavigate('owner-table-map')}
              className="bg-[#241619] p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl group"
            >
              <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">grid_view</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Floor Plan</span>
            </button>
            <button 
              onClick={() => onNavigate('owner-inventory')}
              className="bg-[#241619] p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl group"
            >
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">restaurant_menu</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Inventory</span>
            </button>
            <button 
              onClick={() => onNavigate('owner-branding')}
              className="bg-[#241619] p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl group"
            >
              <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">palette</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Style</span>
            </button>
          </div>
        </section>

        {/* Master QR Card */}
        <section className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] p-8 border border-primary/20 shadow-2xl relative overflow-hidden group text-center">
            <div className="bg-white p-4 rounded-3xl mb-4 inline-block mx-auto">
              <span className="material-symbols-outlined text-[60px] text-black">qr_code_2</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mb-2">Master Menu QR</h2>
            <p className="text-text-secondary text-xs mb-6 max-w-[220px] mx-auto font-medium tracking-tight leading-relaxed">Print one code for all tables. Waiters link orders manually.</p>
            <button
              onClick={() => onNavigate('owner-table-qr-generator')}
              className="w-full bg-white text-primary h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Generate Table QRs
            </button>
        </section>
      </main>

      {/* Staff Floating Command Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] z-50">
        <nav className="bg-[#1c1113]/95 backdrop-blur-2xl border border-white/10 rounded-full h-[72px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center px-2">
          <button className="flex-1 flex flex-col items-center justify-center gap-1 text-primary active:scale-95">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button 
            onClick={() => onNavigate('owner-pending-orders')}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-text-secondary active:scale-95"
          >
            <span className="material-symbols-outlined text-[28px]">sync_alt</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Queue</span>
          </button>
          <button 
            onClick={() => onNavigate('owner-kitchen')}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-text-secondary active:scale-95"
          >
            <span className="material-symbols-outlined text-[28px]">restaurant</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default DashboardView;
