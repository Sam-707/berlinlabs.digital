
import React, { useState, useEffect } from 'react';
import { TableOrder, OwnerNotification } from '../../types';
import OwnerStatusNotifications from '../../components/OwnerStatusNotifications';

interface TableMapViewProps {
  orders: TableOrder[];
  onClearTable: (tableNumber: string) => void;
  onBack: () => void;
  notifications: OwnerNotification[];
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

const TableMapView: React.FC<TableMapViewProps> = ({ orders, onClearTable, onBack, notifications, onDismissNotification, onClearAllNotifications }) => {
  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000); // Update every 10s for elapsed time
    return () => clearInterval(timer);
  }, []);

  const getTableStatus = (tableNum: string) => {
    const tableOrders = orders.filter(o => o.tableNumber === tableNum);
    if (tableOrders.length === 0) return 'available';
    
    // If any order is cooking or confirmed, it's active. 
    // If all are served, it's 'waiting for bill/clearance'
    if (tableOrders.some(o => o.status === 'confirmed' || o.status === 'cooking')) return 'active';
    return 'served';
  };

  const getTableTime = (tableNum: string) => {
    const tableOrders = orders.filter(o => o.tableNumber === tableNum);
    if (tableOrders.length === 0) return null;
    const oldestTimestamp = Math.min(...tableOrders.map(o => o.timestamp));
    const elapsedMinutes = Math.floor((now - oldestTimestamp) / 60000);
    return elapsedMinutes;
  };

  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white animate-fade-in overflow-hidden relative">
      <OwnerStatusNotifications
        notifications={notifications}
        onDismiss={onDismissNotification}
        onClearAll={onClearAllNotifications}
      />
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-[#170e10]/90 backdrop-blur-xl z-20">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Floor Management</span>
          <h1 className="text-sm font-black tracking-tight">Live Table Map</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        {/* Status Legend */}
        <div className="flex gap-4 mb-8 justify-center">
           <div className="flex items-center gap-1.5">
             <div className="size-2 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
             <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Available</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(194,30,58,0.5)]"></div>
             <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Eating</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="size-2 rounded-full bg-amber-500"></div>
             <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Served</span>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pb-20">
          {tables.map(num => {
            const status = getTableStatus(num);
            const minutes = getTableTime(num);
            const isActive = status !== 'available';

            return (
              <button
                key={num}
                onClick={() => isActive && onClearTable(num)}
                className={`aspect-[4/5] rounded-[2rem] border transition-all relative flex flex-col items-center justify-center gap-2 shadow-xl ${
                  status === 'available' 
                    ? 'bg-[#241619]/50 border-white/5 opacity-40' 
                    : status === 'active'
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                {/* Visual Occupancy Indicator */}
                <div className={`absolute top-4 right-4 size-2 rounded-full ${
                  status === 'available' ? 'bg-transparent' : status === 'active' ? 'bg-primary animate-pulse' : 'bg-amber-500'
                }`}></div>

                <span className={`text-2xl font-black tracking-tighter ${isActive ? 'text-white' : 'text-text-secondary/40'}`}>
                  {num}
                </span>
                
                {isActive && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-black text-white/50">{minutes}m</span>
                    {status === 'served' && (
                       <span className="text-[7px] font-black uppercase tracking-widest text-amber-500 mt-1">Tap to Clear</span>
                    )}
                  </div>
                )}
                
                {!isActive && (
                  <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary/20">Empty</span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="p-8 text-center bg-gradient-to-t from-[#170e10] to-transparent pointer-events-none">
        <p className="text-[9px] font-black text-text-secondary/20 uppercase tracking-[0.4em]">Grid Engine v2.4</p>
      </footer>
    </div>
  );
};

export default TableMapView;
