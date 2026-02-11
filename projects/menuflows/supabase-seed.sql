-- =====================================================
-- MenuFlows Database Seed Script
-- =====================================================
-- This script creates demo data for testing and development
-- Run with: psql -h <host> -U <user> -d <database> -f supabase-seed.sql
-- Or via Supabase SQL Editor
-- =====================================================

-- PIN "1234" hashed with SHA-256 (generated using crypto.subtle.digest)
-- Hash: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4

-- =====================================================
-- Demo Restaurant
-- =====================================================
INSERT INTO restaurants (
  id, name, slug, business_type, logo_url, accent_color,
  country, currency, is_open, subscription_plan, subscription_status
) VALUES (
  'demo-restaurant-001',
  'The Burger Lab',
  'demo',
  'restaurant',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  '#c21e3a',
  'DE',
  'EUR',
  true,
  'trial',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  is_open = EXCLUDED.is_open;

-- =====================================================
-- Demo Staff (Owner)
-- PIN: 1234
-- =====================================================
INSERT INTO restaurant_staff (
  id, restaurant_id, name, role, pin_hash, is_active
) VALUES (
  'demo-staff-owner-001',
  'demo-restaurant-001',
  'Owner',
  'owner',
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  true
) ON CONFLICT (id) DO UPDATE SET
  pin_hash = EXCLUDED.pin_hash,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- Menu Items
-- =====================================================
INSERT INTO menu_items (
  id, restaurant_id, name, translated_name, description, price,
  image_url, category, is_available, is_spicy, display_order
) VALUES
-- Burgers
(
  'menu-001',
  'demo-restaurant-001',
  'Classic Burger',
  'Klassischer Burger',
  'Juicy beef patty with lettuce, tomato, onion, and our secret sauce',
  9.99,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Burgers',
  true,
  false,
  1
),
(
  'menu-002',
  'demo-restaurant-001',
  'Spicy Jalapeño Burger',
  'Scharfer Jalapeño Burger',
  'Our classic burger with spicy jalapeños and pepper jack cheese',
  11.99,
  'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop',
  'Burgers',
  true,
  true,
  2
),
(
  'menu-003',
  'demo-restaurant-001',
  'Double Cheese Burger',
  'Doppelter Cheeseburger',
  'Two beef patties with double cheddar cheese',
  14.99,
  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
  'Burgers',
  true,
  false,
  3
),
-- Sides
(
  'menu-004',
  'demo-restaurant-001',
  'Crispy Fries',
  'Knusprige Pommes',
  'Golden crispy french fries with sea salt',
  4.99,
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
  'Sides',
  true,
  false,
  4
),
(
  'menu-005',
  'demo-restaurant-001',
  'Onion Rings',
  'Zwiebelringe',
  'Beer-battered crispy onion rings',
  5.99,
  'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop',
  'Sides',
  true,
  false,
  5
),
-- Drinks
(
  'menu-006',
  'demo-restaurant-001',
  'Cola',
  'Cola',
  'Classic cola drink',
  2.99,
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
  'Drinks',
  true,
  false,
  6
),
(
  'menu-007',
  'demo-restaurant-001',
  'Fresh Lemonade',
  'Frische Limonade',
  'Freshly squeezed lemonade with mint',
  3.99,
  'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
  'Drinks',
  true,
  false,
  7
),
-- Desserts
(
  'menu-008',
  'demo-restaurant-001',
  'Chocolate Brownie',
  'Schokoladen-Brownie',
  'Warm chocolate brownie with vanilla ice cream',
  6.99,
  'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop',
  'Desserts',
  true,
  false,
  8
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available;

-- =====================================================
-- Modifier Groups
-- =====================================================
INSERT INTO item_modifier_groups (
  id, restaurant_id, name, name_translated,
  min_selections, max_selections, is_required, display_order
) VALUES
(
  'mod-group-001',
  'demo-restaurant-001',
  'Size',
  'Größe',
  1, 1, true, 1
),
(
  'mod-group-002',
  'demo-restaurant-001',
  'Extras',
  'Extras',
  0, 5, false, 2
),
(
  'mod-group-003',
  'demo-restaurant-001',
  'Sauce',
  'Soße',
  0, 2, false, 3
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_required = EXCLUDED.is_required;

-- =====================================================
-- Modifiers
-- =====================================================
INSERT INTO item_modifiers (
  id, group_id, name, name_translated,
  price_adjustment, is_available, is_default, display_order
) VALUES
-- Size options
('mod-001', 'mod-group-001', 'Regular', 'Normal', 0.00, true, true, 1),
('mod-002', 'mod-group-001', 'Large', 'Groß', 2.00, true, false, 2),
('mod-003', 'mod-group-001', 'XL', 'XL', 3.50, true, false, 3),
-- Extras
('mod-004', 'mod-group-002', 'Extra Cheese', 'Extra Käse', 1.50, true, false, 1),
('mod-005', 'mod-group-002', 'Bacon', 'Speck', 2.00, true, false, 2),
('mod-006', 'mod-group-002', 'Avocado', 'Avocado', 2.50, true, false, 3),
('mod-007', 'mod-group-002', 'Fried Egg', 'Spiegelei', 1.50, true, false, 4),
-- Sauces
('mod-008', 'mod-group-003', 'Ketchup', 'Ketchup', 0.00, true, false, 1),
('mod-009', 'mod-group-003', 'Mayo', 'Mayo', 0.00, true, false, 2),
('mod-010', 'mod-group-003', 'BBQ Sauce', 'BBQ Soße', 0.50, true, false, 3),
('mod-011', 'mod-group-003', 'Hot Sauce', 'Scharfe Soße', 0.50, true, false, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_adjustment = EXCLUDED.price_adjustment,
  is_available = EXCLUDED.is_available;

-- =====================================================
-- Link Modifiers to Menu Items (Burgers get all modifiers)
-- =====================================================
INSERT INTO menu_item_modifiers (menu_item_id, modifier_group_id) VALUES
-- Classic Burger
('menu-001', 'mod-group-001'),
('menu-001', 'mod-group-002'),
('menu-001', 'mod-group-003'),
-- Spicy Jalapeño Burger
('menu-002', 'mod-group-001'),
('menu-002', 'mod-group-002'),
('menu-002', 'mod-group-003'),
-- Double Cheese Burger
('menu-003', 'mod-group-001'),
('menu-003', 'mod-group-002'),
('menu-003', 'mod-group-003'),
-- Fries get size options
('menu-004', 'mod-group-001'),
('menu-004', 'mod-group-003')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Sample Orders (for testing)
-- =====================================================
INSERT INTO orders (
  id, restaurant_id, table_number, status, created_at, confirmed_at
) VALUES
(
  'AB.12',
  'demo-restaurant-001',
  '5',
  'cooking',
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '10 minutes'
),
(
  'CD.34',
  'demo-restaurant-001',
  NULL,
  'pending',
  NOW() - INTERVAL '2 minutes',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- Order items for the cooking order
INSERT INTO order_items (
  id, order_id, menu_item_id, quantity, notes, modifiers, modifiers_total, unit_price
) VALUES
(
  'item-001',
  'AB.12',
  'menu-001',
  2,
  'No onions please',
  '[{"group_id": "mod-group-001", "group_name": "Size", "modifier_id": "mod-002", "modifier_name": "Large", "price_adjustment": 2.00}]'::jsonb,
  2.00,
  11.99
),
(
  'item-002',
  'AB.12',
  'menu-004',
  1,
  NULL,
  '[]'::jsonb,
  0.00,
  4.99
)
ON CONFLICT (id) DO NOTHING;

-- Order items for the pending order
INSERT INTO order_items (
  id, order_id, menu_item_id, quantity, notes, modifiers, modifiers_total, unit_price
) VALUES
(
  'item-003',
  'CD.34',
  'menu-002',
  1,
  'Extra spicy!',
  '[]'::jsonb,
  0.00,
  11.99
),
(
  'item-004',
  'CD.34',
  'menu-006',
  2,
  NULL,
  '[]'::jsonb,
  0.00,
  2.99
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Summary
-- =====================================================
-- Demo restaurant created: "The Burger Lab" (slug: demo)
-- Staff PIN: 1234
-- 8 menu items across 4 categories
-- 3 modifier groups with 11 modifiers
-- 2 sample orders for testing KDS
--
-- Access at: http://localhost:3000/demo
-- Login with PIN: 1234
-- =====================================================
