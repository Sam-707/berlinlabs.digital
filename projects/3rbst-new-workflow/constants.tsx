
import { MenuItem } from './types';

export const BURGER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDay4jloIdCfIwm0UHBBuXkSIN9ObE474ZOE9dD2Ka_9AgfW8ao239QKCUHueWO9STHXoz-95i17-5XwTp-s3bsT00Nhtz8wqt29H9Cgs8OHHNYKmIW-kiiBVBnIAcxGdCRMCxUb-BOShUXh7-M92NWJTmdhcGG1KE2FW-ET2REDtcnPj0JUOZwGs3G0Y1YJF-vfKRFPqrsSYorbsMzbV2zAaMUSBlARus5DvrZo44UzX9AEJonivsf0llp3vXK9T4fEdB_Dnj-Nf_d';

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

export const CATEGORIES = ['Burgers', 'Sides', 'Drinks', 'Desserts'];
