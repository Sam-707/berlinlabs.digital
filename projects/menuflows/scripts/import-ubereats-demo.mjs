import fs from 'fs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const readEnv = (path) => {
  const env = fs.readFileSync(path, 'utf8');
  const get = (key) => {
    const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  };
  return {
    url: get('VITE_SUPABASE_URL'),
    key: get('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  };
};

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith('--slug='))?.split('=')[1] || 'demo';
const replace = args.includes('--replace');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 200;

const { url, key } = readEnv('.env.local');
if (!url || !key) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const raw = fs.readFileSync('public/dataset_ubereats-menu-scraper---v2_2026-01-05_14-09-42-985.json', 'utf8');
const json = JSON.parse(raw);
const payload = Array.isArray(json) ? json[0] : json;
const products = payload?.products;
if (!Array.isArray(products)) {
  console.error('Unsupported UberEats JSON format.');
  process.exit(1);
}

const { data: restaurant, error: restaurantError } = await supabase
  .from('restaurants')
  .select('id,slug,name')
  .eq('slug', slug)
  .single();

if (restaurantError || !restaurant) {
  console.error('Failed to find restaurant for slug:', slug, restaurantError?.message || '');
  process.exit(1);
}

if (replace) {
  const { error: deleteError } = await supabase
    .from('menu_items')
    .delete()
    .eq('restaurant_id', restaurant.id);
  if (deleteError) {
    console.error('Failed to clear existing menu items:', deleteError.message);
    process.exit(1);
  }
}

const items = [];
let orderIndex = 0;

for (const category of products) {
  const categoryTitle = (category?.categoryTitle || 'Uncategorized').toString().trim() || 'Uncategorized';
  const catProducts = category?.categoryProducts;
  if (!Array.isArray(catProducts)) continue;

  for (const product of catProducts) {
    if (items.length >= limit) break;

    const priceRaw = product?.price;
    const priceNum = typeof priceRaw === 'string' ? Number.parseFloat(priceRaw) : priceRaw;
    const price = typeof priceNum === 'number' ? priceNum / 100 : 0;

    const imageUrl = product?.imageUrl
      || (Array.isArray(product?.images) ? product.images[0]?.imageUrl : '')
      || '';

    items.push({
      id: crypto.randomUUID(),
      restaurant_id: restaurant.id,
      name: (product?.title || '').toString().trim(),
      description: (product?.itemDescription || '').toString().trim(),
      price,
      image_url: imageUrl,
      category: categoryTitle,
      is_available: true,
      display_order: orderIndex++,
    });
  }

  if (items.length >= limit) break;
}

if (items.length === 0) {
  console.error('No items found to import.');
  process.exit(1);
}

const { error: insertError } = await supabase
  .from('menu_items')
  .insert(items);

if (insertError) {
  console.error('Failed to insert menu items:', insertError.message);
  process.exit(1);
}

console.log(`Imported ${items.length} items for ${restaurant.slug} (${restaurant.name}).`);
