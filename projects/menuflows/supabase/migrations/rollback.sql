-- ============================================================
-- Rollback: Revert menu_items RLS fix
-- Purpose: Restore original "Staff manage menu items" policy
-- Date: 2025-01-24
-- ============================================================

-- Remove the new policy
DROP POLICY IF EXISTS "Allow menu updates with valid restaurant_id" ON menu_items;

-- Restore original policy
CREATE POLICY "Staff manage menu items"
ON menu_items
FOR ALL
TO anon, authenticated
USING (restaurant_id = current_restaurant_id());

-- ============================================================
-- VERIFICATION AFTER ROLLBACK
-- ============================================================
--
-- Run this to verify rollback:
--
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename = 'menu_items';
--
-- Should show:
--   policyname: "Staff manage menu_items"
--   cmd: ALL
--
-- ============================================================
