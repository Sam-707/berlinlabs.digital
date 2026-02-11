# MenuFlows Database Guide

This document provides a complete reference for the MenuFlows database schema, including table structures, relationships, and PostgreSQL functions.

---

## Overview

MenuFlows uses PostgreSQL via Supabase with two schema options:

| Schema | File | Use Case |
|--------|------|----------|
| **Single-Tenant** | `supabase-schema.sql` | Single restaurant deployment |
| **Multi-Tenant** | `supabase-schema-multitenant.sql` | SaaS platform with multiple restaurants |

---

## Multi-Tenant Schema (Production)

### Entity Relationship Diagram

```
┌─────────────────────┐
│   platform_admins   │
└─────────────────────┘

┌─────────────────────┐
│     restaurants     │ (Tenant)
└──────────┬──────────┘
           │
     ┌─────┴─────┬──────────────┬──────────────┬──────────────┐
     │           │              │              │              │
     ▼           ▼              ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐
│  staff  │ │  menu   │ │  modifier  │ │   tables   │ │ orders  │
└─────────┘ │ items   │ │  groups    │ └────────────┘ └────┬────┘
            └────┬────┘ └─────┬──────┘                     │
                 │            │                            ▼
                 │            ▼                      ┌───────────┐
                 │      ┌───────────┐                │  order    │
                 │      │ modifiers │                │  items    │
                 │      └───────────┘                └───────────┘
                 │
                 ▼
          ┌─────────────────────┐
          │ menu_item_modifiers │ (Link Table)
          └─────────────────────┘
```

---

## Tables Reference

### platform_admins

Platform-level administrators who manage all restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt/SHA-256 hash |
| `role` | VARCHAR(50) | DEFAULT 'admin' | admin, super_admin, support |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |

**Indexes:**
- `idx_platform_admins_email` on `email`

---

### restaurants

Restaurant tenants (main entity for multi-tenancy).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Restaurant name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug (e.g., "burger-lab-berlin") |
| `business_type` | ENUM | DEFAULT 'restaurant' | restaurant, cafe, bar, bakery, food_truck, ghost_kitchen, hotel_restaurant, catering |
| `logo_url` | TEXT | | Logo image URL |
| `cover_image_url` | TEXT | | Cover/banner image URL |
| `accent_color` | VARCHAR(7) | DEFAULT '#10B981' | Brand color (hex) |
| `email` | VARCHAR(255) | | Contact email |
| `phone` | VARCHAR(50) | | Contact phone |
| `website` | VARCHAR(255) | | Website URL |
| `address_line1` | VARCHAR(255) | | Street address |
| `address_line2` | VARCHAR(255) | | Address line 2 |
| `city` | VARCHAR(100) | | City |
| `postal_code` | VARCHAR(20) | | Postal/ZIP code |
| `country` | VARCHAR(100) | DEFAULT 'Germany' | Country |
| `is_open` | BOOLEAN | DEFAULT true | Operating status |
| `timezone` | VARCHAR(50) | DEFAULT 'Europe/Berlin' | Timezone |
| `currency` | VARCHAR(3) | DEFAULT 'EUR' | Currency code |
| `tax_rate` | DECIMAL(5,2) | DEFAULT 19.00 | Tax rate (German VAT) |
| `google_review_url` | TEXT | | Google Maps review link |
| `tripadvisor_url` | TEXT | | TripAdvisor link |
| `instagram_handle` | VARCHAR(100) | | Instagram username |
| `subscription_plan` | ENUM | DEFAULT 'trial' | trial, starter, professional, enterprise |
| `subscription_status` | ENUM | DEFAULT 'trial' | trial, active, past_due, cancelled, suspended |
| `trial_ends_at` | TIMESTAMPTZ | | Trial expiration (14 days from creation) |
| `subscription_ends_at` | TIMESTAMPTZ | | Subscription expiration |
| `stripe_customer_id` | VARCHAR(255) | | Stripe customer ID |
| `onboarded_by` | UUID | FK → platform_admins | Admin who created this restaurant |
| `onboarding_completed` | BOOLEAN | DEFAULT false | Onboarding wizard completed |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_restaurants_slug` on `slug`
- `idx_restaurants_subscription_status` on `subscription_status`

**Enums:**
```sql
CREATE TYPE business_type AS ENUM (
  'restaurant', 'cafe', 'bar', 'bakery',
  'food_truck', 'ghost_kitchen', 'hotel_restaurant', 'catering'
);

CREATE TYPE subscription_plan AS ENUM (
  'trial', 'starter', 'professional', 'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'trial', 'active', 'past_due', 'cancelled', 'suspended'
);
```

---

### restaurant_staff

Staff members who can access the owner dashboard.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `email` | VARCHAR(255) | | Staff email (optional) |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `pin_hash` | VARCHAR(255) | NOT NULL | SHA-256 hash of 4-digit PIN |
| `role` | ENUM | DEFAULT 'waiter' | owner, manager, kitchen, waiter, cashier |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |

**Indexes:**
- `idx_restaurant_staff_restaurant` on `restaurant_id`
- `idx_restaurant_staff_pin` on `restaurant_id, pin_hash`

**Enum:**
```sql
CREATE TYPE staff_role AS ENUM (
  'owner', 'manager', 'kitchen', 'waiter', 'cashier'
);
```

---

### menu_categories

Optional categories for organizing menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `name` | VARCHAR(100) | NOT NULL | Category name |
| `name_translated` | VARCHAR(100) | | Translated name |
| `description` | TEXT | | Category description |
| `icon` | VARCHAR(50) | | Material icon name |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_visible` | BOOLEAN | DEFAULT true | Visibility flag |
| `available_from` | TIME | | Start time (e.g., breakfast 6:00) |
| `available_until` | TIME | | End time (e.g., breakfast 11:00) |
| `available_days` | INTEGER[] | | Days of week (0=Sun, 6=Sat) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### menu_items

Menu items available for ordering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `category_id` | UUID | FK → menu_categories | Category reference (optional) |
| `name` | VARCHAR(255) | NOT NULL | Item name |
| `name_translated` | VARCHAR(255) | | Translated name |
| `description` | TEXT | | Item description |
| `description_translated` | TEXT | | Translated description |
| `price` | DECIMAL(10,2) | NOT NULL | Current price |
| `compare_price` | DECIMAL(10,2) | | Original price (for sales) |
| `cost` | DECIMAL(10,2) | | Cost price (for margin tracking) |
| `image_url` | TEXT | | Main image URL |
| `thumbnail_url` | TEXT | | Thumbnail URL |
| `category` | VARCHAR(100) | | Legacy category string |
| `is_vegetarian` | BOOLEAN | DEFAULT false | Vegetarian flag |
| `is_vegan` | BOOLEAN | DEFAULT false | Vegan flag |
| `is_gluten_free` | BOOLEAN | DEFAULT false | Gluten-free flag |
| `is_spicy` | BOOLEAN | DEFAULT false | Spicy indicator |
| `spice_level` | INTEGER | DEFAULT 0 | Spice level 0-3 |
| `contains_peanuts` | BOOLEAN | DEFAULT false | Peanut allergy warning |
| `contains_alcohol` | BOOLEAN | DEFAULT false | Contains alcohol |
| `allergens` | TEXT[] | | Array of allergens |
| `additives` | TEXT[] | | Array of additives |
| `calories` | INTEGER | | Calorie count |
| `is_available` | BOOLEAN | DEFAULT true | Availability flag |
| `is_featured` | BOOLEAN | DEFAULT false | Featured on menu |
| `is_new` | BOOLEAN | DEFAULT false | New item badge |
| `track_inventory` | BOOLEAN | DEFAULT false | Track stock levels |
| `stock_quantity` | INTEGER | | Current stock |
| `low_stock_threshold` | INTEGER | | Low stock alert level |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `preparation_time` | INTEGER | | Prep time in minutes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_menu_items_restaurant` on `restaurant_id`
- `idx_menu_items_category` on `restaurant_id, category`
- `idx_menu_items_available` on `restaurant_id, is_available`

---

### item_modifier_groups

Groups of modifiers (e.g., "Size", "Extras", "Sauce").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `name` | VARCHAR(100) | NOT NULL | Group name (e.g., "Size") |
| `name_translated` | VARCHAR(100) | | Translated name |
| `min_selections` | INTEGER | DEFAULT 0 | Minimum selections required |
| `max_selections` | INTEGER | DEFAULT 1 | Maximum selections allowed |
| `is_required` | BOOLEAN | DEFAULT false | Must select at least min |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Selection Logic:**
- `min_selections = 0, max_selections = 1` → Optional single-select
- `min_selections = 1, max_selections = 1` → Required single-select (radio)
- `min_selections = 0, max_selections = 5` → Optional multi-select (0-5 choices)
- `min_selections = 1, max_selections = 3` → Required multi-select (1-3 choices)

---

### item_modifiers

Individual modifier options within a group.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `group_id` | UUID | FK → item_modifier_groups, NOT NULL | Parent group |
| `name` | VARCHAR(100) | NOT NULL | Modifier name (e.g., "Large") |
| `name_translated` | VARCHAR(100) | | Translated name |
| `price_adjustment` | DECIMAL(10,2) | DEFAULT 0.00 | Price change (+2.50, -1.00, 0) |
| `is_available` | BOOLEAN | DEFAULT true | Availability flag |
| `is_default` | BOOLEAN | DEFAULT false | Pre-selected by default |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_item_modifiers_group` on `group_id`

---

### menu_item_modifiers

Many-to-many link between menu items and modifier groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `menu_item_id` | UUID | FK → menu_items, NOT NULL | Menu item reference |
| `modifier_group_id` | UUID | FK → item_modifier_groups, NOT NULL | Modifier group reference |

**Primary Key:** `(menu_item_id, modifier_group_id)`

**Example:** Linking "Cheeseburger" to "Size" and "Extras" groups:
```sql
INSERT INTO menu_item_modifiers VALUES
  ('cheeseburger-uuid', 'size-group-uuid'),
  ('cheeseburger-uuid', 'extras-group-uuid');
```

---

### restaurant_tables

Physical tables in the restaurant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `table_number` | VARCHAR(10) | NOT NULL | Table identifier ("1", "A1", "Patio-3") |
| `name` | VARCHAR(50) | | Friendly name ("Window Table") |
| `capacity` | INTEGER | DEFAULT 4 | Seating capacity |
| `position_x` | INTEGER | | X position for map UI |
| `position_y` | INTEGER | | Y position for map UI |
| `is_active` | BOOLEAN | DEFAULT true | Table is in use |
| `qr_code_url` | TEXT | | QR code for this table |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Unique Constraint:** `(restaurant_id, table_number)`

---

### orders

Customer orders with handshake codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(10) | PK | Handshake code (e.g., "AB.12") |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `table_id` | UUID | FK → restaurant_tables | Table reference |
| `table_number` | VARCHAR(10) | | Table number (denormalized) |
| `order_type` | ENUM | DEFAULT 'dine_in' | dine_in, takeaway, delivery |
| `status` | ENUM | DEFAULT 'pending' | Order status |
| `customer_name` | VARCHAR(255) | | Customer name |
| `customer_phone` | VARCHAR(50) | | Customer phone |
| `customer_email` | VARCHAR(255) | | Customer email |
| `delivery_address` | TEXT | | Delivery address |
| `delivery_notes` | TEXT | | Delivery instructions |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Order placed |
| `confirmed_at` | TIMESTAMPTZ | | Waiter confirmed |
| `prepared_at` | TIMESTAMPTZ | | Kitchen finished |
| `served_at` | TIMESTAMPTZ | | Served to customer |
| `completed_at` | TIMESTAMPTZ | | Order completed |
| `confirmed_by` | UUID | FK → restaurant_staff | Staff who confirmed |
| `prepared_by` | UUID | FK → restaurant_staff | Staff who prepared |
| `subtotal` | DECIMAL(10,2) | DEFAULT 0 | Items total |
| `tax_amount` | DECIMAL(10,2) | DEFAULT 0 | Tax amount |
| `tip_amount` | DECIMAL(10,2) | DEFAULT 0 | Tip amount |
| `discount_amount` | DECIMAL(10,2) | DEFAULT 0 | Discount applied |
| `total` | DECIMAL(10,2) | DEFAULT 0 | Final total |
| `is_paid` | BOOLEAN | DEFAULT false | Payment status |
| `payment_method` | VARCHAR(50) | | cash, card, etc. |
| `kitchen_notes` | TEXT | | Notes for kitchen |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_orders_restaurant` on `restaurant_id`
- `idx_orders_status` on `restaurant_id, status`
- `idx_orders_table` on `restaurant_id, table_number`
- `idx_orders_created` on `restaurant_id, created_at`

**Enums:**
```sql
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'delivery');

CREATE TYPE order_status AS ENUM (
  'pending',     -- Customer placed order
  'confirmed',   -- Waiter confirmed & assigned table
  'preparing',   -- Kitchen is cooking
  'ready',       -- Ready for pickup/delivery
  'served',      -- Served to customer
  'completed',   -- Fully completed
  'cancelled'    -- Order cancelled
);
```

---

### order_items

Individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `order_id` | VARCHAR(10) | FK → orders, NOT NULL | Order reference |
| `menu_item_id` | UUID | FK → menu_items, NOT NULL | Menu item reference |
| `item_name` | VARCHAR(255) | NOT NULL | Item name (snapshot) |
| `item_price` | DECIMAL(10,2) | NOT NULL | Item price (snapshot) |
| `quantity` | INTEGER | DEFAULT 1, NOT NULL | Quantity ordered |
| `modifiers` | JSONB | DEFAULT '[]' | Selected modifiers |
| `modifiers_total` | DECIMAL(10,2) | DEFAULT 0 | Sum of modifier prices |
| `line_total` | DECIMAL(10,2) | NOT NULL | (item_price + modifiers_total) * quantity |
| `notes` | TEXT | | Special instructions |
| `is_prepared` | BOOLEAN | DEFAULT false | Kitchen prepared this item |
| `prepared_at` | TIMESTAMPTZ | | When item was prepared |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Modifiers JSONB Structure:**
```json
[
  {
    "groupId": "uuid",
    "groupName": "Size",
    "modifierId": "uuid",
    "modifierName": "Large",
    "priceAdjustment": 2.50
  },
  {
    "groupId": "uuid",
    "groupName": "Extras",
    "modifierId": "uuid",
    "modifierName": "Extra Cheese",
    "priceAdjustment": 1.00
  }
]
```

**Indexes:**
- `idx_order_items_order` on `order_id`

---

### operating_hours

Restaurant operating hours by day.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `day_of_week` | INTEGER | NOT NULL | 0=Sunday, 6=Saturday |
| `opens_at` | TIME | | Opening time |
| `closes_at` | TIME | | Closing time |
| `kitchen_closes_at` | TIME | | Kitchen last order time |
| `is_closed` | BOOLEAN | DEFAULT false | Closed this day |

**Unique Constraint:** `(restaurant_id, day_of_week)`

---

### daily_analytics

Aggregated daily statistics for reporting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | FK → restaurants, NOT NULL | Restaurant reference |
| `date` | DATE | NOT NULL | Statistics date |
| `total_orders` | INTEGER | DEFAULT 0 | Orders placed |
| `completed_orders` | INTEGER | DEFAULT 0 | Orders completed |
| `cancelled_orders` | INTEGER | DEFAULT 0 | Orders cancelled |
| `gross_revenue` | DECIMAL(12,2) | DEFAULT 0 | Total revenue |
| `net_revenue` | DECIMAL(12,2) | DEFAULT 0 | Revenue after discounts |
| `tips_collected` | DECIMAL(10,2) | DEFAULT 0 | Tips received |
| `items_sold` | INTEGER | DEFAULT 0 | Total items sold |
| `avg_order_value` | DECIMAL(10,2) | DEFAULT 0 | Average order value |
| `avg_preparation_time` | INTEGER | | Average prep time (minutes) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation |

**Unique Constraint:** `(restaurant_id, date)`

---

## PostgreSQL Functions

### generate_handshake_code(p_restaurant_id)

Generates a unique handshake code for orders.

```sql
CREATE OR REPLACE FUNCTION generate_handshake_code(p_restaurant_id UUID)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';  -- No I, O (similar to 1, 0)
  nums TEXT := '123456789';                   -- No 0
  code VARCHAR(10);
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate code: XX.NN (e.g., "AB.12")
    code := substr(chars, floor(random() * 24 + 1)::int, 1) ||
            substr(chars, floor(random() * 24 + 1)::int, 1) ||
            '.' ||
            substr(nums, floor(random() * 9 + 1)::int, 1) ||
            substr(nums, floor(random() * 9 + 1)::int, 1);

    -- Check uniqueness among active orders
    IF NOT EXISTS (
      SELECT 1 FROM orders
      WHERE id = code
        AND restaurant_id = p_restaurant_id
        AND status NOT IN ('served', 'completed', 'cancelled')
    ) THEN
      RETURN code;
    END IF;

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique code';
    END IF;
  END LOOP;
END;
$$;
```

**Usage:**
```sql
SELECT generate_handshake_code('restaurant-uuid');
-- Returns: "AB.12"
```

---

### get_restaurant_by_slug(p_slug)

Retrieves restaurant by URL slug.

```sql
CREATE OR REPLACE FUNCTION get_restaurant_by_slug(p_slug VARCHAR)
RETURNS SETOF restaurants
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM restaurants
  WHERE slug = p_slug
    AND subscription_status != 'suspended';
$$;
```

---

### calculate_order_total(p_order_id)

Calculates and updates order totals.

```sql
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_subtotal DECIMAL(10,2);
  v_tax_rate DECIMAL(5,2);
  v_tax_amount DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Sum line totals
  SELECT COALESCE(SUM(line_total), 0) INTO v_subtotal
  FROM order_items WHERE order_id = p_order_id;

  -- Get restaurant tax rate
  SELECT r.tax_rate INTO v_tax_rate
  FROM orders o
  JOIN restaurants r ON o.restaurant_id = r.id
  WHERE o.id = p_order_id;

  -- Calculate tax and total
  v_tax_amount := v_subtotal * (v_tax_rate / 100);
  v_total := v_subtotal + v_tax_amount;

  -- Update order
  UPDATE orders SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;
```

---

### update_updated_at_column()

Trigger function for automatic timestamp updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to tables
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row-Level Security (RLS)

### Enabling RLS

```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ... all tenant tables
```

### Example Policies

```sql
-- Restaurants: Read own restaurant only
CREATE POLICY "Restaurants are visible to their staff"
  ON restaurants FOR SELECT
  USING (id = current_setting('app.current_restaurant_id', true)::uuid);

-- Menu items: Full access for restaurant
CREATE POLICY "Restaurant owns its menu items"
  ON menu_items FOR ALL
  USING (restaurant_id = current_setting('app.current_restaurant_id', true)::uuid);

-- Orders: Restaurant can manage its orders
CREATE POLICY "Restaurant owns its orders"
  ON orders FOR ALL
  USING (restaurant_id = current_setting('app.current_restaurant_id', true)::uuid);
```

### Setting Restaurant Context

```sql
-- Set before queries (in application code)
SET app.current_restaurant_id = 'restaurant-uuid';

-- Or via RPC
SELECT set_config('app.current_restaurant_id', 'restaurant-uuid', false);
```

---

## Indexes Summary

| Table | Index | Columns |
|-------|-------|---------|
| `restaurants` | `idx_restaurants_slug` | `slug` |
| `restaurants` | `idx_restaurants_subscription_status` | `subscription_status` |
| `restaurant_staff` | `idx_restaurant_staff_restaurant` | `restaurant_id` |
| `restaurant_staff` | `idx_restaurant_staff_pin` | `restaurant_id, pin_hash` |
| `menu_items` | `idx_menu_items_restaurant` | `restaurant_id` |
| `menu_items` | `idx_menu_items_category` | `restaurant_id, category` |
| `menu_items` | `idx_menu_items_available` | `restaurant_id, is_available` |
| `item_modifiers` | `idx_item_modifiers_group` | `group_id` |
| `orders` | `idx_orders_restaurant` | `restaurant_id` |
| `orders` | `idx_orders_status` | `restaurant_id, status` |
| `orders` | `idx_orders_table` | `restaurant_id, table_number` |
| `orders` | `idx_orders_created` | `restaurant_id, created_at` |
| `order_items` | `idx_order_items_order` | `order_id` |

---

## Migration Notes

### From Single-Tenant to Multi-Tenant

1. Create new multi-tenant schema
2. Insert restaurant record
3. Update menu_items with restaurant_id
4. Migrate orders with restaurant_id
5. Create staff from owner_pin_hash
6. Enable RLS policies

### Adding New Tables

1. Always include `restaurant_id` column
2. Add foreign key to `restaurants`
3. Create index on `restaurant_id`
4. Enable RLS
5. Create appropriate policies

---

*See also: [API-REFERENCE.md](./API-REFERENCE.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
