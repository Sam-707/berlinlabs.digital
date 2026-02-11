/**
 * MENU IMPORTER TOOL
 * Cleans and normalizes scraped menu data from UberEats, Deliveroo, etc.
 * Run with: npx ts-node tools/menu-importer.ts input.json
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURATION
// ============================================

// Standard categories - map all variations to these
const STANDARD_CATEGORIES = [
  'Burgers',
  'Sides',
  'Drinks',
  'Desserts',
  'Salads',
  'Appetizers',
  'Mains',
  'Pizza',
  'Pasta',
  'Breakfast',
  'Specials',
  'Kids Menu',
  'Extras',
] as const;

// Category mapping - add variations here
const CATEGORY_MAP: Record<string, string> = {
  // Burgers
  'burger': 'Burgers',
  'burgers': 'Burgers',
  'hamburgers': 'Burgers',
  'sandwiches': 'Burgers',
  'wraps': 'Burgers',
  'wraps & sandwiches': 'Burgers',

  // Sides
  'side': 'Sides',
  'sides': 'Sides',
  'side dishes': 'Sides',
  'beilagen': 'Sides', // German
  'fries': 'Sides',
  'extras': 'Extras',
  'add-ons': 'Extras',
  'toppings': 'Extras',

  // Drinks
  'drink': 'Drinks',
  'drinks': 'Drinks',
  'beverages': 'Drinks',
  'getränke': 'Drinks', // German
  'soft drinks': 'Drinks',
  'sodas': 'Drinks',
  'juices': 'Drinks',
  'shakes': 'Drinks',
  'milkshakes': 'Drinks',

  // Desserts
  'dessert': 'Desserts',
  'desserts': 'Desserts',
  'sweets': 'Desserts',
  'süßes': 'Desserts', // German
  'nachspeisen': 'Desserts', // German
  'ice cream': 'Desserts',

  // Salads
  'salad': 'Salads',
  'salads': 'Salads',
  'salate': 'Salads', // German
  'fresh salads': 'Salads',
  'healthy': 'Salads',
  'bowls': 'Salads',

  // Appetizers
  'appetizer': 'Appetizers',
  'appetizers': 'Appetizers',
  'starters': 'Appetizers',
  'vorspeisen': 'Appetizers', // German
  'small plates': 'Appetizers',
  'sharers': 'Appetizers',
  'sharing': 'Appetizers',

  // Mains
  'main': 'Mains',
  'mains': 'Mains',
  'main course': 'Mains',
  'main courses': 'Mains',
  'hauptgerichte': 'Mains', // German
  'entrees': 'Mains',
  'entrées': 'Mains',
  'chicken': 'Mains',
  'beef': 'Mains',
  'fish': 'Mains',
  'seafood': 'Mains',

  // Pizza
  'pizza': 'Pizza',
  'pizzas': 'Pizza',
  'pizzen': 'Pizza', // German

  // Pasta
  'pasta': 'Pasta',
  'pastas': 'Pasta',
  'noodles': 'Pasta',

  // Breakfast
  'breakfast': 'Breakfast',
  'frühstück': 'Breakfast', // German
  'brunch': 'Breakfast',
  'morning': 'Breakfast',

  // Specials
  'special': 'Specials',
  'specials': 'Specials',
  'deals': 'Specials',
  'combos': 'Specials',
  'meal deals': 'Specials',
  'angebote': 'Specials', // German
  'featured': 'Specials',
  'popular': 'Specials',
  'bestsellers': 'Specials',
  'most popular': 'Specials',

  // Kids
  'kids': 'Kids Menu',
  'kids menu': 'Kids Menu',
  'children': 'Kids Menu',
  'kindermenü': 'Kids Menu', // German
};

// Common allergens to detect in descriptions
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'Gluten': ['wheat', 'bread', 'bun', 'flour', 'brioche', 'pasta', 'noodle', 'gluten'],
  'Dairy': ['cheese', 'milk', 'cream', 'butter', 'mayo', 'mayonnaise', 'aioli', 'yogurt'],
  'Peanuts': ['peanut', 'peanuts', 'erdnuss'],
  'Tree Nuts': ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio'],
  'Eggs': ['egg', 'eggs', 'mayo', 'mayonnaise', 'aioli'],
  'Soy': ['soy', 'soya', 'tofu', 'edamame'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'anchovy'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'oyster'],
  'Sesame': ['sesame', 'tahini'],
};

// ============================================
// TYPES
// ============================================

// Generic scraped item (flexible to handle various sources)
interface ScrapedMenuItem {
  name?: string;
  title?: string;
  itemName?: string;

  description?: string;
  desc?: string;
  itemDescription?: string;

  price?: number | string;
  itemPrice?: number | string;
  priceAmount?: number | string;

  image?: string;
  imageUrl?: string;
  photo?: string;
  thumbnail?: string;

  category?: string;
  categoryName?: string;
  section?: string;

  available?: boolean;
  isAvailable?: boolean;
  inStock?: boolean;

  spicy?: boolean;
  isSpicy?: boolean;

  allergens?: string[];
  tags?: string[];
}

// Normalized menu item for our database
interface NormalizedMenuItem {
  name: string;
  translated_name: string | null;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  is_spicy: boolean;
  contains_peanuts: boolean;
  allergens: string[];
  additives: string[];
  display_order: number;
}

// ============================================
// NORMALIZATION FUNCTIONS
// ============================================

function normalizeCategory(rawCategory: string | undefined): string {
  if (!rawCategory) return 'Mains';

  const normalized = rawCategory.toLowerCase().trim();

  // Direct match
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // If no match, capitalize and use as-is (allows custom categories)
  return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
}

function extractPrice(rawPrice: number | string | undefined): number {
  if (rawPrice === undefined || rawPrice === null) return 0;

  if (typeof rawPrice === 'number') return rawPrice;

  // Handle string prices like "€14.50", "$12.00", "14,50 €"
  const cleaned = rawPrice
    .replace(/[€$£]/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function extractName(item: ScrapedMenuItem): string {
  return (
    item.name ||
    item.title ||
    item.itemName ||
    'Unnamed Item'
  ).trim();
}

function extractDescription(item: ScrapedMenuItem): string {
  return (
    item.description ||
    item.desc ||
    item.itemDescription ||
    ''
  ).trim();
}

function extractImage(item: ScrapedMenuItem): string {
  const url = item.image || item.imageUrl || item.photo || item.thumbnail || '';

  // Clean up URL if needed
  if (url.startsWith('//')) {
    return 'https:' + url;
  }

  return url;
}

function detectAllergens(description: string, existingAllergens?: string[]): string[] {
  const detected = new Set<string>(existingAllergens || []);
  const lowerDesc = description.toLowerCase();

  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        detected.add(allergen);
        break;
      }
    }
  }

  return Array.from(detected);
}

function detectSpicy(item: ScrapedMenuItem): boolean {
  if (item.spicy || item.isSpicy) return true;

  const description = extractDescription(item).toLowerCase();
  const name = extractName(item).toLowerCase();
  const text = `${name} ${description}`;

  const spicyKeywords = ['spicy', 'hot', 'jalapeño', 'jalapeno', 'chili', 'chilli', 'sriracha', 'buffalo', 'scharf'];
  return spicyKeywords.some(kw => text.includes(kw));
}

function normalizeMenuItem(item: ScrapedMenuItem, index: number): NormalizedMenuItem {
  const name = extractName(item);
  const description = extractDescription(item);
  const allergens = detectAllergens(description, item.allergens);

  return {
    name,
    translated_name: null, // Can be filled in later
    description,
    price: extractPrice(item.price || item.itemPrice || item.priceAmount),
    image_url: extractImage(item),
    category: normalizeCategory(item.category || item.categoryName || item.section),
    is_available: item.available ?? item.isAvailable ?? item.inStock ?? true,
    is_spicy: detectSpicy(item),
    contains_peanuts: allergens.includes('Peanuts'),
    allergens,
    additives: [],
    display_order: index,
  };
}

// ============================================
// IMPORT FUNCTION
// ============================================

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  items: NormalizedMenuItem[];
}

function processScrapedData(rawData: ScrapedMenuItem[] | Record<string, ScrapedMenuItem[]>): NormalizedMenuItem[] {
  let items: ScrapedMenuItem[] = [];

  // Handle different input formats
  if (Array.isArray(rawData)) {
    items = rawData;
  } else if (typeof rawData === 'object') {
    // Handle grouped by category format: { "Burgers": [...], "Sides": [...] }
    for (const [category, categoryItems] of Object.entries(rawData)) {
      if (Array.isArray(categoryItems)) {
        items.push(...categoryItems.map(item => ({ ...item, category })));
      }
    }
  }

  // Normalize all items
  return items
    .filter(item => item && (item.name || item.title || item.itemName))
    .map((item, index) => normalizeMenuItem(item, index));
}

async function importToSupabase(
  items: NormalizedMenuItem[],
  supabaseUrl: string,
  supabaseKey: string,
  clearExisting: boolean = false
): Promise<ImportResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    items: [],
  };

  try {
    // Optionally clear existing menu
    if (clearExisting) {
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        result.errors.push(`Failed to clear existing menu: ${deleteError.message}`);
      }
    }

    // Insert new items
    const { data, error } = await supabase
      .from('menu_items')
      .insert(items)
      .select();

    if (error) {
      result.errors.push(`Failed to insert items: ${error.message}`);
      return result;
    }

    result.success = true;
    result.imported = data?.length || 0;
    result.items = items;

  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
  }

  return result;
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║              MENUFLOWS MENU IMPORTER                       ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Usage:                                                    ║
║    npx ts-node tools/menu-importer.ts <input.json>         ║
║                                                            ║
║  Options:                                                  ║
║    --preview    Preview normalized data without importing  ║
║    --clear      Clear existing menu before import          ║
║    --output     Save normalized JSON to file               ║
║                                                            ║
║  Example:                                                  ║
║    npx ts-node tools/menu-importer.ts scraped.json         ║
║    npx ts-node tools/menu-importer.ts scraped.json --preview║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
    return;
  }

  const inputFile = args[0];
  const isPreview = args.includes('--preview');
  const clearExisting = args.includes('--clear');
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

  // Read input file
  const fs = await import('fs');
  const rawJson = fs.readFileSync(inputFile, 'utf-8');
  const rawData = JSON.parse(rawJson);

  console.log('\n📥 Processing scraped data...\n');

  // Process and normalize
  const normalizedItems = processScrapedData(rawData);

  // Group by category for display
  const byCategory = normalizedItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NormalizedMenuItem[]>);

  // Display summary
  console.log('📊 IMPORT SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Total items: ${normalizedItems.length}`);
  console.log('\nBy category:');
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`  • ${cat}: ${items.length} items`);
  }

  // Show sample items
  console.log('\n📋 SAMPLE ITEMS (first 3):');
  console.log('─'.repeat(50));
  normalizedItems.slice(0, 3).forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.name}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Price: €${item.price.toFixed(2)}`);
    console.log(`   Description: ${item.description.substring(0, 60)}...`);
    if (item.allergens.length) console.log(`   Allergens: ${item.allergens.join(', ')}`);
    if (item.is_spicy) console.log(`   🌶️ Spicy`);
  });

  // Save to file if requested
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(normalizedItems, null, 2));
    console.log(`\n💾 Saved normalized data to: ${outputFile}`);
  }

  if (isPreview) {
    console.log('\n✨ Preview complete. Use without --preview to import to Supabase.');
    return;
  }

  // Import to Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n⚠️  Supabase credentials not found in environment.');
    console.log('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('   Or use --output to save JSON and import manually.');
    return;
  }

  console.log('\n🚀 Importing to Supabase...');
  const result = await importToSupabase(normalizedItems, supabaseUrl, supabaseKey, clearExisting);

  if (result.success) {
    console.log(`\n✅ Successfully imported ${result.imported} items!`);
  } else {
    console.log('\n❌ Import failed:');
    result.errors.forEach(err => console.log(`   • ${err}`));
  }
}

// Export for use as module
export {
  processScrapedData,
  normalizeMenuItem,
  normalizeCategory,
  importToSupabase,
  STANDARD_CATEGORIES,
  CATEGORY_MAP,
  NormalizedMenuItem,
  ScrapedMenuItem,
};

// Run CLI if executed directly
main().catch(console.error);
