import React, { useState, useEffect } from 'react';
import { adminApi, PlatformStats, RestaurantWithStats } from '../../api.admin';
import { useBranding } from '../../contexts';
import CreateRestaurantModal from './CreateRestaurantModal';
import AdminMenuModal from './AdminMenuModal';

interface AdminDashboardViewProps {
  onLogout: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onLogout }) => {
  const branding = useBranding();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuModalRestaurant, setMenuModalRestaurant] = useState<RestaurantWithStats | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [statsData, restaurantsData] = await Promise.all([
      adminApi.getStats(),
      adminApi.getAllRestaurants(),
    ]);
    setStats(statsData);
    setRestaurants(restaurantsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadData();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      trial: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return statusColors[status] || statusColors.active;
  };

  return (
    <div className="flex flex-col h-full bg-wine-dark text-white animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-wine-dark/80 backdrop-blur-xl px-6 py-4 pt-12 flex items-center justify-between border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Platform Admin</span>
          <h1 className="text-xl font-extrabold tracking-tight">{branding.company.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        {/* Stats Cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-text-secondary/50 uppercase tracking-[0.2em] px-1">Platform Overview</h2>
          <div className="grid grid-cols-3 gap-3 lg:gap-6">
            <div className="bg-wine-card p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-3xl font-black text-white mb-1">
                {loading ? '-' : stats?.totalRestaurants || 0}
              </div>
              <div className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider">
                Restaurants
              </div>
            </div>
            <div className="bg-wine-card p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-3xl font-black text-emerald-500 mb-1">
                {loading ? '-' : stats?.activeRestaurants || 0}
              </div>
              <div className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider">
                Active
              </div>
            </div>
            <div className="bg-wine-card p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-3xl font-black text-amber-500 mb-1">
                {loading ? '-' : stats?.totalOrdersToday || 0}
              </div>
              <div className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider">
                Orders Today
              </div>
            </div>
          </div>
        </section>

        {/* Add Restaurant Button */}
        <section>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all group"
          >
            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">add_business</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-base font-black tracking-tight text-white">Add New Restaurant</h3>
              <p className="text-[11px] font-medium text-text-secondary/60">
                Create a new restaurant tenant
              </p>
            </div>
            <span className="material-symbols-outlined text-primary/50">chevron_right</span>
          </button>
        </section>

        {/* Restaurant List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-text-secondary/50 uppercase tracking-[0.2em]">All Restaurants</h2>
            <span className="text-[10px] font-bold text-text-secondary/40">{restaurants.length} total</span>
          </div>

          {loading ? (
            <div className="bg-wine-card rounded-2xl border border-white/5 p-8 text-center">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
              <p className="text-text-secondary/60 text-sm mt-4">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="bg-wine-card rounded-2xl border border-white/5 p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-text-secondary/30">storefront</span>
              <p className="text-text-secondary/60 text-sm mt-4">No restaurants yet</p>
              <p className="text-text-secondary/40 text-xs mt-1">Create your first restaurant to get started</p>
            </div>
          ) : (
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-wine-card rounded-2xl border border-white/5 p-4 flex items-center gap-4"
                >
                  {/* Color indicator / Avatar */}
                  <div
                    className="size-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: restaurant.accent_color || '#c21e3a' }}
                  >
                    {restaurant.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{restaurant.name}</h3>
                    <p className="text-[11px] font-medium text-text-secondary/50 truncate">
                      /{restaurant.slug}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(restaurant.subscription_status)}`}>
                    {restaurant.subscription_status}
                  </div>

                  {/* Manage Menu Button */}
                  <button
                    onClick={() => setMenuModalRestaurant(restaurant)}
                    className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary/50 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all"
                    title="Manage Menu"
                  >
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                  </button>

                  {/* View Button */}
                  <a
                    href={`/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary/50 hover:text-white hover:bg-white/10 transition-all"
                    title="View Restaurant"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <CreateRestaurantModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Menu Management Modal */}
      {menuModalRestaurant && (
        <AdminMenuModal
          restaurant={menuModalRestaurant}
          onClose={() => setMenuModalRestaurant(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardView;
