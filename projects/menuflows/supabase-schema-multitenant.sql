-- ============================================
-- MENUFLOWS MULTI-TENANT SCHEMA
-- SaaS Platform for Restaurants, Cafes, Gastronomy
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE PLATFORM TABLES
-- ============================================

-- Business Types
CREATE TYPE business_type AS ENUM (
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'food_truck',
  'ghost_kitchen',
  'hotel_restaurant',
  'catering',
  'other'
);

-- Subscription Plans
CREATE TYPE subscription_plan AS ENUM (
  'trial',      -- 14 days free
  'starter',    -- €29/mo - 1 location, basic features
  'professional', -- €49/mo - 3 locations, full features
  'enterprise'  -- Custom pricing, unlimited
);

-- Subscription Status
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'cancelled',
  'suspended'
);

-- ============================================
-- PLATFORM ADMIN (Your team)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, support
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================
-- RESTAURANTS (Tenants)
-- ============================================

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly: "burger-lab-berlin"
  business_type business_type DEFAULT 'restaurant',

  -- Branding
  logo_url TEXT,
  accent_color VARCHAR(7) DEFAULT '#c21e3a',
  cover_image_url TEXT,

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),

  -- Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Germany',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Operations
  is_open BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  currency VARCHAR(3) DEFAULT 'EUR',
  tax_rate DECIMAL(5,2) DEFAULT 19.00, -- German VAT

  -- External Links
  google_review_url TEXT,
  tripadvisor_url TEXT,
  instagram_handle VARCHAR(100),

  -- Subscription
  subscription_plan subscription_plan DEFAULT 'trial',
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),

  -- Onboarding
  onboarded_by UUID REFERENCES platform_admins(id),
  onboarding_completed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for slug lookups (fast subdomain resolution)
CREATE UNIQUE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_subscription ON restaurants(subscription_status, subscription_plan);

-- ============================================
-- RESTAURANT STAFF (Owner's team)
-- ============================================

CREATE TYPE staff_role AS ENUM (
  'owner',      -- Full access
  'manager',    -- Can manage menu, orders, staff
  'kitchen',    -- Can view/update orders
  'waiter',     -- Can confirm orders, assign tables
  'cashier'     -- Can view orders, process payments
);

CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Identity
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255), -- 4-digit PIN for quick login

  -- Access
  role staff_role DEFAULT 'waiter',
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  UNIQUE(restaurant_id, email)
);

CREATE INDEX idx_staff_restaurant ON restaurant_staff(restaurant_id);

-- ============================================
-- MENU CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  name_translated VARCHAR(100), -- Second language
  description TEXT,
  icon VARCHAR(50), -- Material icon name
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,

  -- Time-based visibility (optional)
  available_from TIME, -- e.g., breakfast from 07:00
  available_until TIME, -- e.g., breakfast until 11:00
  available_days INTEGER[], -- 0=Sun, 1=Mon, etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_restaurant ON menu_categories(restaurant_id);

-- ============================================
-- MENU ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  name_translated VARCHAR(255),
  description TEXT,
  description_translated TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2), -- Original price if on sale
  cost DECIMAL(10,2), -- For profit tracking

  -- Media
  image_url TEXT,
  thumbnail_url TEXT,

  -- Categorization (legacy support)
  category VARCHAR(100), -- Fallback if no category_id

  -- Dietary & Allergens
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  spice_level INTEGER DEFAULT 0, -- 0-3
  contains_peanuts BOOLEAN DEFAULT false,
  contains_alcohol BOOLEAN DEFAULT false,
  allergens TEXT[] DEFAULT '{}',
  additives TEXT[] DEFAULT '{}',

  -- Nutrition (optional)
  calories INTEGER,

  -- Availability
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,

  -- Inventory
  track_inventory BOOLEAN DEFAULT false,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER DEFAULT 5,

  -- Ordering
  display_order INTEGER DEFAULT 0,
  preparation_time INTEGER, -- Minutes

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(restaurant_id, is_available);

-- ============================================
-- ITEM MODIFIERS / OPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS item_modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL, -- "Size", "Extras", "Sauce"
  name_translated VARCHAR(100),

  min_selections INTEGER DEFAULT 0, -- 0 = optional
  max_selections INTEGER DEFAULT 1, -- 1 = single choice
  is_required BOOLEAN DEFAULT false,

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES item_modifier_groups(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL, -- "Large", "Extra Cheese"
  name_translated VARCHAR(100),
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- +2.00 for large

  is_available BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link modifiers to items (many-to-many)
CREATE TABLE IF NOT EXISTS menu_item_modifiers (
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES item_modifier_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, modifier_group_id)
);

-- ============================================
-- TABLES (Physical tables in restaurant)
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  table_number VARCHAR(10) NOT NULL,
  name VARCHAR(50), -- "Window Table", "VIP Booth"
  capacity INTEGER DEFAULT 4,

  -- Position for table map
  position_x INTEGER,
  position_y INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- QR Code
  qr_code_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restaurant_id, table_number)
);

CREATE INDEX idx_tables_restaurant ON restaurant_tables(restaurant_id);

-- ============================================
-- ORDERS
-- ============================================

CREATE TYPE order_status AS ENUM (
  'pending',    -- Waiting for staff confirmation
  'confirmed',  -- Confirmed, assigned to table
  'preparing',  -- Kitchen is preparing
  'ready',      -- Ready for pickup/serve
  'served',     -- Delivered to table
  'completed',  -- Paid and done
  'cancelled'   -- Cancelled
);

CREATE TYPE order_type AS ENUM (
  'dine_in',
  'takeaway',
  'delivery'
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(10) PRIMARY KEY, -- Handshake code: "AB.12"
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Table assignment
  table_id UUID REFERENCES restaurant_tables(id),
  table_number VARCHAR(10), -- Denormalized for quick access

  -- Order info
  order_type order_type DEFAULT 'dine_in',
  status order_status DEFAULT 'pending',

  -- Customer (optional, for delivery/takeaway)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),

  -- Delivery address (if applicable)
  delivery_address TEXT,
  delivery_notes TEXT,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Staff
  confirmed_by UUID REFERENCES restaurant_staff(id),
  prepared_by UUID REFERENCES restaurant_staff(id),

  -- Pricing
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  tip_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),

  -- Payment
  is_paid BOOLEAN DEFAULT false,
  payment_method VARCHAR(50), -- cash, card, online

  -- Notes
  kitchen_notes TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_date ON orders(restaurant_id, created_at);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(10) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),

  -- Snapshot of item at order time
  item_name VARCHAR(255) NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,

  quantity INTEGER NOT NULL DEFAULT 1,

  -- Modifiers selected
  modifiers JSONB DEFAULT '[]', -- [{name, price}, ...]
  modifiers_total DECIMAL(10,2) DEFAULT 0,

  -- Line total
  line_total DECIMAL(10,2) NOT NULL,

  -- Notes
  notes TEXT,

  -- Kitchen status
  is_prepared BOOLEAN DEFAULT false,
  prepared_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- OPERATING HOURS
-- ============================================

CREATE TABLE IF NOT EXISTS operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN DEFAULT false,

  -- Kitchen hours (might differ from open hours)
  kitchen_closes_at TIME,

  UNIQUE(restaurant_id, day_of_week)
);

-- ============================================
-- ANALYTICS / DAILY SUMMARY
-- ============================================

CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Orders
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,

  -- Revenue
  gross_revenue DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) DEFAULT 0,
  tips_collected DECIMAL(10,2) DEFAULT 0,

  -- Items
  items_sold INTEGER DEFAULT 0,

  -- Averages
  avg_order_value DECIMAL(10,2),
  avg_preparation_time INTEGER, -- minutes

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restaurant_id, date)
);

CREATE INDEX idx_analytics_restaurant_date ON daily_analytics(restaurant_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper function to get current restaurant from JWT or session
CREATE OR REPLACE FUNCTION current_restaurant_id()
RETURNS UUID AS $$
BEGIN
  -- Get from JWT claim (set during authentication)
  RETURN NULLIF(current_setting('app.current_restaurant_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restaurants: Public can read by slug, owners can update their own
CREATE POLICY "Public read restaurants by slug" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "Owners update own restaurant" ON restaurants
  FOR UPDATE USING (id = current_restaurant_id());

-- Menu Items: Public read, restaurant staff can manage
CREATE POLICY "Public read menu items" ON menu_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.subscription_status != 'suspended')
  );

CREATE POLICY "Staff manage menu items" ON menu_items
  FOR ALL USING (restaurant_id = current_restaurant_id());

-- Orders: Restaurant can manage their own
CREATE POLICY "Public create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read own orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Staff manage orders" ON orders
  FOR ALL USING (restaurant_id = current_restaurant_id());

-- Order Items
CREATE POLICY "Public create order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read order items" ON order_items
  FOR SELECT USING (true);

-- Categories
CREATE POLICY "Public read categories" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Staff manage categories" ON menu_categories
  FOR ALL USING (restaurant_id = current_restaurant_id());

-- Tables
CREATE POLICY "Staff read tables" ON restaurant_tables
  FOR SELECT USING (true);

CREATE POLICY "Staff manage tables" ON restaurant_tables
  FOR ALL USING (restaurant_id = current_restaurant_id());

-- ============================================
-- GRANTS FOR ANON/AUTHENTICATED
-- ============================================

-- Anon (public customers)
GRANT SELECT ON restaurants TO anon;
GRANT SELECT ON menu_categories TO anon;
GRANT SELECT ON menu_items TO anon;
GRANT SELECT ON item_modifier_groups TO anon;
GRANT SELECT ON item_modifiers TO anon;
GRANT SELECT, INSERT ON orders TO anon;
GRANT SELECT, INSERT ON order_items TO anon;

-- Authenticated (restaurant staff)
GRANT ALL ON restaurants TO authenticated;
GRANT ALL ON restaurant_staff TO authenticated;
GRANT ALL ON menu_categories TO authenticated;
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON restaurant_tables TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON item_modifier_groups TO authenticated;
GRANT ALL ON item_modifiers TO authenticated;
GRANT ALL ON menu_item_modifiers TO authenticated;
GRANT ALL ON operating_hours TO authenticated;
GRANT ALL ON daily_analytics TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate handshake code (same as before)
CREATE OR REPLACE FUNCTION generate_handshake_code(p_restaurant_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  nums TEXT := '123456789';
  code VARCHAR(10);
  attempts INTEGER := 0;
BEGIN
  LOOP
    code :=
      SUBSTR(chars, FLOOR(RANDOM() * 24 + 1)::INT, 1) ||
      SUBSTR(chars, FLOOR(RANDOM() * 24 + 1)::INT, 1) ||
      '.' ||
      SUBSTR(nums, FLOOR(RANDOM() * 9 + 1)::INT, 1) ||
      SUBSTR(nums, FLOOR(RANDOM() * 9 + 1)::INT, 1);

    IF NOT EXISTS (
      SELECT 1 FROM orders
      WHERE id = code
      AND restaurant_id = p_restaurant_id
      AND status IN ('pending', 'confirmed', 'preparing', 'ready')
    ) THEN
      RETURN code;
    END IF;

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique handshake code';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Get restaurant by slug
CREATE OR REPLACE FUNCTION get_restaurant_by_slug(p_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  logo_url TEXT,
  accent_color VARCHAR,
  is_open BOOLEAN,
  business_type business_type,
  subscription_status subscription_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.name, r.logo_url, r.accent_color, r.is_open,
    r.business_type, r.subscription_status
  FROM restaurants r
  WHERE r.slug = p_slug
  AND r.subscription_status NOT IN ('suspended', 'cancelled');
END;
$$ LANGUAGE plpgsql;

-- Calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
  v_subtotal DECIMAL;
  v_tax_rate DECIMAL;
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(line_total), 0) INTO v_subtotal
  FROM order_items WHERE order_id = p_order_id;

  SELECT COALESCE(r.tax_rate, 19) INTO v_tax_rate
  FROM orders o
  JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = p_order_id;

  v_total := v_subtotal * (1 + v_tax_rate / 100);

  UPDATE orders SET
    subtotal = v_subtotal,
    tax_amount = v_subtotal * (v_tax_rate / 100),
    total = v_total
  WHERE id = p_order_id;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED: Platform Admin (You)
-- ============================================

INSERT INTO platform_admins (email, name, password_hash, role)
VALUES (
  'admin@menuflows.app',
  'Platform Admin',
  crypt('your-secure-password', gen_salt('bf')),
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SEED: Example Restaurant
-- ============================================

INSERT INTO restaurants (
  name, slug, business_type,
  logo_url, accent_color,
  email, city, country,
  google_review_url,
  subscription_plan, subscription_status
) VALUES (
  'The Burger Lab',
  'burger-lab-berlin',
  'restaurant',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
  '#c21e3a',
  'hello@burgerlab.de',
  'Berlin',
  'Germany',
  'google.com/maps/review/gbk-berlin',
  'professional',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ENABLE REALTIME
-- ============================================
-- Run in Supabase Dashboard: Database → Replication
-- Add tables: orders, order_items

-- ============================================
-- STORAGE BUCKETS (Create via Dashboard)
-- ============================================
-- 1. menu-images (public) - Menu item photos
-- 2. restaurant-assets (public) - Logos, covers
-- 3. receipts (private) - PDF receipts
