import { MenuItem, TableOrder, RestaurantConfig, CartItem } from './types';
import {
  supabase,
  hashPin,
  setOwnerSession,
  isOwnerAuthenticated,
  getRestaurantSlug,
  setCurrentRestaurant,
  getCurrentRestaurant,
  DbRestaurant,
  DbMenuItem,
  DbOrder,
  DbOrderItem
} from './lib/supabase';

/**
 * MULTI-TENANT SUPABASE API
 * All queries are scoped to the current restaurant (tenant)
 */

// Current restaurant context
let currentRestaurantId: string | null = null;
let currentRestaurantSlug: string | null = null;

// ============================================
// TYPE MAPPERS
// ============================================

const mapDbRestaurantToConfig = (db: DbRestaurant): RestaurantConfig => ({
  name: db.name,
  logo: db.logo_url || '',
  accentColor: db.accent_color,
  reviewUrl: db.google_review_url || '',
  isOpen: db.is_open,
});

const mapDbMenuItemToMenuItem = (db: DbMenuItem): MenuItem => ({
  id: db.id,
  name: db.name,
  translatedName: db.translated_name ?? undefined,
  description: db.description,
  price: db.price,
  image: db.image_url,
  category: db.category,
  isAvailable: db.is_available,
  isSpicy: db.is_spicy ?? undefined,
  containsPeanuts: db.contains_peanuts ?? undefined,
  allergens: db.allergens ?? [],
  additives: db.additives ?? [],
});

const mapMenuItemToDb = (item: MenuItem): Partial<DbMenuItem> => ({
  id: item.id,
  name: item.name,
  translated_name: item.translatedName ?? null,
  description: item.description,
  price: item.price,
  image_url: item.image,
  category: item.category,
  is_available: item.isAvailable,
  is_spicy: item.isSpicy ?? null,
  contains_peanuts: item.containsPeanuts ?? null,
  allergens: item.allergens ?? [],
  additives: item.additives ?? [],
});

const mapDbOrderToTableOrder = (
  order: DbOrder,
  orderItems: DbOrderItem[]
): TableOrder => ({
  id: order.id,
  tableNumber: order.table_number ?? undefined,
  items: orderItems.map(item => ({
    id: item.id,
    menuItemId: item.menu_item_id,
    quantity: item.quantity,
    notes: item.notes ?? undefined,
  })),
  status: order.status,
  timestamp: new Date(order.confirmed_at ?? order.created_at).getTime(),
});

// ============================================
// MULTI-TENANT API
// ============================================

export const multiTenantApi = {
  // --- Restaurant Resolution ---

  /**
   * Initialize the API with a restaurant slug
   * Call this on app startup to resolve the current restaurant
   */
  initializeRestaurant: async (slug?: string): Promise<DbRestaurant | null> => {
    const targetSlug = slug || getRestaurantSlug();

    if (!targetSlug) {
      return null;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', targetSlug)
      .single();

    if (error || !data) {
      return null;
    }

    // Check subscription status
    if (data.subscription_status === 'suspended' || data.subscription_status === 'cancelled') {
      return null;
    }

    // Set context
    currentRestaurantId = data.id;
    currentRestaurantSlug = data.slug;
    setCurrentRestaurant(data.id, data.slug);

    return data as DbRestaurant;
  },

  getCurrentRestaurantId: (): string | null => {
    if (currentRestaurantId) return currentRestaurantId;
    const stored = getCurrentRestaurant();
    return stored?.id || null;
  },

  // --- Auth ---

  login: async (pin: string): Promise<boolean> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    try {
      const hashedPin = await hashPin(pin);

      // If multi-tenant mode, check staff table first
      if (restaurantId) {
        const { data, error } = await supabase
          .from('restaurant_staff')
          .select('id, role, pin_hash')
          .eq('restaurant_id', restaurantId)
          .eq('pin_hash', hashedPin)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          setOwnerSession(true);
          return true;
        }
      }

      // Fallback: check legacy restaurant_config table
      const { data: legacyData } = await supabase
        .from('restaurant_config')
        .select('owner_pin_hash')
        .single();

      if (legacyData?.owner_pin_hash === hashedPin) {
        setOwnerSession(true);
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    setOwnerSession(false);
  },

  isAuthenticated: (): boolean => {
    return isOwnerAuthenticated();
  },

  // --- Restaurant Config ---

  getConfig: async (): Promise<RestaurantConfig | null> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    if (restaurantId) {
      // Multi-tenant mode: load from restaurants table
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (!error && data) {
        return mapDbRestaurantToConfig(data as DbRestaurant);
      }
    }

    // Fallback: legacy single-tenant mode
    const { data, error } = await supabase
      .from('restaurant_config')
      .select('*')
      .single();

    if (!error && data) {
      return {
        name: data.name,
        logo: data.logo,
        accentColor: data.accent_color,
        reviewUrl: data.review_url,
        isOpen: data.is_open,
      };
    }

    // Default fallback
    return {
      name: 'Restaurant',
      logo: '',
      accentColor: '#c21e3a',
      reviewUrl: '',
      isOpen: true,
    };
  },

  updateConfig: async (config: RestaurantConfig): Promise<void> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    if (restaurantId) {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: config.name,
          logo_url: config.logo,
          accent_color: config.accentColor,
          google_review_url: config.reviewUrl,
          is_open: config.isOpen,
        })
        .eq('id', restaurantId);

      if (error) throw new Error('Failed to update config');
    } else {
      // Legacy fallback
      const { error } = await supabase
        .from('restaurant_config')
        .update({
          name: config.name,
          logo: config.logo,
          accent_color: config.accentColor,
          review_url: config.reviewUrl,
          is_open: config.isOpen,
        })
        .not('id', 'is', null);

      if (error) throw new Error('Failed to update config');
    }
  },

  // --- Menu ---

  getMenu: async (): Promise<MenuItem[]> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    let query = supabase
      .from('menu_items')
      .select('*')
      .order('display_order', { ascending: true });

    // Filter by restaurant if in multi-tenant mode
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [];
    }

    return (data as DbMenuItem[]).map(mapDbMenuItemToMenuItem);
  },

  updateMenu: async (menu: MenuItem[]): Promise<void> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    // Get existing items for this restaurant
    let existingQuery = supabase.from('menu_items').select('id');
    if (restaurantId) {
      existingQuery = existingQuery.eq('restaurant_id', restaurantId);
    }

    const { data: existingItems } = await existingQuery;
    const existingIds = new Set((existingItems || []).map(item => item.id));
    const newIds = new Set(menu.map(item => item.id));

    // Delete removed items
    const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
    if (idsToDelete.length > 0) {
      await supabase.from('menu_items').delete().in('id', idsToDelete);
    }

    // Upsert items
    const itemsWithOrder = menu.map((item, index) => ({
      ...mapMenuItemToDb(item),
      display_order: index,
      ...(restaurantId ? { restaurant_id: restaurantId } : {}),
    }));

    const { error } = await supabase
      .from('menu_items')
      .upsert(itemsWithOrder, { onConflict: 'id' });

    if (error) throw new Error('Failed to update menu');
  },

  // --- Orders ---

  getOrders: async (): Promise<TableOrder[]> => {
    // Legacy schema - no restaurant_id column in orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'cooking', 'served'])
      .order('created_at', { ascending: false });

    if (ordersError || !orders || orders.length === 0) {
      return [];
    }

    // Get order items
    const orderIds = orders.map(o => o.id);
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    // Group items by order
    const itemsByOrderId = (orderItems || []).reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {} as Record<string, DbOrderItem[]>);

    return orders.map(order =>
      mapDbOrderToTableOrder(order as DbOrder, itemsByOrderId[order.id] || [])
    );
  },

  createOrder: async (items: CartItem[]): Promise<TableOrder> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    // Generate handshake code
    let code: string;
    if (restaurantId) {
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_handshake_code', { p_restaurant_id: restaurantId });

      if (codeError || !codeData) {
        // Fallback
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const nums = '123456789';
        code = `${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}.${nums.charAt(Math.floor(Math.random() * nums.length))}${nums.charAt(Math.floor(Math.random() * nums.length))}`;
      } else {
        code = codeData;
      }
    } else {
      // Legacy: use old RPC
      const { data: codeData } = await supabase.rpc('generate_handshake_code');
      code = codeData || `XX.${Math.floor(Math.random() * 100)}`;
    }

    // Insert order (legacy schema - no restaurant_id column)
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: code,
        status: 'pending',
      });

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: code,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      notes: item.notes ?? null,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', code);
      throw new Error('Failed to create order items');
    }

    return {
      id: code,
      items: (insertedItems || []).map(item => ({
        id: item.id,
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        notes: item.notes ?? undefined,
      })),
      status: 'pending',
      timestamp: Date.now(),
    };
  },

  updateOrderStatus: async (
    orderId: string,
    status: TableOrder['status'],
    tableNumber?: string
  ): Promise<void> => {
    const updateData: any = { status };

    if (tableNumber !== undefined) {
      updateData.table_number = tableNumber;
    }
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw new Error('Failed to update order status');
  },

  clearTable: async (tableNumber: string): Promise<void> => {
    // Legacy schema - no restaurant_id column
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('table_number', tableNumber);
    if (error) throw new Error('Failed to clear table');
  },

  // --- Real-time ---

  subscribeToOrders: (callback: (orders: TableOrder[]) => void) => {
    // Initial fetch
    multiTenantApi.getOrders().then(callback);

    // Real-time subscription (legacy schema - no restaurant_id filter)
    let channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          const orders = await multiTenantApi.getOrders();
          callback(orders);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const orders = await multiTenantApi.getOrders();
          callback(orders);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --- Image Upload ---

  uploadImage: async (file: File): Promise<string> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = restaurantId
      ? `${restaurantId}/${fileName}`
      : `menu/${fileName}`;

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (error) throw new Error('Failed to upload image');

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // --- Diagnostic ---

  checkConnection: async () => {
    try {
      const restaurantId = multiTenantApi.getCurrentRestaurantId();

      let menuQuery = supabase.from('menu_items').select('id', { count: 'exact', head: true });
      if (restaurantId) {
        menuQuery = menuQuery.eq('restaurant_id', restaurantId);
      }

      const [menuResult, restaurantResult] = await Promise.all([
        menuQuery,
        restaurantId
          ? supabase.from('restaurants').select('id').eq('id', restaurantId).single()
          : supabase.from('restaurant_config').select('id').single()
      ]);

      return {
        connected: true,
        menuCount: menuResult.count || 0,
        configExists: !!restaurantResult.data,
        restaurantId,
        error: menuResult.error?.message || restaurantResult.error?.message,
      };
    } catch (err) {
      return { connected: false, menuCount: 0, configExists: false, restaurantId: null, error: String(err) };
    }
  },
};

// Export as default for easy switching
export default multiTenantApi;
