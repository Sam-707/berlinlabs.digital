-- ============================================================
-- Migration: Fix trigger guard to allow no-op updates
-- Purpose: Allow UPDATE when field values haven't actually changed
-- Date: 2025-01-28
-- ============================================================
--
-- PROBLEM:
-- The trigger guard uses JSONB diff to detect changed columns.
-- When upsert sets all columns (even with same values), the diff
-- shows all columns as "changed" and blocks legitimate updates.
--
-- SOLUTION:
-- Compare actual values, not just column presence. Allow UPDATE if:
-- 1. Only is_available changed (toggle), OR
-- 2. No actual value changes (all fields have same values), OR
-- 3. Only system fields changed (id, restaurant_id, display_order)
--
-- ============================================================

CREATE OR REPLACE FUNCTION guard_menu_items_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _changed_cols TEXT[];
  _has_real_changes BOOLEAN := FALSE;
BEGIN
  -- Get list of columns that are different (not just present)
  SELECT array_agg(jsonb_object_keys(NEW - OLD))
    INTO _changed_cols
    FROM jsonb(NEW - OLD);

  -- If no columns changed, allow (no-op update)
  IF _changed_cols IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if any non-allowed columns changed
  _has_real_changes := EXISTS (
    SELECT 1
    FROM unnest(_changed_cols) AS col
    WHERE col NOT IN ('is_available', 'id', 'restaurant_id', 'display_order')
  );

  -- Block if fields other than allowed ones changed
  IF _has_real_changes THEN
    RAISE EXCEPTION 'Only is_available field can be modified'
    USING ERRCODE = 'WRONG_DATA',
          DETAIL = 'UPDATE of menu_items is restricted to is_available field only.';
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- VERIFICATION
-- ============================================================
--
-- Test 1: No-op update should succeed:
--   UPDATE menu_items SET name = name WHERE id = 'some-id';
--
-- Test 2: is_available toggle should succeed:
--   UPDATE menu_items SET is_available = NOT is_available WHERE id = 'some-id';
--
-- Test 3: Changing name should fail:
--   UPDATE menu_items SET name = 'Hacked' WHERE id = 'some-id';
--
-- ============================================================
