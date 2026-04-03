
import React, { useEffect, useState } from 'react';
import { TableOrder } from '../types';

interface WaiterHandshakeViewProps {
  order: TableOrder;
  onBack: () => void;
  onTrackOrder?: () => void;
}

const WaiterHandshakeView: React.FC<WaiterHandshakeViewProps> = ({ order, onBack, onTrackOrder }) => {
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Update lastUpdated timestamp when order status changes
  useEffect(() => {
    setLastUpdated(Date.now());
  }, [order.status]);

  // Format "last updated" time ago
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getStatusConfig = (status: TableOrder['status']) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-amber-500',
          borderColor: 'border-amber-500',
          icon: 'schedule',
          label: 'Waiting for staff to confirm',
          description: 'Your order is waiting to be confirmed by the staff.',
        };
      case 'confirmed':
        return {
          color: 'bg-blue-500',
          borderColor: 'border-blue-500',
          icon: 'check_circle',
          label: 'Confirmed — kitchen starting',
          description: 'Your order has been confirmed and will be prepared soon.',
        };
      case 'cooking':
        return {
          color: 'bg-emerald-500',
          borderColor: 'border-emerald-500',
          icon: 'restaurant',
          label: 'Being prepared',
          description: 'The kitchen is preparing your delicious meal!',
        };
      case 'served':
        return {
          color: 'bg-emerald-600',
          borderColor: 'border-emerald-600',
          icon: 'celebration',
          label: 'Served — enjoy',
          description: 'Your order has been served. Bon appétit!',
        };
    }
  };

  const getStatusStepIndex = (status: TableOrder['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'cooking': return 2;
      case 'served': return 3;
    }
  };

  const steps = [
    { key: 'pending', icon: 'schedule', label: 'Pending' },
    { key: 'confirmed', icon: 'check_circle', label: 'Confirmed' },
    { key: 'cooking', icon: 'restaurant', label: 'Cooking' },
    { key: 'served', icon: 'celebration', label: 'Served' },
  ];

  const currentStepIndex = getStatusStepIndex(order.status);
  const statusConfig = getStatusConfig(order.status);
  return (
    <div className="flex flex-col h-full bg-wine-dark text-white animate-fade-in overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent)' }}></div>
      
      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Digital Handshake</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 text-center">
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
              
              <div className="bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] p-10 px-14 rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative z-10 flex flex-col items-center border-b-primary/30">
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

            {/* Status Section */}
            <div className="mt-14 w-full max-w-[340px]">
              {/* Status Badge */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`size-12 rounded-full ${statusConfig.color}/20 border ${statusConfig.borderColor}/30 flex items-center justify-center ${statusConfig.color.replace('bg-', 'text-')}`}>
                  <span className={`material-symbols-outlined text-[24px] ${order.status === 'served' ? 'animate-bounce' : 'animate-pulse'}`}>
                    {statusConfig.icon}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">{statusConfig.label}</h3>
                  <p className="text-[10px] text-text-secondary/60">Updated {getTimeAgo(lastUpdated)}</p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                          <div
                            className={`
                              size-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                              ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                              ${isCurrent ? `${statusConfig.color} ${statusConfig.borderColor} text-white animate-pulse` : ''}
                              ${isPending ? 'bg-white/5 border-white/10 text-text-secondary/40' : ''}
                            `}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isCompleted ? 'check' : step.icon}
                            </span>
                          </div>
                          <span className={`text-[8px] font-black uppercase mt-1.5 ${isCurrent ? 'text-white' : 'text-text-secondary/40'}`}>
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-4 w-full max-w-[320px]">
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
      </main>

      <div className="p-8 text-center relative z-10">
        <p className="text-[9px] font-black text-text-secondary/20 uppercase tracking-[0.4em]">Proprietary Handshake Protocol v2</p>
      </div>
    </div>
  );
};

export default WaiterHandshakeView;
