# MenuFlows Troubleshooting Guide

This guide covers common issues and their solutions when developing, deploying, or maintaining MenuFlows.

---

## Quick Diagnosis Checklist

When something isn't working:

1. **Browser Console** - Check for JavaScript errors (F12 → Console)
2. **Network Tab** - Check for failed API requests (F12 → Network)
3. **Supabase Dashboard** - Check for database errors (Logs → API)
4. **Environment Variables** - Verify all required vars are set
5. **Vercel Logs** - Check deployment and function logs

---

## Connection Issues

### "Failed to connect to Supabase"

**Symptoms:**
- Blank screen on load
- Console error: `TypeError: Failed to fetch`
- Network tab shows failed requests to `supabase.co`

**Causes & Solutions:**

1. **Missing environment variables**
   ```bash
   # Check .env.local exists and has:
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

2. **Supabase project paused** (free tier)
   - Go to Supabase dashboard
   - If project is paused, click "Restore"
   - Free tier pauses after 1 week of inactivity

3. **Wrong API credentials**
   - Go to Supabase → Settings → API
   - Copy fresh credentials
   - Update in `.env.local` and Vercel

4. **CORS issues**
   - Supabase allows all origins by default
   - Check if custom CORS settings were added

**Diagnostic:**
```typescript
// Run in browser console
const { data, error } = await supabase.from('restaurants').select('count');
console.log('Connection test:', { data, error });
```

---

### "Restaurant not found"

**Symptoms:**
- Splash screen stuck on loading
- Console: `Restaurant not found for slug: xxx`
- Redirected to marketing page

**Causes & Solutions:**

1. **Slug doesn't exist**
   ```sql
   -- Check if restaurant exists
   SELECT * FROM restaurants WHERE slug = 'your-slug';
   ```

2. **Restaurant is suspended**
   ```sql
   -- Check subscription status
   SELECT slug, subscription_status FROM restaurants;

   -- Fix: Reactivate
   UPDATE restaurants
   SET subscription_status = 'active'
   WHERE slug = 'your-slug';
   ```

3. **URL typo**
   - Slugs are case-sensitive: `Burger-Lab` ≠ `burger-lab`
   - Check for extra slashes: `/burger-lab/` vs `/burger-lab`

4. **Multi-tenant mode not initialized**
   - Check `api.multitenant.ts` is being used
   - Verify `initializeRestaurant()` is called on app load

---

## Authentication Issues

### "Invalid PIN" (Owner Login)

**Symptoms:**
- PIN entry shakes/shows error
- Console: `Login failed: no matching record`

**Causes & Solutions:**

1. **Wrong PIN**
   - Default test PIN is usually `1234`
   - Check `restaurant_staff` table for correct hash

2. **PIN hash mismatch**
   - App uses SHA-256 hashing
   - Verify hash format matches:
   ```sql
   -- PIN "1234" should hash to:
   -- 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
   SELECT * FROM restaurant_staff WHERE pin_hash LIKE '03ac%';
   ```

3. **Staff member inactive**
   ```sql
   -- Check is_active flag
   SELECT * FROM restaurant_staff
   WHERE restaurant_id = 'xxx' AND is_active = true;
   ```

4. **Wrong restaurant context**
   - Staff PINs are restaurant-specific
   - Ensure correct restaurant is loaded

**Reset PIN:**
```sql
UPDATE restaurant_staff
SET pin_hash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
WHERE restaurant_id = 'xxx' AND role = 'owner';
-- New PIN: 1234
```

---

### "Admin login failed"

**Symptoms:**
- Admin login form shows error
- Console: `Admin auth failed`

**Causes & Solutions:**

1. **No admin account exists**
   ```sql
   -- Check platform_admins table
   SELECT email, is_active FROM platform_admins;
   ```

2. **Password hash mismatch**
   - Generate correct hash:
   ```javascript
   // Browser console
   const encoder = new TextEncoder();
   const data = encoder.encode('your-password');
   const hash = await crypto.subtle.digest('SHA-256', data);
   const hashHex = Array.from(new Uint8Array(hash))
     .map(b => b.toString(16).padStart(2, '0')).join('');
   console.log(hashHex);
   ```

3. **Account inactive**
   ```sql
   UPDATE platform_admins SET is_active = true WHERE email = 'admin@example.com';
   ```

---

## Menu & Data Issues

### "Menu is empty"

**Symptoms:**
- MenuView shows no items
- Categories show but no items inside

**Causes & Solutions:**

1. **No menu items for restaurant**
   ```sql
   SELECT COUNT(*) FROM menu_items
   WHERE restaurant_id = 'xxx';
   ```

2. **Items not available**
   ```sql
   -- Check availability
   SELECT name, is_available FROM menu_items
   WHERE restaurant_id = 'xxx';

   -- Fix: Make all available
   UPDATE menu_items SET is_available = true
   WHERE restaurant_id = 'xxx';
   ```

3. **Category mismatch**
   - Items have `category` field that must match filter
   - Check categories: `Burgers`, `Sides`, `Drinks`, `Desserts`

4. **Wrong API being used**
   - Single-tenant: `api.ts` (no restaurant_id filter)
   - Multi-tenant: `api.multitenant.ts` (filtered by restaurant)

---

### "Modifiers not showing on item"

**Symptoms:**
- Item detail view shows no modifiers
- Modifier selector component not rendered

**Causes & Solutions:**

1. **No modifier groups linked**
   ```sql
   -- Check links exist
   SELECT m.name as item, g.name as modifier_group
   FROM menu_item_modifiers mim
   JOIN menu_items m ON mim.menu_item_id = m.id
   JOIN item_modifier_groups g ON mim.modifier_group_id = g.id
   WHERE m.restaurant_id = 'xxx';
   ```

2. **Modifier group has no modifiers**
   ```sql
   -- Check modifiers exist in groups
   SELECT g.name, COUNT(m.id) as modifier_count
   FROM item_modifier_groups g
   LEFT JOIN item_modifiers m ON g.id = m.group_id
   WHERE g.restaurant_id = 'xxx'
   GROUP BY g.id, g.name;
   ```

3. **API not fetching modifiers**
   - Use `getMenuWithModifiers()` instead of `getMenu()`
   - Check that join query is working

**Fix: Link modifier group to item**
```sql
INSERT INTO menu_item_modifiers (menu_item_id, modifier_group_id)
VALUES ('menu-item-uuid', 'modifier-group-uuid');
```

---

## Order Issues

### "Orders not appearing in dashboard"

**Symptoms:**
- Customer places order successfully
- Kitchen/staff don't see the order

**Causes & Solutions:**

1. **Real-time subscription not working**
   - Check WebSocket connection in Network tab
   - Look for `wss://` connection to Supabase

2. **Tables not in replication**
   ```sql
   -- Add to realtime
   ALTER PUBLICATION supabase_realtime ADD TABLE orders;
   ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
   ```

3. **Restaurant ID mismatch**
   - Order created with wrong `restaurant_id`
   - Staff viewing different restaurant

4. **Status filter**
   - Dashboard may filter by status
   - Check if order has unexpected status

**Debug:**
```sql
-- Find recent orders
SELECT id, restaurant_id, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

---

### "Order status not updating"

**Symptoms:**
- Click status button, nothing happens
- Console shows update error

**Causes & Solutions:**

1. **RLS policy blocking update**
   - Check policies allow update for current context

2. **Invalid status transition**
   - Status enum: `pending` → `confirmed` → `preparing` → `ready` → `served`
   - Can't skip statuses

3. **WebSocket disconnected**
   - Subscription died, not receiving updates
   - Refresh page to reconnect

---

### "Handshake code generation failed"

**Symptoms:**
- Order creation fails
- Console: `Could not generate unique code`

**Causes & Solutions:**

1. **RPC function missing**
   ```sql
   -- Check function exists
   SELECT proname FROM pg_proc WHERE proname = 'generate_handshake_code';
   ```

2. **Too many active orders** (unlikely)
   - 24^2 * 9^2 = 46,656 possible codes
   - Function retries 100 times

3. **Database connection issue**
   - RPC call failing entirely
   - Check Supabase logs

**Manual fix:**
```javascript
// Client-side fallback generates code if RPC fails
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const nums = '123456789';
// Code like "AB.12"
```

---

## Real-Time Issues

### "Real-time updates not working"

**Symptoms:**
- Changes made in one tab don't appear in another
- Need to refresh to see new orders

**Causes & Solutions:**

1. **Realtime not enabled**
   - Supabase Dashboard → Database → Replication
   - Enable Supabase Realtime
   - Add tables to publication

2. **Connection limit exceeded** (free tier: 200)
   - Check concurrent connections in Supabase dashboard
   - Upgrade plan if needed

3. **Subscription filter mismatch**
   ```typescript
   // Ensure filter matches restaurant_id
   .on('postgres_changes', {
     event: '*',
     table: 'orders',
     filter: `restaurant_id=eq.${restaurantId}`  // Must match exactly
   })
   ```

4. **Channel not subscribed**
   ```typescript
   // Verify subscription status
   const channel = supabase.channel('orders-channel');
   console.log('Channel state:', channel.state);  // Should be 'subscribed'
   ```

**Test real-time:**
```typescript
// Subscribe to all changes (debug)
supabase
  .channel('debug')
  .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
    console.log('Change received:', payload);
  })
  .subscribe();
```

---

## Image Upload Issues

### "Image upload failed"

**Symptoms:**
- Image picker works, upload fails
- Console: `StorageError: Not found`

**Causes & Solutions:**

1. **Bucket doesn't exist**
   - Create `menu-images` bucket in Supabase Storage
   - Set to public

2. **Wrong bucket policies**
   ```sql
   -- Allow public uploads
   CREATE POLICY "Allow uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'menu-images');

   -- Allow public read
   CREATE POLICY "Allow reads" ON storage.objects
   FOR SELECT USING (bucket_id = 'menu-images');
   ```

3. **File too large**
   - Free tier: 50MB max file size
   - Compress images before upload

4. **Wrong file path**
   ```typescript
   // Path should be: restaurantId/timestamp-filename.jpg
   const filePath = `${restaurantId}/${Date.now()}-${file.name}`;
   ```

---

## Build & Deployment Issues

### "Build failed on Vercel"

**Symptoms:**
- Deployment fails
- Build logs show errors

**Common Causes:**

1. **TypeScript errors**
   ```bash
   # Test build locally first
   npm run build
   ```

2. **Missing dependencies**
   ```bash
   # Ensure package-lock.json is committed
   git add package-lock.json
   git commit -m "Add package-lock"
   ```

3. **Environment variables missing**
   - Check Vercel project settings
   - All `VITE_` vars must be set

4. **Node version mismatch**
   - Set Node 20.x in Vercel settings

---

### "404 on page refresh"

**Symptoms:**
- Direct URL access returns 404
- `/burger-lab-berlin` works initially, fails on refresh

**Solution:**

Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This tells Vercel to serve `index.html` for all routes (SPA routing).

---

## Performance Issues

### "App loads slowly"

**Diagnosis:**
1. Check Network tab for slow requests
2. Run Lighthouse audit
3. Check Supabase query performance

**Solutions:**

1. **Add indexes**
   ```sql
   CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
   CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
   ```

2. **Optimize queries**
   - Use `.select('specific,columns')` not `select('*')`
   - Add pagination for large datasets

3. **Enable connection pooling**
   - Supabase settings → Database → Connection pooling

4. **Cache static data**
   - Menu items don't change often
   - Store in local state after first fetch

---

## Debug Mode

### Enable Verbose Logging

Add to your code temporarily:

```typescript
// Log all Supabase queries
const originalFrom = supabase.from;
supabase.from = function(table) {
  console.log('Supabase query:', table);
  return originalFrom.call(this, table);
};

// Log all state changes
useEffect(() => {
  console.log('State changed:', { view, menu, cart, orders });
}, [view, menu, cart, orders]);
```

### Check Session Storage

```javascript
// Browser console
console.log('Owner session:', sessionStorage.getItem('menuflows_owner_session'));
console.log('Admin session:', sessionStorage.getItem('menuflows_admin_session'));
console.log('Restaurant:', sessionStorage.getItem('menuflows_current_restaurant'));
```

### Test API Connection

```typescript
// Run in browser console
import { supabase } from './lib/supabase';

// Test basic query
const { data, error } = await supabase.from('restaurants').select('*');
console.log('Restaurants:', data, error);

// Test RPC
const { data: code } = await supabase.rpc('generate_handshake_code', {
  p_restaurant_id: 'your-restaurant-id'
});
console.log('Generated code:', code);
```

---

## Getting Help

If you can't resolve an issue:

1. **Search existing issues** on GitHub
2. **Create a new issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors
   - Environment details (browser, OS)
3. **Include relevant logs** from browser and Supabase

---

## Common Error Messages

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| `Failed to fetch` | Network/CORS | Check Supabase URL |
| `JWT expired` | Auth token expired | Refresh page |
| `Row not found` | RLS blocking | Check policies |
| `Relation does not exist` | Table missing | Run schema SQL |
| `Permission denied` | RLS policy | Check user context |
| `WebSocket error` | Realtime issue | Enable replication |

---

*See also: [DEPLOYMENT.md](./DEPLOYMENT.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
