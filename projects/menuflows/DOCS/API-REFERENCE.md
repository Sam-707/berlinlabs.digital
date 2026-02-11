# MenuFlows API Reference

This document provides complete API documentation for all three API modules in MenuFlows.

---

## Overview

MenuFlows has three API layers:

| Module | File | Purpose |
|--------|------|---------|
| **Single-Tenant** | `api.ts` | Legacy single-restaurant API |
| **Multi-Tenant** | `api.multitenant.ts` | Production SaaS API |
| **Admin** | `api.admin.ts` | Platform administration |

All APIs use the Supabase JavaScript client for database operations.

---

## api.ts - Single-Tenant API

This is the original API for single-restaurant deployments. It assumes one restaurant per database.

### Connection & Diagnostics

#### `checkConnection()`

Tests database connectivity and returns diagnostic information.

```typescript
async function checkConnection(): Promise<{
  connected: boolean;
  menuCount: number;
  configExists: boolean;
  error?: string;
}>
```

**Returns:**
- `connected`: Whether database is reachable
- `menuCount`: Number of menu items in database
- `configExists`: Whether restaurant_config row exists
- `error`: Error message if connection failed

**Example:**
```typescript
const status = await api.checkConnection();
if (!status.connected) {
  console.error('Database error:', status.error);
}
```

---

### Authentication

#### `login(pin)`

Authenticates restaurant owner with 4-digit PIN.

```typescript
async function login(pin: string): Promise<boolean>
```

**Parameters:**
- `pin`: 4-digit PIN string (e.g., "1234")

**Returns:** `true` if authentication succeeded

**Process:**
1. Hash PIN with SHA-256
2. Compare against `restaurant_config.owner_pin_hash`
3. Set session in sessionStorage

---

#### `logout()`

Clears owner session.

```typescript
function logout(): void
```

---

#### `isAuthenticated()`

Checks if owner is currently logged in.

```typescript
function isAuthenticated(): boolean
```

---

### Restaurant Configuration

#### `getConfig()`

Retrieves restaurant configuration.

```typescript
async function getConfig(): Promise<RestaurantConfig | null>
```

**Returns:**
```typescript
interface RestaurantConfig {
  name: string;
  logo: string;
  accentColor: string;
  reviewUrl: string;
  isOpen: boolean;
}
```

---

#### `updateConfig(config)`

Updates restaurant configuration.

```typescript
async function updateConfig(config: RestaurantConfig): Promise<void>
```

**Parameters:**
- `config`: Full RestaurantConfig object

---

### Menu Management

#### `getMenu()`

Retrieves all menu items.

```typescript
async function getMenu(): Promise<MenuItem[]>
```

**Returns:** Array of menu items, sorted by `display_order`

---

#### `getMenuWithModifiers()`

Retrieves menu items with their modifier groups pre-joined.

```typescript
async function getMenuWithModifiers(): Promise<MenuItem[]>
```

**Returns:** Menu items with `modifierGroups` populated

**Query joins:**
- `menu_items` → `menu_item_modifiers` → `item_modifier_groups` → `item_modifiers`

---

#### `updateMenu(menu)`

Upserts menu items (insert or update).

```typescript
async function updateMenu(menu: MenuItem[]): Promise<void>
```

**Parameters:**
- `menu`: Array of MenuItem objects

**Behavior:**
- Existing items (matching ID) are updated
- New items are inserted
- Items not in array are NOT deleted

---

### Image Upload

#### `uploadImage(file)`

Uploads an image to Supabase Storage.

```typescript
async function uploadImage(file: File): Promise<string>
```

**Parameters:**
- `file`: File object from input element

**Returns:** Public URL of uploaded image

**Storage path:** `menu-images/{timestamp}-{filename}`

---

### Order Management

#### `getOrders()`

Retrieves all non-served orders.

```typescript
async function getOrders(): Promise<TableOrder[]>
```

**Returns:** Orders with status != 'served', newest first

**Includes:** Joined `order_items` with `menu_item` details

---

#### `createOrder(items)`

Creates a new order with generated handshake code.

```typescript
async function createOrder(items: CartItem[]): Promise<TableOrder>
```

**Parameters:**
- `items`: Array of cart items with modifiers

**Returns:** Created order with handshake code as ID

**Process:**
1. Generate handshake code via RPC or fallback
2. Insert order with status 'pending'
3. Insert order_items with modifier snapshots
4. Return created order

---

#### `updateOrderStatus(orderId, status, tableNumber?)`

Updates order status and optionally assigns table.

```typescript
async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'cooking' | 'served',
  tableNumber?: string
): Promise<void>
```

**Parameters:**
- `orderId`: Handshake code
- `status`: New status
- `tableNumber`: Optional table assignment (for confirmed status)

---

#### `clearTable(tableNumber)`

Deletes all orders for a table.

```typescript
async function clearTable(tableNumber: string): Promise<void>
```

---

### Real-Time Subscriptions

#### `subscribeToOrders(callback)`

Subscribes to real-time order updates.

```typescript
function subscribeToOrders(
  callback: (orders: TableOrder[]) => void
): () => void
```

**Parameters:**
- `callback`: Function called with updated orders array

**Returns:** Unsubscribe function

**Events:** INSERT, UPDATE, DELETE on `orders` table

---

## api.multitenant.ts - Multi-Tenant API

Production API with restaurant isolation. All methods are scoped to current restaurant context.

### Restaurant Context

#### `initializeRestaurant(slug?)`

Loads restaurant by URL slug and sets context.

```typescript
async function initializeRestaurant(slug?: string): Promise<DbRestaurant | null>
```

**Parameters:**
- `slug`: URL slug (e.g., "burger-lab-berlin"). Auto-detected from URL if not provided.

**Returns:** Restaurant record or null if not found/suspended

**Process:**
1. Extract slug from URL path
2. Query `restaurants` table by slug
3. Validate `subscription_status != 'suspended'`
4. Store context in sessionStorage
5. Return restaurant data

---

#### `getCurrentRestaurantId()`

Gets current restaurant ID from session.

```typescript
function getCurrentRestaurantId(): string | null
```

---

### Authentication

Same interface as single-tenant, but checks `restaurant_staff` table:

```typescript
async function login(pin: string): Promise<boolean>
```

**Query:**
```sql
SELECT * FROM restaurant_staff
WHERE restaurant_id = ?
  AND pin_hash = ?
  AND is_active = true
```

---

### All Other Methods

Multi-tenant versions of all single-tenant methods with automatic `restaurant_id` scoping:

- `getConfig()` → Queries `restaurants` table
- `updateConfig(config)` → Updates current restaurant
- `getMenu()` → Filters by `restaurant_id`
- `getOrders()` → Filters by `restaurant_id`
- `createOrder(items)` → Includes `restaurant_id`
- `subscribeToOrders(callback)` → Filters subscription

---

## api.admin.ts - Platform Admin API

Cross-tenant API for platform administrators.

### Authentication

#### `login(email, password)`

Authenticates platform admin.

```typescript
async function login(email: string, password: string): Promise<boolean>
```

**Parameters:**
- `email`: Admin email address
- `password`: Admin password

**Query:**
```sql
SELECT * FROM platform_admins
WHERE email = ?
  AND password_hash = ?
  AND is_active = true
```

---

#### `logout()` / `isAuthenticated()`

Same interface as other APIs.

---

### Platform Statistics

#### `getStats()`

Retrieves platform-wide statistics.

```typescript
async function getStats(): Promise<PlatformStats>
```

**Returns:**
```typescript
interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrdersToday: number;
  totalRevenue: number;
}
```

---

### Restaurant Management

#### `getAllRestaurants()`

Lists all restaurants with statistics.

```typescript
async function getAllRestaurants(): Promise<RestaurantWithStats[]>
```

**Returns:**
```typescript
interface RestaurantWithStats extends DbRestaurant {
  order_count?: number;
  staff_count?: number;
}
```

---

#### `createRestaurant(data)`

Creates a new restaurant tenant.

```typescript
async function createRestaurant(data: CreateRestaurantData): Promise<{
  restaurant: DbRestaurant | null;
  error?: string;
}>
```

**Parameters:**
```typescript
interface CreateRestaurantData {
  name: string;
  slug: string;
  accentColor: string;
  businessType: string;
  ownerPin?: string;  // Creates owner staff member if provided
}
```

**Process:**
1. Insert restaurant record
2. If `ownerPin` provided, create staff member with role 'owner'
3. Return created restaurant

---

#### `updateRestaurant(id, updates)`

Updates restaurant details.

```typescript
async function updateRestaurant(
  id: string,
  updates: Partial<DbRestaurant>
): Promise<boolean>
```

---

#### `deleteRestaurant(id)`

Soft-deletes restaurant (sets status to suspended).

```typescript
async function deleteRestaurant(id: string): Promise<boolean>
```

---

### Menu Management (Admin)

#### `getRestaurantMenu(restaurantId)`

Gets menu for any restaurant.

```typescript
async function getRestaurantMenu(restaurantId: string): Promise<MenuItem[]>
```

---

#### `importMenuForRestaurant(restaurantId, items)`

Bulk imports menu items.

```typescript
async function importMenuForRestaurant(
  restaurantId: string,
  items: MenuItem[]
): Promise<{ success: boolean; error?: string }>
```

---

#### `addMenuItem(restaurantId, item)`

Adds single menu item.

```typescript
async function addMenuItem(
  restaurantId: string,
  item: MenuItem
): Promise<{ item: MenuItem | null; error?: string }>
```

---

#### `deleteMenuItem(restaurantId, itemId)`

Deletes menu item.

```typescript
async function deleteMenuItem(
  restaurantId: string,
  itemId: string
): Promise<boolean>
```

---

#### `clearRestaurantMenu(restaurantId)`

Deletes all menu items for restaurant.

```typescript
async function clearRestaurantMenu(restaurantId: string): Promise<boolean>
```

---

### Modifier Group Management

#### `getModifierGroups(restaurantId)`

Gets all modifier groups for restaurant.

```typescript
async function getModifierGroups(restaurantId: string): Promise<ModifierGroup[]>
```

**Returns:** Groups with nested `modifiers` array

---

#### `createModifierGroup(restaurantId, group)`

Creates modifier group.

```typescript
async function createModifierGroup(
  restaurantId: string,
  group: Omit<ModifierGroup, 'id' | 'modifiers'>
): Promise<{ group: ModifierGroup | null; error?: string }>
```

**Parameters:**
```typescript
{
  name: string;
  nameTranslated?: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  displayOrder: number;
}
```

---

#### `updateModifierGroup(groupId, updates)`

Updates modifier group.

```typescript
async function updateModifierGroup(
  groupId: string,
  updates: Partial<Omit<ModifierGroup, 'id' | 'modifiers'>>
): Promise<boolean>
```

---

#### `deleteModifierGroup(groupId)`

Deletes modifier group and all its modifiers.

```typescript
async function deleteModifierGroup(groupId: string): Promise<boolean>
```

---

### Modifier Management

#### `addModifier(groupId, modifier)`

Adds modifier to group.

```typescript
async function addModifier(
  groupId: string,
  modifier: Omit<Modifier, 'id'>
): Promise<{ modifier: Modifier | null; error?: string }>
```

**Parameters:**
```typescript
{
  name: string;
  nameTranslated?: string;
  priceAdjustment: number;
  isAvailable: boolean;
  isDefault: boolean;
  displayOrder: number;
}
```

---

#### `updateModifier(modifierId, updates)`

Updates modifier.

```typescript
async function updateModifier(
  modifierId: string,
  updates: Partial<Omit<Modifier, 'id'>>
): Promise<boolean>
```

---

#### `deleteModifier(modifierId)`

Deletes modifier.

```typescript
async function deleteModifier(modifierId: string): Promise<boolean>
```

---

### Menu Item ↔ Modifier Group Links

#### `getMenuItemModifierGroups(menuItemId)`

Gets linked modifier group IDs.

```typescript
async function getMenuItemModifierGroups(menuItemId: string): Promise<string[]>
```

---

#### `linkModifierGroupToItem(menuItemId, groupId)`

Links modifier group to menu item.

```typescript
async function linkModifierGroupToItem(
  menuItemId: string,
  groupId: string
): Promise<boolean>
```

---

#### `unlinkModifierGroupFromItem(menuItemId, groupId)`

Removes link between menu item and modifier group.

```typescript
async function unlinkModifierGroupFromItem(
  menuItemId: string,
  groupId: string
): Promise<boolean>
```

---

#### `setMenuItemModifierGroups(menuItemId, groupIds)`

Replaces all modifier group links for menu item.

```typescript
async function setMenuItemModifierGroups(
  menuItemId: string,
  groupIds: string[]
): Promise<boolean>
```

---

### Template Import

#### `importModifierTemplates(restaurantId, groups)`

Bulk imports modifier groups with modifiers.

```typescript
async function importModifierTemplates(
  restaurantId: string,
  groups: ModifierGroup[]
): Promise<{ success: boolean; error?: string }>
```

---

## Type Definitions

### Core Types

```typescript
interface MenuItem {
  id: string;
  name: string;
  translatedName?: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isSpicy?: boolean;
  containsPeanuts?: boolean;
  allergens?: string[];
  additives?: string[];
  modifierGroups?: ModifierGroup[];
}

interface ModifierGroup {
  id: string;
  name: string;
  nameTranslated?: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  displayOrder: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  nameTranslated?: string;
  priceAdjustment: number;
  isAvailable: boolean;
  isDefault: boolean;
  displayOrder: number;
}

interface SelectedModifier {
  groupId: string;
  groupName: string;
  modifierId: string;
  modifierName: string;
  priceAdjustment: number;
}

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  selectedModifiers: SelectedModifier[];
  basePrice: number;
  modifiersTotal: number;
  unitPrice: number;
}

interface TableOrder {
  id: string;  // Handshake code
  tableNumber?: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'cooking' | 'served';
  timestamp: number;
}

interface RestaurantConfig {
  name: string;
  logo: string;
  accentColor: string;
  reviewUrl: string;
  isOpen: boolean;
}
```

---

## Error Handling

All API methods handle errors internally and log to console:

```typescript
const { data, error } = await supabase.from('table').select();

if (error) {
  console.error('API Error:', error.message);
  return null;  // or empty array, or false
}

return data;
```

For user-facing errors, check return values:

```typescript
const success = await api.login(pin);
if (!success) {
  showError('Invalid PIN');
}
```

---

*See also: [ARCHITECTURE.md](./ARCHITECTURE.md) | [DATABASE.md](./DATABASE.md)*
