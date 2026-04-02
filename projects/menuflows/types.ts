
export type AppView =
  | 'marketing'
  | 'splash'
  | 'menu'
  | 'item-detail'
  | 'cart'
  | 'waiter-handshake'
  | 'order-tracking'
  | 'owner-login'
  | 'owner-dashboard'
  | 'owner-inventory'
  | 'owner-menu-import'
  | 'owner-branding'
  | 'owner-pending-orders'
  | 'owner-table-grid'
  | 'owner-order-entry'
  | 'owner-kitchen'
  | 'owner-table-map'
  | 'owner-table-qr-generator'
  | 'waiter-ready-orders'
  | 'admin-login'
  | 'admin-dashboard'
  | 'privacy'
  | 'terms';

// Toast system types
export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

// Modifier system types
export interface Modifier {
  id: string;
  name: string;
  nameTranslated?: string;
  priceAdjustment: number;  // +2.50, 0, or -1.00 for discounts
  isAvailable: boolean;
  isDefault: boolean;
  displayOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  nameTranslated?: string;
  minSelections: number;  // 0 = optional, 1+ = required
  maxSelections: number;  // 1 = single-select, N = multi-select
  isRequired: boolean;
  displayOrder: number;
  modifiers: Modifier[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  modifierId: string;
  modifierName: string;
  priceAdjustment: number;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  translatedName?: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryId?: string;
  isAvailable: boolean;
  isSpicy?: boolean;
  containsPeanuts?: boolean;
  allergens?: string[];
  additives?: string[];
  modifierGroups?: ModifierGroup[];  // Populated via API join
}

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  selectedModifiers: SelectedModifier[];  // Selected modifier options
  basePrice: number;      // Item's base price
  modifiersTotal: number; // Sum of modifier adjustments
  unitPrice: number;      // basePrice + modifiersTotal
}

export interface RestaurantConfig {
  name: string;
  logo: string;
  accentColor: string;
  reviewUrl: string;
  isOpen: boolean;
}

export interface TableOrder {
  id: string;
  tableNumber?: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'cooking' | 'ready' | 'served';
  timestamp: number;
}

export interface OwnerNotification {
  id: string;
  orderId: string;
  code: string;
  tableNumber?: string;
  status: TableOrder['status'];
  createdAt: number;
}
