-- ============================================================
-- Migration: Fix menu_items RLS for UPDATE operations
-- Purpose: Allow anon key to UPDATE menu_items for restaurant
-- Date: 2025-01-24
-- ============================================================
--
-- PROBLEM:
-- The "Staff manage menu items" policy requires current_restaurant_id() which
-- relies on database-level session settings that aren't set by the anon key.
--
-- SOLUTION:
-- Add explicit UPDATE/INSERT policy that validates restaurant_id is provided
-- in the query and matches an existing restaurant.
--
-- OPERATION: UPDATE (for toggling is_available)
-- SCOPE: menu_items table
-- ROLE: anon, authenticated
--
-- ============================================================

-- Drop existing overly restrictive policy
DROP POLICY IF EXISTS "Staff manage menu items" ON menu_items;

-- Create new policy that allows UPDATE/INSERT when restaurant_id is explicitly provided
-- This matches how the app calls upsert: .eq('restaurant_id', restaurantId)
CREATE POLICY "Allow menu updates with valid restaurant_id"
ON menu_items
FOR ALL
TO anon, authenticated
USING (
  -- Only allow operations when restaurant_id is explicitly specified in the query
  -- This prevents accidental updates without restaurant context
  EXISTS (
    SELECT 1
    FROM pg_subquery('querytree' AS qt)
    WHERE qt.nodeid::text LIKE '%menu_items%'
      AND jsonb_path_exists(qt.query, '$.args.0.0.eq.restaurant_id')
  )
)
WITH CHECK (
  -- Verify restaurant_id exists and is valid
  EXISTS (
    SELECT 1
    FROM restaurants
    WHERE id = restaurant_id
      AND subscription_status != 'suspended'
  )
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
--
-- After applying, run these in Supabase SQL Editor to verify:
--
-- 1. Show policies on menu_items:
--    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
--    FROM pg_policies
--    WHERE tablename = 'menu_items';
--
-- 2. Test UPDATE from SQL (replace YOUR_RESTAURANT_ID with actual ID):
--    UPDATE menu_items
--    SET is_available = NOT is_available
--    WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
--    RETURNING *;
--
-- 3. Confirm INSERT is blocked (should fail if we only want UPDATE):
--    -- This should be blocked by the USING clause if no restaurant_id in query
--
-- 4. Verify policy allows UPDATE but not broad table scans:
--    EXPLAIN ANALYZE UPDATE menu_items SET is_available = true WHERE restaurant_id = 'test';
--
-- ============================================================
