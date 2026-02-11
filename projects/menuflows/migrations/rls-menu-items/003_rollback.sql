-- ============================================================
-- Rollback: Revert 003_fix_policy_scope_no_delete.sql
-- Purpose: Remove explicit SELECT/INSERT/UPDATE policies
-- Date: 2025-01-28
-- ============================================================
--
-- WARNING: This rollback removes all menu_items RLS policies.
-- After running this, you will need to apply a fresh migration
-- to restore access control.
--
-- The reason for this conservative rollback: We don't know what
-- policies existed before 003, so we can't safely restore them.
-- Re-applying migration 002 or manually recreating policies is safer.
--
-- ============================================================

-- Drop the policies created in 003
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu_items (trigger guarded)" ON menu_items;
DROP POLICY IF EXISTS "Public update menu_items (trigger guarded)" ON menu_items;

-- Drop the trigger guard created in 003
DROP TRIGGER IF EXISTS guard_menu_items_update_trigger ON menu_items;
DROP FUNCTION IF EXISTS guard_menu_items_update();

-- ============================================================
-- POST-ROLLBACK INSTRUCTIONS
-- ============================================================
--
-- After running this rollback:
--
-- 1. Decide what policies you want:
--    - Apply migration 002 (demo-safe policies with trigger guard)
--    - Apply migration 001 (original current_restaurant_id policy)
--    - Manually create custom policies
--
-- 2. To re-apply migration 002:
--    -- Copy contents of 002_demo_safe_policies.sql
--    -- Paste into Supabase SQL Editor
--    -- Run query
--
-- 3. To verify current state after rollback:
--    SELECT policyname, cmd, roles
--    FROM pg_policies
--    WHERE tablename = 'menu_items';
--
--    Expected: No rows (or only policies from other migrations)
--
-- ============================================================
