
import React, { useState, useMemo } from 'react';
import { TableOrder } from '../../types';

interface DailySummaryViewProps {
  orders: TableOrder[];
  currency?: string;
  onMarkAsPaid: (orderId: string) => Promise<void>;
  onBack: () => void;
}

type FilterType = 'all' | 'paid' | 'unpaid';

const DailySummaryView: React.FC<DailySummaryViewProps> = ({ orders, currency = 'AED', onMarkAsPaid, onBack }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Filter orders for today and by payment status
  const todayOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= startOfDay;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    switch (filter) {
      case 'paid':
        return todayOrders.filter(o => o.isPaid);
      case 'unpaid':
        return todayOrders.filter(o => !o.isPaid);
      default:
        return todayOrders;
    }
  }, [todayOrders, filter]);

  // Calculate totals
  const stats = useMemo(() => {
    const totalOrders = todayOrders.length;
    const paidOrders = todayOrders.filter(o => o.isPaid).length;
    const unpaidOrders = totalOrders - paidOrders;

    // Calculate revenue from paid orders
    const revenue = todayOrders
      .filter(o => o.isPaid)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate pending revenue from unpaid orders
    const pendingRevenue = todayOrders
      .filter(o => !o.isPaid)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      totalOrders,
      paidOrders,
      unpaidOrders,
      revenue,
      pendingRevenue,
    };
  }, [todayOrders]);

  const handleMarkAsPaid = async (orderId: string) => {
    setMarkingPaid(orderId);
    try {
      await onMarkAsPaid(orderId);
    } finally {
      setMarkingPaid(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background-dark text-white animate-fade-in overflow-hidden">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-background-dark/90 backdrop-blur-xl z-20">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Analytics</span>
          <h1 className="text-sm font-black tracking-tight">Daily Sales</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Summary Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-2xl p-5 border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary/60 block mb-1">Today's Orders</span>
            <span className="text-3xl font-black text-white">{stats.totalOrders}</span>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-emerald-500">{stats.paidOrders} paid</span>
              </div>
              {stats.unpaidOrders > 0 && (
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-amber-500">{stats.unpaidOrders} unpaid</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-5 border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary/60 block mb-1">Revenue</span>
            <span className="text-3xl font-black text-white">{formatCurrency(stats.revenue)}</span>
            {stats.pendingRevenue > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-amber-500">
                  +{formatCurrency(stats.pendingRevenue)} pending
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="flex gap-2 bg-surface-dark p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-lg'
                : 'text-text-secondary/60 hover:text-white'
            }`}
          >
            All ({stats.totalOrders})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              filter === 'unpaid'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-text-secondary/60 hover:text-white'
            }`}
          >
            Unpaid ({stats.unpaidOrders})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              filter === 'paid'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-text-secondary/60 hover:text-white'
            }`}
          >
            Paid ({stats.paidOrders})
          </button>
        </section>

        {/* Order List */}
        <section className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
              <span className="material-symbols-outlined text-[48px] mb-3">receipt_long</span>
              <p className="text-sm font-black uppercase tracking-widest">
                {filter === 'unpaid' ? 'No unpaid orders' : filter === 'paid' ? 'No paid orders yet' : 'No orders today'}
              </p>
              <p className="text-[10px] mt-2 font-medium">Orders will appear here once customers place them.</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
              const isMarkingPaid = markingPaid === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-surface-dark rounded-2xl p-5 border border-white/5 shadow-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 px-3 py-1.5 rounded-lg">
                        <span className="text-lg font-black tracking-wider">{order.id}</span>
                      </div>
                      {order.tableNumber && (
                        <div className="bg-primary/20 px-2 py-1 rounded text-primary">
                          <span className="text-[10px] font-bold uppercase">Table {order.tableNumber}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-text-secondary/40">{formatTime(order.timestamp)}</span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      order.isPaid
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-text-secondary/60">
                        <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
                        <span className="text-[11px] font-bold uppercase">{itemCount} items</span>
                      </div>
                      {order.total !== undefined && (
                        <div className="flex items-center gap-2 text-text-secondary/60">
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                          <span className="text-[11px] font-bold uppercase">{formatCurrency(order.total)}</span>
                        </div>
                      )}
                    </div>

                    {!order.isPaid && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id)}
                        disabled={isMarkingPaid}
                        className="bg-primary hover:bg-primary/80 active:scale-95 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isMarkingPaid ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                            Marking...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Mark Paid
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <footer className="p-6 text-center text-text-secondary/10 text-[9px] font-black uppercase tracking-[0.4em]">
        Daily Sales Report
      </footer>
    </div>
  );
};

export default DailySummaryView;
