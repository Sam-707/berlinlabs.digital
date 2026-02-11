
import { MenuItem, TableOrder, RestaurantConfig, CartItem } from './types';
import { MOCK_MENU, BURGER_IMAGE } from './constants';

/**
 * MOCK PERSISTENCE ENGINE (BACKUP)
 * This is the original localStorage-based implementation.
 * Kept as a fallback if Supabase needs to be disabled.
 */

const STORAGE_KEYS = {
  MENU: 'menuflows_menu',
  ORDERS: 'menuflows_orders',
  CONFIG: 'menuflows_config',
  AUTH: 'menuflows_auth_session'
};

const getStorage = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // --- Auth ---
  login: async (pin: string): Promise<boolean> => {
    if (pin === '1234') {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  },

  logout: async (): Promise<void> => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  isAuthenticated: (): boolean => {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  // --- Restaurant Config ---
  getConfig: async (): Promise<RestaurantConfig> => {
    return getStorage(STORAGE_KEYS.CONFIG, {
      name: 'The Burger Lab',
      logo: BURGER_IMAGE,
      accentColor: '#c21e3a',
      reviewUrl: 'google.com/maps/review/gbk-berlin',
      isOpen: true,
    });
  },

  updateConfig: async (config: RestaurantConfig): Promise<void> => {
    setStorage(STORAGE_KEYS.CONFIG, config);
  },

  // --- Menu ---
  getMenu: async (): Promise<MenuItem[]> => {
    return getStorage(STORAGE_KEYS.MENU, MOCK_MENU);
  },

  updateMenu: async (menu: MenuItem[]): Promise<void> => {
    setStorage(STORAGE_KEYS.MENU, menu);
  },

  // --- Asset Upload ---
  /**
   * Converts a File to a Base64 string for mock persistence.
   * In a real app, this would upload to S3/Cloudinary/Supabase Storage.
   */
  uploadImage: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // --- Orders ---
  getOrders: async (): Promise<TableOrder[]> => {
    return getStorage(STORAGE_KEYS.ORDERS, []);
  },

  createOrder: async (items: CartItem[]): Promise<TableOrder> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const nums = '123456789';
    const code = `${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}.${nums.charAt(Math.floor(Math.random() * nums.length))}${nums.charAt(Math.floor(Math.random() * nums.length))}`;

    const newOrder: TableOrder = {
      id: code,
      items,
      status: 'pending',
      timestamp: Date.now(),
    };

    const current = await api.getOrders();
    setStorage(STORAGE_KEYS.ORDERS, [...current, newOrder]);
    return newOrder;
  },

  updateOrderStatus: async (orderId: string, status: TableOrder['status'], tableNumber?: string): Promise<void> => {
    const current = await api.getOrders();
    const updated = current.map(o =>
      o.id === orderId
        ? { ...o, status, tableNumber: tableNumber ?? o.tableNumber, timestamp: status === 'confirmed' ? Date.now() : o.timestamp }
        : o
    );
    setStorage(STORAGE_KEYS.ORDERS, updated);
  },

  clearTable: async (tableNumber: string): Promise<void> => {
    const current = await api.getOrders();
    const updated = current.filter(o => o.tableNumber !== tableNumber);
    setStorage(STORAGE_KEYS.ORDERS, updated);
  },

  subscribeToOrders: (callback: (orders: TableOrder[]) => void) => {
    const interval = setInterval(async () => {
      const orders = await api.getOrders();
      callback(orders);
    }, 2000);
    return () => clearInterval(interval);
  }
};
