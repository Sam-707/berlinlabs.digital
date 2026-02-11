import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// Client for general app operations (customer-facing, respects RLS)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Client for owner operations (bypasses RLS for trusted owner operations)
// WARNING: Only use for authenticated owner operations (menu updates, config changes)
export const ownerSupabase = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

if (!ownerSupabase) {
  console.warn('Owner Supabase client not configured. Please set VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local for owner operations to work properly.');
}

// Owner session helpers
const OWNER_SESSION_KEY = 'menuflows_owner_session';

export const setOwnerSession = (authenticated: boolean) => {
  if (authenticated) {
    sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(OWNER_SESSION_KEY);
  }
};

export const isOwnerAuthenticated = (): boolean => {
  return sessionStorage.getItem(OWNER_SESSION_KEY) === 'true';
};

// PIN hashing using Web Crypto API
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Restaurant slug from URL path
// URL format: menuflows.app/burgerlab or localhost:3001/burgerlab
export function getRestaurantSlug(): string | null {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);

  // First segment is the restaurant slug (if not a system route)
  const systemRoutes = ['admin', 'login', 'signup', 'dashboard', 'api'];
  if (segments.length > 0 && !systemRoutes.includes(segments[0])) {
    return segments[0];
  }

  // Fallback: check query param for development
  const params = new URLSearchParams(window.location.search);
  return params.get('restaurant') || null;
}

// Admin session helpers
const ADMIN_SESSION_KEY = 'menuflows_admin_session';

export const setAdminSession = (authenticated: boolean) => {
  if (authenticated) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

// Get current restaurant ID from session
const RESTAURANT_SESSION_KEY = 'menuflows_current_restaurant';

export function setCurrentRestaurant(restaurantId: string, slug: string) {
  sessionStorage.setItem(RESTAURANT_SESSION_KEY, JSON.stringify({ id: restaurantId, slug }));
}

export function getCurrentRestaurant(): { id: string; slug: string } | null {
  const data = sessionStorage.getItem(RESTAURANT_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Database row types (snake_case from Supabase)

// Multi-tenant restaurant type
export interface DbRestaurant {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  logo_url: string;
  accent_color: string;
  cover_image_url: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string;
  is_open: boolean;
  currency: string;
  google_review_url: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

// Legacy single-tenant config (for backwards compatibility)
export interface DbRestaurantConfig {
  id: string;
  name: string;
  logo: string;
  accent_color: string;
  review_url: string;
  is_open: boolean;
  owner_pin_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DbMenuItem {
  id: string;
  name: string;
  translated_name: string | null;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  is_spicy: boolean | null;
  contains_peanuts: boolean | null;
  allergens: string[];
  additives: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  table_number: string | null;
  status: 'pending' | 'confirmed' | 'cooking' | 'served';
  created_at: string;
  confirmed_at: string | null;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  notes: string | null;
  modifiers: DbSelectedModifier[];  // JSONB array of selected modifiers
  modifiers_total: number;          // Sum of modifier adjustments
  unit_price: number;               // Base price + modifiers_total
  created_at: string;
}

// Selected modifier stored in order_items.modifiers JSONB
export interface DbSelectedModifier {
  group_id: string;
  group_name: string;
  modifier_id: string;
  modifier_name: string;
  price_adjustment: number;
}

// Platform admin type
export interface DbPlatformAdmin {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'super_admin' | 'support' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Modifier group type (e.g., "Size", "Extras", "Sauce")
export interface DbModifierGroup {
  id: string;
  restaurant_id: string;
  name: string;
  name_translated: string | null;
  min_selections: number;  // 0 = optional
  max_selections: number;  // 1 = single choice, N = multi-select
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Individual modifier type (e.g., "Large", "Extra Cheese")
export interface DbModifier {
  id: string;
  group_id: string;
  name: string;
  name_translated: string | null;
  price_adjustment: number;  // Can be negative for discounts
  is_available: boolean;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Link modifier groups to menu items (many-to-many)
export interface DbMenuItemModifier {
  menu_item_id: string;
  modifier_group_id: string;
  created_at: string;
}
