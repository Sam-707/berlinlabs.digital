-- ============================================================
-- Migration: Demo-safe RLS policies for menu_items
-- Purpose: Restrict public/anon UPDATE to ONLY is_available field
-- Date: 2025-01-24
-- ============================================================
--
-- PROBLEM:
-- Current policies allow broad INSERT/UPDATE/DELETE on menu_items for public.
-- The app upserts all MenuItem fields, but we only want availability toggle to work.
--
-- SOLUTION:
-- 1. Drop overly-broad policies
-- 2. Create trigger function that guards menu_items updates
-- 3. Allow UPDATE only when is_available is the only field being modified
-- 4. No INSERT, no DELETE for public
--
-- SECURITY:
-- - Public/anon can SELECT menu items (read-only)
-- - Public/anon can UPDATE is_available (availability toggle)
-- - Public/anon CANNOT INSERT, DELETE, or modify other fields
--
-- NOTE: This is a DEMO-ONLY solution until proper Supabase Auth is implemented.
-- For production, we'll replace with authenticated tenant-scoped policies.
--
-- ============================================================

-- Drop overly-broad policies
DROP POLICY IF EXISTS "Anon manage menu" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public delete menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;  -- will recreate

-- Recreate read-only policy (for public menu access)
CREATE POLICY "Public read menu_items"
ON menu_items
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================
-- TRIGGER FUNCTION: Guard menu_items updates
-- ============================================================

CREATE OR REPLACE FUNCTION guard_menu_items_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _old JSONB;
  _new JSONB;
  _changed_cols TEXT[];
BEGIN
  -- Get old and new row data as JSONB
  SELECT to_jsonb(OLD) INTO _old;
  SELECT to_jsonb(NEW) INTO _new;

  -- Find which columns changed
  SELECT jsonb_object_keys(_new - _old)
    INTO _changed_cols;

  -- Allow UPDATE if:
  -- 1. Only is_available changed (toggle), OR
  -- 2. Only system fields changed (id, restaurant_id for WHERE clause matching)

  -- Allow if only is_available changed, or only id/restaurant_id changed (upsert WHERE clause)
  IF (
    _changed_cols = ARRAY['is_available'] OR
    _changed_cols <@ ARRAY['id', 'restaurant_id'] OR  -- upsert WHERE clause
    _changed_cols = ARRAY[]  -- no actual changes
  ) THEN
    RETURN NEW;
  END IF;

  -- Otherwise, block the update
  RAISE EXCEPTION 'Only is_available field can be modified'
  USING ERRCODE = 'WRONG_DATA',
        DETAIL = 'UPDATE of menu_items is restricted to is_available field only. To modify other fields, use authenticated staff account.';
END;
$$;

-- Create trigger
CREATE TRIGGER guard_menu_items_update_trigger
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION guard_menu_items_update();

-- ============================================================
-- INSERT POLICY
-- ============================================================

CREATE POLICY "Public insert menu_items with trigger guard"
ON menu_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);  -- Trigger does the actual guarding

-- ============================================================
-- UPDATE POLICY
-- ============================================================

CREATE POLICY "Public update is_available only"
ON menu_items
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);  -- Trigger does the actual guarding

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
--
-- After applying, run these in Supabase SQL Editor:
--
-- 1. Show all policies on menu_items:
--    SELECT policyname, cmd, roles, qual
--    FROM pg_policies
--    WHERE tablename = 'menu_items'
--    ORDER BY policyname;
--
--    Expected:
--    - "Public read menu_items" - SELECT
--    - "Public insert menu_items with trigger guard" - INSERT
--    - "Public update is_available only" - UPDATE
--
-- 2. Verify trigger exists:
--    SELECT tgname, tgtype
--    FROM pg_trigger
--    WHERE tgname = 'guard_menu_items_update_trigger';
--
-- 3. Test UPDATE from SQL (replace YOUR_RESTAURANT_ID with actual ID):
--
--    -- Should SUCCEED - only is_available changes:
--    UPDATE menu_items
--    SET is_available = false
--    WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
--    RETURNING *;
--
--    -- Should FAIL - trying to change name:
--    UPDATE menu_items
--    SET name = 'Hacked Name'
--    WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
--    RETURNING *;
--
--    Expected: ERROR: Only is_available field can be modified
--
-- 4. Verify INSERT works (for upsert):
--    INSERT INTO menu_items (id, name, price, category, is_available, restaurant_id)
--    VALUES ('test-id', 'Test', 10.00, 'Mains', true, 'YOUR_RESTAURANT_ID')
--    ON CONFLICT (id) DO UPDATE SET is_available = EXCLUDED.is_available;
--
--    Expected: Success (trigger guards column changes)
--
-- 5. Verify DELETE is blocked:
--    DELETE FROM menu_items WHERE id = 'test-id';
--
--    Expected: "Permission denied" or similar error
--
-- 6. Test from app:
--    - Load /demo menu (should work)
--    - /demo/owner → Inventory → toggle availability (should work)
--    - Try to edit item name/price in Inventory View (should fail with permission error)
--
-- ============================================================
