
import React from 'react';
import { TableOrder } from '../types';

interface WaiterHandshakeViewProps {
  order: TableOrder;
  onBack: () => void;
}

const WaiterHandshakeView: React.FC<WaiterHandshakeViewProps> = ({ order, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white animate-fade-in overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(circle_at_50%_0%,rgba(194,30,58,0.15),transparent)] pointer-events-none z-0"></div>
      
      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Digital Handshake</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 text-center">
        {order.status === 'confirmed' ? (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="size-32 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
               <span className="material-symbols-outlined text-[64px]">check_circle</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-[0.9]">Fire the Grill!</h2>
            <p className="text-text-secondary text-sm max-w-[240px] leading-relaxed font-medium mb-12">
              Your order is verified. The kitchen is preparing your selection right now.
            </p>
            <button onClick={onBack} className="px-12 h-14 bg-white text-[#170e10] rounded-full font-black text-sm active:scale-95 transition-all shadow-xl">
              Back to Menu
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-14 text-center">
              <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight">Handshake Code</h2>
              <p className="text-text-secondary text-sm max-w-[260px] mx-auto leading-relaxed font-medium opacity-70">
                Show this unique code to your server to verify your items and start preparation.
              </p>
            </div>

            <div className="relative">
              {/* Outer Pulse */}
              <div className="absolute -inset-12 bg-primary/10 blur-[80px] rounded-full animate-pulse"></div>
              
              <div className="bg-gradient-to-br from-[#2a1a1d] to-[#170e10] p-10 px-14 rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative z-10 flex flex-col items-center border-b-primary/30">
                <div className="flex items-center gap-1.5 mb-4 opacity-40">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Table Secure</span>
                </div>
                
                <div className="text-7xl font-black tracking-[0.1em] text-primary">
                  {order.id}
                </div>
                
                <div className="mt-6 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                   <div className="size-2 rounded-full bg-primary animate-ping"></div>
                   <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Searching for Server</span>
                </div>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-4 w-full max-w-[320px]">
               <div className="flex flex-col items-start gap-3 p-5 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-black text-white tracking-tight">
                      {order.tableNumber ? `Table ${order.tableNumber.padStart(2, '0')}` : 'Pending'}
                    </p>
                  </div>
               </div>
               <div className="flex flex-col items-start gap-3 p-5 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
                  <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest mb-0.5">Items</p>
                    <p className="text-sm font-black text-white tracking-tight">{order.items.length} Choice</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      <div className="p-8 text-center relative z-10">
        <p className="text-[9px] font-black text-text-secondary/20 uppercase tracking-[0.4em]">Proprietary Handshake Protocol v2</p>
      </div>
    </div>
  );
};

export default WaiterHandshakeView;
