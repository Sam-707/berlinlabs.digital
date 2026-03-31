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
// ARRAY NORMALIZATION UTILITIES
// ============================================

/**
 * Normalizes a field value to a clean string array for JSONB columns.
 * Handles: undefined, null, arrays, strings (JSON or comma-separated), double-stringified JSON
 * De-duplicates values using Set.
 *
 * Double-stringified JSON handling: parses up to 3 times if result is a string looking like JSON.
 */
function normalizeStringArrayField(value: unknown, depth: number = 0): string[] {
  const MAX_PARSE_DEPTH = 3;

  // undefined/null → []
  if (value === null || value === undefined) return [];

  // Already an array → filter strings, trim, remove empties, de-duplicate
  if (Array.isArray(value)) {
    return Array.from(new Set(
      value
        .filter((v): v is string => typeof v === 'string')
        .map(v => v.trim())
        .filter(v => v.length > 0)
    ));
  }

  // String → try JSON.parse, fallback to comma split
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return [];

    // Try JSON.parse first (for stringified arrays or double-stringified)
    try {
      let parsed: unknown = JSON.parse(trimmed);

      // Handle double-stringified JSON: if parsed is a string that looks like JSON, parse again
      let parseCount = 1;
      while (
        parseCount < MAX_PARSE_DEPTH &&
        typeof parsed === 'string' &&
        parsed.trim().startsWith('[')
      ) {
        parsed = JSON.parse(parsed);
        parseCount++;
      }

      if (Array.isArray(parsed)) {
        return normalizeStringArrayField(parsed, depth + 1); // Recurse to clean
      }
    } catch {
      // Not JSON, fall through to comma split
    }

    // Comma-separated fallback, de-duplicate
    return Array.from(new Set(
      trimmed
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)
    ));
  }

  // Unknown type → return empty array
  return [];
}

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

    if (!restaurantId) {
      throw new Error('No restaurant context');
    }

    const itemsWithOrder = menu.map((item, index) => ({
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
      allergens: normalizeStringArrayField(item.allergens),
      additives: normalizeStringArrayField(item.additives),
      display_order: index,
    }));

    console.log('[API] Updating menu via RPC:', {
      restaurantId,
      itemCount: itemsWithOrder.length
    });

    // Dev-only: log raw vs normalized to prove we're sending arrays
    if (import.meta.env.DEV && itemsWithOrder.length > 0) {
      const rawFirst = menu[0];
      const normalizedFirst = itemsWithOrder[0];
      console.log('[API] Menu payload normalization (first item):', {
        raw: {
          allergensType: typeof rawFirst.allergens,
          allergensValue: rawFirst.allergens,
          additivesType: typeof rawFirst.additives,
          additivesValue: rawFirst.additives,
        },
        normalized: {
          allergensType: typeof normalizedFirst.allergens,
          allergensIsArray: Array.isArray(normalizedFirst.allergens),
          allergensValue: normalizedFirst.allergens,
          additivesType: typeof normalizedFirst.additives,
          additivesIsArray: Array.isArray(normalizedFirst.additives),
          additivesValue: normalizedFirst.additives,
        },
      });
    }

    // Use RPC function (bypasses RLS with definer rights)
    const { data, error } = await supabase
      .rpc('upsert_menu_items', {
        p_items: itemsWithOrder,
        p_restaurant_id: restaurantId
      });

    if (error) {
      console.error('[API] Failed to update menu:', error);
      throw new Error(`Failed to update menu: ${error.message} (code: ${error.code})`);
    }

    console.log('[API] Menu updated successfully via RPC:', data);
  },

  // --- Orders ---

  getOrders: async (): Promise<TableOrder[]> => {
    // Legacy schema - no restaurant_id column in orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'cooking', 'ready', 'served'])
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

  createOrder: async (items: CartItem[], tableNumber?: number | null): Promise<TableOrder> => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    if (!restaurantId) {
      throw new Error(
        'No restaurant context - unable to identify which restaurant this order belongs to. ' +
        'Please ensure you are accessing the app via a restaurant-specific URL (e.g., /demo, /hasir-spandau).'
      );
    }

    // Generate handshake code using multi-tenant RPC
    let code: string;
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_handshake_code', { p_restaurant_id: restaurantId });

    if (codeError || !codeData) {
      // Fallback to local generation
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const nums = '123456789';
      code = `${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}.${nums.charAt(Math.floor(Math.random() * nums.length))}${nums.charAt(Math.floor(Math.random() * nums.length))}`;
    } else {
      code = codeData;
    }

    // Build order object with restaurant_id
    const orderData: any = {
      id: code,
      status: 'pending',
    };

    // Add restaurant_id in multi-tenant mode
    if (restaurantId) {
      orderData.restaurant_id = restaurantId;
    }

    // Add table_number if provided from QR scan
    if (tableNumber) {
      orderData.table_number = String(tableNumber);
    }

    // Insert order with restaurant_id
    const { error: orderError } = await supabase
      .from('orders')
      .insert(orderData);

    if (orderError) {
      console.error('[API] Failed to insert order:', {
        error: orderError,
        orderData,
        restaurantId
      });
      throw new Error(`Failed to create order: ${orderError.message} (code: ${orderError.code}, hint: ${orderError.hint || 'none'})`);
    }

    // Insert order items
    // First, validate that all menu_item_id values exist in the database
    const menuItemIds = items.map(item => item.menuItemId);
    const { data: existingMenuItems, error: validationError } = await supabase
      .from('menu_items')
      .select('id')
      .in('id', menuItemIds);

    if (validationError) {
      console.error('[API] Failed to validate menu items:', validationError);
    }

    const existingIds = new Set((existingMenuItems || []).map(item => item.id));
    const invalidIds = menuItemIds.filter(id => !existingIds.has(id));

    if (invalidIds.length > 0) {
      console.error('[API] Invalid menu_item_id values found:', {
        invalidIds,
        menuItemIds,
        existingIds: Array.from(existingIds),
        restaurantId
      });
      throw new Error(
        `Cannot create order: ${invalidIds.length} menu item(s) not found in database. ` +
        `Please reload the menu and try again. (Invalid IDs: ${invalidIds.join(', ')})`
      );
    }

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
      console.error('[API] Failed to insert order items:', {
        error: itemsError,
        orderItems,
        code
      });
      await supabase.from('orders').delete().eq('id', code);
      throw new Error(`Failed to create order items: ${itemsError.message} (code: ${itemsError.code}, hint: ${itemsError.hint || 'none'})`);
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
    console.log('[API] Updating order status:', { orderId, status, tableNumber });

    const updateData: any = { status };

    if (tableNumber !== undefined) {
      updateData.table_number = tableNumber;
    }
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { error, data } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('[API] Order update failed:', {
        orderId,
        status,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        table: error.table,
      });
      throw new Error(`Failed to update order status: ${error.message} (code: ${error.code})`);
    }

    console.log('[API] Order update successful:', { orderId, status, data });
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

  /**
   * Subscribe to real-time menu updates
   * Callback receives the updated menu array when menu_items table changes
   */
  subscribeToMenu: (callback: (menu: MenuItem[]) => void) => {
    const restaurantId = multiTenantApi.getCurrentRestaurantId();

    // Initial fetch
    multiTenantApi.getMenu().then(callback);

    // Real-time subscription to menu_items table
    const channelName = restaurantId
      ? `menu-changes-${restaurantId}`
      : 'menu-changes';

    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'menu_items',
          filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined,
        },
        async () => {
          console.log('[subscribeToMenu] Menu change detected, refreshing...');
          const menu = await multiTenantApi.getMenu();
          callback(menu);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[subscribeToMenu] Successfully subscribed to menu changes', { restaurantId });
        }
      });

    return () => {
      console.log('[subscribeToMenu] Cleaning up menu subscription');
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
