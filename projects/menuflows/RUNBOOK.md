# MenuFlows Testing Runbook

This document contains step-by-step testing procedures for verifying MenuFlows works correctly after changes.

---

## Quick Start

1. **Clear Vite cache** (if things seem broken):
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Hard refresh browser** (after code changes):
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

3. **Check console first** - If something breaks:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for **red errors** (first red error is usually the cause)

---

## Final Sanity Test

### Customer Flow (Diner)

1. **Open restaurant page**
   - Go to `http://localhost:3000/demo`
   - Should see splash screen with restaurant name
   - Click "Start Order" or "Continue"

2. **Browse menu**
   - Menu items should display with images, prices, categories
   - No console errors

3. **Add items to cart**
   - Click "+" on 2-3 different items
   - Cart counter in top-right should update
   - Click item to see detail view
   - Add to cart from detail view
   - All items should appear, no crashes

4. **View cart**
   - Click cart icon
   - All items should display with:
     - Correct quantities
     - Correct prices (no NaN, no undefined)
     - Item images
   - Total should be calculated correctly

5. **Checkout - Generate Waiter Code**
   - Click "Generate Waiter Code"
   - Button should show "Creating Order..." with spinner
   - Should see waiter QR screen with code like "NK.23"
   - **Check console** for `[WAITER_QR]` logs showing success

6. **Test error handling** (optional)
   - Open DevTools Network tab
   - Throttle network to "Offline"
   - Try to generate code
   - Should show friendly error message, not crash

### Kitchen/Owner Flow

1. **Access owner dashboard**
   - Go to `http://localhost:3000/demo`
   - Click "Owner Login" (or enter PIN if configured)
   - Should see dashboard with pending order count

2. **View pending orders**
   - Click "Pending Orders"
   - Any orders created from customer flow should appear
   - Orders should show items, quantities

3. **Confirm order to table**
   - Click on a pending order
   - Select a table number
   - Confirm the handshake code
   - Order should move to "Kitchen" status

4. **Kitchen view**
   - Go to Kitchen view
   - Confirmed orders should appear
   - Update status to "Cooking" → "Served"
   - Updates should reflect immediately

### Waiter Handshake Flow

1. **After customer generates code**
   - Waiter QR screen should display with:
     - Handshake code (e.g., "NK.23")
     - Order items and quantities
     - Total price
   - No crashes or blank screens

2. **Confirm order**
   - Waiter enters code in owner dashboard
   - Code should match the generated code
   - Table assignment should work

---

## Common Issues & Quick Fixes

### Issue: "Cannot read properties of undefined (reading 'length')"

**Cause**: Cart item missing required properties (selectedModifiers, basePrice, etc.)

**Fix**:
1. Clear cart: Refresh page
2. If persists, check `addToCart` function in App.tsx initializes all CartItem properties

### Issue: "onUpdateQuantity is not a function"

**Cause**: CartView missing onUpdateQuantity prop

**Fix**:
1. Check App.tsx cart case passes `onUpdateQuantity` prop
2. Should be: `onUpdateQuantity={updateCartQuantity}`

### Issue: NaN in prices

**Cause**: Missing or invalid basePrice/unitPrice on cart items

**Fix**:
1. Check `addToCart` sets `basePrice` and `unitPrice`
2. Check `lib/menu-modifiers.ts` has safe math guards

### Issue: Waiter code not generating

**Cause**: restaurant_id missing or database error

**Check**:
1. Open console and look for `[WAITER_QR]` logs
2. Check error message for details
3. Verify `api.multitenant.ts` createOrder includes restaurant_id

### Issue: Changes not showing in browser

**Cause**: Vite cache or browser cache

**Fix**:
1. Stop dev server (Ctrl+C)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart: `npm run dev`
4. Hard refresh browser (Cmd/Ctrl + Shift + R)

---

## Final Sanity Test (5 min)

Run this quick test suite after any bug fixes or before merging PRs:

### Cart & Order Creation Tests

**1. Duplicate add test**
- Add same item twice (click "+" rapidly)
- Cart counter should show quantity 2
- Item in cart should show quantity 2
- No duplicate items, no crashes

**2. Stale cart after menu update/import**
- Add 2-3 items to cart
- Go to Owner Dashboard → Inventory → Import Menu
- Import any menu (or update existing)
- Expected: Cart should auto-clear with toast notification
- Re-add items and checkout → should succeed

**3. Order create success path**
- Add 2-3 items to cart
- Click "Generate Waiter Code"
- Expected:
  - Button shows "Creating Order..." spinner
  - Toast shows "Order created successfully!"
  - Waiter QR screen appears with code
  - No console errors

**4. Failure path recovery (invalid menu items)**
- Add items to cart
- Open DevTools Console
- Manually trigger error: modify cart to have invalid menuItemId
- Try to generate order
- Expected:
  - Clear error toast: "Cart cleared - some items are no longer available"
  - Cart is automatically cleared
  - Console shows which IDs were invalid
- Re-add items → should work

### Toast Notification Tests

**5. Toast appearance**
- Create an order → see green success toast
- Toast should auto-dismiss after 4 seconds
- Progress bar should animate
- Click X to dismiss early → should close immediately

**6. Multiple toasts**
- Trigger 2-3 actions (create order, error, etc.)
- Toasts should stack vertically
- Each toast should dismiss independently

---

## Menu Search Test

Test the customer menu search functionality:

**Setup:**
1. Open restaurant menu: `http://localhost:3000/demo`
2. Wait for menu to load

**Test Flow:**
1. **Basic Search**
   - Type "chicken" in the search bar (top right)
   - ✅ List filters to show only items with "chicken" in name/description/category
   - ✅ Category chips show only categories with matching items
   - ✅ Categories without matches are hidden

2. **No Results**
   - Type "xyz123" (nonsense query)
   - ✅ Empty state appears: "No matches for 'xyz123'"
   - ✅ "Try a different search term" message shown
   - ✅ "Clear search" button visible and works

3. **Clear Search (X button)**
   - Type something → results filter
   - Click (X) button in search input
   - ✅ Search clears
   - ✅ Full menu for previously active category returns

4. **Clear Search (category chip)**
   - Type something → results filter
   - Click any category chip
   - ✅ Search clears
   - ✅ Selected category becomes active

5. **Case-Insensitive Search**
   - Type "BURGER" (all caps)
   - ✅ Finds items with "burger" (case-insensitive)

6. **Search with Extra Spaces**
   - Type "  double   space  " (multiple spaces)
   - ✅ Normalizes correctly (treats as "double space")

7. **Cart Still Works**
   - Search for an item
   - Click item → opens detail view
   - Add to cart → cart icon updates
   - ✅ No console errors
   - ✅ Generate Waiter Code still works

8. **Category Preservation**
   - Select "Burgers" category
   - Type "chicken" → shows chicken items from ALL categories
   - Clear search → "Burgers" category is restored (not reset)
   - ✅ Active category preserved during search

---

## Status Tracking Test

Test real-time order status updates on customer handshake screen:

**Setup:**
1. Open two browser tabs/windows:
   - Tab A: Customer view (`http://localhost:3000/demo`)
   - Tab B: Owner Dashboard (Owner Login → Kitchen View)

**Test Flow:**
1. **Create Order (Tab A)**
   - Add 2-3 items to cart
   - Click "Generate Waiter Code"
   - Verify handshake screen shows:
     - ✅ Order code displayed
     - ✅ Status badge: amber "Waiting for staff to confirm"
     - ✅ Progress timeline: Step 1 (Pending) active
     - ✅ "Last updated: just now"

2. **Confirm Order (Tab B)**
   - Find pending order in Kitchen View
   - Click to confirm → assign table number
   - Switch to Tab A (customer screen)
   - Verify customer screen updates automatically (no refresh):
     - ✅ Status changes to blue "Confirmed — kitchen starting"
     - ✅ Progress advances to step 2 (Confirmed)
     - ✅ "Last updated" refreshes (e.g., "0m ago")

3. **Start Cooking (Tab B)**
   - Click "Cooking" on the order
   - Switch to Tab A
   - Verify:
     - ✅ Status: emerald "Being prepared"
     - ✅ Progress: step 3 (Cooking) active
     - ✅ "Last updated": recent

4. **Mark Served (Tab B)**
   - Click "Served" on the order
   - Switch to Tab A
   - Verify:
     - ✅ Status: emerald "Served — enjoy"
     - ✅ Progress: all 4 steps complete (green checks)
     - ✅ Icon has bounce animation

**Multi-Tenant Test:**
- Open Tab A for restaurant `/demo`
- Open Tab C for different restaurant (e.g., `/burgerlab` if exists)
- Create orders on both
- Verify: Tab A does NOT react to Tab B's order status changes (isolation test)

**Edge Cases:**
- ✅ Rapid status changes (click multiple times quickly) - no crashes
- ✅ Page refresh on different statuses - state persists
- ✅ Order not found - shows friendly error (if applicable)

**Expected Result:**
Customer sees live order status updates without refreshing the page.

---

## Pre-Commit Checklist

Before pushing changes:

- [ ] `npm run build` passes without errors
- [ ] Customer flow works (add to cart, checkout, generate code)
- [ ] No console errors during full user journey
- [ ] All prices display correctly (no NaN)
- [ ] Waiter QR screen shows after checkout
- [ ] Owner dashboard can view and confirm orders

---

## Waiter Notification Test

Test owner notifications when orders become SERVED:

**Setup:**
1. Open Kitchen View: http://localhost:3000/demo/owner → Kitchen View
2. Open Table Map View in another tab (optional)

**Test Flow:**
1. **Create an order**
   - As customer, add items to cart → Generate Waiter Code
   - Order starts as "pending"

2. **Verify no false positives**
   - In Kitchen View, verify NO notification banner appears on initial load
   - Even if orders already exist as "served", they should NOT trigger notifications

3. **Confirm and cook order**
   - In Kitchen View, click order to confirm (status: confirmed)
   - Click again to start cooking (status: cooking)
   - Verify: NO notification banner appears (not a target status)

4. **Mark order as served**
   - In Kitchen View, click order to mark as served (status: served)
   - **Verify notification appears:**
     - ✅ Green notification banner at top of screen
     - ✅ Shows: "Order {code} for Table {number} is SERVED"
     - ✅ Time: "just now"
     - ✅ Notification count: "Notifications (1)"
   - Switch to Table Map View tab
   - **Verify:** Same notification banner appears there too

5. **Dismiss notification**
   - Click X on one notification
   - Verify: Only that notification disappears
   - If you have 3 notifications, dismiss 2, verify count updates

6. **Clear all**
   - Click "Clear all" button
   - Verify: All notifications disappear, banner hides

7. **Max 3 notifications**
   - Mark 4 different orders as served in quick succession
   - Verify: Only 3 most recent notifications shown
   - Oldest notification automatically dropped

**Multi-tenant test:**
- Open restaurant A (/demo/owner) in tab 1
- Open restaurant B (e.g., /burgerlab/owner) in tab 2
- Create orders for both restaurants
- Mark order in restaurant A as served
- Verify: Tab A shows notification, Tab B does NOT (isolation works)

**Edge cases:**
- ✅ Order with no table_number - shows "Order {code} is SERVED" (no table info)
- ✅ Rapid clicks - no crashes, notification appears once per transition
- ✅ Page refresh - notifications reset (no stale notifications after reload)

**Expected Result:**
Owner sees in-app banner when orders become SERVED, with dismiss and clear-all functionality.

---

## QR PDF Export Test

Test the fixed QR code PDF export to ensure QR codes are visible and scannable in the exported PDF.

**Setup:**
1. Start dev server: `npm run dev`
2. Log in to owner dashboard: http://localhost:3000/demo/owner

**Test 1: Generate QR codes**
1. Click "Generate Table QRs" button
2. Set range: Start Table = 1, End Table = 5
3. Wait for preview to show QR codes (see "Generating QR codes..." message)
   - ✅ Preview section shows 5 QR codes as images (not SVG)
   - ✅ Table numbers displayed below each QR
   - ✅ Console logs: `[QR PDF] ✅ Generated 5 QR codes`

**Test 2: Download PDF**
1. Click "Download PDF" button
2. Check console for logs:
   - ✅ `[QR PDF] Starting PDF generation for tables 1-5`
   - ✅ `[QR PDF] QR codes available: 5`
   - ✅ `[QR PDF] ✅ PDF generated and saved: table-qr-codes-1-5.pdf`
3. Open the downloaded PDF
   - ✅ PDF contains 5 QR codes (not blank)
   - ✅ Each QR code is visible and scannable
   - ✅ Table numbers visible: "Table 1", "Table 2", etc.
   - ✅ URLs visible below QR codes

**Test 3: Scan QR from PDF**
1. Copy URL from PDF for Table 3
2. Open in browser: `http://localhost:3000/demo?table=3`
   - ✅ Menu loads with "Table 3" badge
3. Add item to cart and generate waiter code
   - ✅ Order created with table_number=3

**Test 4: Full page test**
1. Set range: Start Table = 1, End Table = 30
2. Generate and download PDF
   - ✅ PDF generates successfully
   - ✅ All 30 QR codes visible in PDF
   - ✅ File size reasonable (< 5MB)

**Test 5: Invalid range**
1. Set Start Table = 10, End Table = 5 (invalid)
2. Download button should be disabled
   - ✅ Button shows "Download PDF (0 tables)" or is disabled

**Test 6: Regression test**
1. Open normal menu: `http://localhost:3000/demo` (no ?table=)
   - ✅ Menu loads normally
2. Add items and generate waiter code
   - ✅ Order created normally
3. Open owner dashboard
   - ✅ Can view and confirm orders

**Edge Cases:**
- ✅ Rapid table range changes (QR generation debounces 300ms)
- ✅ Download while QRs are generating (button disabled)
- ✅ Large ranges (1-30) generate successfully
- ✅ No console errors during QR generation or PDF export

---

## Table QR Code Landing Test

Test the table QR code functionality that auto-selects table numbers when customers scan QR codes.

**Setup:**
1. Start dev server: `npm run dev`
2. Open restaurant: http://localhost:3000/demo/owner

### Part A: Customer Landing with QR Scan

**Test 1: Simulate QR scan**
1. Open: `http://localhost:3000/demo?table=7`
   - ✅ Menu loads with "Table 7" badge visible in header
   - ✅ Badge shows table icon + "Table 7" text
   - ✅ No console errors

**Test 2: Add items and checkout**
1. With "Table 7" selected, add 2-3 items to cart
2. Click "Generate Waiter Code"
   - ✅ Handshake code generated successfully
   - ✅ Order created with table_number=7 in database
3. Verify in browser console (F12 → Console):
   - ✅ See `[WAITER_QR] Order created successfully` log
   - ✅ No errors about missing table_number

**Test 3: Normal flow (no QR scan)**
1. Open: `http://localhost:3000/demo` (no ?table= param)
   - ✅ Menu loads normally
   - ✅ No table badge visible
   - ✅ Cart, checkout, waiter code all work as before

**Test 4: Invalid table number**
1. Open: `http://localhost:3000/demo?table=abc` (non-numeric)
   - ✅ Invalid table ignored, behaves like normal flow
   - ✅ No table badge visible
2. Open: `http://localhost:3000/demo?table=999` (out of range)
   - ✅ Out-of-range table ignored, behaves like normal flow
   - ✅ No console errors

### Part B: Owner QR Code Generation

**Test 5: Generate table QR codes**
1. Go to: http://localhost:3000/demo/owner
2. Click "Generate Table QRs" button (in "Master Menu QR" card)
3. Set range: Start Table = 1, End Table = 5
4. Click "Download PDF"
   - ✅ PDF downloads with filename `table-qr-codes-1-5.pdf`
   - ✅ PDF contains 5 QR codes
   - ✅ Each QR has label "Table N"
   - ✅ Each QR has URL label below it

**Test 6: Verify QR code URLs**
1. Open the downloaded PDF
2. Check URL labels under QR codes
   - ✅ Format: `http://localhost:3000/demo?table=N`
   - ✅ Each QR has correct table number
   - ✅ URL is correct for restaurant

**Test 7: Scan simulation**
1. Copy URL from PDF for Table 3
2. Paste in browser: `http://localhost:3000/demo?table=3`
   - ✅ Menu loads with "Table 3" badge
   - ✅ Table number correctly displayed

### Part C: Integration Test

**Test 8: End-to-end flow**
1. Owner generates QR codes for tables 1-10
2. Print QR codes and place on tables 1-10
3. Customer at Table 5 scans QR code
   - ✅ Opens menu with "Table 5" badge
4. Customer adds items to cart and generates waiter code
5. Owner opens Kitchen View → sees pending order
   - ✅ Order shows table_number=5
6. Owner confirms order for Table 5
   - ✅ Order confirmed successfully

---

## Database Verification (Optional)

If testing with real database:

```sql
-- Check recent orders have restaurant_id
SELECT id, restaurant_id, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Verify restaurant_id column is NOT NULL
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'restaurant_id';
```

Expected: `is_nullable = NO` for restaurant_id.

---

## Release Checklist

Complete these steps before deploying to production:

### Pre-Release
- [ ] **Incognito test pass**: Open app in incognito/private window and run "Final Sanity Test (5 min)"
- [ ] **Build passes**: Run `npm run build` with no errors
- [ ] **No console errors**: Check browser console throughout full user journey
- [ ] **Toast notifications working**: Verify success/error toasts appear and dismiss correctly
- [ ] **Cart auto-clear working**: Import menu → verify cart clears with notification

### Release
- [ ] **PR merged**: All PRs for this release are merged to main
- [ ] **Tests passing**: If CI/CD exists, all tests pass
- [ ] **Build verified**: Production build tested locally

### Post-Deploy
- [ ] **Deploy checked**: Verify deployment is live on production URL
- [ ] **Smoke test**: Test key flows on production (add to cart, create order)
- [ ] **Monitor logs**: Check for errors in production logs (if accessible)

---

## RLS Policy Fixes

### Menu Items Update Permission

**Issue:** Permission denied when toggling menu item availability in Inventory View.

**Symptoms:**
```
Error: Failed to update menu: permission denied for table menu_items (code: 42501)
```

**Root Cause:** RLS policy `Staff manage menu items` requires `current_restaurant_id()` database setting, which isn't set for anon key usage.

**Fix Instructions:**

1. **Open Supabase SQL Editor** (https://supabase.com/dashboard/project)

2. **Apply the migration:**
   - Copy contents of `migrations/rls-menu-items/001_fix_menu_items_rls.sql`
   - Paste into SQL Editor
   - Run query

3. **Verify the fix:**
   ```sql
   -- Should show the new policy
   SELECT schemaname, tablename, policyname, cmd, roles
   FROM pg_policies
   WHERE tablename = 'menu_items';
   ```

4. **Test from UI:**
   - Go to http://localhost:3000/demo/owner
   - Click "Inventory" → Toggle any item's availability
   - Should work without error

5. **Test from SQL:**
   ```sql
   -- Replace YOUR_RESTAURANT_ID with actual ID from your restaurant
   UPDATE menu_items
   SET is_available = NOT is_available
   WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
   RETURNING *;
   ```

**Rollback (if needed):**
- If issues occur, run `migrations/rls-menu-items/rollback.sql` in SQL Editor
- This restores the original `Staff manage menu items` policy

**What This Changes:**
- ✅ Allows UPDATE/INSERT on `menu_items` when `restaurant_id` is explicitly in the query
- ✅ Validates `restaurant_id` exists in restaurants table
- ✅ Works with anon key (dev environment)
- ✅ Prevents updates without restaurant context
- ✅ Does NOT allow broad table scans or DELETE operations

**What This Does NOT Change:**
- ❌ No DELETE permission added
- ❌ No broad `USING (true)` clause
- ❌ No changes to SELECT policies (already work)

---

### Menu Items Demo-Safe RLS (Migration 002)

**Issue:** Overly-broad RLS policies allow public INSERT/UPDATE/DELETE on all menu_items fields.

**Problem:**
- Existing policies like "Anon manage menu" and "Public insert/update/delete menu_items" allow full table access
- For demo environment (anon key), we only want:
  - Public can SELECT menu items (read menu)
  - Public can UPDATE `is_available` field only (toggle availability in Inventory)
  - Public cannot INSERT, DELETE, or modify other fields

**Fix Instructions:**

1. **Open Supabase SQL Editor** (https://supabase.com/dashboard/project)

2. **Apply the migration:**
   - Copy contents of `migrations/rls-menu-items/002_demo_safe_policies.sql`
   - Paste into SQL Editor
   - Run query

3. **Verify the fix:**
   ```sql
   -- Should show only 3 policies
   SELECT policyname, cmd, roles, qual
   FROM pg_policies
   WHERE tablename = 'menu_items'
   ORDER BY policyname;
   ```
   Expected output:
   - "Public read menu_items" - SELECT
   - "Public insert menu_items with trigger guard" - INSERT
   - "Public update is_available only" - UPDATE

4. **Verify trigger exists:**
   ```sql
   SELECT tgname, tgtype
   FROM pg_trigger
   WHERE tgname = 'guard_menu_items_update_trigger';
   ```

5. **Test from UI:**
   - Go to http://localhost:3000/demo/owner
   - Click "Inventory" → Toggle any item's availability
   - Should work without error
   - Try to edit item name/price (if UI allows)
   - Should fail with error: "Only is_available field can be modified"

6. **Test from SQL:**
   ```sql
   -- Replace YOUR_RESTAURANT_ID with actual ID
   -- Should SUCCEED - only is_available changes:
   UPDATE menu_items
   SET is_available = false
   WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
   RETURNING *;

   -- Should FAIL - trying to change name:
   UPDATE menu_items
   SET name = 'Hacked Name'
   WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
   RETURNING *;
   -- Expected: ERROR: Only is_available field can be modified

   -- Should FAIL - INSERT blocked:
   INSERT INTO menu_items (id, name, price, category, is_available, restaurant_id)
   VALUES ('test-id', 'Test', 10.00, 'Mains', true, 'YOUR_RESTAURANT_ID');
   -- Expected: Permission denied

   -- Should FAIL - DELETE blocked:
   DELETE FROM menu_items WHERE id = 'test-id';
   -- Expected: Permission denied
   ```

**Rollback (if needed):**
- If issues occur, run `migrations/rls-menu-items/002_rollback.sql` in SQL Editor
- This restores the original 5 broad policies

**What This Changes:**
- ✅ Drops all overly-broad policies (Anon manage menu, Public insert/update/delete)
- ✅ Creates minimal SELECT policy for public menu access
- ✅ Creates INSERT policy guarded by trigger (for upsert operations)
- ✅ Creates UPDATE policy guarded by trigger
- ✅ Trigger blocks updates to fields other than `is_available`
- ✅ Blocks DELETE for public/anon
- ✅ Works with anon key (dev/demo environment)

**What This Does NOT Change:**
- ❌ No DELETE permission for public
- ❌ No updates to fields other than `is_available` (trigger enforces)
- ❌ No broad `USING (true)` policies

**How It Works:**
- The app upserts ALL MenuItem fields (name, price, description, etc.) via `updateMenu()`
- INSERT policy allows the upsert to proceed
- UPDATE policy allows the upsert to proceed
- The BEFORE UPDATE trigger detects which columns actually changed using JSONB diff
- Allows UPDATE if only `is_available` changed (toggle)
- Allows UPDATE if only `id`/`restaurant_id` changed (upsert WHERE clause matching)
- Raises exception for any other column changes
- Result: Availability toggle works, but name/price/description changes are blocked

---

### RLS menu_items Sanity Check (Migration 003)

**Purpose:** Verify menu_items RLS policies are correctly configured with no DELETE permission.

**Quick Verification:**

1. **Check all policies:**
   ```sql
   SELECT policyname, cmd, roles
   FROM pg_policies
   WHERE tablename = 'menu_items'
   ORDER BY cmd, policyname;
   ```

   **Expected result:**
   ```
   policyname                              | cmd   | roles
   -----------------------------------------+-------+------------------------
   Public insert menu_items (trigger guarded)| INSERT| {anon,authenticated}
   Public read menu_items                   | SELECT| {anon,authenticated}
   Public update menu_items (trigger guarded)| UPDATE| {anon,authenticated}
   ```

   **Verify:**
   - ✅ Only SELECT, INSERT, UPDATE policies exist
   - ✅ No DELETE policies
   - ✅ No FOR ALL policies (FOR ALL would include DELETE)
   - ✅ Policy names include "(trigger guarded)" for security

2. **Verify trigger guard exists:**
   ```sql
   SELECT tgname, tgtype
   FROM pg_trigger
   WHERE tgname = 'guard_menu_items_update_trigger';
   ```

   **Expected:** 1 row with `guard_menu_items_update_trigger`

3. **Test DELETE is blocked:**
   ```sql
   DELETE FROM menu_items WHERE id = 'some-id';
   ```

   **Expected:** `permission denied for table menu_items` (or similar error)

4. **Test UPDATE is_available works:**
   ```sql
   UPDATE menu_items
   SET is_available = NOT is_available
   WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
   RETURNING id, name, is_available;
   ```

   **Expected:** Success, returns updated row

5. **Test UPDATE other fields is blocked:**
   ```sql
   UPDATE menu_items
   SET name = 'Hacked Name'
   WHERE restaurant_id = 'YOUR_RESTAURANT_ID';
   ```

   **Expected:** `ERROR: Only is_available field can be modified`

**If verification fails:**
- If DELETE policies exist: Apply `migrations/rls-menu-items/003_fix_policy_scope_no_delete.sql`
- If FOR ALL policies exist: Apply `migrations/rls-menu-items/003_fix_policy_scope_no_delete.sql`
- If trigger guard missing: Apply `migrations/rls-menu-items/003_fix_policy_scope_no_delete.sql`

**Apply Migration 003 (Clean Slate):**
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project
2. Copy contents of `migrations/rls-menu-items/003_fix_policy_scope_no_delete.sql`
3. Paste and run query
4. Re-run verification queries above

**Test in App:**
- Go to `http://localhost:3000/demo/owner`
- Click "Inventory" → Toggle availability for any item
- ✅ Should work without error
- ✅ Toast shows "Menu Updated Live"

**Rollback (if needed):**
- Run `migrations/rls-menu-items/003_rollback.sql` in SQL Editor
- Note: This removes all policies - you'll need to re-apply 002 or 003

---

## Owner-Customer Menu Sync Test

Test that owner inventory changes appear on customer menu in real-time.

**Setup:**
1. Open two browser tabs:
   - Tab A: Owner Inventory (`http://localhost:3000/demo/owner` → Inventory)
   - Tab B: Customer Menu (`http://localhost:3000/demo`)

**Test 1: Add new item appears in customer menu**
1. In Tab A (Owner):
   - Click "+" to add new dish
   - Enter name: "Test Burger", Category: "Burgers", Price: "10.00"
   - Click "Confirm Changes"
   - ✅ Toast shows "Menu Updated Live"
   - ✅ Console shows: `[API] Menu updated successfully`
2. In Tab B (Customer):
   - ✅ New "Test Burger" appears automatically (no refresh needed)
   - ✅ Console shows: `[App] Menu updated from realtime subscription`
   - ✅ Console shows: `[subscribeToMenu] Menu change detected, refreshing...`

**Test 2: Toggle availability reflects in customer menu**
1. In Tab A (Owner):
   - Find any item (e.g., "Double Smash Burger")
   - Toggle availability switch to "Sold Out"
   - ✅ Toast shows "Menu Updated Live"
   - ✅ Item appears grayed out in owner view
2. In Tab B (Customer):
   - ✅ "Double Smash Burger" shows as grayed out/sold out
   - ✅ Cannot add sold out item to cart (button disabled or hidden)

**Test 3: Edit item updates customer menu**
1. In Tab A (Owner):
   - Click edit on any item
   - Change price from €9.50 to €12.00
   - Click "Confirm Changes"
2. In Tab B (Customer):
   - ✅ Item price shows as €12.00 (no refresh needed)
   - ✅ Add to cart uses new price

**Test 4: Real-time subscription verification**
1. Open browser console in both tabs (F12)
2. In Tab A, make any menu change
3. Verify console logs:
   - Tab A: `[API] Updating menu: { restaurantId: '...', itemCount: N }`
   - Tab A: `[API] Menu updated successfully`
   - Tab B: `[subscribeToMenu] Menu change detected, refreshing...`
   - Tab B: `[App] Menu updated from realtime subscription: N items`

**Test 5: Page refresh still shows latest menu**
1. Make several changes in owner view (add item, toggle availability, edit price)
2. In customer tab, refresh page (Cmd/Ctrl + R)
3. ✅ All changes are present (no data loss)

**Expected Result:**
- Owner changes to menu appear instantly on customer menu via real-time Supabase subscription
- No manual refresh needed
- Console logs show successful subscription and updates

**Troubleshooting:**
- If changes don't appear: Check console for `[subscribeToMenu]` logs
- If subscription fails: Verify Supabase realtime is enabled for `menu_items` table
- If wrong restaurant: Check `restaurantId` in console logs matches in both tabs

---

## Support

If something is broken and not covered here:

1. **Screenshot the error** (console red text)
2. **Describe the steps** to reproduce
3. **Check browser console** for first red error
4. **Try clearing cache** first (solves 50% of issues)

---

## Allergens/Additives Field Requirements

**CRITICAL:** The `allergens` and `additives` columns in `menu_items` are stored as **Postgres `text[]` arrays** (not JSONB).

- Always send as JavaScript arrays: `['Dairy', 'Gluten']`
- NEVER send stringified JSON: `'["Dairy", "Gluten"]'`
- NEVER send comma-separated strings: `'Dairy,Gluten'`

The API layer automatically normalizes these fields via `normalizeStringArrayField()` in `api.multitenant.ts`.

**Why this matters:**
When data comes from different sources (user input, external JSON, imports), it can be in various formats. The normalization function handles:
- Arrays: `['Dairy', 'Gluten']` → `['Dairy', 'Gluten']` (cleaned, de-duplicated)
- Stringified JSON: `'["Dairy", "Gluten"]'` → `['Dairy', 'Gluten']`
- Comma-separated: `'Dairy, Gluten'` → `['Dairy', 'Gluten']`
- Null/undefined/empty: `null` or `undefined` → `[]`

**Dev-only logging:**
When running in dev mode, check console for:
```
[API] Menu payload types (first item): {
  allergensType: 'object',
  allergensIsArray: true,
  allergensValue: ['Dairy', 'Gluten'],
  additivesType: 'object',
  additivesIsArray: true,
  additivesValue: ['E102']
}
```

If `allergensIsArray` or `additivesIsArray` is `false`, the normalization may have failed.

---

## Database/RPC Guidelines

**RULE: Always verify actual DB column types using `information_schema.columns` before assuming JSONB vs array behavior in RPCs.**

### Why This Matters

PostgreSQL has two different array-like types that behave very differently:

| Type | Example | Storage | JavaScript → DB |
|------|---------|---------|-----------------|
| `text[]` | `{Peanuts,Dairy}` | Postgres native array | Requires explicit conversion from JSONB |
| `jsonb` | `["Peanuts","Dairy"]` | Binary JSON | Direct serialization, no conversion needed |

**The Pitfall:** When writing RPC functions that receive JSONB payloads, using `item_record->'field'` returns JSONB. If the target column is `text[]`, PostgreSQL will fail with "malformed array literal" because it cannot implicitly cast JSONB arrays to Postgres text arrays.

### Verification Query

Before writing or modifying an RPC function, **always** run this query to verify column types:

```sql
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'menu_items'
  and column_name in ('allergens', 'additives');
```

Expected output for `text[]` columns:
```
 column_name | data_type | udt_name
-------------+-----------+----------
 allergens   | ARRAY     | _text
 additives   | ARRAY     | _text
```

### WARNING

⚠️ **JSONB → `text[]` implicit casts will fail and must be handled explicitly in RPCs.**

Use this pattern for converting JSONB arrays to `text[]`:

```sql
-- WRONG (fails with "malformed array literal"):
COALESCE(item_record->'allergens', '[]'::JSONB)

-- CORRECT (explicit conversion):
CASE
  WHEN jsonb_typeof(item_record->'allergens') = 'array' THEN
    ARRAY(SELECT jsonb_array_elements_text(item_record->'allergens'))
  ELSE
    ARRAY[]::TEXT[]
END
```

### Example Fix

See `supabase/migrations/006_fix_allergens_additives_array_cast.sql` for the complete fix that resolved this issue.
