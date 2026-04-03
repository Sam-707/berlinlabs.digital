
import React from 'react';
import { TableOrder, MenuItem } from '../../types';

interface PendingOrdersViewProps {
  orders: TableOrder[];
  menu: MenuItem[];
  onSelectOrder: (order: TableOrder) => void;
  onBack: () => void;
}

const PendingOrdersView: React.FC<PendingOrdersViewProps> = ({ orders, menu, onSelectOrder, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-white animate-fade-in overflow-hidden relative">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur-xl z-20">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Floating Queue</span>
          <h1 className="text-sm font-black tracking-tight">Pending Handshakes</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30">
            <span className="material-symbols-outlined text-[64px] mb-4">hourglass_empty</span>
            <p className="text-sm font-black uppercase tracking-widest">No pending codes</p>
            <p className="text-[10px] mt-2 font-medium">Wait for customers to generate a handshake.</p>
          </div>
        ) : (
          orders.map(order => {
            const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
            return (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="w-full bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 flex items-center justify-between shadow-xl active:scale-95 transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Incoming Code</span>
                  <span className="text-4xl font-black tracking-[0.1em] text-white group-active:text-primary transition-colors">{order.id}</span>
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 mb-2">
                     <span className="material-symbols-outlined text-[14px] text-amber-500">shopping_basket</span>
                     <span className="text-[11px] font-black uppercase tracking-widest">{itemCount} items</span>
                   </div>
                   <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Tap to Assign Table</span>
                </div>
              </button>
            );
          })
        )}
      </main>

      <footer className="p-8 text-center text-text-secondary/10 text-[9px] font-black uppercase tracking-[0.4em]">
        Handshake Protocol v3.1
      </footer>
    </div>
  );
};

export default PendingOrdersView;
