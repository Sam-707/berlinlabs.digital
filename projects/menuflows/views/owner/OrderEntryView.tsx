
import React, { useState } from 'react';
import { TableOrder, MenuItem } from '../../types';

interface OrderEntryViewProps {
  tableNumber: string;
  onConfirm: (orderId: string) => boolean;
  onBack: () => void;
  activeOrder: TableOrder;
  menu: MenuItem[];
}

const OrderEntryView: React.FC<OrderEntryViewProps> = ({ tableNumber, onConfirm, onBack, activeOrder, menu }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(activeOrder.id);
      setIsProcessing(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark text-white animate-fade-in overflow-hidden relative">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-background-dark/90 backdrop-blur-xl z-30">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Verification</span>
          <h1 className="text-lg font-black tracking-tight text-white">Match Confirmed</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col p-6 pt-10 overflow-hidden">
        {/* Match Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden mb-8 text-center animate-slide-up">
           <div className="flex items-center justify-center gap-6 mb-6">
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Code</span>
                <span className="text-3xl font-black text-white">{activeOrder.id}</span>
             </div>
             <span className="material-symbols-outlined text-text-secondary/50 text-[32px]">sync_alt</span>
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Table</span>
                <span className="text-3xl font-black text-white">{tableNumber}</span>
             </div>
           </div>
           <p className="text-[11px] text-text-secondary/60 font-medium leading-relaxed max-w-[200px] mx-auto">
             Match confirmed with customer device. Ready to fire to kitchen.
           </p>
        </div>

        {/* Order Details Preview */}
        <div className="flex-1 flex flex-col bg-surface-dark rounded-[2.5rem] p-6 border border-white/10 shadow-3xl overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-black tracking-tight">Order Details</h2>
            <div className="bg-white/10 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
              {activeOrder.items.reduce((a, b) => a + b.quantity, 0)} Items
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-6 pr-1">
            {activeOrder.items.map(cartItem => {
              const item = menu.find(m => m.id === cartItem.menuItemId);
              return (
                <div key={cartItem.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <div className="flex gap-4 items-center">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-white font-black text-xs">
                      {cartItem.quantity}
                    </span>
                    <span className="font-bold text-sm text-white/90">{item?.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-price tracking-wider">
                    €{((item?.price || 0) * cartItem.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleFinalConfirm}
            disabled={isProcessing}
            className="w-full h-16 rounded-full bg-emerald-500 text-white font-black text-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined">restaurant</span>
                <span>Confirm & Fire</span>
              </>
            )}
          </button>
        </div>
      </main>

      <footer className="p-8 text-center text-text-secondary/10 text-[9px] font-black uppercase tracking-[0.4em]">
        Verified Handshake Node 8
      </footer>
    </div>
  );
};

export default OrderEntryView;
