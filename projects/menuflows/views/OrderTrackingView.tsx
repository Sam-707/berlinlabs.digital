import React, { useEffect, useState } from 'react';
import { TableOrder } from '../types';

interface OrderTrackingViewProps {
  order: TableOrder;
  allOrders: TableOrder[];
  onBack: () => void;
}

const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ order, allOrders, onBack }) => {
  const [currentOrder, setCurrentOrder] = useState<TableOrder>(order);
  const [previousStatus, setPreviousStatus] = useState<TableOrder['status'] | null>(null);

  // Update order when allOrders changes (real-time sync)
  useEffect(() => {
    const updatedOrder = allOrders.find(o => o.id === order.id);
    if (updatedOrder) {
      // Check if status changed for toast notification
      if (updatedOrder.status !== currentOrder.status) {
        setPreviousStatus(currentOrder.status);
      }
      setCurrentOrder(updatedOrder);
    }
  }, [allOrders, order.id]);

  // Show toast notification when status changes (handled by parent via toast context)
  // This effect just tracks the status change for any additional UI logic
  useEffect(() => {
    if (previousStatus && previousStatus !== currentOrder.status) {
      // Status changed - parent will handle toast notification
    }
  }, [currentOrder.status, previousStatus, order.id]);

  const getStatusConfig = (status: TableOrder['status']) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-amber-500',
          icon: 'schedule',
          label: 'Waiting for Confirmation',
          description: 'Your order is waiting to be confirmed by the staff.',
        };
      case 'confirmed':
        return {
          color: 'bg-blue-500',
          icon: 'check_circle',
          label: 'Order Confirmed',
          description: 'Your order has been confirmed and will be prepared soon.',
        };
      case 'cooking':
        return {
          color: 'bg-emerald-500',
          icon: 'restaurant',
          label: 'Being Prepared',
          description: 'The kitchen is preparing your delicious meal!',
        };
      case 'served':
        return {
          color: 'bg-emerald-600',
          icon: 'celebration',
          label: 'Ready to Enjoy!',
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

  const currentStepIndex = getStatusStepIndex(currentOrder.status);
  const statusConfig = getStatusConfig(currentOrder.status);

  // Calculate total items
  const totalItems = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-background-dark text-white animate-fade-in overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent)' }}></div>

      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Order Status</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col p-6 relative z-10 overflow-y-auto">
        {/* Status Badge */}
        <div className={`size-24 rounded-full ${statusConfig.color}/20 border border-${statusConfig.color.split('-')[1]}-500/30 flex items-center justify-center ${statusConfig.color.replace('bg-', 'text-')} mb-6 mx-auto shadow-[0_0_50px_rgba(0,0,0,0.3)]`}>
          <span className={`material-symbols-outlined text-[48px] ${currentOrder.status === 'served' ? 'animate-bounce' : 'animate-pulse'}`}>
            {statusConfig.icon}
          </span>
        </div>

        <h2 className="text-3xl font-black tracking-tighter mb-2 text-center">
          {statusConfig.label}
        </h2>
        <p className="text-text-secondary text-sm text-center mb-8 max-w-[300px] mx-auto">
          {statusConfig.description}
        </p>

        {/* Status Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                        ${isCurrent ? `${statusConfig.color} border-${statusConfig.color.split('-')[1]}-500 text-white animate-pulse` : ''}
                        ${isPending ? 'bg-white/5 border-white/10 text-text-secondary/40' : ''}
                      `}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isCompleted ? 'check' : step.icon}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase mt-2 ${isCurrent ? 'text-white' : 'text-text-secondary/40'}`}>
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

        {/* Order Summary Card */}
        <div className="bg-white/5 border border-white/5 backdrop-blur-sm rounded-[2rem] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary/60">Order Details</h3>
            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-[10px] font-black text-primary uppercase tracking-wider">{currentOrder.id}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Table</p>
                  <p className="text-sm font-black text-white">
                    {currentOrder.tableNumber ? `Table ${currentOrder.tableNumber.padStart(2, '0')}` : 'Assigning...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Items</p>
                  <p className="text-sm font-black text-white">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Estimated Wait</p>
                  <p className="text-sm font-black text-white">
                    {currentOrder.status === 'pending' && '15-20 min'}
                    {currentOrder.status === 'confirmed' && '12-18 min'}
                    {currentOrder.status === 'cooking' && '5-10 min'}
                    {currentOrder.status === 'served' && 'Ready!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-400 text-[20px]">info</span>
          <p className="text-xs text-text-secondary/80">
            Show this order code to your waiter if you have any questions: <span className="text-blue-400 font-black">{currentOrder.id}</span>
          </p>
        </div>
      </main>

      <div className="p-6 text-center relative z-10">
        <p className="text-[9px] font-black text-text-secondary/20 uppercase tracking-[0.4em]">Real-time Order Tracking</p>
      </div>
    </div>
  );
};

export default OrderTrackingView;
