
import { MenuItem } from './types';

export const BURGER_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';

// Note: Menu categories are now DB-driven via the menu_categories table.
// The old CATEGORIES constant has been removed. Fetch via api.getCategories().

export const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Double Trouble',
    translatedName: 'İkili Lezzet',
    description: 'Two smash patties, double cheese, caramelized onions, house sauce on brioche.',
    price: 14.50,
    image: BURGER_IMAGE,
    category: 'Burgers',
    isAvailable: true,
    isSpicy: true,
    containsPeanuts: true,
    allergens: ['Peanuts', 'Gluten', 'Dairy'],
    additives: ['Preservatives (E250)']
  },
  {
    id: '2',
    name: 'Spicy Chicken',
    translatedName: 'Acılı Tavuk',
    description: 'Crispy breast, spicy slaw, pickles, chipotle mayo, toasted bun.',
    price: 12.00,
    image: BURGER_IMAGE, // Using same hotlink as it's the only one provided
    category: 'Burgers',
    isAvailable: true,
    isSpicy: true
  },
  {
    id: '3',
    name: 'Mushroom Swiss',
    translatedName: 'Mantarlı İsviçre',
    description: 'Sautéed wild mushrooms, truffle aioli, swiss cheese, fresh arugula.',
    price: 15.50,
    image: BURGER_IMAGE,
    category: 'Burgers',
    isAvailable: true
  },
  {
    id: '4',
    name: 'Classic Fries',
    description: 'Triple cooked house fries with sea salt.',
    price: 4.50,
    image: BURGER_IMAGE,
    category: 'Sides',
    isAvailable: true
  },
  {
    id: '5',
    name: 'Truffle Mayo Dip',
    description: 'Rich and creamy truffle-infused mayonnaise.',
    price: 1.50,
    image: BURGER_IMAGE,
    category: 'Sides',
    isAvailable: true
  }
];

