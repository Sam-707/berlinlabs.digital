-- ============================================
-- MENUFLOWS SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Restaurant Configuration (single row)
CREATE TABLE IF NOT EXISTS restaurant_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'The Burger Lab',
  logo TEXT NOT NULL DEFAULT '',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#c21e3a',
  review_url TEXT NOT NULL DEFAULT '',
  is_open BOOLEAN NOT NULL DEFAULT true,
  owner_pin_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  translated_name VARCHAR(255),
  description TEXT NOT NULL DEFAULT '',
  
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_spicy BOOLEAN DEFAULT false,
  contains_peanuts BOOLEAN DEFAULT false,
  allergens TEXT[] DEFAULT '{}',
  additives TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders (Handshake Code as Primary Key)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(10) PRIMARY KEY,  -- Format: "AB.12"
  table_number VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cooking', 'served')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items (Normalized from CartItem[])
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(10) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first (idempotent)
DROP TRIGGER IF EXISTS update_restaurant_config_updated_at ON restaurant_config;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_restaurant_config_updated_at
  BEFORE UPDATE ON restaurant_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Handshake Code Generator
-- Generates unique codes like "AB.12" avoiding confusing characters
CREATE OR REPLACE FUNCTION generate_handshake_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';  -- Excludes I, O (similar to 1, 0)
  nums TEXT := '123456789';                   -- Excludes 0 (similar to O)
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

    -- Check if code is unique among active orders
    IF NOT EXISTS (
      SELECT 1 FROM orders
      WHERE id = code
      AND status IN ('pending', 'confirmed', 'cooking')
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

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "Public read config" ON restaurant_config;
DROP POLICY IF EXISTS "Public read menu" ON menu_items;
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public read order_items" ON order_items;
DROP POLICY IF EXISTS "Public create orders" ON orders;
DROP POLICY IF EXISTS "Public create order_items" ON order_items;
DROP POLICY IF EXISTS "Anon update orders" ON orders;
DROP POLICY IF EXISTS "Anon delete orders" ON orders;
DROP POLICY IF EXISTS "Anon manage menu" ON menu_items;
DROP POLICY IF EXISTS "Anon update config" ON restaurant_config;

-- Public read access (customers can view menu and config)
CREATE POLICY "Public read config" ON restaurant_config FOR SELECT USING (true);
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);

-- Public can create orders (customers placing orders)
CREATE POLICY "Public create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public create order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Owner operations (authenticated via anon key + client-side session)
-- In production, use proper Supabase Auth with service role key
CREATE POLICY "Anon update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Anon delete orders" ON orders FOR DELETE USING (true);
CREATE POLICY "Anon manage menu" ON menu_items FOR ALL USING (true);
CREATE POLICY "Anon update config" ON restaurant_config FOR UPDATE USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Default config with PIN 1234 (SHA-256 hash)
-- Hash of "1234" = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
-- Only insert if no config exists
INSERT INTO restaurant_config (name, accent_color, review_url, is_open, owner_pin_hash, logo)
SELECT
  'The Burger Lab',
  '#c21e3a',
  'google.com/maps/review/gbk-berlin',
  true,
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d'
WHERE NOT EXISTS (SELECT 1 FROM restaurant_config);

-- Seed menu items (matching constants.tsx)
INSERT INTO menu_items (name, translated_name, description, price, category, is_available, is_spicy, contains_peanuts, allergens, additives, image_url, display_order)
VALUES
  (
    'Double Trouble',
    'İkili Lezzet',
    'Two smash patties, double cheese, caramelized onions, house sauce on brioche.',
    14.50,
    'Burgers',
    true,
    true,
    true,
    ARRAY['Peanuts', 'Gluten', 'Dairy'],
    ARRAY['Preservatives (E250)'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
    0
  ),
  (
    'Spicy Chicken',
    'Acılı Tavuk',
    'Crispy breast, spicy slaw, pickles, chipotle mayo, toasted bun.',
    12.00,
    'Burgers',
    true,
    true,
    false,
    '{}',
    '{}',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
    1
  ),
  (
    'Mushroom Swiss',
    'Mantarlı İsviçre',
    'Sautéed wild mushrooms, truffle aioli, swiss cheese, fresh arugula.',
    15.50,
    'Burgers',
    true,
    false,
    false,
    '{}',
    '{}',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
    2
  ),
  (
    'Classic Fries',
    NULL,
    'Triple cooked house fries with sea salt.',
    4.50,
    'Sides',
    true,
    false,
    false,
    '{}',
    '{}',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
    3
  ),
  (
    'Truffle Mayo Dip',
    NULL,
    'Rich and creamy truffle-infused mayonnaise.',
    1.50,
    'Sides',
    true,
    false,
    false,
    '{}',
    '{}',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d',
    4
  );

-- ============================================
-- ENABLE REALTIME (Run in Supabase Dashboard)
-- ============================================
-- Go to Database → Replication → Add the following tables:
-- - orders
-- - order_items

-- ============================================
-- STORAGE BUCKETS (Create via Supabase Dashboard)
-- ============================================
-- 1. Create bucket: menu-images (public)
-- 2. Create bucket: restaurant-assets (public)
