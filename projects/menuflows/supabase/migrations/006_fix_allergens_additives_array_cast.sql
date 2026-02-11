-- ============================================================
-- Fix: Properly convert JSONB arrays to text[] for allergens/additives
-- Issue: menu_items.allergens and menu_items.additives are text[] columns
--        but RPC was using JSONB->text[] conversion incorrectly
-- Date: 2026-01-31
-- ============================================================

CREATE OR REPLACE FUNCTION upsert_menu_items(
  p_items JSONB,
  p_restaurant_id UUID
)
RETURNS JSONB AS $$
DECLARE
  item_record JSONB;
  result JSONB := '{"updated": 0, "errors": []}'::JSONB;
BEGIN
  -- Validate input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items provided';
  END IF;

  -- Process each item
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Upsert the item directly with proper array conversion
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
      COALESCE((item_record->>'id')::UUID, gen_random_uuid()),
      item_record->>'name',
      item_record->>'translated_name',
      item_record->>'description',
      (item_record->>'price')::NUMERIC,
      item_record->>'image_url',
      item_record->>'category',
      COALESCE((item_record->>'is_available')::BOOLEAN, true),
      (item_record->>'is_spicy')::BOOLEAN,
      (item_record->>'contains_peanuts')::BOOLEAN,
      -- FIX: Properly convert JSONB array to text[]
      CASE
        WHEN jsonb_typeof(item_record->'allergens') = 'array' THEN
          ARRAY(SELECT jsonb_array_elements_text(item_record->'allergens'))
        ELSE
          ARRAY[]::TEXT[]
      END,
      -- FIX: Properly convert JSONB array to text[]
      CASE
        WHEN jsonb_typeof(item_record->'additives') = 'array' THEN
          ARRAY(SELECT jsonb_array_elements_text(item_record->'additives'))
        ELSE
          ARRAY[]::TEXT[]
      END,
      (item_record->>'display_order')::INTEGER,
      p_restaurant_id
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
SECURITY DEFINER
SET search_path = public;

-- Grant execute to anon/authenticated
GRANT EXECUTE ON FUNCTION upsert_menu_items(JSONB, UUID) TO anon, authenticated;
