# MenuFlows Modifier System Deep Dive

This document provides comprehensive documentation of the modifier system in MenuFlows, including how it works, how to configure it, and best practices.

---

## Overview

The modifier system allows restaurants to offer customizable menu items with options like:

- **Sizes**: Small, Medium, Large
- **Extras**: Extra cheese, Bacon, Avocado
- **Preparation**: Rare, Medium, Well-done
- **Toppings**: Lettuce, Tomato, Onion (multi-select)
- **Sides**: Fries, Salad, Soup (choose one)
- **Milk type**: Whole, Oat, Almond (for coffee shops)

---

## Core Concepts

### Modifier Groups

A **modifier group** is a category of options (e.g., "Size", "Extras").

```typescript
interface ModifierGroup {
  id: string;
  name: string;                  // "Size"
  nameTranslated?: string;       // "Größe"
  minSelections: number;         // Minimum required (0 = optional)
  maxSelections: number;         // Maximum allowed (1 = single-select)
  isRequired: boolean;           // Must select at least min
  displayOrder: number;          // Sort order in UI
  modifiers: Modifier[];         // The actual options
}
```

### Modifiers

A **modifier** is a single option within a group (e.g., "Large" in the "Size" group).

```typescript
interface Modifier {
  id: string;
  name: string;                  // "Large"
  nameTranslated?: string;       // "Groß"
  priceAdjustment: number;       // +2.50 (can be negative or zero)
  isAvailable: boolean;          // Can be selected
  isDefault: boolean;            // Pre-selected
  displayOrder: number;          // Sort order in group
}
```

### Selected Modifiers

When a customer selects modifiers, they're stored as:

```typescript
interface SelectedModifier {
  groupId: string;               // Reference to group
  groupName: string;             // "Size" (for display)
  modifierId: string;            // Reference to modifier
  modifierName: string;          // "Large" (for display)
  priceAdjustment: number;       // +2.50
}
```

---

## Selection Rules

### Single-Select (Radio Buttons)

When `maxSelections = 1`:

```
Size (choose one):
  ○ Small        +€0.00
  ● Medium       +€1.00  ← selected
  ○ Large        +€2.00
```

**Configuration:**
```typescript
{
  name: "Size",
  minSelections: 1,    // Must choose
  maxSelections: 1,    // Only one
  isRequired: true
}
```

### Multi-Select (Checkboxes)

When `maxSelections > 1`:

```
Toppings (choose up to 3):
  ☑ Lettuce      +€0.00  ← selected
  ☑ Tomato       +€0.00  ← selected
  ☐ Onion        +€0.00
  ☑ Pickles      +€0.00  ← selected (max reached)
  ☐ Jalapeños    +€0.50  ← disabled (max reached)
```

**Configuration:**
```typescript
{
  name: "Toppings",
  minSelections: 0,    // Optional
  maxSelections: 3,    // Up to 3
  isRequired: false
}
```

### Required vs Optional

| minSelections | isRequired | Behavior |
|---------------|------------|----------|
| 0 | false | Completely optional |
| 1 | true | Must select at least 1 |
| 2 | true | Must select at least 2 |

### Selection Logic Matrix

| min | max | UI Type | Example |
|-----|-----|---------|---------|
| 0 | 1 | Optional radio | "Add sauce?" (Yes/No) |
| 1 | 1 | Required radio | "Choose size" |
| 0 | 3 | Optional checkboxes | "Add toppings (up to 3)" |
| 1 | 3 | Required checkboxes | "Choose 1-3 sides" |
| 2 | 2 | Required checkboxes | "Choose exactly 2 sides" |

---

## Price Adjustments

### How Pricing Works

```
Final Price = Base Price + Sum(Modifier Adjustments)
```

**Example:**
```
Cheeseburger (base)              €8.50
+ Size: Large                    €2.00
+ Extra: Bacon                   €1.50
+ Extra: Avocado                 €2.00
─────────────────────────────────────
Total                           €14.00
```

### Adjustment Types

| Type | Value | Use Case |
|------|-------|----------|
| Positive | +2.50 | Upgrades, extras |
| Zero | 0.00 | Standard options |
| Negative | -1.00 | Discounts, removals |

### Negative Adjustments

Use negative prices for "removal" options:

```
Customizations:
  ☐ No lettuce    -€0.00  (just removes)
  ☐ No cheese     -€0.50  (reduces price)
```

---

## Database Schema

### Tables

```sql
-- Modifier groups (per restaurant)
CREATE TABLE item_modifier_groups (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(100) NOT NULL,
  name_translated VARCHAR(100),
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual modifiers (per group)
CREATE TABLE item_modifiers (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES item_modifier_groups(id),
  name VARCHAR(100) NOT NULL,
  name_translated VARCHAR(100),
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link table: which items have which modifier groups
CREATE TABLE menu_item_modifiers (
  menu_item_id UUID REFERENCES menu_items(id),
  modifier_group_id UUID REFERENCES item_modifier_groups(id),
  PRIMARY KEY (menu_item_id, modifier_group_id)
);
```

### Relationships

```
Menu Item ←──── menu_item_modifiers ────→ Modifier Group
                                              │
                                              │ 1:N
                                              ▼
                                          Modifiers
```

One menu item can have multiple modifier groups.
One modifier group can be linked to multiple menu items.
One modifier group has multiple modifiers.

---

## API Operations

### Fetching Menu with Modifiers

```typescript
// api.multitenant.ts
async function getMenuWithModifiers(): Promise<MenuItem[]> {
  const { data: items } = await supabase
    .from('menu_items')
    .select(`
      *,
      menu_item_modifiers!inner (
        modifier_group_id,
        item_modifier_groups (
          *,
          item_modifiers (*)
        )
      )
    `)
    .eq('restaurant_id', restaurantId);

  // Map and structure the response
  return items.map(item => ({
    ...mapDbMenuItemToMenuItem(item),
    modifierGroups: item.menu_item_modifiers.map(link =>
      mapDbModifierGroupToModifierGroup(link.item_modifier_groups)
    )
  }));
}
```

### Creating Modifier Groups (Admin)

```typescript
// api.admin.ts
async function createModifierGroup(
  restaurantId: string,
  group: Omit<ModifierGroup, 'id' | 'modifiers'>
): Promise<{ group: ModifierGroup | null; error?: string }> {
  const { data, error } = await supabase
    .from('item_modifier_groups')
    .insert({
      restaurant_id: restaurantId,
      name: group.name,
      name_translated: group.nameTranslated,
      min_selections: group.minSelections,
      max_selections: group.maxSelections,
      is_required: group.isRequired,
      display_order: group.displayOrder
    })
    .select()
    .single();

  return { group: data ? { ...data, modifiers: [] } : null, error };
}
```

### Linking Groups to Items

```typescript
// api.admin.ts
async function linkModifierGroupToItem(
  menuItemId: string,
  groupId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('menu_item_modifiers')
    .insert({
      menu_item_id: menuItemId,
      modifier_group_id: groupId
    });

  return !error;
}
```

---

## Frontend Implementation

### ModifierSelector Component

**File:** `components/ModifierSelector.tsx`

```typescript
interface ModifierSelectorProps {
  modifierGroups: ModifierGroup[];
  selectedModifiers: SelectedModifier[];
  onModifierChange: (modifiers: SelectedModifier[]) => void;
}

function ModifierSelector({
  modifierGroups,
  selectedModifiers,
  onModifierChange
}: ModifierSelectorProps) {
  // Render each group
  return (
    <div className="modifier-selector">
      {modifierGroups.map(group => (
        <ModifierGroupSelector
          key={group.id}
          group={group}
          selected={selectedModifiers.filter(m => m.groupId === group.id)}
          onChange={(groupModifiers) => {
            // Replace modifiers for this group
            const otherModifiers = selectedModifiers.filter(
              m => m.groupId !== group.id
            );
            onModifierChange([...otherModifiers, ...groupModifiers]);
          }}
        />
      ))}
    </div>
  );
}
```

### Validation Logic

**File:** `lib/menu-modifiers.ts`

```typescript
interface ModifierValidationResult {
  isValid: boolean;
  errors: ModifierValidationError[];
}

interface ModifierValidationError {
  groupId: string;
  groupName: string;
  message: string;
}

function validateAllModifiers(
  groups: ModifierGroup[],
  selected: SelectedModifier[]
): ModifierValidationResult {
  const errors: ModifierValidationError[] = [];

  for (const group of groups) {
    const groupSelections = selected.filter(m => m.groupId === group.id);
    const count = groupSelections.length;

    // Check minimum
    if (group.isRequired && count < group.minSelections) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Please select at least ${group.minSelections} option(s)`
      });
    }

    // Check maximum
    if (count > group.maxSelections) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Maximum ${group.maxSelections} option(s) allowed`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Price Calculation

```typescript
function calculateModifierPrice(selected: SelectedModifier[]): number {
  return selected.reduce((sum, mod) => sum + mod.priceAdjustment, 0);
}

function calculateItemTotal(
  basePrice: number,
  selectedModifiers: SelectedModifier[],
  quantity: number
): number {
  const modifiersTotal = calculateModifierPrice(selectedModifiers);
  const unitPrice = basePrice + modifiersTotal;
  return unitPrice * quantity;
}
```

---

## Business Type Templates

Pre-configured modifier templates for different business types:

### Restaurant Template

```typescript
const restaurantModifiers = [
  {
    name: "Size",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Regular", priceAdjustment: 0 },
      { name: "Large", priceAdjustment: 2.00 }
    ]
  },
  {
    name: "Extras",
    minSelections: 0,
    maxSelections: 5,
    isRequired: false,
    modifiers: [
      { name: "Extra Cheese", priceAdjustment: 1.00 },
      { name: "Bacon", priceAdjustment: 1.50 },
      { name: "Avocado", priceAdjustment: 2.00 },
      { name: "Fried Egg", priceAdjustment: 1.00 }
    ]
  },
  {
    name: "Cooking",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Rare", priceAdjustment: 0 },
      { name: "Medium Rare", priceAdjustment: 0 },
      { name: "Medium", priceAdjustment: 0 },
      { name: "Well Done", priceAdjustment: 0 }
    ]
  }
];
```

### Cafe/Coffee Shop Template

```typescript
const cafeModifiers = [
  {
    name: "Size",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Small", priceAdjustment: 0 },
      { name: "Medium", priceAdjustment: 0.50 },
      { name: "Large", priceAdjustment: 1.00 }
    ]
  },
  {
    name: "Milk",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Whole Milk", priceAdjustment: 0 },
      { name: "Skim Milk", priceAdjustment: 0 },
      { name: "Oat Milk", priceAdjustment: 0.60 },
      { name: "Almond Milk", priceAdjustment: 0.60 },
      { name: "Soy Milk", priceAdjustment: 0.50 }
    ]
  },
  {
    name: "Extras",
    minSelections: 0,
    maxSelections: 3,
    isRequired: false,
    modifiers: [
      { name: "Extra Shot", priceAdjustment: 0.80 },
      { name: "Vanilla Syrup", priceAdjustment: 0.50 },
      { name: "Caramel Syrup", priceAdjustment: 0.50 },
      { name: "Whipped Cream", priceAdjustment: 0.30 }
    ]
  }
];
```

### Bar Template

```typescript
const barModifiers = [
  {
    name: "Size",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Single", priceAdjustment: 0 },
      { name: "Double", priceAdjustment: 3.00 }
    ]
  },
  {
    name: "Mixer",
    minSelections: 0,
    maxSelections: 1,
    isRequired: false,
    modifiers: [
      { name: "Tonic Water", priceAdjustment: 0 },
      { name: "Soda Water", priceAdjustment: 0 },
      { name: "Cola", priceAdjustment: 0 },
      { name: "Ginger Beer", priceAdjustment: 0.50 },
      { name: "Neat", priceAdjustment: 0 }
    ]
  },
  {
    name: "Garnish",
    minSelections: 0,
    maxSelections: 2,
    isRequired: false,
    modifiers: [
      { name: "Lime", priceAdjustment: 0 },
      { name: "Lemon", priceAdjustment: 0 },
      { name: "Orange", priceAdjustment: 0 },
      { name: "Olive", priceAdjustment: 0 }
    ]
  }
];
```

### Pizza Template

```typescript
const pizzaModifiers = [
  {
    name: "Size",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Personal (8\")", priceAdjustment: 0 },
      { name: "Medium (12\")", priceAdjustment: 4.00 },
      { name: "Large (16\")", priceAdjustment: 8.00 }
    ]
  },
  {
    name: "Crust",
    minSelections: 1,
    maxSelections: 1,
    isRequired: true,
    modifiers: [
      { name: "Classic", priceAdjustment: 0 },
      { name: "Thin Crust", priceAdjustment: 0 },
      { name: "Stuffed Crust", priceAdjustment: 2.00 },
      { name: "Gluten-Free", priceAdjustment: 3.00 }
    ]
  },
  {
    name: "Extra Toppings",
    minSelections: 0,
    maxSelections: 5,
    isRequired: false,
    modifiers: [
      { name: "Extra Cheese", priceAdjustment: 1.50 },
      { name: "Pepperoni", priceAdjustment: 1.50 },
      { name: "Mushrooms", priceAdjustment: 1.00 },
      { name: "Olives", priceAdjustment: 1.00 },
      { name: "Jalapeños", priceAdjustment: 0.75 }
    ]
  }
];
```

---

## Admin Management

### Creating Modifier Groups

1. Go to Admin Dashboard
2. Select restaurant
3. Click "Modifier Groups"
4. Click "Add Group"
5. Configure:
   - Name (e.g., "Size")
   - Min/max selections
   - Required toggle
6. Add modifiers to the group
7. Save

### Linking to Menu Items

1. Select a menu item
2. Click "Modifier Groups"
3. Check groups to link
4. Save

Or via bulk linking:
1. Select modifier group
2. Click "Link to Items"
3. Select multiple items
4. Apply

### Importing Templates

```typescript
// Import cafe template for a new coffee shop
await adminApi.importModifierTemplates(restaurantId, cafeModifiers);
```

---

## Order Storage

When an order is placed, modifiers are stored as JSONB:

```sql
-- order_items.modifiers column
[
  {
    "groupId": "uuid-size-group",
    "groupName": "Size",
    "modifierId": "uuid-large",
    "modifierName": "Large",
    "priceAdjustment": 2.00
  },
  {
    "groupId": "uuid-extras-group",
    "groupName": "Extras",
    "modifierId": "uuid-bacon",
    "modifierName": "Bacon",
    "priceAdjustment": 1.50
  }
]
```

This snapshot approach ensures:
- Historical accuracy (price at time of order)
- No broken references if modifiers are deleted
- Easy display in kitchen/receipts

---

## Best Practices

### Naming Conventions

✅ **Good:**
- "Size" (not "Choose your size")
- "Milk Type" (not "What kind of milk?")
- "Cooking Temperature" (not "How would you like it cooked?")

### Price Strategy

1. **Include standard option at €0.00** - Customers feel they're getting value
2. **Use round numbers** - €1.00, €1.50, €2.00 (not €1.37)
3. **Group premium options** - Put expensive extras together

### UX Guidelines

1. **Order groups logically** - Size first, then core choices, then optional extras
2. **Limit multi-select max** - 3-5 is ideal, more is overwhelming
3. **Mark defaults clearly** - Pre-select the most common option
4. **Show prices inline** - Don't hide price adjustments

### Performance

1. **Don't over-link** - Not every item needs every modifier group
2. **Use templates** - Reuse common groups across similar items
3. **Archive unused** - Soft-delete old modifiers instead of deleting

---

## Troubleshooting

### Modifiers not showing

1. Check group is linked to item:
   ```sql
   SELECT * FROM menu_item_modifiers WHERE menu_item_id = 'xxx';
   ```

2. Check modifiers exist in group:
   ```sql
   SELECT * FROM item_modifiers WHERE group_id = 'xxx';
   ```

3. Check modifiers are available:
   ```sql
   SELECT * FROM item_modifiers WHERE group_id = 'xxx' AND is_available = true;
   ```

### Validation errors

1. **"Please select at least X"** - Required group not satisfied
2. **"Maximum X allowed"** - Too many selections
3. Check `minSelections` and `maxSelections` settings

### Price calculation wrong

1. Verify `priceAdjustment` values in database
2. Check all selected modifiers are included
3. Verify quantity multiplication

---

*See also: [FEATURES.md](./FEATURES.md) | [API-REFERENCE.md](./API-REFERENCE.md) | [DATABASE.md](./DATABASE.md)*
