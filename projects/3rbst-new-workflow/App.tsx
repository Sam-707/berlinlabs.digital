
import React, { useState, useMemo, useEffect } from 'react';
import { AppView, MenuItem, CartItem, RestaurantConfig, TableOrder } from './types';
import { multiTenantApi as api } from './api.multitenant';
import { adminApi } from './api.admin';
import { getRestaurantSlug } from './lib/supabase';

// --- Views ---
import LandingView from './views/LandingView';
import SplashView from './views/SplashView';
import MenuView from './views/MenuView';
import ItemDetailView from './views/ItemDetailView';
import CartView from './views/CartView';
import WaiterHandshakeView from './views/WaiterHandshakeView';
import LoginView from './views/owner/LoginView';
import DashboardView from './views/owner/DashboardView';
import InventoryView from './views/owner/InventoryView';
import BrandingView from './views/owner/BrandingView';
import OrderEntryView from './views/owner/OrderEntryView';
import TableGridView from './views/owner/TableGridView';
import PendingOrdersView from './views/owner/PendingOrdersView';
import KitchenView from './views/owner/KitchenView';
import TableMapView from './views/owner/TableMapView';
import MenuImportView from './views/owner/MenuImportView';
import AdminLoginView from './views/admin/AdminLoginView';
import AdminDashboardView from './views/admin/AdminDashboardView';

const App: React.FC = () => {
  // Multi-tenant state
  const [restaurantLoaded, setRestaurantLoaded] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // We start at 'marketing' for the main domain experience (no restaurant slug)
  // or 'splash' if a restaurant slug is present
  const [view, setView] = useState<AppView>('marketing');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Persistence States
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [allOrders, setAllOrders] = useState<TableOrder[]>([]);
  const [config, setConfig] = useState<RestaurantConfig | null>(null);

  // Flow States
  const [currentMappingOrder, setCurrentMappingOrder] = useState<TableOrder | null>(null);
  const [selectedTableForMapping, setSelectedTableForMapping] = useState<string | null>(null);

  // Initial Data Fetch - Multi-tenant aware
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔄 Initializing MenuFlows app...');
        
        // Check if this is an admin route
        const path = window.location.pathname;
        console.log('📍 Current path:', path);
        
        if (path === '/admin' || path.startsWith('/admin/')) {
          console.log('🔐 Admin route detected');
          setIsAdminRoute(true);
          // Check if admin is already authenticated
          if (adminApi.isAuthenticated()) {
            setView('admin-dashboard');
          } else {
            setView('admin-login');
          }
          setRestaurantLoaded(true);
          return;
        }

        // Step 1: Initialize restaurant from URL slug
        const slug = getRestaurantSlug();
        console.log('🏪 Restaurant slug:', slug);

        if (slug) {
          console.log('🔄 Loading restaurant data for slug:', slug);
          // Try to load the restaurant by slug
          const restaurant = await api.initializeRestaurant(slug);

          if (restaurant) {
            console.log('✅ Restaurant found:', restaurant.name);
            setHasRestaurant(true);
            setView('splash'); // Start at splash for valid restaurant

            // Load restaurant data
            console.log('📊 Loading restaurant data...');
            const [m, c, o] = await Promise.all([api.getMenu(), api.getConfig(), api.getOrders()]);
            console.log('📊 Data loaded - Menu items:', m.length, 'Orders:', o.length);
            setMenu(m);
            setConfig(c);
            setAllOrders(o);
          } else {
            console.log('⚠️ Restaurant not found, checking legacy mode...');
            // Multi-tenant restaurant not found - try legacy single-tenant mode
            const diagnostic = await api.checkConnection();
            console.log('🔍 Connection diagnostic:', diagnostic);

            if (diagnostic.configExists || diagnostic.menuCount > 0) {
              console.log('✅ Legacy data found, using single-tenant mode');
              // Legacy data exists - use single-tenant mode
              setHasRestaurant(true);
              setView('splash');

              // Load legacy data (API methods already handle null restaurantId)
              const [m, c, o] = await Promise.all([api.getMenu(), api.getConfig(), api.getOrders()]);
              setMenu(m);
              setConfig(c);
              setAllOrders(o);
            } else {
              console.log('❌ No restaurant data found, showing marketing page');
              // No restaurant found - show landing page with error context
              setHasRestaurant(false);
              setView('marketing');
            }
          }
        } else {
          console.log('🌐 No slug detected, showing marketing page');
          // No slug - show landing/marketing page
          setHasRestaurant(false);
          setView('marketing');
        }

        setRestaurantLoaded(true);
        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Fallback to marketing page on error
        setHasRestaurant(false);
        setView('marketing');
        setRestaurantLoaded(true);
      }
    };
    init();
  }, []);

  // Real-time Order Sync - only subscribe when restaurant is loaded
  useEffect(() => {
    if (!hasRestaurant) return;

    return api.subscribeToOrders((orders) => {
      setAllOrders(orders);
    });
  }, [hasRestaurant]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), menuItemId: item.id, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.menuItemId !== menuItemId);
    });
  };

  const generateWaiterCode = async () => {
    try {
      await api.createOrder(cart);
      setCart([]);
      setView('waiter-handshake');
    } catch (err) {
      alert('Failed to create order. Please try again.');
    }
  };

  const finalizeHandshake = async (orderId: string, tableNum: string) => {
    await api.updateOrderStatus(orderId, 'confirmed', tableNum);
    return true;
  };

  const updateOrderStatus = async (orderId: string, nextStatus: TableOrder['status']) => {
    await api.updateOrderStatus(orderId, nextStatus);
  };

  const clearTable = async (tableNumber: string) => {
    await api.clearTable(tableNumber);
  };

  const handleUpdateMenu = async (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    await api.updateMenu(newMenu);
  };

  const handleUpdateConfig = async (newConfig: RestaurantConfig) => {
    setConfig(newConfig);
    await api.updateConfig(newConfig);
  };

  const handleLogin = async (pin: string) => {
    const success = await api.login(pin);
    if (success) {
      setView('owner-dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await api.logout();
    setView('splash');
  };

  // Admin auth handlers
  const handleAdminLogin = async (email: string, password: string) => {
    const success = await adminApi.login(email, password);
    if (success) {
      setView('admin-dashboard');
      return true;
    }
    return false;
  };

  const handleAdminLogout = async () => {
    await adminApi.logout();
    setView('admin-login');
  };

  // Auth Guard helper
  const navigateWithOwnerGuard = (targetView: AppView) => {
    if (targetView.startsWith('owner-') && targetView !== 'owner-login' && !api.isAuthenticated()) {
      setView('owner-login');
    } else {
      setView(targetView);
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, cartItem) => {
      const item = menu.find(m => m.id === cartItem.menuItemId);
      return total + (item ? item.price * cartItem.quantity : 0);
    }, 0);
  }, [cart, menu]);

  // Wait for restaurant initialization
  if (!restaurantLoaded) {
    return (
      <div className="min-h-screen bg-[#170e10] flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <div className="text-primary font-black uppercase tracking-widest animate-pulse text-2xl mb-4">
            Initializing MenuFlows...
          </div>
          <div className="text-text-secondary text-sm">
            Loading restaurant data and configuration
          </div>
          <div className="mt-4 text-xs text-text-secondary/50">
            Debug: {window.location.pathname} | {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }

  // For landing page (no restaurant), we don't need config
  // For admin routes, we also don't need restaurant config
  // For restaurant views, wait for config to load
  if (hasRestaurant && !isAdminRoute && !config) {
    return (
      <div className="min-h-screen bg-[#170e10] flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <div className="text-primary font-black uppercase tracking-widest animate-pulse text-2xl mb-4">
            Loading Restaurant...
          </div>
          <div className="text-text-secondary text-sm">
            Fetching menu and configuration
          </div>
          <div className="mt-4 text-xs text-text-secondary/50">
            Debug: Restaurant found, loading config...
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const kitchenOrders = allOrders.filter(o => o.status === 'confirmed' || o.status === 'cooking');

  // Navigate to demo restaurant (changes URL to include slug)
  const navigateToDemo = () => {
    // Use a demo restaurant slug - navigate to it
    const demoSlug = 'demo'; // or 'burgerlab' - configure as needed
    window.location.href = `/${demoSlug}`;
  };

  const renderView = () => {
    switch (view) {
      case 'marketing':
        return <LandingView onDemo={navigateToDemo} />;
      case 'splash':
        // config is guaranteed non-null here by early return guard
        return <SplashView config={config!} onContinue={() => setView('menu')} onEnterOwner={() => navigateWithOwnerGuard('owner-dashboard')} />;
      case 'menu':
        return (
          <MenuView 
            menu={menu} 
            cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
            onItemClick={(item) => { setSelectedMenuItem(item); setView('item-detail'); }}
            onOpenCart={() => setView('cart')}
            onQuickAdd={addToCart}
          />
        );
      case 'item-detail':
        return selectedMenuItem ? (
          <ItemDetailView 
            item={selectedMenuItem} 
            onClose={() => setView('menu')} 
            onAddToCart={(it) => { addToCart(it); setView('menu'); }}
          />
        ) : null;
      case 'cart':
        return (
          <CartView 
            cart={cart} 
            menu={menu} 
            total={cartTotal}
            onClose={() => setView('menu')} 
            onAdd={addToCart} 
            onRemove={removeFromCart}
            onCheckout={generateWaiterCode}
          />
        );
      case 'waiter-handshake':
        const latestPending = pendingOrders[pendingOrders.length - 1];
        const latestConfirmed = allOrders.find(o => o.id === (latestPending?.id || ''));
        const orderToShow = latestConfirmed || latestPending;
        return orderToShow ? <WaiterHandshakeView order={orderToShow} onBack={() => setView('menu')} /> : null;
      
      case 'owner-login':
        // Back goes to splash (restaurant) or marketing (landing page)
        return <LoginView onLogin={handleLogin} onBack={() => setView(hasRestaurant ? 'splash' : 'marketing')} />;

      case 'owner-dashboard':
        return <DashboardView onNavigate={(v) => navigateWithOwnerGuard(v as AppView)} onBack={handleLogout} pendingCount={pendingOrders.length} />;
      
      case 'owner-pending-orders':
        return (
          <PendingOrdersView 
            orders={pendingOrders} 
            menu={menu}
            onSelectOrder={(order) => { setCurrentMappingOrder(order); setView('owner-table-grid'); }} 
            onBack={() => setView('owner-dashboard')} 
          />
        );

      case 'owner-table-grid':
        return (
          <TableGridView 
            onSelectTable={(num) => { setSelectedTableForMapping(num); setView('owner-order-entry'); }} 
            onBack={() => setView('owner-pending-orders')} 
          />
        );

      case 'owner-order-entry':
        return currentMappingOrder ? (
          <OrderEntryView 
            tableNumber={selectedTableForMapping || '??'}
            onConfirm={(code) => finalizeHandshake(code, selectedTableForMapping || '00')} 
            onBack={() => setView('owner-pending-orders')} 
            activeOrder={currentMappingOrder}
            menu={menu}
          />
        ) : null;

      case 'owner-kitchen':
        return (
          <KitchenView 
            orders={kitchenOrders} 
            menu={menu}
            onUpdateStatus={updateOrderStatus}
            onBack={() => setView('owner-dashboard')} 
          />
        );

      case 'owner-table-map':
        return (
          <TableMapView 
            orders={allOrders} 
            onClearTable={clearTable}
            onBack={() => setView('owner-dashboard')} 
          />
        );

      case 'owner-inventory':
        // Import only visible in admin mode (add ?admin=true to URL)
        const isAdminMode = new URLSearchParams(window.location.search).get('admin') === 'true';
        return (
          <InventoryView
            menu={menu}
            setMenu={handleUpdateMenu}
            onBack={() => setView('owner-dashboard')}
            onImport={isAdminMode ? () => setView('owner-menu-import') : undefined}
          />
        );
      case 'owner-menu-import':
        return (
          <MenuImportView
            existingMenu={menu}
            onImport={(newMenu: MenuItem[]) => { handleUpdateMenu(newMenu); setView('owner-inventory'); }}
            onBack={() => setView('owner-inventory')}
          />
        );
      case 'owner-branding':
        // config is guaranteed non-null here by early return guard
        return <BrandingView config={config!} setConfig={handleUpdateConfig} onBack={() => setView('owner-dashboard')} />;

      // Admin views
      case 'admin-login':
        return <AdminLoginView onLogin={handleAdminLogin} onBack={() => window.location.href = '/'} />;

      case 'admin-dashboard':
        return <AdminDashboardView onLogout={handleAdminLogout} />;

      default:
        return <LandingView onDemo={navigateToDemo} />;
    }
  };

  // LandingView has its own responsive layout, render it without the phone container
  if (view === 'marketing') {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] font-sans">
        {renderView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] font-sans">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10">
        <div className="max-w-md mx-auto lg:max-w-none bg-[#170e10] min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-5rem)] overflow-hidden relative shadow-2xl lg:rounded-3xl">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default App;
