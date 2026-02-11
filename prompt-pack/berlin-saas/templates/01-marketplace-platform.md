---
title: "Marketplace Platform Template"
description: "Complete SaaS template for course marketplaces, service marketplaces, and product catalogs"
category: "Template"
tags: ["marketplace", "multi-vendor", "stripe-connect", "escrow"]
difficulty: "Intermediate"
timeRequired: "20-30 hours"
dependencies: ["Phase 1", "Phase 2", "Phase 3", "Phase 4A"]
---

# Marketplace Platform Template

> For: Course marketplaces, service marketplaces, product catalogs

---

## Quick Start

Use this template with the [Foundation Framework](../phases/01-foundation-framework.md).

---

## Business Context

```yaml
Target:
  Buyers:
    - Looking to purchase products/services
    - Need trust and safety
    - Want variety and discovery

  Sellers:
    - Want to reach more customers
    - Need easy listing management
    - Want fair pricing and payouts

  Admin:
    - Manage the platform
    - Resolve disputes
    - Review listings
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Public | Browse listings, view seller profiles, search/filter |
| Buyer | All public + Make purchases, order tracking, reviews |
| Seller | All buyer + Create listings, manage inventory, view sales analytics |
| Admin | Full control + Manage all users, platform analytics, dispute resolution |

---

## Core Pages

### Public Pages
- Landing page
- Browse/search listings
- Category pages
- Seller profiles

### Seller Pages
- Dashboard
- Create/edit listing
- My listings
- Orders management
- Analytics
- Payout settings

### Buyer Pages
- Dashboard
- My orders
- Saved items
- Reviews

### Admin Pages
- All listings
- All users (sellers + buyers)
- All orders
- Platform analytics
- Payout management

---

## Data Structure

```sql
-- Users/Profiles extension
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- user, seller, admin
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  images TEXT[],
  status TEXT DEFAULT 'active', -- active, sold, draft, archived
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled, refunded
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id) -- One review per listing per buyer
);

-- Messages (buyer-seller communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved items (wishlist)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Seller earnings (for payouts)
CREATE TABLE seller_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL, -- Seller's share after fees
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
```

---

## RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner write
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Public read active, seller CRUD own
CREATE POLICY "Public can view active listings"
ON listings FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage own listings"
ON listings FOR ALL USING (auth.uid() = seller_id);

-- Orders: Buyer/Seller can view own
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Reviews: Public read, buyer create for purchased listings
CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews"
ON reviews FOR INSERT WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.buyer_id = auth.uid()
    AND orders.listing_id = reviews.listing_id
    AND orders.status = 'completed'
  )
);

-- Messages: Sender/receiver can view
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Saved items: User CRUD own
CREATE POLICY "Users can manage saved items"
ON saved_items FOR ALL USING (auth.uid() = user_id);

-- Seller earnings: Seller read own, admin all
CREATE POLICY "Sellers can view own earnings"
ON seller_earnings FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all earnings"
ON seller_earnings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## Key Features

### 1. Search and Filtering

```typescript
// hooks/useListings.ts
export function useListings(filters: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'created_at' | 'price' | 'popular'
}) {
  const [listings, setListings] = useState([])

  useEffect(() => {
    loadListings()
  }, [filters])

  async function loadListings() {
    let query = supabase
      .from('listings')
      .select('*, profiles:seller_id(display_name, avatar_url)')
      .eq('status', 'active')

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters.sortBy === 'price') {
      query = query.order('price', { ascending: true })
    } else if (filters.sortBy === 'popular') {
      query = query.order('view_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data } = await query
    setListings(data || [])
  }

  return { listings }
}
```

### 2. Stripe Connect for Seller Payouts

```typescript
// supabase/functions/create-stripe-connect-account/index.ts
import { stripe } from '../_shared/stripe.ts'

serve(async (req) => {
  const { userId } = await req.json()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Create or retrieve Stripe Connect account
  let accountId = profile.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DE',
      capabilities: {
        transfers: { requested: true },
      },
    })

    accountId = account.id

    await supabase
      .from('profiles')
      .update({ stripe_account_id: accountId })
      .eq('id', userId)
  }

  // Create onboarding link
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/seller/settings',
    return_url: `${origin}/seller/settings?connected=true`,
    type: 'account_onboarding',
  })

  return new Response(JSON.stringify({ url: link.url }))
})
```

### 3. Order Status Tracking

```typescript
// components/OrderTracking.tsx
export function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Subscribe to order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        setOrder(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed by Seller' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'completed', label: 'Delivered' }
  ]

  const currentStep = steps.findIndex(s => s.key === order?.status)

  return (
    <div className="order-tracking">
      <div className="steps">
        {steps.map((step, index) => (
          <div key={step.key} className={`step ${index <= currentStep ? 'active' : ''}`}>
            <div className="circle">{index + 1}</div>
            <div className="label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Dashboard Widgets

### Seller Dashboard

```typescript
// components/SellerDashboard.tsx
export function SellerDashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    pendingPayouts: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: { user } } = await supabase.auth.getUser()

    const [listings, orders, earnings] = await Promise.all([
      supabase.from('listings').select('id, status', { count: 'exact', head: true })
        .eq('seller_id', user.id),
      supabase.from('orders').select('id, status, amount')
        .eq('seller_id', user.id),
      supabase.from('seller_earnings').select('amount, status')
        .eq('seller_id', user.id).eq('status', 'pending')
    ])

    setStats({
      totalListings: listings.count || 0,
      activeListings: listings.data?.filter(l => l.status === 'active').length || 0,
      totalOrders: orders.data?.length || 0,
      pendingOrders: orders.data?.filter(o => o.status === 'pending').length || 0,
      totalRevenue: orders.data?.reduce((sum, o) => sum + o.amount, 0) || 0,
      pendingPayouts: earnings.data?.reduce((sum, e) => sum + e.amount, 0) || 0
    })
  }

  return (
    <div className="dashboard">
      <div className="stat-card">
        <label>Active Listings</label>
        <value>{stats.activeListings}</value>
      </div>
      <div className="stat-card">
        <label>Pending Orders</label>
        <value>{stats.pendingOrders}</value>
      </div>
      <div className="stat-card">
        <label>Total Revenue</label>
        <value>€{stats.totalRevenue.toFixed(2)}</value>
      </div>
      <div className="stat-card">
        <label>Pending Payouts</label>
        <value>€{stats.pendingPayouts.toFixed(2)}</value>
      </div>
    </div>
  )
}
```

---

## Security Notes

1. **Escrow-style payments**: Hold funds until order is completed
2. **Dispute resolution**: Admin can mediate and reverse transactions
3. **Seller verification**: Require onboarding before listing
4. **Review gating**: Only verified buyers can review purchased items

---

## Monetization Options

| Model | Description |
|-------|-------------|
| Transaction fee | % of each sale (5-15%) |
| Listing fee | Charge per listing |
| Featured listings | Pay for visibility |
| Subscription for sellers | Monthly fee for reduced fees |

---

## What's Next

1. Set up Stripe Connect
2. Implement search with full-text search
3. Add image upload to S3/Cloudflare R2
4. Build real-time messaging
5. Add review system

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
