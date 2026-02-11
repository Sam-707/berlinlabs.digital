# Menu Items RLS Migrations

This folder contains migrations for Row Level Security (RLS) policies on the `menu_items` table.

## Overview

The `menu_items` table stores restaurant menu items and needs RLS policies to:
- Allow public/anon users to read the menu (customer view)
- Allow upsert operations for menu item availability (owner inventory toggle)
- Prevent unauthorized DELETE operations
- Restrict field-level changes via trigger guard

## Migrations

### 001_fix_menu_items_rls.sql ⚠️ **BROKEN**
**Status**: DO NOT USE - Contains critical bug

**Issue**: Uses non-existent `pg_subquery()` function. The policy will fail to create.

**Original intent**: Replace `current_restaurant_id()` based policy with one that validates `restaurant_id` is provided in the query.

**Action**: Use migration 003 instead.

---

### 002_demo_safe_policies.sql ✅ **WORKING**
**Status**: Current recommended migration

**What it does**:
- Drops old broad policies ("Anon manage menu", "Public delete menu_items", etc.)
- Creates explicit SELECT, INSERT, UPDATE policies
- Creates trigger guard to restrict UPDATE to `is_available` field only
- No DELETE policy (DELETE operations are blocked)

**Policies created**:
- `Public read menu_items` - SELECT for anon, authenticated
- `Public insert menu_items with trigger guard` - INSERT for anon, authenticated
- `Public update is_available only` - UPDATE for anon, authenticated

**Trigger guard**: `guard_menu_items_update_trigger`
- Allows UPDATE only when `is_available` is the only changed field
- Allows system fields (id, restaurant_id) for upsert WHERE clause matching
- Blocks changes to all other fields

**How to apply**:
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project
2. Copy contents of `002_demo_safe_policies.sql`
3. Paste and run query
4. Verify with: `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menu_items';`

**How to rollback**: Run `002_rollback.sql`

---

### 003_fix_policy_scope_no_delete.sql ✅ **RECOMMENDED**
**Status**: Latest migration - clean slate approach

**What it does**:
- Drops ALL existing policies on menu_items (clean slate)
- Creates explicit SELECT, INSERT, UPDATE policies only
- Ensures trigger guard exists
- **NO DELETE policy** - DELETE operations are blocked
- **NO FOR ALL policies** - No implicit DELETE permission

**Policies created**:
- `Public read menu_items` - SELECT for anon, authenticated
- `Public insert menu_items (trigger guarded)` - INSERT for anon, authenticated
- `Public update menu_items (trigger guarded)` - UPDATE for anon, authenticated

**Why use 003 over 002**:
- Cleaner: Drops all old policies first (no conflicts)
- Safer: Explicitly ensures no FOR ALL or DELETE policies exist
- Clearer: Policy names indicate "(trigger guarded)" for security
- Future-proof: Easy to understand what permissions exist

**How to apply**:
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project
2. Copy contents of `003_fix_policy_scope_no_delete.sql`
3. Paste and run query
4. Verify with queries below

**How to rollback**: Run `003_rollback.sql`

---

## Verification

### After applying any migration, verify:

**1. Check policies exist and no DELETE policies**:
```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'menu_items'
ORDER BY cmd, policyname;
```

**Expected result** (for 003):
```
policyname                              | cmd   | roles
-----------------------------------------+-------+------------------------
Public insert menu_items (trigger guarded)| INSERT| {anon,authenticated}
Public read menu_items                   | SELECT| {anon,authenticated}
Public update menu_items (trigger guarded)| UPDATE| {anon,authenticated}
```

**Verify**:
- ✅ Only SELECT, INSERT, UPDATE policies exist
- ✅ No DELETE policies
- ✅ No FOR ALL policies
- ✅ Policy names include "(trigger guarded)" for INSERT/UPDATE

---

**2. Check trigger guard exists**:
```sql
SELECT tgname, tgtype
FROM pg_trigger
WHERE tgname = 'guard_menu_items_update_trigger';
```

**Expected**: 1 row with `tgname = 'guard_menu_items_update_trigger'`

---

**3. Test DELETE is blocked**:
```sql
DELETE FROM menu_items WHERE id = 'some-id';
```

**Expected**: `permission denied for table menu_items` or similar error

---

**4. Test UPDATE is_available works**:
```sql
UPDATE menu_items
SET is_available = NOT is_available
WHERE restaurant_id = 'YOUR_RESTAURANT_ID'
RETURNING id, name, is_available;
```

**Expected**: Success, returns updated row

---

**5. Test UPDATE other fields is blocked**:
```sql
UPDATE menu_items
SET name = 'Hacked Name'
WHERE restaurant_id = 'YOUR_RESTAURANT_ID';
```

**Expected**: `ERROR: Only is_available field can be modified`

---

## Application Testing

After applying migration, test in the app:

1. **Customer Menu**:
   - Go to `http://localhost:3000/demo`
   - ✅ Menu loads successfully (SELECT works)

2. **Owner Inventory Toggle**:
   - Go to `http://localhost:3000/demo/owner`
   - Click "Inventory"
   - Toggle availability for any item
   - ✅ Toggle works (UPDATE is_available works)
   - ✅ Toast shows "Menu Updated Live"

3. **Verify DELETE is blocked**:
   - Try to delete an item from Supabase SQL Editor
   - ✅ Should get permission denied error

---

## Security Model

### Layer 1: RLS Policies
- **SELECT**: Allow reading menu items
- **INSERT**: Allow inserting (for upsert operations)
- **UPDATE**: Allow updates
- **DELETE**: NO policy (blocked)

### Layer 2: Trigger Guard
- `guard_menu_items_update_trigger` runs BEFORE UPDATE
- Allows changes only to:
  - `is_available` field (availability toggle)
  - `id`, `restaurant_id` (for upsert WHERE clause)
- Blocks changes to all other fields (name, price, description, etc.)

### Why Two Layers?
- **RLS Policies**: Control who can perform which operations (SELECT/INSERT/UPDATE/DELETE)
- **Trigger Guard**: Controls what fields can be modified during those operations
- Together: "Can UPDATE, but only is_available field"

---

## Troubleshooting

### Issue: "permission denied for table menu_items"

**Cause**: No RLS policy for the operation you're trying

**Solution**:
1. Check what operation you're doing (SELECT/INSERT/UPDATE/DELETE)
2. Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'menu_items';`
3. If missing, apply migration 002 or 003

---

### Issue: UPDATE succeeds but changes don't apply

**Cause**: Trigger guard might be blocking the field change

**Solution**:
1. Check if you're changing only `is_available`
2. If changing other fields, that's expected behavior (security feature)
3. For full menu edits, use authenticated staff account (when implemented)

---

### Issue: "function current_restaurant_id() does not exist"

**Cause**: Migration 001 or old policies that rely on `current_restaurant_id()`

**Solution**: Apply migration 003 to remove old policies

---

### Issue: DELETE operations work (should be blocked)

**Cause**: A DELETE policy or FOR ALL policy exists

**Solution**:
1. Check for DELETE policies: `SELECT * FROM pg_policies WHERE tablename = 'menu_items' AND cmd = 'DELETE';`
2. Check for FOR ALL policies: `SELECT * FROM pg_policies WHERE tablename = 'menu_items' AND cmd = 'ALL';`
3. Apply migration 003 to remove them

---

## Migration History

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2025-01-24 | 001_fix_menu_items_rls.sql | ⚠️ BROKEN | Uses non-existent `pg_subquery()` function |
| 2025-01-24 | 002_demo_safe_policies.sql | ✅ WORKING | First working migration with trigger guard |
| 2025-01-28 | 003_fix_policy_scope_no_delete.sql | ✅ RECOMMENDED | Clean slate, no FOR ALL, no DELETE |

---

## Future Work

When Supabase Auth is properly implemented:

1. Replace anon/authenticated policies with authenticated-only policies
2. Add restaurant_id scoping to policies (multi-tenant isolation)
3. Remove trigger guard (use RLS policy WITH CHECK clause instead)
4. Add audit logging for menu changes

Example production policy (future):
```sql
CREATE POLICY "Restaurant staff manage menu items"
ON menu_items
FOR ALL
TO authenticated
USING (restaurant_id = current_restaurant_id())
WITH CHECK (restaurant_id = current_restaurant_id());
```

---

## Questions?

See RUNBOOK.md section "RLS menu_items sanity check" for quick verification queries.
