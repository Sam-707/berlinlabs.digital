# Marketplace Platform Template

Ready-to-use template for building two-sided marketplace platforms.

---

## Quick Start Prompt

```
You are building a two-sided Marketplace Platform.

BUSINESS CONTEXT:
- Target Sellers: [WHO SELLS - e.g., Freelancers, Creators, Small businesses]
- Target Buyers: [WHO BUYS - e.g., Businesses, Individuals]
- Problem: [THE MARKET INEFFICIENCY]
- Solution: [YOUR MARKETPLACE SOLUTION]
- Business Model: MARKETPLACE with X% commission on each transaction
- Primary Goal: Get sellers to list items, buyers to purchase

USER ROLES:
- Public: Browse listings, view seller profiles, search/filter
- Buyers: Purchase items, leave reviews, save favorites
- Sellers: Create listings, manage inventory, view sales, withdraw earnings
- Admin: Manage all users, approve listings, handle disputes, view analytics

CORE PAGES:
- / - Landing page with featured listings
- /browse - Browse all listings with filters
- /listing/[id] - Individual listing page with purchase
- /seller/[slug] - Seller profile and listings
- /dashboard/buyer - Buyer dashboard (purchases, favorites)
- /dashboard/seller - Seller dashboard (listings, sales, earnings, payout)
- /admin - Admin dashboard

DATA STRUCTURE:
- users (auth.users)
- profiles (with role: buyer, seller, admin)
- listings (items for sale)
  - id, seller_id, title, description, price, currency
  - category, images[], status (active/inactive/sold)
  - tags, created_at
- orders (purchases)
  - id, buyer_id, seller_id, listing_id, amount
  - status (pending/active/completed/cancelled/refunded)
  - commission_amount, seller_earnings, created_at
- reviews (buyer reviews of sellers/listings)
  - id, order_id, buyer_id, seller_id, rating, comment
- categories (listing categories)
- payouts (seller withdrawal requests)
  - id, seller_id, amount, status, payout_method

COMMISSION STRUCTURE:
- Platform commission: X% on each sale
- Seller earnings: (100-X)% goes to seller
- Minimum payout: €[X]
- Payout methods: Bank transfer, Stripe Connect

SECURITY RULES:
- Public: View listings and seller profiles (active only)
- Buyers: View own orders, create orders, review sellers after purchase
- Sellers: Manage own listings, view own sales/earnings, request payouts
- Admin: Full access to all resources, dispute resolution

FEATURES:
- Search and filtering (category, price range, rating, location)
- Listing creation with image upload
- Seller verification/badges
- Order tracking and status updates
- Review system (verified buyers only)
- Commission calculation and payout
- Dispute resolution system
- Favorites/watchlist for buyers

DELIVERABLES:
1. Complete database schema with RLS
2. Authentication with role-based access
3. Listing creation and management
4. Order/purchase flow with Stripe Connect
5. Review system
6. Seller payout system
7. Admin panel for dispute resolution
8. Search and filtering

Please generate the complete marketplace application.
```

---

## Commission & Payout Flow

```typescript
// Calculate commission on purchase
async function createPurchase(listingId: string, buyerId: string) {
  // Get listing
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  const commissionRate = 0.10 // 10% commission
  const commission = listing.price * commissionRate
  const sellerEarnings = listing.price - commission

  // Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      listing_id: listing.id,
      amount: listing.price,
      commission_amount: commission,
      seller_earnings: sellerEarnings,
      status: 'pending'
    })
    .select()
    .single()

  // Process payment via Stripe Connect
  await processStripePayment(order)

  return order
}

// Seller payout request
async function requestPayout(sellerId: string) {
  // Calculate available balance
  const { data: sales } = await supabase
    .from('orders')
    .select('seller_earnings')
    .eq('seller_id', sellerId)
    .eq('status', 'completed')

  const totalEarnings = sales.reduce((sum, s) => sum + s.seller_earnings, 0)

  // Subtract already paid out
  const { data: paidOut } = await supabase
    .from('payouts')
    .select('amount')
    .eq('seller_id', sellerId)
    .eq('status', 'completed')

  const alreadyPaid = paidOut.reduce((sum, p) => sum + p.amount, 0)
  const available = totalEarnings - alreadyPaid

  if (available < MINIMUM_PAYOUT) {
    throw new Error(`Minimum payout is €${MINIMUM_PAYOUT}`)
  }

  // Create payout request
  await supabase
    .from('payouts')
    .insert({
      seller_id: sellerId,
      amount: available,
      status: 'pending'
    })
}
```

---

## Seller Dashboard Template

```typescript
// src/pages/seller/SellerDashboardPage.tsx
export function SellerDashboardPage() {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    pendingEarnings: 0,
    availablePayout: 0
  })

  useEffect(() => {
    fetchSellerStats()
  }, [])

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>

      <div className="stats-grid">
        <StatCard label="Active Listings" value={stats.activeListings} />
        <StatCard label="Total Sales" value={`€${stats.totalSales}`} />
        <StatCard label="Pending Earnings" value={`€${stats.pendingEarnings}`} />
        <StatCard label="Available for Payout" value={`€${stats.availablePayout}`}>
          <button onClick={requestPayout} disabled={stats.availablePayout < MIN_PAYOUT}>
            Request Payout
          </button>
        </StatCard>
      </div>

      <div className="dashboard-tabs">
        <TabPanel title="My Listings">
          <ListingsManagement />
        </TabPanel>
        <TabPanel title="Sales">
          <SalesList />
        </TabPanel>
        <TabPanel title="Reviews">
          <SellerReviews />
        </TabPanel>
        <TabPanel title="Payouts">
          <PayoutHistory />
        </TabPanel>
      </div>
    </div>
  )
}
```

---

## Review System Pattern

```typescript
// Only verified buyers can review
async function createReview(orderId: string, rating: number, comment: string) {
  // Verify order exists and belongs to user
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order) {
    throw new Error('Order not found')
  }

  // Check if order is completed
  if (order.status !== 'completed') {
    throw new Error('Can only review completed orders')
  }

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (existing) {
    throw new Error('Already reviewed this order')
  }

  // Create review
  await supabase
    .from('reviews')
    .insert({
      order_id: orderId,
      buyer_id: user.id,
      seller_id: order.seller_id,
      rating,
      comment
    })

  // Update seller's average rating
  updateSellerRating(order.seller_id)
}
```

---

## Database Schema

```sql
-- Listings
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  category_id UUID REFERENCES public.categories(id),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'removed')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  seller_earnings DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT DEFAULT 'bank_transfer',
  stripe_transfer_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Indexes
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can manage own listings"
  ON public.listings FOR ALL
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view own sales"
  ON public.orders FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can manage own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);
```

---

## Common Marketplace Types

| Type | Description | Key Features |
|------|-------------|--------------|
| **Services** | Freelancers, consultants | Bookings, messaging, proposals |
| **Products** | Physical goods | Shipping, inventory, returns |
| **Digital** | Downloads, courses | File delivery, licensing |
| **Rentals** | Equipment, spaces | Availability calendar, deposits |
| **Local** | Food, services | Location-based, delivery |

---

## Next Steps

1. **Customize with your marketplace details**
2. **Implement Phase 1-3** for foundation
3. **Add Stripe Connect** for split payments
4. **Build seller onboarding flow**
5. **Launch and iterate**

---

## See Also

- [SaaS Template](./saas.md) - For subscription-based apps
- [Booking System Template](./booking.md) - For appointment-based marketplaces
