-- ============================================
-- MENUFLOWS DATABASE RESET
-- Run this FIRST to clean up existing tables
-- Then run supabase-schema.sql
-- ============================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurant_config CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_handshake_code() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirm cleanup
SELECT 'Database reset complete. Now run supabase-schema.sql' AS status;
