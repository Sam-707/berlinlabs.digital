# MenuFlows Vision, Mission & Roadmap

## Why MenuFlows Exists

### The Problem

Restaurants face significant challenges in digital ordering:

1. **Cost Barrier** - Traditional POS systems require expensive hardware and monthly fees
2. **App Fatigue** - Customers don't want to download another app for every restaurant
3. **Lost Hospitality** - Many digital solutions remove the human connection entirely
4. **Complexity** - Modifier systems (sizes, extras, customizations) are often poorly implemented
5. **Fragmentation** - Restaurants need multiple systems that don't talk to each other

### The Solution

MenuFlows provides a web-based digital ordering platform that:

- **No Download Required** - Customers scan a QR code and start ordering immediately
- **Preserves Hospitality** - The waiter handshake system maintains human connection
- **Handles Complexity** - Robust modifier system for any customization need
- **Unified Platform** - Menu, orders, kitchen display, and analytics in one place
- **SaaS Model** - Low cost, easy setup, scales automatically

---

## Vision Statement

> "Empower every restaurant to offer a premium digital ordering experience, from food trucks to fine dining, without compromising on hospitality or breaking the bank."

---

## Mission

To become the go-to digital ordering platform for small and medium restaurants worldwide by:

1. Making digital ordering accessible to any budget
2. Preserving the human elements that make dining special
3. Providing enterprise-grade features at SMB prices
4. Building a platform that grows with each restaurant

---

## Target Market

### Primary Segments

| Segment | Description | Key Needs |
|---------|-------------|-----------|
| **Small Restaurants** | 1-3 locations, owner-operated | Low cost, easy setup, minimal training |
| **Cafes & Coffee Shops** | High volume, quick service | Fast ordering, modifier-heavy (milk types, sizes) |
| **Bars & Pubs** | Evening service, tabs | Table assignment, multiple rounds |
| **Food Trucks** | Mobile, limited space | Mobile-first, outdoor QR scanning |
| **Ghost Kitchens** | Delivery-only | No table service, pickup focus |

### Geographic Focus

- Initial: Germany (Berlin market)
- Expansion: EU markets
- Long-term: Global with multi-currency support

### Business Type Support

The platform supports these business types via the `business_type` enum:
- `restaurant`
- `cafe`
- `bar`
- `bakery`
- `food_truck`
- `ghost_kitchen`
- `hotel_restaurant`
- `catering`

---

## Key Differentiators

### 1. No App Download Required

Unlike Uber Eats, DoorDash, or restaurant-specific apps, MenuFlows is entirely web-based:

- Customer scans QR code
- Opens directly in mobile browser
- No app store, no account creation, no friction

### 2. Waiter Handshake System

The unique handshake code system ("AB.12") preserves hospitality:

```
Customer Journey:
1. Scan QR → Browse Menu → Add to Cart
2. Checkout → Receive handshake code (e.g., "AB.12")
3. Show code to waiter
4. Waiter confirms and assigns table
5. Order goes to kitchen
```

This maintains the human touchpoint while gaining digital efficiency.

### 3. Robust Modifier System

Full support for complex orders:

- **Single-select groups**: Size (Small/Medium/Large)
- **Multi-select groups**: Toppings (up to 5 choices)
- **Required selections**: Must choose a size
- **Price adjustments**: +€2.50 for large, +€0.50 per topping
- **Business templates**: Pre-configured for cafes, bars, pizzerias

### 4. Multi-Tenant SaaS Architecture

Built from the ground up for scale:

- Each restaurant is a tenant with isolated data
- URL-based routing (`menuflows.app/burger-lab-berlin`)
- Subscription management with Stripe-ready integration
- Platform admin dashboard for oversight

### 5. Real-Time Everything

Powered by Supabase Realtime:

- Orders update instantly across all devices
- Kitchen display shows new orders as they arrive
- Staff see order status changes immediately
- No polling, no delays

---

## Current State (What's Built)

### Customer Features
- [x] Menu browsing with categories
- [x] Item detail view with modifiers
- [x] Shopping cart with quantity adjustment
- [x] Order checkout with handshake code
- [x] Mobile-optimized responsive design
- [x] Allergen and additive information

### Owner Features
- [x] PIN-based authentication
- [x] Dashboard with navigation
- [x] Kitchen display system (KDS)
- [x] Pending orders view
- [x] Table grid management
- [x] Menu inventory management
- [x] Restaurant branding settings
- [x] Manual order entry

### Admin Features
- [x] Email/password authentication
- [x] Restaurant creation and management
- [x] Menu import functionality
- [x] Modifier group management
- [x] Staff management
- [x] Platform statistics

### Technical
- [x] Multi-tenant database schema
- [x] Real-time order subscriptions
- [x] Image upload to Supabase Storage
- [x] Responsive Tailwind CSS styling
- [x] TypeScript type safety

---

## Future Roadmap

### Phase 1: Payment Integration
- [ ] Stripe Connect integration
- [ ] In-app payment flow
- [ ] Receipt generation
- [ ] Refund handling
- [ ] Split bill support

### Phase 2: Analytics Dashboard
- [ ] Revenue reports
- [ ] Popular item tracking
- [ ] Peak hour analysis
- [ ] Customer insights
- [ ] Export to CSV/PDF

### Phase 3: Customer Engagement
- [ ] Loyalty/rewards program
- [ ] Customer accounts (optional)
- [ ] Order history
- [ ] Favorites/reorder
- [ ] Push notifications

### Phase 4: Operations
- [ ] Kitchen printer integration (ESC/POS)
- [ ] Inventory tracking
- [ ] Low stock alerts
- [ ] Supplier integration
- [ ] Waste tracking

### Phase 5: Scale
- [ ] Multi-location management
- [ ] Franchise support
- [ ] White-label options
- [ ] API for third-party integrations
- [ ] Mobile app for staff (React Native)

---

## Design Decisions & Rationale

### Why Supabase?

| Requirement | Supabase Solution |
|-------------|-------------------|
| Real-time updates | Built-in PostgreSQL subscriptions |
| Authentication | Supabase Auth (future) |
| Database | PostgreSQL with RLS |
| Storage | Built-in blob storage |
| Scalability | Managed infrastructure |
| Cost | Generous free tier, predictable pricing |

Alternative considered: Firebase
Reason rejected: NoSQL doesn't fit relational restaurant data well

### Why No Redux?

The app uses React hooks and props for state management:

- **Simplicity**: Redux adds boilerplate for limited benefit at this scale
- **React 19**: Built-in hooks are powerful enough
- **Co-located state**: State lives close to where it's used
- **Easier debugging**: No action/reducer indirection

Future consideration: If app complexity grows, consider Zustand (lighter than Redux)

### Why Waiter Handshake?

Many digital ordering apps remove staff entirely. MenuFlows keeps them for:

1. **Hospitality**: Dining is a human experience
2. **Flexibility**: Staff can handle edge cases
3. **Upselling**: Waiters can suggest items
4. **Error handling**: Humans fix issues faster than chatbots
5. **Table assignment**: Physical tables need human mapping

### Why URL Slugs (Not Subdomains)?

Multi-tenant routing uses `/slug` pattern:
- `menuflows.app/burger-lab-berlin`
- `menuflows.app/cafe-mitte`

Not subdomains (`burger-lab.menuflows.app`) because:

1. **SSL complexity**: Wildcard certs or per-tenant certs
2. **DNS propagation**: Delays when creating new tenants
3. **Cookie scope**: Subdomains complicate session management
4. **SEO**: Path-based URLs are simpler to manage

### Why 4-Digit PIN (Not Email/Password)?

Owner authentication uses a 4-digit PIN:

1. **Speed**: Faster than typing email/password
2. **Shared devices**: Multiple staff on one tablet
3. **Simplicity**: No password reset flows needed
4. **Sufficient security**: Combined with session expiry

Admin authentication uses email/password for higher security.

---

## Technical Principles

1. **Mobile-First**: All designs start on 375px width
2. **Offline-Tolerant**: Graceful degradation when connectivity drops
3. **Type-Safe**: TypeScript everywhere, no `any` types
4. **Real-Time**: Prefer subscriptions over polling
5. **Multi-Tenant**: All queries scoped by restaurant_id
6. **Simple > Clever**: Readable code over clever abstractions

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first order | < 60 seconds from QR scan |
| Order completion rate | > 90% |
| Kitchen display latency | < 1 second |
| Restaurant onboarding | < 15 minutes |
| System uptime | 99.9% |

---

## Contact & Support

For questions about the vision or roadmap:
- GitHub Issues: [Repository Issues]
- Documentation: This folder (`/DOCS`)

---

*Last updated: January 2026*
