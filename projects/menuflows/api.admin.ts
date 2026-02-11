import {
  supabase,
  hashPin,
  setAdminSession,
  isAdminAuthenticated,
  DbRestaurant,
  DbPlatformAdmin,
  DbMenuItem,
  DbModifierGroup,
  DbModifier,
} from './lib/supabase';
import { MenuItem, ModifierGroup, Modifier } from './types';

/**
 * PLATFORM ADMIN API
 * For cross-tenant platform management
 */

export interface RestaurantWithStats extends DbRestaurant {
  order_count?: number;
  staff_count?: number;
}

export interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrdersToday: number;
  totalRevenue: number;
}

export interface CreateRestaurantData {
  name: string;
  slug: string;
  accentColor: string;
  businessType: string;
  ownerPin?: string;
}

export const adminApi = {
  // --- Authentication ---

  /**
   * Authenticate platform admin with email/password
   */
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const hashedPassword = await hashPin(password);

      const { data, error } = await supabase
        .from('platform_admins')
        .select('id, role, is_active')
        .eq('email', email.toLowerCase().trim())
        .eq('password_hash', hashedPassword)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      setAdminSession(true);
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Log out admin
   */
  logout: async (): Promise<void> => {
    setAdminSession(false);
  },

  /**
   * Check if admin is authenticated
   */
  isAuthenticated: (): boolean => {
    return isAdminAuthenticated();
  },

  // --- Platform Stats ---

  /**
   * Get platform-wide statistics
   */
  getStats: async (): Promise<PlatformStats> => {
    try {
      // Get restaurant counts
      const { count: totalRestaurants } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });

      const { count: activeRestaurants } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const { count: totalOrdersToday } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayIso);

      // For revenue, we'd need to join with order_items and menu_items
      // Simplified: just return 0 for now
      const totalRevenue = 0;

      return {
        totalRestaurants: totalRestaurants || 0,
        activeRestaurants: activeRestaurants || 0,
        totalOrdersToday: totalOrdersToday || 0,
        totalRevenue,
      };
    } catch (err) {
      return {
        totalRestaurants: 0,
        activeRestaurants: 0,
        totalOrdersToday: 0,
        totalRevenue: 0,
      };
    }
  },

  // --- Restaurant Management ---

  /**
   * Get all restaurants with basic stats
   */
  getAllRestaurants: async (): Promise<RestaurantWithStats[]> => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return (data || []) as RestaurantWithStats[];
    } catch (err) {
      return [];
    }
  },

  /**
   * Create a new restaurant with default owner staff
   */
  createRestaurant: async (data: CreateRestaurantData): Promise<{ restaurant: DbRestaurant | null; error: string | null }> => {
    try {
      // Generate a unique ID for the restaurant
      const restaurantId = crypto.randomUUID();

      // Insert restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          id: restaurantId,
          name: data.name,
          slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          business_type: data.businessType || 'restaurant',
          accent_color: data.accentColor || '#c21e3a',
          logo_url: '',
          country: 'DE',
          currency: 'EUR',
          is_open: true,
          subscription_plan: 'trial',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (restaurantError || !restaurant) {
        const errorMsg = restaurantError?.message || 'Unknown error creating restaurant';
        return { restaurant: null, error: errorMsg };
      }

      // Create default owner staff member with PIN
      const defaultPin = data.ownerPin || '1234';
      const hashedPin = await hashPin(defaultPin);

      const { error: staffError } = await supabase
        .from('restaurant_staff')
        .insert({
          restaurant_id: restaurantId,
          name: 'Owner',
          role: 'owner',
          pin_hash: hashedPin,
          is_active: true,
        });

      // Staff creation is non-critical - continue if it fails

      return { restaurant: restaurant as DbRestaurant, error: null };
    } catch (err) {
      return { restaurant: null, error: String(err) };
    }
  },

  /**
   * Update a restaurant's details
   */
  updateRestaurant: async (id: string, updates: Partial<DbRestaurant>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Delete a restaurant (soft delete by setting status)
   */
  deleteRestaurant: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ subscription_status: 'cancelled' })
        .eq('id', id);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  // --- Menu Management ---

  /**
   * Get menu items for a restaurant
   */
  getRestaurantMenu: async (restaurantId: string): Promise<MenuItem[]> => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        return [];
      }

      // Convert DbMenuItem to MenuItem
      return (data || []).map((item: DbMenuItem) => ({
        id: item.id,
        name: item.name,
        translatedName: item.translated_name || undefined,
        description: item.description,
        price: item.price,
        image: item.image_url,
        category: item.category,
        isAvailable: item.is_available,
        isSpicy: item.is_spicy || false,
        containsPeanuts: item.contains_peanuts || false,
        allergens: item.allergens || [],
        additives: item.additives || [],
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Import menu items for a restaurant (bulk insert)
   */
  importMenuForRestaurant: async (restaurantId: string, items: MenuItem[]): Promise<{ success: boolean; error?: string }> => {
    try {
      // Convert MenuItem[] to database format
      const dbItems = items.map((item, index) => ({
        id: item.id || crypto.randomUUID(),
        restaurant_id: restaurantId,
        name: item.name,
        translated_name: item.translatedName || null,
        description: item.description || '',
        price: item.price,
        image_url: item.image || '',
        category: item.category || 'Mains',
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy || false,
        contains_peanuts: item.containsPeanuts || false,
        allergens: item.allergens || [],
        additives: item.additives || [],
        display_order: index,
      }));

      const { error } = await supabase
        .from('menu_items')
        .insert(dbItems);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Add a single menu item to a restaurant
   */
  addMenuItem: async (restaurantId: string, item: Omit<MenuItem, 'id'>): Promise<{ item: MenuItem | null; error?: string }> => {
    try {
      const id = crypto.randomUUID();
      const dbItem = {
        id,
        restaurant_id: restaurantId,
        name: item.name,
        translated_name: item.translatedName || null,
        description: item.description || '',
        price: item.price,
        image_url: item.image || '',
        category: item.category || 'Mains',
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy || false,
        contains_peanuts: item.containsPeanuts || false,
        allergens: item.allergens || [],
        additives: item.additives || [],
        display_order: 0,
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert(dbItem)
        .select()
        .single();

      if (error) {
        return { item: null, error: error.message };
      }

      return {
        item: {
          id: data.id,
          name: data.name,
          translatedName: data.translated_name || undefined,
          description: data.description,
          price: data.price,
          image: data.image_url,
          category: data.category,
          isAvailable: data.is_available,
          isSpicy: data.is_spicy || false,
          containsPeanuts: data.contains_peanuts || false,
          allergens: data.allergens || [],
          additives: data.additives || [],
        },
      };
    } catch (err) {
      return { item: null, error: String(err) };
    }
  },

  /**
   * Delete a menu item
   */
  deleteMenuItem: async (restaurantId: string, itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)
        .eq('restaurant_id', restaurantId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Clear all menu items for a restaurant
   */
  clearRestaurantMenu: async (restaurantId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  // --- Modifier Group Management ---

  /**
   * Get all modifier groups for a restaurant
   */
  getModifierGroups: async (restaurantId: string): Promise<ModifierGroup[]> => {
    try {
      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('item_modifier_groups')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (groupsError || !groupsData) {
        return [];
      }

      if (groupsData.length === 0) {
        return [];
      }

      // Fetch modifiers for all groups
      const groupIds = groupsData.map(g => g.id);
      const { data: modifiersData, error: modifiersError } = await supabase
        .from('item_modifiers')
        .select('*')
        .in('group_id', groupIds)
        .order('display_order', { ascending: true });


      // Map modifiers to groups
      const modifiersByGroupId = new Map<string, Modifier[]>();
      for (const mod of modifiersData || []) {
        const existing = modifiersByGroupId.get(mod.group_id) || [];
        modifiersByGroupId.set(mod.group_id, [...existing, {
          id: mod.id,
          name: mod.name,
          nameTranslated: mod.name_translated || undefined,
          priceAdjustment: mod.price_adjustment,
          isAvailable: mod.is_available,
          isDefault: mod.is_default,
          displayOrder: mod.display_order,
        }]);
      }

      return groupsData.map((group: DbModifierGroup) => ({
        id: group.id,
        name: group.name,
        nameTranslated: group.name_translated || undefined,
        minSelections: group.min_selections,
        maxSelections: group.max_selections,
        isRequired: group.is_required,
        displayOrder: group.display_order,
        modifiers: (modifiersByGroupId.get(group.id) || []).sort((a, b) => a.displayOrder - b.displayOrder),
      }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Create a new modifier group
   */
  createModifierGroup: async (
    restaurantId: string,
    group: Omit<ModifierGroup, 'id' | 'modifiers'>
  ): Promise<{ group: ModifierGroup | null; error?: string }> => {
    try {
      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from('item_modifier_groups')
        .insert({
          id,
          restaurant_id: restaurantId,
          name: group.name,
          name_translated: group.nameTranslated || null,
          min_selections: group.minSelections,
          max_selections: group.maxSelections,
          is_required: group.isRequired,
          display_order: group.displayOrder,
        })
        .select()
        .single();

      if (error) {
        return { group: null, error: error.message };
      }

      return {
        group: {
          id: data.id,
          name: data.name,
          nameTranslated: data.name_translated || undefined,
          minSelections: data.min_selections,
          maxSelections: data.max_selections,
          isRequired: data.is_required,
          displayOrder: data.display_order,
          modifiers: [],
        },
      };
    } catch (err) {
      return { group: null, error: String(err) };
    }
  },

  /**
   * Update a modifier group
   */
  updateModifierGroup: async (
    groupId: string,
    updates: Partial<Omit<ModifierGroup, 'id' | 'modifiers'>>
  ): Promise<boolean> => {
    try {
      const dbUpdates: Partial<DbModifierGroup> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.nameTranslated !== undefined) dbUpdates.name_translated = updates.nameTranslated || null;
      if (updates.minSelections !== undefined) dbUpdates.min_selections = updates.minSelections;
      if (updates.maxSelections !== undefined) dbUpdates.max_selections = updates.maxSelections;
      if (updates.isRequired !== undefined) dbUpdates.is_required = updates.isRequired;
      if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

      const { error } = await supabase
        .from('item_modifier_groups')
        .update(dbUpdates)
        .eq('id', groupId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Delete a modifier group and all its modifiers
   */
  deleteModifierGroup: async (groupId: string): Promise<boolean> => {
    try {
      // Delete modifiers first (cascade should handle this, but being explicit)
      await supabase
        .from('item_modifiers')
        .delete()
        .eq('group_id', groupId);

      // Delete links to menu items
      await supabase
        .from('menu_item_modifiers')
        .delete()
        .eq('modifier_group_id', groupId);

      // Delete the group
      const { error } = await supabase
        .from('item_modifier_groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  // --- Modifier Management ---

  /**
   * Add a modifier to a group
   */
  addModifier: async (
    groupId: string,
    modifier: Omit<Modifier, 'id'>
  ): Promise<{ modifier: Modifier | null; error?: string }> => {
    try {
      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from('item_modifiers')
        .insert({
          id,
          group_id: groupId,
          name: modifier.name,
          name_translated: modifier.nameTranslated || null,
          price_adjustment: modifier.priceAdjustment,
          is_available: modifier.isAvailable,
          is_default: modifier.isDefault,
          display_order: modifier.displayOrder,
        })
        .select()
        .single();

      if (error) {
        return { modifier: null, error: error.message };
      }

      return {
        modifier: {
          id: data.id,
          name: data.name,
          nameTranslated: data.name_translated || undefined,
          priceAdjustment: data.price_adjustment,
          isAvailable: data.is_available,
          isDefault: data.is_default,
          displayOrder: data.display_order,
        },
      };
    } catch (err) {
      return { modifier: null, error: String(err) };
    }
  },

  /**
   * Update a modifier
   */
  updateModifier: async (
    modifierId: string,
    updates: Partial<Omit<Modifier, 'id'>>
  ): Promise<boolean> => {
    try {
      const dbUpdates: Partial<DbModifier> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.nameTranslated !== undefined) dbUpdates.name_translated = updates.nameTranslated || null;
      if (updates.priceAdjustment !== undefined) dbUpdates.price_adjustment = updates.priceAdjustment;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;
      if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

      const { error } = await supabase
        .from('item_modifiers')
        .update(dbUpdates)
        .eq('id', modifierId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Delete a modifier
   */
  deleteModifier: async (modifierId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('item_modifiers')
        .delete()
        .eq('id', modifierId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  // --- Menu Item Modifier Links ---

  /**
   * Get modifier group IDs linked to a menu item
   */
  getMenuItemModifierGroups: async (menuItemId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('menu_item_modifiers')
        .select('modifier_group_id')
        .eq('menu_item_id', menuItemId);

      if (error) {
        return [];
      }

      return (data || []).map(row => row.modifier_group_id);
    } catch (err) {
      return [];
    }
  },

  /**
   * Link a modifier group to a menu item
   */
  linkModifierGroupToItem: async (menuItemId: string, modifierGroupId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menu_item_modifiers')
        .insert({
          menu_item_id: menuItemId,
          modifier_group_id: modifierGroupId,
        });

      if (error) {
        // Ignore duplicate key errors
        if (error.code === '23505') {
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Unlink a modifier group from a menu item
   */
  unlinkModifierGroupFromItem: async (menuItemId: string, modifierGroupId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menu_item_modifiers')
        .delete()
        .eq('menu_item_id', menuItemId)
        .eq('modifier_group_id', modifierGroupId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Set all modifier groups for a menu item (replace existing links)
   */
  setMenuItemModifierGroups: async (menuItemId: string, modifierGroupIds: string[]): Promise<boolean> => {
    try {
      // Delete existing links
      await supabase
        .from('menu_item_modifiers')
        .delete()
        .eq('menu_item_id', menuItemId);

      // Insert new links
      if (modifierGroupIds.length > 0) {
        const links = modifierGroupIds.map(groupId => ({
          menu_item_id: menuItemId,
          modifier_group_id: groupId,
        }));

        const { error } = await supabase
          .from('menu_item_modifiers')
          .insert(links);

        if (error) {
          return false;
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Import modifier groups from templates for a restaurant
   */
  importModifierTemplates: async (
    restaurantId: string,
    groups: ModifierGroup[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      for (const group of groups) {
        // Create the group
        const groupId = crypto.randomUUID();
        const { error: groupError } = await supabase
          .from('item_modifier_groups')
          .insert({
            id: groupId,
            restaurant_id: restaurantId,
            name: group.name,
            name_translated: group.nameTranslated || null,
            min_selections: group.minSelections,
            max_selections: group.maxSelections,
            is_required: group.isRequired,
            display_order: group.displayOrder,
          });

        if (groupError) {
          return { success: false, error: groupError.message };
        }

        // Create modifiers for this group
        if (group.modifiers.length > 0) {
          const modifiers = group.modifiers.map(mod => ({
            id: crypto.randomUUID(),
            group_id: groupId,
            name: mod.name,
            name_translated: mod.nameTranslated || null,
            price_adjustment: mod.priceAdjustment,
            is_available: mod.isAvailable,
            is_default: mod.isDefault,
            display_order: mod.displayOrder,
          }));

          const { error: modError } = await supabase
            .from('item_modifiers')
            .insert(modifiers);

          if (modError) {
            return { success: false, error: modError.message };
          }
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
};

export default adminApi;
