# MenuFlows Feature Reference

This document provides comprehensive documentation of all features in MenuFlows, organized by user type.

---

## User Types Overview

| User Type | Access Method | Key Features |
|-----------|---------------|--------------|
| **Customer** | QR code scan / direct URL | Browse menu, order, checkout |
| **Owner/Staff** | PIN authentication | Dashboard, orders, kitchen display |
| **Platform Admin** | Email/password | Multi-tenant management |

---

## Customer Features

### Menu Browsing

**View:** `MenuView.tsx`

Customers can browse the restaurant's menu with:

- **Category Navigation**
  - Horizontal scrolling category tabs
  - Categories: Burgers, Sides, Drinks, Desserts (configurable)
  - Active category highlighted with restaurant's accent color
  - Sticky header for easy navigation

- **Item Cards**
  - Item image with gradient overlay
  - Item name and translated name (if available)
  - Price display in local currency
  - Quick-add button for simple items
  - Tap card for full details

- **Item Indicators**
  - 🌶️ Spicy badge for spicy items
  - 🥜 Peanut warning icon
  - Availability status (greyed out if unavailable)

- **Search & Filter** (future)
  - Currently category-based only
  - Search planned for future release

**User Flow:**
```
Open Menu URL → See Splash → Browse Categories → View Items → Add to Cart
```

---

### Item Details

**View:** `ItemDetailView.tsx`

Full item information including:

- **Item Information**
  - Large image display
  - Full description
  - Price (base + modifier adjustments)
  - Translated name/description

- **Dietary Information**
  - Allergen list (Gluten, Dairy, Nuts, etc.)
  - Additive information (preservatives, colorings)
  - Dietary flags (vegetarian, vegan, gluten-free)

- **Modifier Selection**
  - Modifier groups (Size, Extras, Sauce, etc.)
  - Single-select (radio buttons) or multi-select (checkboxes)
  - Price adjustments shown for each option
  - Required selections enforced

- **Quantity Selection**
  - Plus/minus buttons
  - Minimum quantity: 1
  - No maximum (reasonable limit in UI)

- **Special Instructions**
  - Text field for notes
  - "No onions", "Extra sauce", etc.

- **Add to Cart Button**
  - Shows total price (base + modifiers × quantity)
  - Disabled until required modifiers selected

---

### Shopping Cart

**View:** `CartView.tsx`

Cart management features:

- **Cart Items**
  - Item name with selected modifiers
  - Quantity with +/- adjusters
  - Line total (unit price × quantity)
  - Remove item button
  - Special notes display

- **Price Summary**
  - Subtotal (all items)
  - Tax amount (based on restaurant tax rate)
  - Total amount

- **Cart Actions**
  - Continue shopping (back to menu)
  - Clear cart
  - Proceed to checkout

- **Empty Cart State**
  - Friendly message
  - "Browse Menu" button

**Price Calculation:**
```
Line Total = (Base Price + Modifier Adjustments) × Quantity
Subtotal = Sum of all Line Totals
Tax = Subtotal × Tax Rate
Total = Subtotal + Tax
```

---

### Checkout & Handshake

**View:** `WaiterHandshakeView.tsx`

Order completion flow:

- **Order Confirmation**
  - Order successfully created
  - Unique handshake code displayed prominently (e.g., "AB.12")
  - Instructions to show code to waiter

- **Handshake Code**
  - Large, readable format
  - Easy to remember (2 letters + 2 numbers)
  - Avoids confusing characters (no I, O, 0)

- **Next Steps**
  - "Show this code to your waiter"
  - Waiter will confirm and assign your table
  - Order goes to kitchen after confirmation

- **New Order Option**
  - Start new order button
  - Returns to menu view

**Handshake Flow:**
```
Customer: Shows "AB.12" to waiter
Waiter: Enters code in system → Assigns table
System: Updates order status to "confirmed"
Kitchen: Receives order on KDS
```

---

## Owner/Staff Features

### Staff Authentication

**View:** `owner/LoginView.tsx`

PIN-based login:

- **PIN Keypad**
  - 4-digit numeric PIN
  - Visual keypad (1-9, 0)
  - Backspace/clear buttons
  - Auto-submit when 4 digits entered

- **Security Features**
  - PIN shown as dots (masked)
  - Error shake animation on invalid PIN
  - No "remember me" (session-based only)
  - Session cleared on browser close

- **Multi-Staff Support**
  - Different PINs for different staff
  - Role-based (owner, manager, kitchen, waiter)
  - All staff share same dashboard

---

### Owner Dashboard

**View:** `owner/DashboardView.tsx`

Central navigation hub:

- **Quick Stats**
  - Pending orders count
  - Active tables
  - Today's orders (future)

- **Navigation Cards**
  - 📋 Pending Orders
  - 🍳 Kitchen Display
  - 🪑 Table Grid
  - 📦 Menu Inventory
  - 🎨 Branding Settings
  - ➕ Manual Order Entry

- **Actions**
  - Logout button
  - Restaurant open/closed toggle

---

### Pending Orders

**View:** `owner/PendingOrdersView.tsx`

Order queue management:

- **Order List**
  - Chronological order display
  - Handshake code prominent
  - Table number (if assigned)
  - Time since order placed

- **Order Details**
  - Expand to see items
  - Item names with modifiers
  - Quantities
  - Special notes highlighted

- **Status Management**
  - Current status badge
  - Quick status update buttons:
    - Pending → Confirm
    - Confirmed → Cooking
    - Cooking → Served

- **Table Assignment**
  - Assign table on confirmation
  - Table number input
  - Links order to physical table

- **Filters** (future)
  - Filter by status
  - Filter by table
  - Search by code

---

### Kitchen Display System (KDS)

**View:** `owner/KitchenView.tsx`

Kitchen-optimized order view:

- **Order Tickets**
  - Large, readable format
  - Color-coded by status/age
  - Table number prominent
  - Time elapsed indicator

- **Item Display**
  - Item name in large text
  - Modifiers clearly listed
  - Quantity badges
  - Special notes in red/highlighted

- **Actions**
  - Mark item as prepared
  - Mark entire order ready
  - Alert waiter (notification)

- **Auto-Refresh**
  - Real-time updates via subscription
  - New orders appear instantly
  - Sound notification (optional)

- **Layout Options**
  - Grid view (multiple orders)
  - Single order focus mode
  - Adjustable text size

---

### Table Management

**View:** `owner/TableGridView.tsx` & `owner/TableMapView.tsx`

Table overview and management:

**Table Grid View:**
- Grid layout of all tables
- Table number display
- Status indicators:
  - 🟢 Available (empty)
  - 🟡 Occupied (has orders)
  - 🔴 Needs attention
- Tap to view table details

**Table Map View:**
- Visual floor plan
- Drag-to-position tables
- See table relationships
- Print QR codes per table

**Table Actions:**
- View active orders
- Clear table (mark orders served)
- Transfer orders between tables
- Table capacity info

---

### Menu Inventory

**View:** `owner/InventoryView.tsx`

Menu item management:

- **Item List**
  - All menu items
  - Category grouping
  - Search/filter
  - Sort by name/category/price

- **Item Management**
  - Add new item
  - Edit existing item
  - Delete item (with confirmation)
  - Duplicate item

- **Item Fields**
  - Name (and translation)
  - Description
  - Price
  - Category selection
  - Image upload
  - Availability toggle
  - Dietary flags

- **Bulk Actions**
  - Mark category unavailable
  - Price adjustments
  - Export menu (CSV)

---

### Menu Import

**View:** `owner/MenuImportView.tsx`

Bulk menu import wizard:

- **Import Sources**
  - JSON file upload
  - CSV file upload
  - Copy/paste data

- **Field Mapping**
  - Map columns to fields
  - Preview imported data
  - Handle duplicates

- **Validation**
  - Required field check
  - Price format validation
  - Category validation

- **Import Actions**
  - Preview before import
  - Merge or replace existing
  - Undo import

---

### Branding Settings

**View:** `owner/BrandingView.tsx`

Restaurant customization:

- **Basic Info**
  - Restaurant name
  - Description/tagline

- **Visual Branding**
  - Logo upload
  - Cover image upload
  - Accent color picker
  - Color preview

- **Links**
  - Google Maps/Review URL
  - Social media links
  - Website URL

- **Operations**
  - Open/closed toggle
  - Operating hours (future)
  - Vacation mode (future)

---

### Manual Order Entry

**View:** `owner/OrderEntryView.tsx`

Create orders without customer:

- **Use Cases**
  - Phone orders
  - Walk-in customers
  - Staff meals

- **Order Building**
  - Browse menu items
  - Add with modifiers
  - Set quantities
  - Add notes

- **Customer Info**
  - Name (optional)
  - Phone (for callbacks)
  - Table assignment

- **Order Creation**
  - Skips handshake (direct to kitchen)
  - Generates code for reference
  - Appears in order queue

---

## Platform Admin Features

### Admin Authentication

**View:** `admin/AdminLoginView.tsx`

Email/password login:

- **Login Form**
  - Email input
  - Password input (masked)
  - Login button
  - Error messages

- **Security**
  - SHA-256 password hashing
  - Session-based auth
  - No password recovery (manual reset)

---

### Admin Dashboard

**View:** `admin/AdminDashboardView.tsx`

Platform management hub:

**Platform Statistics:**
- Total restaurants
- Active restaurants
- Today's orders (all restaurants)
- Total revenue

**Restaurant Management:**

- **Restaurant List**
  - All restaurants with stats
  - Search/filter
  - Status indicators
  - Quick actions

- **Create Restaurant**
  - Name and slug
  - Business type selection
  - Initial accent color
  - Owner PIN setup

- **Restaurant Details**
  - View/edit all settings
  - Staff management
  - Subscription status
  - Usage statistics

- **Restaurant Actions**
  - Suspend/activate
  - Delete (soft delete)
  - Impersonate (view as owner)

**Menu Management:**

- **View Restaurant Menu**
  - See all items
  - Add/edit/delete items
  - Manage categories

- **Import Menu**
  - Bulk import for restaurant
  - Template menus
  - Copy from another restaurant

**Modifier Management:**

- **Modifier Groups**
  - Create/edit groups
  - Set selection rules
  - Manage modifiers

- **Modifier Templates**
  - Business type templates
  - Coffee shop modifiers
  - Restaurant modifiers
  - Bar modifiers

- **Link Management**
  - Link groups to items
  - Bulk linking
  - View linked items

**Staff Management:**

- **View Staff**
  - List by restaurant
  - Role information
  - Active status

- **Manage Staff**
  - Create staff accounts
  - Reset PINs
  - Change roles
  - Deactivate accounts

---

## Feature Matrix

| Feature | Customer | Owner | Admin |
|---------|----------|-------|-------|
| Browse menu | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | - |
| View order status | ✅ | ✅ | ✅ |
| Manage orders | - | ✅ | ✅ |
| Kitchen display | - | ✅ | - |
| Table management | - | ✅ | - |
| Menu editing | - | ✅ | ✅ |
| Branding | - | ✅ | ✅ |
| Staff management | - | Limited | ✅ |
| Multi-restaurant | - | - | ✅ |
| Analytics | - | Basic | Full |

---

## Future Features

### Planned

- [ ] Payment integration (Stripe)
- [ ] Customer accounts
- [ ] Order history
- [ ] Loyalty rewards
- [ ] Analytics dashboard
- [ ] Kitchen printer support
- [ ] Multi-language selection
- [ ] Push notifications

### Under Consideration

- [ ] Delivery integration
- [ ] Inventory management
- [ ] Supplier ordering
- [ ] Customer reviews
- [ ] Table reservations
- [ ] Split payments
- [ ] Gift cards

---

*See also: [MODIFIERS.md](./MODIFIERS.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
