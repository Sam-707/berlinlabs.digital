/**
 * Menu Modifiers Utilities
 * Validation helpers and price calculation utilities for item modifiers
 */

import { ModifierGroup, Modifier, SelectedModifier, CartItem, MenuItem } from '../types';

/**
 * Validation result for modifier selections
 */
export interface ModifierValidationResult {
  isValid: boolean;
  errors: ModifierValidationError[];
}

export interface ModifierValidationError {
  groupId: string;
  groupName: string;
  message: string;
}

/**
 * Validates selected modifiers against a modifier group's rules
 */
export function validateModifierGroup(
  group: ModifierGroup,
  selectedModifierIds: string[]
): ModifierValidationError | null {
  const selectedCount = selectedModifierIds.length;

  // Check minimum selections (for required groups)
  if (group.isRequired && selectedCount < group.minSelections) {
    return {
      groupId: group.id,
      groupName: group.name,
      message: group.minSelections === 1
        ? `Please select a ${group.name.toLowerCase()}`
        : `Please select at least ${group.minSelections} ${group.name.toLowerCase()} options`,
    };
  }

  // Check maximum selections
  if (selectedCount > group.maxSelections) {
    return {
      groupId: group.id,
      groupName: group.name,
      message: group.maxSelections === 1
        ? `Only one ${group.name.toLowerCase()} can be selected`
        : `Maximum ${group.maxSelections} ${group.name.toLowerCase()} options allowed`,
    };
  }

  return null;
}

/**
 * Validates all modifier selections for a menu item
 */
export function validateAllModifiers(
  modifierGroups: ModifierGroup[],
  selectedModifiers: SelectedModifier[]
): ModifierValidationResult {
  const errors: ModifierValidationError[] = [];

  for (const group of modifierGroups) {
    const selectedForGroup = selectedModifiers.filter(m => m.groupId === group.id);
    const selectedIds = selectedForGroup.map(m => m.modifierId);
    const error = validateModifierGroup(group, selectedIds);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if all required modifiers have been selected
 */
export function hasAllRequiredModifiers(
  modifierGroups: ModifierGroup[],
  selectedModifiers: SelectedModifier[]
): boolean {
  const requiredGroups = modifierGroups.filter(g => g.isRequired);

  for (const group of requiredGroups) {
    const selectedForGroup = selectedModifiers.filter(m => m.groupId === group.id);
    if (selectedForGroup.length < group.minSelections) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates the total price adjustment from selected modifiers
 */
export function calculateModifiersTotal(selectedModifiers: SelectedModifier[]): number {
  if (!selectedModifiers || !Array.isArray(selectedModifiers)) {
    return 0;
  }
  return selectedModifiers.reduce((total, modifier) => total + (modifier?.priceAdjustment || 0), 0);
}

/**
 * Calculates the unit price (base price + modifiers)
 */
export function calculateUnitPrice(basePrice: number, selectedModifiers: SelectedModifier[]): number {
  const safeBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) ? basePrice : 0;
  return safeBasePrice + calculateModifiersTotal(selectedModifiers);
}

/**
 * Calculates the line total (unit price * quantity)
 */
export function calculateLineTotal(cartItem: CartItem): number {
  if (!cartItem) {
    return 0;
  }
  const unitPrice = typeof cartItem.unitPrice === 'number' && !isNaN(cartItem.unitPrice) ? cartItem.unitPrice : 0;
  const quantity = typeof cartItem.quantity === 'number' && !isNaN(cartItem.quantity) ? cartItem.quantity : 1;
  return unitPrice * quantity;
}

/**
 * Calculates the cart total from all cart items
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  if (!cartItems || !Array.isArray(cartItems)) {
    return 0;
  }
  return cartItems.reduce((total, item) => total + calculateLineTotal(item), 0);
}

/**
 * Creates a SelectedModifier from a ModifierGroup and Modifier
 */
export function createSelectedModifier(group: ModifierGroup, modifier: Modifier): SelectedModifier {
  return {
    groupId: group.id,
    groupName: group.nameTranslated || group.name,
    modifierId: modifier.id,
    modifierName: modifier.nameTranslated || modifier.name,
    priceAdjustment: modifier.priceAdjustment,
  };
}

/**
 * Creates a CartItem from a MenuItem with selected modifiers
 */
export function createCartItem(
  menuItem: MenuItem,
  selectedModifiers: SelectedModifier[],
  quantity: number = 1,
  notes?: string
): CartItem {
  const modifiersTotal = calculateModifiersTotal(selectedModifiers);
  const unitPrice = menuItem.price + modifiersTotal;

  return {
    id: crypto.randomUUID(),
    menuItemId: menuItem.id,
    quantity,
    notes,
    selectedModifiers,
    basePrice: menuItem.price,
    modifiersTotal,
    unitPrice,
  };
}

/**
 * Gets the default selected modifiers for a menu item (isDefault = true)
 */
export function getDefaultModifiers(modifierGroups: ModifierGroup[]): SelectedModifier[] {
  const defaults: SelectedModifier[] = [];

  for (const group of modifierGroups) {
    for (const modifier of group.modifiers) {
      if (modifier.isDefault && modifier.isAvailable) {
        defaults.push(createSelectedModifier(group, modifier));
      }
    }
  }

  return defaults;
}

/**
 * Toggles a modifier selection (adds or removes)
 * Handles single-select (radio) and multi-select (checkbox) groups
 */
export function toggleModifier(
  group: ModifierGroup,
  modifier: Modifier,
  currentSelections: SelectedModifier[]
): SelectedModifier[] {
  const isSingleSelect = group.maxSelections === 1;
  const isCurrentlySelected = currentSelections.some(
    s => s.groupId === group.id && s.modifierId === modifier.id
  );

  // Remove current selection(s) for this group
  let newSelections = currentSelections.filter(s => s.groupId !== group.id);

  if (isSingleSelect) {
    // Single select: replace with new selection (or leave empty if deselecting)
    if (!isCurrentlySelected) {
      newSelections.push(createSelectedModifier(group, modifier));
    }
  } else {
    // Multi-select: keep other selections in this group, toggle current
    const otherSelectionsInGroup = currentSelections.filter(
      s => s.groupId === group.id && s.modifierId !== modifier.id
    );
    newSelections = [...newSelections, ...otherSelectionsInGroup];

    if (!isCurrentlySelected) {
      // Check if we can add more
      if (otherSelectionsInGroup.length < group.maxSelections) {
        newSelections.push(createSelectedModifier(group, modifier));
      }
    }
  }

  return newSelections;
}

/**
 * Checks if a modifier can be selected (not at max limit)
 */
export function canSelectModifier(
  group: ModifierGroup,
  modifier: Modifier,
  currentSelections: SelectedModifier[]
): boolean {
  if (!modifier.isAvailable) {
    return false;
  }

  const isCurrentlySelected = currentSelections.some(
    s => s.groupId === group.id && s.modifierId === modifier.id
  );

  if (isCurrentlySelected) {
    // Can always deselect (if not at minimum for required groups)
    const selectionsInGroup = currentSelections.filter(s => s.groupId === group.id);
    return !group.isRequired || selectionsInGroup.length > group.minSelections;
  }

  // Check if at max selections for this group
  const selectionsInGroup = currentSelections.filter(s => s.groupId === group.id);
  return selectionsInGroup.length < group.maxSelections;
}

/**
 * Checks if a modifier is currently selected
 */
export function isModifierSelected(
  groupId: string,
  modifierId: string,
  currentSelections: SelectedModifier[]
): boolean {
  return currentSelections.some(
    s => s.groupId === groupId && s.modifierId === modifierId
  );
}

/**
 * Formats a price adjustment for display
 * Examples: "+2.50", "-1.00", "" (for 0)
 */
export function formatPriceAdjustment(priceAdjustment: number): string {
  if (priceAdjustment === 0) {
    return '';
  }
  const sign = priceAdjustment > 0 ? '+' : '';
  return `${sign}${priceAdjustment.toFixed(2)}`;
}

/**
 * Sorts modifier groups by display order
 */
export function sortModifierGroups(groups: ModifierGroup[]): ModifierGroup[] {
  return [...groups].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Sorts modifiers within a group by display order
 */
export function sortModifiers(modifiers: Modifier[]): Modifier[] {
  return [...modifiers].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Gets a summary of selected modifiers for display (e.g., "Large, Extra Cheese")
 */
export function getModifiersSummary(selectedModifiers: SelectedModifier[]): string {
  if (!selectedModifiers || selectedModifiers.length === 0) {
    return '';
  }
  return selectedModifiers.map(m => m.modifierName).join(', ');
}

/**
 * Groups selected modifiers by their group for display
 */
export function groupSelectedModifiers(
  selectedModifiers: SelectedModifier[]
): Map<string, SelectedModifier[]> {
  const grouped = new Map<string, SelectedModifier[]>();

  for (const modifier of selectedModifiers) {
    const existing = grouped.get(modifier.groupId) || [];
    grouped.set(modifier.groupId, [...existing, modifier]);
  }

  return grouped;
}

/**
 * Business type modifier templates for quick setup
 */
export const MODIFIER_TEMPLATES: Record<string, ModifierGroup[]> = {
  restaurant: [
    {
      id: 'size',
      name: 'Size',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 0,
      modifiers: [
        { id: 'small', name: 'Small', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'medium', name: 'Medium', priceAdjustment: 1.50, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'large', name: 'Large', priceAdjustment: 2.50, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
    {
      id: 'cooking',
      name: 'Cooking',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 1,
      modifiers: [
        { id: 'rare', name: 'Rare', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 0 },
        { id: 'medium-rare', name: 'Medium Rare', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 1 },
        { id: 'medium', name: 'Medium', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 2 },
        { id: 'well-done', name: 'Well Done', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 3 },
      ],
    },
    {
      id: 'extras',
      name: 'Extras',
      minSelections: 0,
      maxSelections: 5,
      isRequired: false,
      displayOrder: 2,
      modifiers: [
        { id: 'bacon', name: 'Bacon', priceAdjustment: 2.00, isAvailable: true, isDefault: false, displayOrder: 0 },
        { id: 'cheese', name: 'Extra Cheese', priceAdjustment: 1.50, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'avocado', name: 'Avocado', priceAdjustment: 2.50, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
  ],
  cafe: [
    {
      id: 'size',
      name: 'Size',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 0,
      modifiers: [
        { id: 'small', name: 'Small', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'medium', name: 'Medium', priceAdjustment: 0.80, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'large', name: 'Large', priceAdjustment: 1.50, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
    {
      id: 'milk',
      name: 'Milk',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 1,
      modifiers: [
        { id: 'whole', name: 'Whole Milk', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'oat', name: 'Oat Milk', priceAdjustment: 0.60, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'almond', name: 'Almond Milk', priceAdjustment: 0.60, isAvailable: true, isDefault: false, displayOrder: 2 },
        { id: 'soy', name: 'Soy Milk', priceAdjustment: 0.50, isAvailable: true, isDefault: false, displayOrder: 3 },
      ],
    },
    {
      id: 'extras',
      name: 'Extras',
      minSelections: 0,
      maxSelections: 3,
      isRequired: false,
      displayOrder: 2,
      modifiers: [
        { id: 'extra-shot', name: 'Extra Shot', priceAdjustment: 0.80, isAvailable: true, isDefault: false, displayOrder: 0 },
        { id: 'vanilla', name: 'Vanilla Syrup', priceAdjustment: 0.50, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'caramel', name: 'Caramel Syrup', priceAdjustment: 0.50, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
  ],
  bar: [
    {
      id: 'size',
      name: 'Size',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 0,
      modifiers: [
        { id: 'single', name: 'Single', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'double', name: 'Double', priceAdjustment: 4.00, isAvailable: true, isDefault: false, displayOrder: 1 },
      ],
    },
    {
      id: 'mixer',
      name: 'Mixer',
      minSelections: 0,
      maxSelections: 1,
      isRequired: false,
      displayOrder: 1,
      modifiers: [
        { id: 'tonic', name: 'Tonic Water', priceAdjustment: 2.00, isAvailable: true, isDefault: false, displayOrder: 0 },
        { id: 'soda', name: 'Soda Water', priceAdjustment: 1.50, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'cola', name: 'Cola', priceAdjustment: 2.00, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
  ],
  bakery: [
    {
      id: 'size',
      name: 'Size',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 0,
      modifiers: [
        { id: 'slice', name: 'Slice', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'whole', name: 'Whole', priceAdjustment: 15.00, isAvailable: true, isDefault: false, displayOrder: 1 },
      ],
    },
  ],
  food_truck: [
    {
      id: 'spice',
      name: 'Spice Level',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 0,
      modifiers: [
        { id: 'mild', name: 'Mild', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'medium', name: 'Medium', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'hot', name: 'Hot', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 2 },
        { id: 'extra-hot', name: 'Extra Hot', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 3 },
      ],
    },
    {
      id: 'protein',
      name: 'Protein',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      displayOrder: 1,
      modifiers: [
        { id: 'chicken', name: 'Chicken', priceAdjustment: 0, isAvailable: true, isDefault: true, displayOrder: 0 },
        { id: 'beef', name: 'Beef', priceAdjustment: 1.50, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'tofu', name: 'Tofu', priceAdjustment: 0, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
    {
      id: 'toppings',
      name: 'Toppings',
      minSelections: 0,
      maxSelections: 5,
      isRequired: false,
      displayOrder: 2,
      modifiers: [
        { id: 'guac', name: 'Guacamole', priceAdjustment: 2.00, isAvailable: true, isDefault: false, displayOrder: 0 },
        { id: 'salsa', name: 'Fresh Salsa', priceAdjustment: 1.00, isAvailable: true, isDefault: false, displayOrder: 1 },
        { id: 'sour-cream', name: 'Sour Cream', priceAdjustment: 0.50, isAvailable: true, isDefault: false, displayOrder: 2 },
      ],
    },
  ],
};

/**
 * Gets modifier templates for a business type
 */
export function getModifierTemplatesForBusinessType(businessType: string): ModifierGroup[] {
  return MODIFIER_TEMPLATES[businessType] || MODIFIER_TEMPLATES.restaurant;
}
