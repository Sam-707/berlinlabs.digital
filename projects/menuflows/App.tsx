
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppView, MenuItem, CartItem, RestaurantConfig, TableOrder, OwnerNotification } from './types';
import { multiTenantApi as api } from './api.multitenant';
import { adminApi } from './api.admin';
import { getRestaurantSlug } from './lib/supabase';
import { ToastProvider, useToast, BrandingProvider } from './contexts';
import ToastContainer from './components/ToastContainer';
import { saveActiveOrder, getActiveOrder, clearActiveOrder } from './utils/orderPersistence';

// --- Views ---
import LandingView from './views/LandingView';
import SplashView from './views/SplashView';
import MenuView from './views/MenuView';
import ItemDetailView from './views/ItemDetailView';
import CartView from './views/CartView';
import WaiterHandshakeView from './views/WaiterHandshakeView';
import OrderTrackingView from './views/OrderTrackingView';
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
import TableQRGeneratorView from './views/owner/TableQRGeneratorView';
import WaiterReadyOrdersView from './views/WaiterReadyOrdersView';
import AdminLoginView from './views/admin/AdminLoginView';
import AdminDashboardView from './views/admin/AdminDashboardView';
import AdminBrandingView from './views/admin/AdminBrandingView';

// Inner app component that uses the toast context
const AppContent: React.FC = () => {
  const { toast, toasts, removeToast } = useToast();

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
  const [currentOrderCode, setCurrentOrderCode] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  // Owner Notifications State
  const [ownerNotifications, setOwnerNotifications] = useState<OwnerNotification[]>([]);
  const lastStatusRef = useRef<Record<string, TableOrder['status']>>({});
  const initializedRef = useRef(false);

  // Notification handlers
  const dismissNotification = (id: string) => {
    setOwnerNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setOwnerNotifications([]);
  };

  // Initial Data Fetch - Multi-tenant aware
  useEffect(() => {
    const init = async () => {
      try {
        // Check if this is an admin route
        const path = window.location.pathname;

        if (path === '/admin' || path.startsWith('/admin/')) {
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

        if (slug) {
          // Try to load the restaurant by slug
          const restaurant = await api.initializeRestaurant(slug);

          if (restaurant) {
            setHasRestaurant(true);
            setView('splash'); // Start at splash for valid restaurant

            // Load restaurant data
            const [m, c, o] = await Promise.all([api.getMenu(), api.getConfig(), api.getOrders()]);
            setMenu(m);
            setConfig(c);
            setAllOrders(o);

            // Parse table number from URL query parameter
            const urlParams = new URLSearchParams(window.location.search);
            const tableParam = urlParams.get('table');
            if (tableParam) {
              const tableNum = parseInt(tableParam, 10);
              const maxTables = 30; // Default max tables
              if (!isNaN(tableNum) && tableNum >= 1 && tableNum <= maxTables) {
                setSelectedTableNumber(tableNum);
              }
            }
          } else {
            // Multi-tenant restaurant not found - try legacy single-tenant mode
            const diagnostic = await api.checkConnection();

            if (diagnostic.configExists || diagnostic.menuCount > 0) {
              // Legacy data exists - use single-tenant mode
              setHasRestaurant(true);
              setView('splash');

              // Load legacy data (API methods already handle null restaurantId)
              const [m, c, o] = await Promise.all([api.getMenu(), api.getConfig(), api.getOrders()]);
              setMenu(m);
              setConfig(c);
              setAllOrders(o);
            } else {
              // No restaurant found - show landing page with error context
              setHasRestaurant(false);
              setView('marketing');
            }
          }
        } else {
          // No slug - show landing/marketing page
          setHasRestaurant(false);
          setView('marketing');
        }

        setRestaurantLoaded(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        // Fallback to marketing page on error
        setHasRestaurant(false);
        setView('marketing');
        setRestaurantLoaded(true);
      }
    };
    init();
  }, []);

  // Check for active order on app load (handshake persistence)
  useEffect(() => {
    if (!hasRestaurant) return;

    const activeOrder = getActiveOrder();
    if (activeOrder) {
      // Check if the order still exists in the database
      const orderExists = allOrders.find(o => o.id === activeOrder.code);
      if (orderExists) {
        setCurrentOrderCode(activeOrder.code);
      } else {
        // Order no longer exists, clear from localStorage
        clearActiveOrder();
      }
    }
  }, [hasRestaurant, allOrders]);

  // Clear active order when served
  useEffect(() => {
    if (currentOrderCode) {
      const currentOrder = allOrders.find(o => o.id === currentOrderCode);
      if (currentOrder && currentOrder.status === 'served') {
        clearActiveOrder();
        setCurrentOrderCode(null);
      }
    }
  }, [allOrders, currentOrderCode]);

  // Real-time Order Sync - only subscribe when restaurant is loaded
  useEffect(() => {
    if (!hasRestaurant) return;

    return api.subscribeToOrders((orders) => {
      setAllOrders(orders);

      // Detect status transitions for owner notifications
      const targetStatuses: TableOrder['status'][] = ['ready', 'served'];

      if (!initializedRef.current) {
        // First load - initialize refs without firing notifications
        orders.forEach(order => {
          lastStatusRef.current[order.id] = order.status;
        });
        initializedRef.current = true;
      } else {
        // Subsequent updates - check for transitions
        orders.forEach(order => {
          const prevStatus = lastStatusRef.current[order.id];
          const nextStatus = order.status;

          if (prevStatus !== nextStatus && targetStatuses.includes(nextStatus)) {
            // Status transitioned to target - enqueue notification
            const newNotification: OwnerNotification = {
              id: `notif-${Date.now()}-${order.id}`,
              orderId: order.id,
              code: order.id,
              tableNumber: order.tableNumber,
              status: nextStatus,
              createdAt: Date.now(),
            };

            setOwnerNotifications(prev => {
              const updated = [newNotification, ...prev];
              // Max 3 notifications
              return updated.slice(0, 3);
            });
          }

          // Update ref
          lastStatusRef.current[order.id] = nextStatus;
        });
      }
    });
  }, [hasRestaurant]);

  // Real-time Menu Sync - only subscribe when restaurant is loaded
  useEffect(() => {
    if (!hasRestaurant) return;

    const unsubscribe = api.subscribeToMenu((updatedMenu) => {
      setMenu(updatedMenu);
    });

    return () => {
      unsubscribe();
    };
  }, [hasRestaurant]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: item.id,
        quantity: 1,
        selectedModifiers: [],
        basePrice: item.price,
        modifiersTotal: 0,
        unitPrice: item.price,
      }];
    });
    // Optional: Show toast when item is added
    // toast.success(`${item.name} added to cart!`);
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

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        if (delta > 0) {
          return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + delta } : i);
        } else if (existing.quantity + delta <= 0) {
          return prev.filter(i => i.id !== cartItemId);
        } else {
          return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + delta } : i);
        }
      }
      return prev;
    });
  };

  const generateWaiterCode = async () => {
    if (isCreatingOrder) return; // Prevent double-click

    setIsCreatingOrder(true);
    try {
      const order = await api.createOrder(cart, selectedTableNumber);

      setCurrentOrderCode(order.id); // Store the created order ID
      // Save to localStorage for persistence
      saveActiveOrder(order.id, selectedTableNumber?.toString());
      setCart([]);
      setView('waiter-handshake');
      toast.success('Order created successfully!');
    } catch (err) {
      console.error('Order creation failed:', err);

      // Show user-friendly error message
      const errorMsg = err instanceof Error
        ? `Failed to create order: ${err.message}`
        : 'Failed to create order. Please try again.';

      // Check if this is a stale menu item error and clear the cart
      if (err instanceof Error && err.message.includes('not found in database')) {
        setCart([]);
        toast.error('Cart cleared - some items are no longer available. Please re-add your items.', { duration: 6000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const finalizeHandshake = async (orderId: string, tableNum: string) => {
    await api.updateOrderStatus(orderId, 'confirmed', tableNum);
    toast.success(`Order confirmed for table ${tableNum}!`);
    return true;
  };

  const updateOrderStatus = async (orderId: string, nextStatus: TableOrder['status']) => {
    console.log(`[App] Updating order ${orderId} to status: ${nextStatus}`);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      console.log(`[App] Successfully updated order ${orderId} to ${nextStatus}`);
    } catch (error) {
      console.error(`[App] Failed to update order ${orderId}:`, error);
      throw error; // Re-throw to allow KitchenView to handle the error
    }
  };

  const clearTable = async (tableNumber: string) => {
    await api.clearTable(tableNumber);
  };

  const handleUpdateMenu = async (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    await api.updateMenu(newMenu);
    // Clear cart when menu is updated to avoid stale item IDs
    if (cart.length > 0) {
      setCart([]);
      toast.info('Cart cleared due to menu changes. Please re-add your items.');
    }
  };

  const handleUpdateConfig = async (newConfig: RestaurantConfig) => {
    setConfig(newConfig);
    await api.updateConfig(newConfig);
    toast.success('Settings saved successfully!');
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
      <div className="min-h-screen bg-wine-dark flex items-center justify-center text-white font-sans">
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
      <div className="min-h-screen bg-wine-dark flex items-center justify-center text-white font-sans">
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
        return <LandingView onDemo={navigateToDemo} activeOrderCode={currentOrderCode} />;
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
            selectedTableNumber={selectedTableNumber}
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
            onClose={() => setView('menu')}
            onRemove={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={generateWaiterCode}
            isCreatingOrder={isCreatingOrder}
          />
        );
      case 'waiter-handshake':
        // Use the stored order code if available, otherwise fall back to search
        let orderToShow = null;
        if (currentOrderCode) {
          orderToShow = allOrders.find(o => o.id === currentOrderCode)
            || pendingOrders.find(o => o.id === currentOrderCode);
        }
        if (!orderToShow) {
          const latestPending = pendingOrders.length > 0 ? pendingOrders[pendingOrders.length - 1] : null;
          orderToShow = allOrders.find(o => o.id === (latestPending?.id || ''))
            || latestPending;
        }
        return orderToShow ? (
          <WaiterHandshakeView
            order={orderToShow}
            onBack={() => { setCurrentOrderCode(null); setView('menu'); }}
            onTrackOrder={() => setView('order-tracking')}
          />
        ) : null;

      case 'order-tracking':
        const orderToTrack = currentOrderCode
          ? allOrders.find(o => o.id === currentOrderCode) || pendingOrders.find(o => o.id === currentOrderCode)
          : null;
        return orderToTrack ? (
          <OrderTrackingView
            order={orderToTrack}
            allOrders={allOrders}
            onBack={() => { setCurrentOrderCode(null); setView('menu'); }}
          />
        ) : null;

      case 'owner-login':
        // Back goes to splash (restaurant) or marketing (landing page)
        return <LoginView onLogin={handleLogin} onBack={() => setView(hasRestaurant ? 'splash' : 'marketing')} />;

      case 'owner-dashboard': {
        const readyOrders = allOrders.filter(o => o.status === 'ready');
        return <DashboardView onNavigate={(v) => navigateWithOwnerGuard(v as AppView)} onBack={handleLogout} pendingCount={pendingOrders.length} readyCount={readyOrders.length} />;
      }

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
            onUpdateStatusAsync={updateOrderStatus}
            onBack={() => setView('owner-dashboard')}
            notifications={ownerNotifications}
            onDismissNotification={dismissNotification}
            onClearAllNotifications={clearAllNotifications}
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
      case 'owner-table-qr-generator':
        return (
          <TableQRGeneratorView
            restaurantSlug={getRestaurantSlug() || 'demo'}
            onBack={() => setView('owner-dashboard')}
          />
        );

      case 'waiter-ready-orders': {
        const readyOrdersList = allOrders.filter(o => o.status === 'ready');
        return (
          <WaiterReadyOrdersView
            orders={readyOrdersList}
            menu={menu}
            onUpdateStatus={updateOrderStatus}
            onBack={() => setView('owner-dashboard')}
          />
        );
      }

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
        return <AdminDashboardView onLogout={handleAdminLogout} onBranding={() => setView('admin-branding')} />;

      case 'admin-branding':
        return <AdminBrandingView onBack={() => setView('admin-dashboard')} />;

      default:
        return <LandingView onDemo={navigateToDemo} />;
    }
  };

  // LandingView has its own responsive layout, render it without the phone container
  if (view === 'marketing') {
    return (
      <div className="min-h-screen w-full bg-background-dark font-sans">
        {renderView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background-dark font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10">
        <div className="max-w-md mx-auto lg:max-w-none bg-wine-dark min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-5rem)] overflow-hidden relative shadow-2xl lg:rounded-3xl">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

// Main App component that provides the toast context
const App: React.FC = () => {
  return (
    <BrandingProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrandingProvider>
  );
};

export default App;
