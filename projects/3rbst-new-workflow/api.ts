import { MenuItem, TableOrder, RestaurantConfig, CartItem, ModifierGroup, Modifier, SelectedModifier } from './types';
import { supabase, hashPin, setOwnerSession, isOwnerAuthenticated, DbRestaurantConfig, DbMenuItem, DbOrder, DbOrderItem, DbModifierGroup, DbModifier, DbSelectedModifier } from './lib/supabase';
import { MOCK_MENU, BURGER_IMAGE } from './constants';

/**
 * SUPABASE API ENGINE
 * Real-time database with Supabase backend.
 * Preserves the same API interface for seamless frontend integration.
 */

// Type mappers: Convert DB rows (snake_case) to frontend types (camelCase)
const mapDbConfigToRestaurantConfig = (db: DbRestaurantConfig): RestaurantConfig => ({
  name: db.name,
  logo: db.logo,
  accentColor: db.accent_color,
  reviewUrl: db.review_url,
  isOpen: db.is_open,
});

const mapRestaurantConfigToDb = (config: RestaurantConfig): Partial<DbRestaurantConfig> => ({
  name: config.name,
  logo: config.logo,
  accent_color: config.accentColor,
  review_url: config.reviewUrl,
  is_open: config.isOpen,
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

// Modifier mappers
const mapDbModifierToModifier = (db: DbModifier): Modifier => ({
  id: db.id,
  name: db.name,
  nameTranslated: db.name_translated ?? undefined,
  priceAdjustment: db.price_adjustment,
  isAvailable: db.is_available,
  isDefault: db.is_default,
  displayOrder: db.display_order,
});

const mapDbModifierGroupToModifierGroup = (db: DbModifierGroup, modifiers: Modifier[]): ModifierGroup => ({
  id: db.id,
  name: db.name,
  nameTranslated: db.name_translated ?? undefined,
  minSelections: db.min_selections,
  maxSelections: db.max_selections,
  isRequired: db.is_required,
  displayOrder: db.display_order,
  modifiers: modifiers.sort((a, b) => a.displayOrder - b.displayOrder),
});

const mapSelectedModifierToDb = (modifier: SelectedModifier): DbSelectedModifier => ({
  group_id: modifier.groupId,
  group_name: modifier.groupName,
  modifier_id: modifier.modifierId,
  modifier_name: modifier.modifierName,
  price_adjustment: modifier.priceAdjustment,
});

const mapDbSelectedModifierToSelectedModifier = (db: DbSelectedModifier): SelectedModifier => ({
  groupId: db.group_id,
  groupName: db.group_name,
  modifierId: db.modifier_id,
  modifierName: db.modifier_name,
  priceAdjustment: db.price_adjustment,
});

// Convert DB order + order_items to frontend TableOrder
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
    selectedModifiers: (item.modifiers || []).map(mapDbSelectedModifierToSelectedModifier),
    basePrice: item.unit_price - (item.modifiers_total || 0),
    modifiersTotal: item.modifiers_total || 0,
    unitPrice: item.unit_price || 0,
  })),
  status: order.status,
  timestamp: new Date(order.confirmed_at ?? order.created_at).getTime(),
});

export const api = {
  // --- Diagnostic ---
  checkConnection: async (): Promise<{ connected: boolean; menuCount: number; configExists: boolean; error?: string }> => {
    try {
      const [menuResult, configResult] = await Promise.all([
        supabase.from('menu_items').select('id', { count: 'exact', head: true }),
        supabase.from('restaurant_config').select('id').single()
      ]);

      return {
        connected: true,
        menuCount: menuResult.count || 0,
        configExists: !!configResult.data,
        error: menuResult.error?.message || configResult.error?.message
      };
    } catch (err) {
      return { connected: false, menuCount: 0, configExists: false, error: String(err) };
    }
  },

  // --- Auth ---
  login: async (pin: string): Promise<boolean> => {
    try {
      const hashedPin = await hashPin(pin);

      const { data, error } = await supabase
        .from('restaurant_config')
        .select('owner_pin_hash')
        .single();

      if (error || !data) {
        return false;
      }

      if (data.owner_pin_hash === hashedPin) {
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
  getConfig: async (): Promise<RestaurantConfig> => {
    try {
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (error || !data) {
        return {
          name: 'The Burger Lab',
          logo: BURGER_IMAGE,
          accentColor: '#c21e3a',
          reviewUrl: 'google.com/maps/review/gbk-berlin',
          isOpen: true,
        };
      }

      return mapDbConfigToRestaurantConfig(data as DbRestaurantConfig);
    } catch (err) {
      return {
        name: 'The Burger Lab',
        logo: BURGER_IMAGE,
        accentColor: '#c21e3a',
        reviewUrl: 'google.com/maps/review/gbk-berlin',
        isOpen: true,
      };
    }
  },

  updateConfig: async (config: RestaurantConfig): Promise<void> => {
    const { error } = await supabase
      .from('restaurant_config')
      .update(mapRestaurantConfigToDb(config))
      .not('id', 'is', null); // Update all rows (should be single row)

    if (error) {
      throw new Error('Failed to update restaurant configuration');
    }
  },

  // --- Menu ---
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return MOCK_MENU;
      }

      if (!data || data.length === 0) {
        return MOCK_MENU;
      }

      return (data as DbMenuItem[]).map(mapDbMenuItemToMenuItem);
    } catch (err) {
      return MOCK_MENU;
    }
  },

  /**
   * Get menu items with modifier groups pre-joined
   * This fetches items along with their linked modifier groups and modifiers
   */
  getMenuWithModifiers: async (): Promise<MenuItem[]> => {
    try {
      // 1. Fetch all menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (menuError) {
        return api.getMenu();
      }

      if (!menuData || menuData.length === 0) {
        return MOCK_MENU;
      }

      const menuItemIds = menuData.map(item => item.id);

      // 2. Fetch menu_item_modifiers links
      const { data: linksData, error: linksError } = await supabase
        .from('menu_item_modifiers')
        .select('*')
        .in('menu_item_id', menuItemIds);

      if (linksError || !linksData || linksData.length === 0) {
        // No modifiers linked, return basic menu
        return (menuData as DbMenuItem[]).map(mapDbMenuItemToMenuItem);
      }

      // 3. Get unique modifier group IDs
      const groupIds = [...new Set(linksData.map(link => link.modifier_group_id))];

      // 4. Fetch modifier groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('item_modifier_groups')
        .select('*')
        .in('id', groupIds)
        .order('display_order', { ascending: true });

      if (groupsError || !groupsData) {
        return (menuData as DbMenuItem[]).map(mapDbMenuItemToMenuItem);
      }

      // 5. Fetch all modifiers for these groups
      const { data: modifiersData, error: modifiersError } = await supabase
        .from('item_modifiers')
        .select('*')
        .in('group_id', groupIds)
        .order('display_order', { ascending: true });

      if (modifiersError || !modifiersData) {
        return (menuData as DbMenuItem[]).map(mapDbMenuItemToMenuItem);
      }

      // 6. Build modifier groups with their modifiers
      const groupsWithModifiers = new Map<string, ModifierGroup>();
      for (const group of groupsData as DbModifierGroup[]) {
        const groupModifiers = (modifiersData as DbModifier[])
          .filter(m => m.group_id === group.id)
          .map(mapDbModifierToModifier);
        groupsWithModifiers.set(group.id, mapDbModifierGroupToModifierGroup(group, groupModifiers));
      }

      // 7. Build links map: menu_item_id -> modifier_group_ids
      const itemToGroupIds = new Map<string, string[]>();
      for (const link of linksData) {
        const existing = itemToGroupIds.get(link.menu_item_id) || [];
        itemToGroupIds.set(link.menu_item_id, [...existing, link.modifier_group_id]);
      }

      // 8. Map menu items with their modifier groups
      return (menuData as DbMenuItem[]).map(dbItem => {
        const menuItem = mapDbMenuItemToMenuItem(dbItem);
        const linkedGroupIds = itemToGroupIds.get(dbItem.id) || [];
        const modifierGroups = linkedGroupIds
          .map(gid => groupsWithModifiers.get(gid))
          .filter((g): g is ModifierGroup => g !== undefined)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        return {
          ...menuItem,
          modifierGroups: modifierGroups.length > 0 ? modifierGroups : undefined,
        };
      });
    } catch (err) {
      return api.getMenu();
    }
  },

  updateMenu: async (menu: MenuItem[]): Promise<void> => {
    // First, get existing item IDs
    const { data: existingItems } = await supabase
      .from('menu_items')
      .select('id');

    const existingIds = new Set((existingItems || []).map(item => item.id));
    const newIds = new Set(menu.map(item => item.id));

    // Delete items that are no longer in the menu
    const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
    if (idsToDelete.length > 0) {
      await supabase
        .from('menu_items')
        .delete()
        .in('id', idsToDelete);
    }

    // Upsert all items with display_order
    const itemsWithOrder = menu.map((item, index) => ({
      ...mapMenuItemToDb(item),
      display_order: index,
    }));

    const { error } = await supabase
      .from('menu_items')
      .upsert(itemsWithOrder, { onConflict: 'id' });

    if (error) {
      throw new Error('Failed to update menu');
    }
  },

  // --- Asset Upload ---
  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (error) {
      throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // --- Orders ---
  getOrders: async (): Promise<TableOrder[]> => {
    try {
      // Fetch all non-served orders with their items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'confirmed', 'cooking', 'served'])
        .order('created_at', { ascending: false });

      if (ordersError || !orders) {
        return [];
      }

      if (orders.length === 0) {
        return [];
      }

      // Fetch all order items for these orders
      const orderIds = orders.map(o => o.id);
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        return [];
      }

      // Group items by order_id
      const itemsByOrderId = (orderItems || []).reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      }, {} as Record<string, DbOrderItem[]>);

      // Map to TableOrder
      return orders.map(order =>
        mapDbOrderToTableOrder(order as DbOrder, itemsByOrderId[order.id] || [])
      );
    } catch (err) {
      return [];
    }
  },

  createOrder: async (items: CartItem[]): Promise<TableOrder> => {
    // Generate handshake code using the database function
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_handshake_code');

    let code: string;
    if (codeError || !codeData) {
      // Fallback to client-side generation
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const nums = '123456789';
      code = `${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}.${nums.charAt(Math.floor(Math.random() * nums.length))}${nums.charAt(Math.floor(Math.random() * nums.length))}`;
    } else {
      code = codeData;
    }

    return createOrderWithCode(code, items);
  },

  updateOrderStatus: async (
    orderId: string,
    status: TableOrder['status'],
    tableNumber?: string
  ): Promise<void> => {
    const updateData: Partial<DbOrder> = { status };

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

    if (error) {
      throw new Error('Failed to update order status');
    }
  },

  clearTable: async (tableNumber: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('table_number', tableNumber);

    if (error) {
      throw new Error('Failed to clear table');
    }
  },

  subscribeToOrders: (callback: (orders: TableOrder[]) => void) => {
    // Initial fetch
    api.getOrders().then(callback);

    // Real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const orders = await api.getOrders();
          callback(orders);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const orders = await api.getOrders();
          callback(orders);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// Helper function to create order with a given code
async function createOrderWithCode(code: string, items: CartItem[]): Promise<TableOrder> {
  // Insert the order
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: code,
      status: 'pending',
    });

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message || orderError.code}`);
  }

  // Insert order items with modifiers
  const orderItems = items.map(item => ({
    order_id: code,
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    notes: item.notes ?? null,
    modifiers: item.selectedModifiers.map(mapSelectedModifierToDb),
    modifiers_total: item.modifiersTotal,
    unit_price: item.unitPrice,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (itemsError) {
    // Rollback the order
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
      selectedModifiers: (item.modifiers || []).map(mapDbSelectedModifierToSelectedModifier),
      basePrice: item.unit_price - (item.modifiers_total || 0),
      modifiersTotal: item.modifiers_total || 0,
      unitPrice: item.unit_price || 0,
    })),
    status: 'pending',
    timestamp: Date.now(),
  };
}
