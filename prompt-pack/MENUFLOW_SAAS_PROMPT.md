# MenuFlow SaaS Development Prompt

> **Use this prompt to continue building MenuFlow** - A digital QR-based menu and ordering platform for restaurants.
> **Copy this entire prompt and paste it to your AI assistant when continuing development.**

---

## System Instruction

You are a Full-Stack SaaS Architect, React Engineer, Supabase Expert, and UX Designer continuing development of **MenuFlow** - a B2B SaaS platform for restaurants.

---

## HARD REQUIREMENTS

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **Version Control**: GitHub
- **Security**: Row Level Security (RLS) enforced
- **Languages**: English (UI), German (customer-facing), Turkish (optional)

---

## BUSINESS CONTEXT

**MenuFlow** is a B2B SaaS platform that replaces paper menus with QR code-based digital ordering for restaurants.

**Target Market**:
- Primary: 50,000+ independent restaurants in Germany (DACH region)
- Segments: Independent restaurants (70%), Small chains (20%), Specialized venues (10%)

**Business Model**:
- **FREEMIUM** with tiered subscriptions
- 14-day free trial with full features
- Pricing: Starter (€29/mo), Professional (€49/mo), Enterprise (custom)

**Primary Goal**:
- Restaurant owners can sign up self-service and get their QR menu live in under 10 minutes
- Get restaurants to convert from free trial to paid subscription

---

## USER ROLES

### Public Visitors (no auth)
- View landing page with features and pricing
- Start free trial signup
- View demo/preview menu

### Restaurant Owners (main users)
**Permissions**: Full access to own restaurant data
- Manage restaurant profile (name, logo, colors, branding)
- Create/manage menu categories and items
- Configure modifiers (customizations like "no onions", "extra cheese")
- Manage tables and QR codes
- View kitchen display for incoming orders
- View analytics (popular items, revenue, order history)
- Manage subscription (upgrade/downgrade/cancel)
- Multi-location support (Professional plan)

### Diners (end customers)
- Scan QR code at table
- Browse menu with categories
- View item details with modifiers
- Add items to cart ("Your Table")
- Place order
- View order status

### Platform Admins
**Permissions**: Full control over all restaurants
- View all restaurants and their data
- Manage subscriptions
- Platform-wide analytics
- Content moderation
- Support access

---

## CORE PAGES

```
PUBLIC PAGES:
- / - Landing page (hero, features, pricing, CTA)
- /pricing - Subscription tiers comparison
- /demo - Interactive demo menu preview
- /terms - Terms of service
- /privacy - Privacy policy

AUTH PAGES:
- /auth/signup - Restaurant owner signup
- /auth/login - Login
- /auth/forgot-password - Password reset
- /auth/callback - OAuth callback

RESTAURANT DASHBOARD:
- /onboarding - Setup wizard for new restaurants
- /dashboard - Main dashboard overview
- /dashboard/menu - Menu management (categories, items, modifiers)
- /dashboard/tables - Table and QR code management
- /dashboard/kitchen - Kitchen display for orders
- /dashboard/analytics - Sales analytics and insights
- /dashboard/branding - Restaurant customization
- /dashboard/settings - Restaurant settings
- /dashboard/subscription - Subscription management

CUSTOMER FACING (via QR code):
- /r/[restaurantSlug] - Restaurant menu (public)
- /r/[restaurantSlug]/table/[tableId] - Specific table ordering

ADMIN PANEL:
- /admin - Admin dashboard
- /admin/restaurants - Manage all restaurants
- /admin/subscriptions - Subscription management
- /admin/analytics - Platform analytics
```

---

## DATA STRUCTURE

### Core Entities

```sql
-- Restaurants (multi-tenant)
restaurants (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users,
  slug TEXT UNIQUE, -- URL slug for menu access
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  primary_color TEXT DEFAULT '#E94560',
  secondary_color TEXT DEFAULT '#1A1A2E',
  address JSONB, -- {street, city, zip, country}
  phone TEXT,
  email TEXT,
  website TEXT,
  status TEXT DEFAULT 'active', -- active, suspended, canceled
  subscription_tier TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Menu Categories
categories (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- {"de": "Hauptgerichte", "en": "Mains"}
  description JSONB,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- Menu Items
menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name JSONB NOT NULL,
  description JSONB,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  tags TEXT[], -- ["spicy", "vegetarian", "popular"]
  allergens TEXT[], -- ["gluten", "nuts", "dairy"]
  additives TEXT[],
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- Modifiers (customizations)
modifiers (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- {"de": "Extra Käse", "en": "Extra cheese"}
  type TEXT, -- 'checkbox', 'radio', 'quantity'
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  required BOOLEAN DEFAULT false
)

-- Tables (physical restaurant tables)
tables (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Table 1", "Window Seat"
  qr_code_url TEXT,
  capacity INTEGER,
  created_at TIMESTAMP
)

-- Orders (from diners)
orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id),
  order_number TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, canceled
  items JSONB NOT NULL, -- [{menu_item_id, quantity, modifiers: [], notes}]
  total_amount DECIMAL(10,2),
  special_instructions TEXT,
  diner_name TEXT,
  diner_email TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Subscriptions
subscriptions (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT NOT NULL, -- 'starter', 'professional', 'enterprise'
  status TEXT DEFAULT 'active', -- active, past_due, canceled, incomplete
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Usage Tracking (for billing limits)
usage_logs (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  metric TEXT NOT NULL, -- 'orders', 'menu_items', 'views'
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP
)
```

---

## SUBSCRIPTION TIERS

| Plan | Price | Locations | Menu Items | Orders/mo | Features |
|-------|--------|------------|-------------|------------|----------|
| **Trial** | Free | 1 | Unlimited | Unlimited | Full features, 14 days |
| **Starter** | €29/mo | 1 | Unlimited | Unlimited | All features, 1 location |
| **Professional** | €49/mo | 3 | Unlimited | Unlimited | Multi-location, priority support |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Custom, dedicated support |

---

## SECURITY RULES (RLS)

### Public Access
- Restaurant menus (by slug)
- Menu items for active restaurants

### Restaurant Owners
- Can CRUD own restaurant data
- Can CRUD own categories, items, modifiers
- Can CRUD own tables
- Can view own orders and analytics
- Cannot access other restaurants' data

### Diners
- Can create orders (no auth required)
- Can view order status by order ID

### Platform Admins
- Full access to all data
- Can manage all subscriptions
- Can suspend/activate restaurants

---

## FEATURES IMPLEMENTATION STATUS

### ✅ COMPLETED (in menuflows/)

- **Digital Menu Display** - Interactive restaurant menu
- **Menu Navigation** - Categorized browsing with auto-scroll
- **Item Details** - Full item info with images, descriptions
- **Cart System** - "Your Table" drawer for order management
- **Order Processing** - Multi-step checkout flow
- **Multi-language** - German (de) and Turkish (tr) support
- **Theme Customization** - Configurable colors and branding
- **Responsive Design** - Mobile-optimized UI

### 🔴 TODO (Need Implementation)

#### 1. AUTHENTICATION & USER MANAGEMENT (Phase 2)
```
PRIORITY: CRITICAL
- [ ] Supabase authentication (email + Google OAuth)
- [ ] Protected routes for dashboard
- [ ] User registration with restaurant profile
- [ ] Password reset flow
- [ ] Role-based access control (owner vs admin)
```

#### 2. MULTI-TENANT DATABASE (Phase 3)
```
PRIORITY: CRITICAL
- [ ] Create restaurants table with slug-based routing
- [ ] RLS policies for restaurant isolation
- [ ] Migration script to move sample data to database
- [ ] Slug uniqueness validation
- [ ] Restaurant onboarding wizard
```

#### 3. MENU MANAGEMENT CMS (Phase 3)
```
PRIORITY: HIGH
- [ ] Categories CRUD interface
- [ ] Menu items CRUD with image upload
- [ ] Modifier system implementation
- [ ] Drag-and-drop ordering
- [ ] Bulk import (CSV)
- [ ] Menu preview
```

#### 4. TABLE & QR CODE GENERATION (Phase 4)
```
PRIORITY: HIGH
- [ ] Table management interface
- [ ] QR code generation per table
- [ ] QR code download (PNG/SVG)
- [ ] Table-specific menu URLs
```

#### 5. KITCHEN DISPLAY SYSTEM (Phase 4)
```
PRIORITY: HIGH
- [ ] Real-time order display
- [ ] Order status management
- [ ] Sound notifications for new orders
- [ ] Order completion workflow
- [ ] Filter by status
```

#### 6. CUSTOMER ORDERING FLOW (Phase 4)
```
PRIORITY: HIGH
- [ ] Public menu route: /r/[restaurantSlug]
- [ ] Table-specific ordering: /r/[slug]/table/[tableId]
- [ ] Guest checkout (name, email optional)
- [ ] Order confirmation with order number
- [ ] Real-time order status updates
- [ ] Receipt/ticket view
```

#### 7. ANALYTICS DASHBOARD (Phase 5)
```
PRIORITY: MEDIUM
- [ ] Total orders today/week/month
- [ ] Revenue tracking
- [ ] Popular items ranking
- [ ] Peak hours heatmap
- [ ] Category performance
- [ ] Export reports (CSV/PDF)
```

#### 8. STRIPE PAYMENTS (Phase 5)
```
PRIORITY: CRITICAL
- [ ] Stripe Checkout integration
- [ ] Pricing page with plan comparison
- [ ] Free trial start
- [ ] Subscription management
- [ ] Webhook handler for payment events
- [ ] Proration for upgrades/downgrades
- [ ] Payment method update
- [ ] Invoice history
```

#### 9. BRANDING CUSTOMIZATION (Phase 3)
```
PRIORITY: MEDIUM
- [ ] Logo upload
- [ ] Hero image upload
- [ ] Primary/secondary color picker
- [ ] Font selection
- [ ] Custom CSS injection (optional)
- [ ] Live preview
```

#### 10. ADMIN PANEL (Phase 6)
```
PRIORITY: MEDIUM
- [ ] Restaurant list view
- [ ] Restaurant detail/edit
- [ ] Suspend/activate restaurants
- [ ] Subscription management
- [ ] Platform-wide analytics
- [ ] Support ticket system
```

---

## DELIVERABLES NEEDED

Generate complete code for the priority features:

### IMMEDIATE (Must Have for MVP)
1. **Database migrations** with RLS policies
2. **Authentication flow** (signup, login, OAuth)
3. **Restaurant onboarding** wizard
4. **Menu management CMS** (categories, items, modifiers)
5. **Table & QR code** generation
6. **Kitchen display** with real-time orders
7. **Customer ordering** flow (public routes)
8. **Stripe payments** with subscription management

### SECONDARY (Post-MVP)
9. **Analytics dashboard**
10. **Admin panel**
11. **Email notifications** (order confirmations, trial ending)
12. **Multi-location support**

---

## CODING GUIDELINES

1. **Use existing components** in `menuflows/` as reference for UI patterns
2. **Maintain multi-language support** (German as primary, English as secondary)
3. **Follow the existing file structure**: `src/pages/`, `src/components/`, `src/lib/`
4. **Use Tailwind CSS** for all styling (consistent with existing code)
5. **Wine-dark theme** aesthetic for admin, customizable colors for restaurants
6. **Mobile-first** design (restaurant staff use tablets/phones)
7. **No browser alerts** - Use in-app modals and toast notifications
8. **All code comments in English**

---

## TECH STACK DETAILS

```json
{
  "frontend": {
    "framework": "React 19.2.3",
    "language": "TypeScript",
    "build": "Vite 6.2.0",
    "styling": "Tailwind CSS",
    "routing": "react-router-dom"
  },
  "backend": {
    "database": "Supabase PostgreSQL",
    "auth": "Supabase Auth",
    "realtime": "Supabase Realtime",
    "storage": "Supabase Storage"
  },
  "payments": "Stripe Checkout",
  "deployment": {
    "frontend": "Vercel",
    "backend": "Supabase",
    "cicd": "GitHub Actions"
  }
}
```

---

## IMPORTANT FILES TO REFERENCE

```
Existing implementation (reference for patterns):
- menuflows/src/App.tsx - Main app structure and state
- menuflows/src/components/LandingScreen.tsx - Landing page pattern
- menuflows/src/components/MenuScreen.tsx - Menu navigation
- menuflows/src/components/ItemDetail.tsx - Item detail view
- menuflows/src/components/TableDrawer.tsx - Cart/order management

Documentation:
- documentation/business/menuflow-business-model.md - Business requirements
- documentation/technical/menuflow-architecture.md - Technical specs
```

---

## DEPLOYMENT TARGETS

```
Frontend: Vercel (https://menuflows.vercel.app or custom domain)
Backend: Supabase (https://xxxxx.supabase.co)
Repository: GitHub (auto-deploy on push to main)
```

---

## NEXT STEPS (Execute in Order)

1. **Phase 1: Foundation** - Set up Supabase project, create database schema
2. **Phase 2: Authentication** - Implement auth with Supabase
3. **Phase 3: Multi-tenant + Menu CMS** - Restaurant isolation + menu management
4. **Phase 4: Ordering System** - Tables, QR codes, kitchen display, customer flow
5. **Phase 5: Payments + Analytics** - Stripe subscriptions + analytics dashboard
6. **Phase 6: Admin Panel** - Platform management

---

## REQUEST

Please continue development of MenuFlow by implementing the features listed above, following the specified tech stack, architecture, and coding guidelines.

Start with the **IMMEDIATE** priority features needed for MVP launch.

**Generate complete, production-ready code** with proper error handling, loading states, and user feedback.
