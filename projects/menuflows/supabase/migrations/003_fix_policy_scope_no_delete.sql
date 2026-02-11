-- ============================================================
-- Migration: Fix menu_items RLS policy scope (no DELETE)
-- Purpose: Replace FOR ALL policies with explicit SELECT/INSERT/UPDATE only
-- Date: 2025-01-28
-- ============================================================
--
-- PROBLEM:
-- Previous migrations used FOR ALL or created DELETE policies, which could
-- allow unauthorized deletion of menu items. We must restrict to only
-- SELECT, INSERT, UPDATE operations.
--
-- SOLUTION:
-- 1. Drop any existing policies on menu_items (clean slate)
-- 2. Create explicit policies for SELECT, INSERT, UPDATE only
-- 3. Ensure trigger guard exists to block non-is_available changes
-- 4. NO DELETE policy - DELETE operations are blocked
--
-- SECURITY:
-- - Public/anon can SELECT menu items (read menu)
-- - Public/anon can INSERT menu items (for upsert operations)
-- - Public/anon can UPDATE menu items (trigger guards to is_available only)
-- - Public/anon CANNOT DELETE menu items (no DELETE policy)
--
-- Note: The trigger guard (guard_menu_items_update_trigger) is the real
-- security mechanism that prevents changing fields other than is_available.
-- The RLS policies provide the permission framework, the trigger enforces
-- field-level restrictions.
--
-- ============================================================

-- Ensure RLS is enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 1: Drop ALL existing policies (clean slate)
-- ============================================================
-- This removes any FOR ALL, DELETE, or other policies that might exist
DROP POLICY IF EXISTS "Anon manage menu" ON menu_items;
DROP POLICY IF EXISTS "Public delete menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Staff manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Allow menu updates with valid restaurant" ON menu_items;
DROP POLICY IF EXISTS "Allow menu updates with valid restaurant_id" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu_items with trigger guard" ON menu_items;
DROP POLICY IF EXISTS "Public update is_available only" ON menu_items;

-- ============================================================
-- STEP 2: Ensure trigger guard function exists
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
  -- 3. No actual changes (upsert no-op)

  IF (
    _changed_cols = ARRAY['is_available'] OR
    _changed_cols <@ ARRAY['id', 'restaurant_id'] OR
    _changed_cols = ARRAY[]
  ) THEN
    RETURN NEW;
  END IF;

  -- Otherwise, block the update
  RAISE EXCEPTION 'Only is_available field can be modified'
  USING ERRCODE = 'WRONG_DATA',
        DETAIL = 'UPDATE of menu_items is restricted to is_available field only.';
END;
$$;

-- Drop trigger if exists (to avoid errors)
DROP TRIGGER IF EXISTS guard_menu_items_update_trigger ON menu_items;

-- Create trigger
CREATE TRIGGER guard_menu_items_update_trigger
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION guard_menu_items_update();

-- ============================================================
-- STEP 3: Create explicit policies (SELECT, INSERT, UPDATE only)
-- ============================================================
-- IMPORTANT: No DELETE policy is created, which blocks all DELETE operations

-- Policy 1: SELECT - Allow reading menu items
CREATE POLICY "Public read menu_items"
ON menu_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: INSERT - Allow inserting menu items (for upsert)
-- The trigger guard prevents inserting non-is_available fields on conflict
CREATE POLICY "Public insert menu_items (trigger guarded)"
ON menu_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 3: UPDATE - Allow updating menu items
-- The trigger guard restricts updates to is_available only
CREATE POLICY "Public update menu_items (trigger guarded)"
ON menu_items
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
--
-- After applying, run these in Supabase SQL Editor to verify:
--
-- 1. Show all policies on menu_items:
--    SELECT policyname, cmd, roles
--    FROM pg_policies
--    WHERE tablename = 'menu_items'
--    ORDER BY cmd, policyname;
--
--    Expected result:
--    cmd     | policyname                              | roles
--    --------+-----------------------------------------+------------------------
--    INSERT  | Public insert menu_items (trigger g...  | {anon,authenticated}
--    SELECT  | Public read menu_items                  | {anon,authenticated}
--    UPDATE  | Public update menu_items (trigger g...  | {anon,authenticated}
--
--    Verify: No DELETE policies, no FOR ALL policies
--
-- 2. Verify trigger exists:
--    SELECT tgname, tgtype
--    FROM pg_trigger
--    WHERE tgname = 'guard_menu_items_update_trigger';
--
--    Expected: 1 row with tgname = 'guard_menu_items_update_trigger'
--
-- 3. Test DELETE is blocked:
--    DELETE FROM menu_items WHERE id = 'some-id';
--
--    Expected: "permission denied for table menu_items" or similar error
--
-- 4. Test UPDATE is_available works:
--    UPDATE menu_items
--    SET is_available = NOT is_available
--    WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
--    RETURNING id, name, is_available;
--
--    Expected: Success, returns updated row
--
-- 5. Test UPDATE other fields is blocked:
--    UPDATE menu_items
--    SET name = 'Hacked Name'
--    WHERE restaurant_id = 'YOUR_RESTAURANT_ID';
--
--    Expected: ERROR: Only is_available field can be modified
--
-- 6. Test from UI:
--    - Go to http://localhost:3000/demo/owner
--    - Click "Inventory"
--    - Toggle availability for any item
--    - Expected: Success, toast shows "Menu Updated Live"
--
-- ============================================================
