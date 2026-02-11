import React, { useState, useEffect } from 'react';
import { TableOrder, MenuItem } from '../types';

interface WaiterReadyOrdersViewProps {
  orders: TableOrder[];
  menu: MenuItem[];
  onUpdateStatus: (orderId: string, status: TableOrder['status']) => void;
  onBack: () => void;
}

/**
 * Waiter Ready Orders View
 * Shows all orders in 'ready' status (kitchen finished, needs to be delivered)
 * Waiters can mark orders as 'served' when delivered to the table
 */
const WaiterReadyOrdersView: React.FC<WaiterReadyOrdersViewProps> = ({
  orders,
  menu,
  onUpdateStatus,
  onBack,
}) => {
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);

  const handleMarkDelivered = async (orderId: string) => {
    setDeliveringOrderId(orderId);
    try {
      await onUpdateStatus(orderId, 'served');
    } finally {
      setDeliveringOrderId(null);
    }
  };

  // Format time since marked ready
  const formatWaitingTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} min ago`;
  };

  // Check if order is waiting too long (> 5 minutes)
  const isLongWait = (timestamp: number): boolean => {
    const minutes = Math.floor((Date.now() - timestamp) / 1000 / 60);
    return minutes > 5;
  };

  return (
    <div className="flex flex-col h-full bg-amber-50 text-gray-900 animate-fade-in overflow-hidden">
      <header className="px-6 pt-12 pb-6 bg-amber-500 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="size-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-white">chevron_left</span>
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Ready to Serve</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} waiting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] block">Ready Queue</span>
              <span className="text-2xl font-black text-white">{orders.length}</span>
            </div>
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">room_service</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-[80px] mb-4 text-amber-500">check_circle</span>
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-gray-700">All Caught Up</h2>
            <p className="text-sm text-gray-600 mt-2">No orders ready to serve</p>
          </div>
        ) : (
          orders.map((order) => (
            <ReadyOrderCard
              key={order.id}
              order={order}
              menu={menu}
              onMarkDelivered={() => handleMarkDelivered(order.id)}
              isDelivering={deliveringOrderId === order.id}
              formatWaitingTime={formatWaitingTime}
              isLongWait={isLongWait}
            />
          ))
        )}
      </main>

      <footer className="p-4 bg-white border-t border-amber-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-amber-500"></div>
            <span className="font-bold uppercase">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-amber-600"></div>
            <span className="font-bold uppercase">Waiting &gt; 5 min</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Ready Order Card Component
interface ReadyOrderCardProps {
  order: TableOrder;
  menu: MenuItem[];
  onMarkDelivered: () => void;
  isDelivering: boolean;
  formatWaitingTime: (timestamp: number) => string;
  isLongWait: (timestamp: number) => boolean;
}

const ReadyOrderCard: React.FC<ReadyOrderCardProps> = ({
  order,
  menu,
  onMarkDelivered,
  isDelivering,
  formatWaitingTime,
  isLongWait,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.timestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.timestamp]);

  const longWait = isLongWait(order.timestamp);

  return (
    <div
      className={`bg-white rounded-2xl border-2 shadow-lg transition-all ${
        longWait ? 'border-amber-600 animate-pulse' : 'border-amber-500'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-4 py-2 rounded-xl ${longWait ? 'bg-amber-600' : 'bg-amber-500'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-white block">
                  Table
                </span>
                <span className="text-3xl font-black text-white leading-none">
                  {order.tableNumber || '--'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Code</p>
                <p className="text-lg font-black text-gray-900">{order.id}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
              longWait ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-600'
            }`}>
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span className="text-[10px] font-black uppercase">{formatWaitingTime(order.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4 space-y-2">
          {order.items.map((cartItem) => {
            const item = menu.find((m) => m.id === cartItem.menuItemId);
            return (
              <div key={cartItem.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <span className="font-mono font-black text-lg text-amber-600">
                  {cartItem.quantity}x
                </span>
                <span className="font-bold text-gray-900 text-sm">{item?.name}</span>
              </div>
            );
          })}
        </div>

        {/* Mark Delivered Button */}
        <button
          onClick={onMarkDelivered}
          disabled={isDelivering}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            isDelivering
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isDelivering ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Marking Delivered...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              Mark as Delivered
            </span>
          )}
        </button>

        {longWait && (
          <div className="mt-3 text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              ⚠️ Order waiting longer than 5 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterReadyOrdersView;
