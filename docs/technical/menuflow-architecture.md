# MenuFlows Architecture Documentation

> **Version**: 1.0
> **Last Updated**: 2026-02-11
> **Tech Stack**: React 19 + TypeScript + Vite + Supabase

---

## System Overview

MenuFlows is a multi-tenant SaaS platform for restaurants. The architecture follows a modern JAMstack (JavaScript, APIs, Markup) pattern with serverless backend.

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Customer     │  │  Restaurant    │  │  Platform     │ │
│  │  (QR Scan)    │  │  Staff         │  │  Admin        │ │
│  │               │  │  (PIN Login)    │  │               │ │
│  │  • Browse     │  │  • Dashboard    │  │  • Analytics  │ │
│  │  • Order      │  │  • Kitchen      │  │  • Manage     │
│  │  • Pay        │  │  • Menu Mgmt    │  │    Restaurants│ │
│  └───────────────┘  └────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           React 19 + TypeScript SPA                     │  │
│  │                                                           │  │
│  │  Components:                                               │  │
│  │  • CustomerMenu - Browse & order                         │  │
│  │  • Cart - Shopping cart                                   │  │
│  │  • StaffDashboard - Restaurant management                 │  │
│  │  • KitchenDisplay - Order board                          │  │
│  │  • AdminPanel - Platform management                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Vite Build + Dev Server                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API LAYER (Vercel)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Supabase Client (Browser API)                   │  │
│  │                                                           │  │
│  │  • Authentication (Auth)                                  │  │
│  │  • Database Queries (PostgreSQL)                          │  │
│  │  • Realtime Subscriptions                                │  │
│  │  • Storage (Images)                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          Serverless Functions (Future)                    │  │
│  │                                                           │  │
│  │  • Stripe Webhooks                                       │  │
│  │  • Email Notifications                                   │  │
│  │  • PDF Generation                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌────────────────────────────────┐ │
│  │    Supabase        │  │       Stripe                  │ │
│  │    Cloud           │  │                                │ │
│  │                     │  │  • Subscription Mgmt           │ │
│  │  • PostgreSQL      │  │  • Payment Processing          │ │
│  │  • Auth           │  │  • Invoicing                  │ │
│  │  • Realtime       │  │  • Webhooks                   │ │
│  │  • Storage        │  │                                │ │
│  │  • RLS           │  │                                │ │
│  └─────────────────────┘  └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── customer/
│   │   ├── MenuBrowser.tsx          # Browse menu categories
│   │   ├── MenuItemDetail.tsx        # Item with modifiers
│   │   ├── Cart.tsx                 # Shopping cart
│   │   └── Checkout.tsx            # Place order
│   │
│   ├── restaurant/
│   │   ├── Dashboard.tsx            # Main staff dashboard
│   │   ├── KitchenDisplay.tsx        # Order board
│   │   ├── MenuEditor.tsx           # Menu management
│   │   ├── TableManager.tsx          # QR code assignment
│   │   ├── Analytics.tsx            # Revenue, popular items
│   │   └── PINLogin.tsx             # Staff authentication
│   │
│   ├── admin/
│   │   ├── AdminPanel.tsx            # Platform management
│   │   ├── RestaurantList.tsx        # All restaurants
│   │   └── PlatformAnalytics.tsx     # Cross-restaurant stats
│   │
│   └── common/
│       ├── QRCode.tsx               # QR generation
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── api-multitenant.ts          # Multi-tenant queries
│   ├── auth.ts                     # Authentication helpers
│   └── utils.ts                    # Common utilities
│
├── pages/
│   ├── /[slug].tsx                 # Restaurant customer view
│   ├── /[slug]/staff.tsx          # Restaurant staff dashboard
│   └── /admin.tsx                 # Platform admin
│
└── App.tsx                         # Main app with routing
```

### State Management

MenuFlows uses **React built-in state** (useState, useContext) combined with **Supabase Realtime** for server state.

```typescript
// Local state (UI)
const [cart, setCart] = useState<CartItem[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string>('');

// Server state (synced via Supabase)
const { data: menuItems, error } = useSupabaseQuery(
  supabase
    .from('menu_items')
    .select('*, categories(*)')
    .eq('restaurant_id', restaurantId)
);

// Real-time updates
useEffect(() => {
  const channel = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: `restaurant_id=eq.${restaurantId}`
    }, (payload) => {
      // New order received - update kitchen display
      setOrders(prev => [payload.new, ...prev]);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [restaurantId]);
```

---

## Multi-Tenant Architecture

### URL-Based Routing

Each restaurant has a unique slug for URL-based routing:

```
https://menuflows.com/burger-lab-berlin
                        └─ slug (unique per restaurant)
```

### Data Isolation (Row-Level Security)

All database queries are scoped to the current restaurant using Supabase RLS:

```sql
-- RLS Policy for menu_items
CREATE POLICY menu_items_isolation ON menu_items
  FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE slug = current_restaurant_slug())
);

-- Function to get current restaurant from URL
CREATE OR REPLACE FUNCTION current_restaurant_slug()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.headers', true)::json->>'x-restaurant-slug', '')
$$ LANGUAGE sql STABLE;
```

### Tenant Metadata Flow

```
1. User visits: /burger-lab-berlin
2. App extracts slug from URL
3. Query: SELECT * FROM restaurants WHERE slug = 'burger-lab-berlin'
4. Store restaurant_id in context
5. All subsequent queries filter by restaurant_id
6. RLS ensures data isolation
```

---

## Database Schema

### Core Tables

```sql
-- Restaurants (Tenants)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  business_type business_type,
  accent_color VARCHAR(7) DEFAULT '#c21e3a',
  subscription_plan subscription_plan DEFAULT 'trial',
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id VARCHAR(255)
);

-- Menu Items (scoped to restaurant)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES menu_categories(id),
  is_available BOOLEAN DEFAULT true
);

-- Orders (scoped to restaurant)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  table_number INTEGER,
  status order_status DEFAULT 'pending',
  items JSONB NOT NULL,              -- Array of order items
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff (scoped to restaurant)
CREATE TABLE restaurant_staff (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255),             -- 4-digit PIN
  role staff_role DEFAULT 'waiter'
);
```

### Relationships

```
restaurants (1) ──────< (N) menu_categories
       │
       │
       ├─────< (N) menu_items ──────< (N) modifier_groups
       │                             │
       │                             └─────< (N) modifiers
       │
       ├─────< (N) orders ─────────────< (N) order_items
       │
       ├─────< (N) tables ─────────────< (N) qr_codes
       │
       └─────< (N) restaurant_staff
```

---

## Authentication

### Customer Access (No Auth)

Customers access menus via QR code without authentication:
1. Scan QR code → Opens `/{restaurant-slug}`
2. Browse menu and add items to cart
3. Place order with table number
4. No account required

### Staff Access (PIN-based)

Restaurant staff authenticate with 4-digit PIN:

```typescript
// PIN Login Flow
const login = async (pin: string) => {
  // Hash PIN
  const pinHash = await hashPIN(pin);

  // Query staff by PIN hash
  const { data: staff } = await supabase
    .from('restaurant_staff')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('pin_hash', pinHash)
    .single();

  if (staff) {
    // Store staff session in localStorage
    localStorage.setItem('staffSession', JSON.stringify({
      restaurantId: staff.restaurant_id,
      staffId: staff.id,
      role: staff.role
    }));
  }
};
```

### Platform Admin (Email + Password)

Platform admins have full access:

```typescript
// Admin login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@menuflows.com',
  password: 'admin_password'
});
```

---

## Real-Time Features

### Kitchen Display Updates

```typescript
// Subscribe to new orders
const channel = supabase
  .channel('kitchen-orders')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: `restaurant_id=eq.${restaurantId}`
    },
    (payload) => {
      // Play sound
      playNotificationSound();

      // Add to order board
      setOrders(prev => [payload.new, ...prev]);

      // Update badge
      incrementPendingCount();
    }
  )
  .subscribe();
```

### Order Status Updates

```typescript
// Customer sees order status in real-time
supabase
  .channel(`order-${orderId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`
    },
    (payload) => {
      const newStatus = payload.new.status;
      setOrderStatus(newStatus);

      // Show notification
      if (newStatus === 'ready') {
        showNotification('Your order is ready!');
      }
    }
  )
  .subscribe();
```

---

## Payment Integration (Future)

### Stripe Flow

```typescript
// 1. Create checkout session
const createCheckoutSession = async (planId: string) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurantId: restaurant.id,
      plan: planId  // 'starter' or 'professional'
    })
  });

  const { url } = await response.json();
  window.location.href = url;  // Redirect to Stripe
};

// 2. Webhook handler (server-side)
// api/stripe-webhook.ts
export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    // Update restaurant subscription in database
    await supabase
      .from('restaurants')
      .update({
        subscription_status: 'active',
        subscription_plan: subscription.items.data[0].price.lookup_key,
        stripe_customer_id: customerId
      })
      .eq('stripe_customer_id', customerId);
  }

  res.json({ received: true });
};
```

---

## Performance Optimizations

### 1. Query Optimization

```typescript
// ❌ BAD - N+1 query problem
const items = await supabase.from('menu_items').select('*');
for (const item of items.data) {
  const category = await supabase
    .from('categories')
    .select('*')
    .eq('id', item.category_id)
    .single();
}

// ✅ GOOD - Single query with join
const items = await supabase
  .from('menu_items')
  .select('*, categories(*)')
  .eq('restaurant_id', restaurantId);
```

### 2. Image Optimization

```typescript
// Supabase Image Transformations
const optimizedImageUrl = supabase.storage
  .from('menu-images')
  .getPublicUrl(imagePath, {
    transform: {
      width: 400,
      height: 300,
      quality: 80
    }
  });
```

### 3. Code Splitting

```typescript
// Lazy load heavy components
const KitchenDisplay = lazy(() => import('./components/KitchenDisplay'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <KitchenDisplay />
</Suspense>
```

---

## Security

### Row-Level Security (RLS)

All tables have RLS policies to ensure data isolation:

```sql
-- Example: Menu items policy
CREATE POLICY menu_items_restaurant_isolation ON menu_items
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE slug = current_restaurant_slug()
    )
  );

-- Example: Orders policy (staff only)
CREATE POLICY orders_staff_only ON orders
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE id = auth.uid()
    )
  );
```

### Input Validation

```typescript
// Validate table number
const tableNumber = parseInt(input);
if (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 50) {
  throw new Error('Invalid table number');
}

// Sanitize user input
const sanitize = (str: string) => {
  return str.replace(/<script.*?>.*?<\/script>/gi, '');
};
```

---

## Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (future)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Sentry (optional)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Monitoring

### Client-Side Tracking

```typescript
// Error tracking with Sentry
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 0.1
  });
}
```

### Performance Metrics

```typescript
// Track API response times
const startTime = performance.now();
const { data, error } = await supabase.from('menu_items').select('*');
const duration = performance.now() - startTime;

// Log to analytics
logPerformanceEvent('menu_items_query', duration);
```

---

## Future Enhancements

1. **Progressive Web App (PWA)**
   - Offline menu access
   - Install to home screen
   - Push notifications

2. **Multi-Language Support**
   - i18n framework
   - Menu translations
   - Dynamic language switching

3. **Loyalty Program**
   - Customer accounts
   - Points system
   - Rewards and discounts

4. **Delivery Integration**
   - Delivery.com API
   - Uber Eats integration
   - In-house delivery tracking

---

**Last Updated**: 2026-02-11
**Architecture Version**: 1.0
**Status**: Production Ready (with Stripe integration)
