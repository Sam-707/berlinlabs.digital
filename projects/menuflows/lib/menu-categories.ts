// Business-type specific menu categories
// Provides appropriate category presets for each business type

export const BUSINESS_TYPE_CATEGORIES: Record<string, string[]> = {
  restaurant: ['Appetizers', 'Mains', 'Sides', 'Salads', 'Desserts', 'Drinks', 'Specials'],
  cafe: ['Coffee', 'Tea', 'Pastries', 'Breakfast', 'Sandwiches', 'Salads', 'Desserts'],
  bar: ['Cocktails', 'Beer', 'Wine', 'Spirits', 'Bar Snacks', 'Soft Drinks'],
  bakery: ['Breads', 'Pastries', 'Cakes', 'Cookies', 'Sandwiches', 'Coffee'],
  fast_food: ['Burgers', 'Chicken', 'Sides', 'Drinks', 'Desserts', 'Combos', 'Kids Menu'],
  food_truck: ['Specialties', 'Sides', 'Drinks', 'Desserts'],
};

// Default categories for unknown business types
const DEFAULT_CATEGORIES = [
  'Appetizers', 'Mains', 'Sides', 'Salads', 'Desserts', 'Drinks', 'Specials',
];

// Category normalization mappings per business type
// Maps common input variations to standard categories
export const CATEGORY_NORMALIZATIONS: Record<string, Record<string, string>> = {
  restaurant: {
    // Appetizers
    'appetizer': 'Appetizers', 'appetizers': 'Appetizers', 'starters': 'Appetizers',
    'starter': 'Appetizers', 'vorspeisen': 'Appetizers', 'vorspeise': 'Appetizers',
    // Mains
    'main': 'Mains', 'mains': 'Mains', 'main course': 'Mains', 'entrees': 'Mains',
    'entree': 'Mains', 'hauptgerichte': 'Mains', 'hauptgericht': 'Mains',
    // Sides
    'side': 'Sides', 'sides': 'Sides', 'side dishes': 'Sides', 'beilagen': 'Sides',
    'fries': 'Sides',
    // Salads
    'salad': 'Salads', 'salads': 'Salads', 'bowls': 'Salads', 'bowl': 'Salads',
    // Desserts
    'dessert': 'Desserts', 'desserts': 'Desserts', 'sweets': 'Desserts',
    'nachspeisen': 'Desserts', 'nachtisch': 'Desserts',
    // Drinks
    'drink': 'Drinks', 'drinks': 'Drinks', 'beverages': 'Drinks',
    'getränke': 'Drinks', 'soft drinks': 'Drinks',
    // Specials
    'special': 'Specials', 'specials': 'Specials', 'deals': 'Specials',
    'tagesangebot': 'Specials',
  },
  cafe: {
    // Coffee
    'coffee': 'Coffee', 'kaffee': 'Coffee', 'espresso': 'Coffee',
    'cappuccino': 'Coffee', 'latte': 'Coffee',
    // Tea
    'tea': 'Tea', 'tee': 'Tea', 'chai': 'Tea', 'teas': 'Tea',
    // Pastries
    'pastry': 'Pastries', 'pastries': 'Pastries', 'gebäck': 'Pastries',
    'croissant': 'Pastries', 'croissants': 'Pastries',
    // Breakfast
    'breakfast': 'Breakfast', 'brunch': 'Breakfast', 'frühstück': 'Breakfast',
    // Sandwiches
    'sandwich': 'Sandwiches', 'sandwiches': 'Sandwiches', 'belegtes brötchen': 'Sandwiches',
    'panini': 'Sandwiches', 'wraps': 'Sandwiches', 'wrap': 'Sandwiches',
    // Salads
    'salad': 'Salads', 'salads': 'Salads', 'bowls': 'Salads',
    // Desserts
    'dessert': 'Desserts', 'desserts': 'Desserts', 'sweets': 'Desserts',
    'kuchen': 'Desserts', 'cake': 'Desserts',
  },
  bar: {
    // Cocktails
    'cocktail': 'Cocktails', 'cocktails': 'Cocktails', 'mixed drinks': 'Cocktails',
    'mixgetränke': 'Cocktails',
    // Beer
    'beer': 'Beer', 'beers': 'Beer', 'bier': 'Beer', 'draft': 'Beer',
    'tap': 'Beer', 'vom fass': 'Beer',
    // Wine
    'wine': 'Wine', 'wines': 'Wine', 'wein': 'Wine', 'weine': 'Wine',
    'red wine': 'Wine', 'white wine': 'Wine',
    // Spirits
    'spirit': 'Spirits', 'spirits': 'Spirits', 'liquor': 'Spirits',
    'schnaps': 'Spirits', 'whiskey': 'Spirits', 'whisky': 'Spirits',
    'vodka': 'Spirits', 'rum': 'Spirits', 'gin': 'Spirits',
    // Bar Snacks
    'snack': 'Bar Snacks', 'snacks': 'Bar Snacks', 'bar snacks': 'Bar Snacks',
    'appetizers': 'Bar Snacks', 'bites': 'Bar Snacks', 'small plates': 'Bar Snacks',
    // Soft Drinks
    'soft drinks': 'Soft Drinks', 'soft drink': 'Soft Drinks',
    'non-alcoholic': 'Soft Drinks', 'alkoholfrei': 'Soft Drinks',
    'soda': 'Soft Drinks', 'juice': 'Soft Drinks',
  },
  bakery: {
    // Breads
    'bread': 'Breads', 'breads': 'Breads', 'brot': 'Breads', 'brötchen': 'Breads',
    'loaf': 'Breads', 'loaves': 'Breads',
    // Pastries
    'pastry': 'Pastries', 'pastries': 'Pastries', 'gebäck': 'Pastries',
    'croissant': 'Pastries', 'danish': 'Pastries', 'muffin': 'Pastries',
    // Cakes
    'cake': 'Cakes', 'cakes': 'Cakes', 'kuchen': 'Cakes', 'torte': 'Cakes',
    'torten': 'Cakes',
    // Cookies
    'cookie': 'Cookies', 'cookies': 'Cookies', 'keks': 'Cookies', 'kekse': 'Cookies',
    'biscuit': 'Cookies', 'biscuits': 'Cookies',
    // Sandwiches
    'sandwich': 'Sandwiches', 'sandwiches': 'Sandwiches', 'belegtes brötchen': 'Sandwiches',
    // Coffee
    'coffee': 'Coffee', 'kaffee': 'Coffee', 'drinks': 'Coffee',
    'beverages': 'Coffee', 'getränke': 'Coffee',
  },
  fast_food: {
    // Burgers
    'burger': 'Burgers', 'burgers': 'Burgers', 'hamburgers': 'Burgers',
    'hamburger': 'Burgers',
    // Chicken
    'chicken': 'Chicken', 'wings': 'Chicken', 'nuggets': 'Chicken',
    'hähnchen': 'Chicken', 'poultry': 'Chicken',
    // Sides
    'side': 'Sides', 'sides': 'Sides', 'fries': 'Sides', 'pommes': 'Sides',
    'beilagen': 'Sides',
    // Drinks
    'drink': 'Drinks', 'drinks': 'Drinks', 'beverages': 'Drinks',
    'getränke': 'Drinks', 'soft drinks': 'Drinks', 'shakes': 'Drinks',
    // Desserts
    'dessert': 'Desserts', 'desserts': 'Desserts', 'sweets': 'Desserts',
    'ice cream': 'Desserts', 'eis': 'Desserts',
    // Combos
    'combo': 'Combos', 'combos': 'Combos', 'meal': 'Combos', 'meals': 'Combos',
    'menü': 'Combos', 'menu': 'Combos',
    // Kids Menu
    'kids': 'Kids Menu', 'kids menu': 'Kids Menu', 'children': 'Kids Menu',
    'kinder': 'Kids Menu', 'kindermenü': 'Kids Menu',
  },
  food_truck: {
    // Specialties
    'specialty': 'Specialties', 'specialties': 'Specialties', 'special': 'Specialties',
    'specials': 'Specialties', 'main': 'Specialties', 'mains': 'Specialties',
    'signature': 'Specialties',
    // Sides
    'side': 'Sides', 'sides': 'Sides', 'fries': 'Sides', 'extras': 'Sides',
    // Drinks
    'drink': 'Drinks', 'drinks': 'Drinks', 'beverages': 'Drinks',
    'getränke': 'Drinks',
    // Desserts
    'dessert': 'Desserts', 'desserts': 'Desserts', 'sweets': 'Desserts',
  },
};

// Allergen detection keywords
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'Gluten': ['wheat', 'bread', 'bun', 'flour', 'brioche', 'pasta', 'weizen', 'mehl'],
  'Dairy': ['cheese', 'milk', 'cream', 'butter', 'mayo', 'aioli', 'käse', 'milch', 'sahne'],
  'Peanuts': ['peanut', 'peanuts', 'erdnuss', 'erdnüsse'],
  'Eggs': ['egg', 'eggs', 'mayo', 'mayonnaise', 'ei', 'eier'],
  'Soy': ['soy', 'tofu', 'soja'],
  'Sesame': ['sesame', 'tahini', 'sesam'],
  'Tree Nuts': ['almond', 'walnut', 'cashew', 'pistachio', 'mandel', 'walnuss'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'fisch', 'lachs', 'thunfisch'],
  'Shellfish': ['shrimp', 'crab', 'lobster', 'mussel', 'garnele', 'krabbe', 'hummer'],
};

// Spicy detection keywords
const SPICY_KEYWORDS = [
  'spicy', 'hot', 'jalapeño', 'jalapeno', 'chili', 'chile', 'sriracha',
  'buffalo', 'scharf', 'habanero', 'cayenne', 'wasabi', 'szechuan',
];

/**
 * Get the list of categories for a given business type
 */
export function getCategoriesForBusinessType(businessType: string | undefined): string[] {
  if (!businessType) return DEFAULT_CATEGORIES;
  return BUSINESS_TYPE_CATEGORIES[businessType] || DEFAULT_CATEGORIES;
}

/**
 * Normalize a raw category string to a standard category for the given business type
 */
export function normalizeCategory(raw: string, businessType: string | undefined): string {
  const normalized = raw.toLowerCase().trim();

  // Get normalizations for the business type
  const normalizations = businessType
    ? CATEGORY_NORMALIZATIONS[businessType]
    : null;

  // Try exact match first
  if (normalizations && normalizations[normalized]) {
    return normalizations[normalized];
  }

  // Try partial match
  if (normalizations) {
    for (const [key, value] of Object.entries(normalizations)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
  }

  // Fall back to checking if raw matches any of the business type's standard categories
  const categories = getCategoriesForBusinessType(businessType);
  for (const cat of categories) {
    if (normalized === cat.toLowerCase()) {
      return cat;
    }
  }

  // Last resort: capitalize first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/**
 * Detect allergens from a description string
 */
export function detectAllergens(description: string): string[] {
  const detected: string[] = [];
  const lower = description.toLowerCase();

  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(allergen);
    }
  }

  return detected;
}

/**
 * Detect if an item is spicy from name and description
 */
export function detectSpicy(name: string, description: string): boolean {
  const text = `${name} ${description}`.toLowerCase();
  return SPICY_KEYWORDS.some(kw => text.includes(kw));
}

/**
 * Get the default category for a business type (first in the list)
 */
export function getDefaultCategory(businessType: string | undefined): string {
  const categories = getCategoriesForBusinessType(businessType);
  return categories[0] || 'Mains';
}
