
import React, { useState, useEffect } from 'react';
import { TableOrder, MenuItem } from '../../types';

interface KitchenViewProps {
  orders: TableOrder[];
  menu: MenuItem[];
  onUpdateStatus: (orderId: string, status: TableOrder['status']) => void;
  onBack: () => void;
}

const KitchenTicket: React.FC<{ 
  order: TableOrder; 
  menu: MenuItem[]; 
  onUpdateStatus: (id: string, s: TableOrder['status']) => void 
}> = ({ order, menu, onUpdateStatus }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.timestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.timestamp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLate = elapsed > 600; // 10 minutes

  return (
    <div 
      onClick={() => {
        if (order.status === 'confirmed') onUpdateStatus(order.id, 'cooking');
        else if (order.status === 'cooking') onUpdateStatus(order.id, 'served');
      }}
      className={`bg-white rounded-xl border-l-[12px] flex flex-col p-4 shadow-xl transition-all active:scale-95 cursor-pointer animate-slide-up ${
        order.status === 'confirmed' ? 'border-primary' : 'border-emerald-500'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Table</span>
          <span className="text-4xl font-black text-black leading-none">{order.tableNumber}</span>
        </div>
        <div className={`flex flex-col items-end px-3 py-1 rounded-lg ${isLate ? 'bg-primary text-white animate-pulse' : 'bg-black/5 text-black'}`}>
          <span className="text-[8px] font-black uppercase tracking-widest">Elapsed</span>
          <span className="text-sm font-black font-mono">{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-4">
        {order.items.map(cartItem => {
          const item = menu.find(m => m.id === cartItem.menuItemId);
          return (
            <div key={cartItem.id} className="flex gap-3 items-start">
              <span className="font-mono font-black text-lg text-primary">{cartItem.quantity}x</span>
              <div className="flex flex-col">
                <span className="font-bold text-black text-sm uppercase leading-tight">{item?.name}</span>
                {cartItem.notes && <span className="text-[10px] text-primary font-black italic">"{cartItem.notes}"</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-dashed border-black/10 flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-black/30">#{order.id}</span>
        <div className="flex items-center gap-2">
          {order.status === 'confirmed' ? (
            <>
              <span className="material-symbols-outlined text-primary text-[20px]">local_fire_department</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Order</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-emerald-500 text-[20px]">restaurant</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cooking...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const KitchenView: React.FC<KitchenViewProps> = ({ orders, menu, onUpdateStatus, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#111111] text-white animate-fade-in overflow-hidden">
      <header className="px-6 pt-12 pb-6 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Kitchen Mode</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">Live Feed Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block">Active Tickets</span>
              <span className="text-xl font-black">{orders.length}</span>
           </div>
           <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary">notifications_active</span>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6 flex gap-6 no-scrollbar items-start">
        {orders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
            <span className="material-symbols-outlined text-[120px] mb-4">check_circle</span>
            <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Kitchen Clear</h2>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="w-[280px] lg:w-[320px] shrink-0">
               <KitchenTicket order={order} menu={menu} onUpdateStatus={onUpdateStatus} />
            </div>
          ))
        )}
      </main>

      <footer className="p-6 bg-[#1a1a1a] border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary"></div>
              <span className="text-[10px] font-black uppercase text-white/40">New</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase text-white/40">Cooking</span>
           </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">BDS OS v4.0</span>
      </footer>
    </div>
  );
};

export default KitchenView;
