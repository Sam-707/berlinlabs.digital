-- ============================================================
-- Rollback: Revert demo-safe RLS policies for menu_items
-- Purpose: Restore original overly-broad policies
-- Date: 2025-01-24
-- ============================================================
--
-- This rolls back migration 002_demo_safe_policies.sql
-- and restores the original policies that existed before.
--
-- WARNING: This restores broad permissions. Use only if
-- the demo-safe policies cause issues and you need to revert.
--
-- ============================================================

-- Remove the demo-safe policies and trigger
DROP POLICY IF EXISTS "Public update is_available only" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu_items with trigger guard" ON menu_items;
DROP TRIGGER IF EXISTS guard_menu_items_update_trigger ON menu_items;
DROP FUNCTION IF EXISTS guard_menu_items_update();

-- Remove the read-only policy
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;

-- ============================================================
-- RESTORE ORIGINAL POLICIES
-- ============================================================
--
-- These restore the policies that existed before migration 002.
-- Note: These policies allow broad access to menu_items for public.
--
-- ============================================================

-- Policy: Anon manage menu
CREATE POLICY "Anon manage menu"
ON menu_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy: Public insert menu_items
CREATE POLICY "Public insert menu_items"
ON menu_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Public update menu_items
CREATE POLICY "Public update menu_items"
ON menu_items
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy: Public delete menu_items
CREATE POLICY "Public delete menu_items"
ON menu_items
FOR DELETE
TO anon, authenticated
USING (true);

-- Policy: Public read menu_items
CREATE POLICY "Public read menu_items"
ON menu_items
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================
-- VERIFICATION AFTER ROLLBACK
-- ============================================================
--
-- Run this to verify rollback:
--
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'menu_items'
-- ORDER BY policyname;
--
-- Should show 5 policies:
--   - "Anon manage menu" - ALL
--   - "Public insert menu_items" - INSERT
--   - "Public update menu_items" - UPDATE
--   - "Public delete menu_items" - DELETE
--   - "Public read menu_items" - SELECT
--
-- ============================================================
