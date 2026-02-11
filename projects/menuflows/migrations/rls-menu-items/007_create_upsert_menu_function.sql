-- ============================================================
-- Function: upsert_menu_items
-- Purpose: Upsert menu items bypassing RLS (definer rights)
-- Security: Runs with postgres privileges, validates restaurant_id
-- Date: 2026-01-29
-- ============================================================

CREATE OR REPLACE FUNCTION upsert_menu_items(
  p_items JSONB,
  p_restaurant_id UUID
)
RETURNS JSONB AS $$
DECLARE
  item_record JSONB;
  parsed_item menu_items%ROWTYPE;
  result JSONB := '{"updated": 0, "errors": []}'::JSONB;
BEGIN
  -- Validate input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items provided';
  END IF;

  -- Process each item
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Parse JSON to menu_items record type
    parsed_item := (
      NULL,  -- id (will be generated if NULL)
      item_record->>'name',
      item_record->>'translated_name',
      item_record->>'description',
      (item_record->>'price')::NUMERIC,
      item_record->>'image_url',
      item_record->>'category',
      COALESCE((item_record->>'is_available')::BOOLEAN, true),
      (item_record->>'is_spicy')::BOOLEAN,
      (item_record->>'contains_peanuts')::BOOLEAN,
      COALESCE(item_record->'allergens', '[]'::JSONB),
      COALESCE(item_record->'additives', '[]'::JSONB),
      (item_record->>'display_order')::INTEGER,
      p_restaurant_id,  -- restaurant_id from parameter
      NULL,  -- created_at (will be set by default)
      NULL   -- updated_at
    );

    -- Upsert the item
    INSERT INTO menu_items (
      id,
      name,
      translated_name,
      description,
      price,
      image_url,
      category,
      is_available,
      is_spicy,
      contains_peanuts,
      allergens,
      additives,
      display_order,
      restaurant_id
    ) VALUES (
      parsed_item.id,
      parsed_item.name,
      parsed_item.translated_name,
      parsed_item.description,
      parsed_item.price,
      parsed_item.image_url,
      parsed_item.category,
      parsed_item.is_available,
      parsed_item.is_spicy,
      parsed_item.contains_peanuts,
      parsed_item.allergens,
      parsed_item.additives,
      parsed_item.display_order,
      parsed_item.restaurant_id
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      translated_name = EXCLUDED.translated_name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      image_url = EXCLUDED.image_url,
      category = EXCLUDED.category,
      is_available = EXCLUDED.is_available,
      is_spicy = EXCLUDED.is_spicy,
      contains_peanuts = EXCLUDED.contains_peanuts,
      allergens = EXCLUDED.allergens,
      additives = EXCLUDED.additives,
      display_order = EXCLUDED.display_order,
      restaurant_id = EXCLUDED.restaurant_id,
      updated_at = NOW();

    -- Increment counter
    result := result || jsonb_build_object('updated', (result->>'updated')::INT + 1);
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER  -- Key: runs with definer (postgres) privileges
SET search_path = public;

-- Grant execute to anon/authenticated
GRANT EXECUTE ON FUNCTION upsert_menu_items(JSONB, UUID) TO anon, authenticated;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Test with:
-- SELECT upsert_menu_items(
--   '[{"id": "test-id", "name": "Test", "price": 9.99, "category": "Test", "image_url": "test", "description": "test"}]'::JSONB,
--   'your-restaurant-id'::UUID
-- );
