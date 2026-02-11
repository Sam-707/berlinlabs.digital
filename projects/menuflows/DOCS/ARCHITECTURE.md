# MenuFlows System Architecture

This document describes the technical architecture of MenuFlows, including frontend structure, backend design, and data flow.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + Tailwind CSS                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Views   │ │Components│ │   Lib    │ │   API    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  PostgreSQL  │ │   Realtime   │ │   Storage    │            │
│  │   Database   │ │ Subscriptions│ │   Buckets    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Row-Level Security (RLS) for multi-tenant isolation            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Vercel Edge Network
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        HOSTING                                   │
├─────────────────────────────────────────────────────────────────┤
│  Vercel: Static hosting + Edge functions                        │
│  GitHub: Source control + CI/CD                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Application Structure

```
menuflows/
├── App.tsx                 # Root component, routing, state management
├── index.tsx               # React entry point
├── index.html              # HTML template
├── types.ts                # TypeScript type definitions
├── constants.tsx           # Mock data, constants
│
├── api.ts                  # Single-tenant API layer
├── api.multitenant.ts      # Multi-tenant API layer
├── api.admin.ts            # Platform admin API layer
├── api.localStorage.ts     # Local storage utilities
│
├── lib/
│   ├── supabase.ts         # Supabase client + auth helpers
│   ├── menu-modifiers.ts   # Modifier validation + calculations
│   └── menu-categories.ts  # Category utilities
│
├── views/
│   ├── MenuView.tsx        # Customer: menu browsing
│   ├── ItemDetailView.tsx  # Customer: item details + modifiers
│   ├── CartView.tsx        # Customer: shopping cart
│   ├── WaiterHandshakeView.tsx  # Customer: order code display
│   ├── SplashView.tsx      # Loading screen
│   ├── MarketingView.tsx   # Marketing landing
│   ├── LandingView.tsx     # Main landing page
│   │
│   ├── owner/
│   │   ├── LoginView.tsx       # Staff PIN entry
│   │   ├── DashboardView.tsx   # Owner home
│   │   ├── InventoryView.tsx   # Menu management
│   │   ├── BrandingView.tsx    # Restaurant settings
│   │   ├── KitchenView.tsx     # Kitchen display
│   │   ├── PendingOrdersView.tsx  # Order queue
│   │   ├── TableGridView.tsx   # Table management
│   │   ├── TableMapView.tsx    # Visual table map
│   │   ├── OrderEntryView.tsx  # Manual order entry
│   │   ├── MenuImportView.tsx  # Menu import wizard
│   │   └── OrderScannerView.tsx # Order barcode scanner
│   │
│   └── admin/
│       ├── AdminLoginView.tsx      # Admin email/password
│       └── AdminDashboardView.tsx  # Platform management
│
└── components/
    └── ModifierSelector.tsx    # Modifier group selector
```

### State Management

MenuFlows uses **React hooks** for state management, not Redux or Context API.

**State Location**: All primary state lives in `App.tsx`:

```typescript
// App.tsx state
const [view, setView] = useState<AppView>('marketing');
const [menu, setMenu] = useState<MenuItem[]>([]);
const [cart, setCart] = useState<CartItem[]>([]);
const [orders, setOrders] = useState<TableOrder[]>([]);
const [config, setConfig] = useState<RestaurantConfig | null>(null);
const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
```

**Data Flow**:
1. State declared in `App.tsx`
2. Props passed down to views
3. Callback functions bubble events up
4. Views are pure rendering components

### Routing Strategy

MenuFlows uses **state-driven routing** (no React Router):

```typescript
// AppView union type defines all possible views
type AppView =
  | 'marketing'
  | 'splash'
  | 'menu'
  | 'item-detail'
  | 'cart'
  | 'waiter-handshake'
  | 'owner-login'
  | 'owner-dashboard'
  | 'owner-inventory'
  // ... more views
  | 'admin-login'
  | 'admin-dashboard';

// Rendering based on view state
function App() {
  const [view, setView] = useState<AppView>('marketing');

  switch (view) {
    case 'menu':
      return <MenuView {...props} />;
    case 'cart':
      return <CartView {...props} />;
    // ... etc
  }
}
```

**URL-Based Tenant Resolution**:

```typescript
// Extract restaurant slug from URL path
function getRestaurantSlug(): string | null {
  const path = window.location.pathname;
  // /burger-lab-berlin → "burger-lab-berlin"
  // /burger-lab-berlin/owner → "burger-lab-berlin"
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0] !== 'admin') {
    return segments[0];
  }
  return null;
}
```

### Component Design Patterns

**1. View Components**

Views are full-screen components for each app state:

```typescript
interface MenuViewProps {
  menu: MenuItem[];
  config: RestaurantConfig;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onViewItem: (item: MenuItem) => void;
  onViewCart: () => void;
}

function MenuView({ menu, config, cart, onAddToCart, onViewItem, onViewCart }: MenuViewProps) {
  // Full screen rendering
}
```

**2. Shared Components**

Reusable components for common UI patterns:

```typescript
// ModifierSelector - used in ItemDetailView
interface ModifierSelectorProps {
  modifierGroups: ModifierGroup[];
  selectedModifiers: SelectedModifier[];
  onModifierChange: (modifiers: SelectedModifier[]) => void;
}
```

**3. Styling with Tailwind**

Inline Tailwind classes for rapid development:

```jsx
<div className="bg-white rounded-lg shadow-md p-4 mb-4">
  <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
  <p className="text-gray-600 text-sm">{item.description}</p>
  <span className="text-green-600 font-semibold">€{item.price.toFixed(2)}</span>
</div>
```

---

## Backend Architecture

### Supabase as Backend

MenuFlows uses Supabase for all backend needs:

| Service | Usage |
|---------|-------|
| **PostgreSQL** | Primary database with RLS |
| **Realtime** | WebSocket subscriptions for orders |
| **Storage** | Image uploads (menu items, logos) |
| **Auth** | Future: customer accounts |

### API Layer Design

Three API modules handle different concerns:

**1. `api.ts` - Single-Tenant (Legacy)**

Original API for single-restaurant mode:
- Uses `restaurant_config` table (single row)
- No `restaurant_id` scoping
- Simpler queries, faster for single-tenant

**2. `api.multitenant.ts` - Multi-Tenant (Production)**

SaaS-ready API with tenant isolation:
- All queries include `restaurant_id` filter
- Restaurant context stored in session
- Validates subscription status
- Supports multiple restaurants

**3. `api.admin.ts` - Platform Admin**

Cross-tenant management API:
- No restaurant scoping (admin sees all)
- Restaurant CRUD operations
- Bulk menu import
- Platform statistics

### Data Mappers

API modules convert between database (snake_case) and frontend (camelCase):

```typescript
// Database record
interface DbMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  translated_name: string | null;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_spicy: boolean;
  display_order: number;
}

// Frontend type
interface MenuItem {
  id: string;
  name: string;
  translatedName?: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isSpicy?: boolean;
  displayOrder: number;
}

// Mapper function
function mapDbMenuItemToMenuItem(db: DbMenuItem): MenuItem {
  return {
    id: db.id,
    name: db.name,
    translatedName: db.translated_name || undefined,
    description: db.description,
    price: db.price,
    image: db.image_url || '',
    isAvailable: db.is_available,
    isSpicy: db.is_spicy,
    displayOrder: db.display_order,
  };
}
```

### Real-Time Subscriptions

Order updates use Supabase Realtime:

```typescript
function subscribeToOrders(callback: (orders: TableOrder[]) => void): () => void {
  const restaurantId = getCurrentRestaurantId();

  const subscription = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      async () => {
        // Refetch all orders on any change
        const orders = await getOrders();
        callback(orders);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}
```

---

## Database Architecture

### Multi-Tenant Design

All tenant data is scoped by `restaurant_id`:

```sql
-- Every tenant table has restaurant_id
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255),
  -- ...
);

-- Index for fast tenant queries
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
```

### Row-Level Security (RLS)

Supabase RLS enforces tenant isolation:

```sql
-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their restaurant's items
CREATE POLICY "Restaurant menu isolation" ON menu_items
  FOR ALL
  USING (restaurant_id = current_setting('app.current_restaurant_id')::uuid);
```

### Key Relationships

```
restaurants (tenant)
  │
  ├── restaurant_staff (1:N)
  │
  ├── menu_categories (1:N)
  │     └── menu_items (1:N)
  │
  ├── menu_items (1:N)
  │     └── menu_item_modifiers (N:N link)
  │
  ├── item_modifier_groups (1:N)
  │     └── item_modifiers (1:N)
  │
  ├── restaurant_tables (1:N)
  │
  └── orders (1:N)
        └── order_items (1:N)
```

See [DATABASE.md](./DATABASE.md) for complete schema reference.

---

## Authentication Architecture

### Owner PIN Authentication

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Client    │     │  Supabase   │
│  (Owner)    │     │   (React)   │     │  (Database) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ Enter PIN "1234"  │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │ Hash PIN (SHA-256)│
       │                   │──────────────────>│
       │                   │                   │
       │                   │ Query staff table │
       │                   │ WHERE pin_hash =  │
       │                   │──────────────────>│
       │                   │                   │
       │                   │<──────────────────│
       │                   │  Match found      │
       │                   │                   │
       │                   │ Store session in  │
       │                   │ sessionStorage    │
       │                   │                   │
       │<──────────────────│                   │
       │   Dashboard shown │                   │
```

### Admin Email/Password Authentication

```typescript
async function adminLogin(email: string, password: string): Promise<boolean> {
  // Hash password client-side
  const hashedPassword = await hashPin(password);

  // Query platform_admins table
  const { data, error } = await supabase
    .from('platform_admins')
    .select('id, role, is_active')
    .eq('email', email.toLowerCase().trim())
    .eq('password_hash', hashedPassword)
    .eq('is_active', true)
    .single();

  if (!error && data) {
    setAdminSession(true);
    return true;
  }
  return false;
}
```

### Session Storage

```typescript
// Session keys
const OWNER_SESSION_KEY = 'menuflows_owner_session';
const ADMIN_SESSION_KEY = 'menuflows_admin_session';
const RESTAURANT_SESSION_KEY = 'menuflows_current_restaurant';

// Session structure
sessionStorage.setItem(RESTAURANT_SESSION_KEY, JSON.stringify({
  id: 'uuid-here',
  slug: 'burger-lab-berlin'
}));
```

---

## Order Flow Architecture

### Customer Order Creation

```
1. Customer browses menu (MenuView)
   │
   ▼
2. Selects item, configures modifiers (ItemDetailView)
   │
   ▼
3. Adds to cart (CartView)
   │
   ▼
4. Submits order → api.createOrder(cartItems)
   │
   ▼
5. Database generates handshake code via RPC
   │
   ▼
6. Order created with status: 'pending'
   │
   ▼
7. Customer sees handshake code (WaiterHandshakeView)
   │
   ▼
8. Real-time subscription notifies staff
```

### Handshake Code System

```typescript
// Generate unique code like "AB.12"
// Letters: A-Z except I, O (similar to 1, 0)
// Numbers: 1-9 (no 0)

async function generateHandshakeCode(restaurantId: string): Promise<string> {
  // Try database RPC first
  const { data, error } = await supabase.rpc('generate_handshake_code', {
    p_restaurant_id: restaurantId
  });

  if (!error && data) {
    return data;
  }

  // Fallback to client-side generation
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '123456789';
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
  const randomNum = () => nums[Math.floor(Math.random() * nums.length)];

  return `${randomChar()}${randomChar()}.${randomNum()}${randomNum()}`;
}
```

### Order Status Flow

```
pending → confirmed → preparing → ready → served → completed
                                              │
                                              └→ cancelled
```

---

## Storage Architecture

### Image Upload Flow

```typescript
async function uploadImage(file: File): Promise<string> {
  const restaurantId = getCurrentRestaurantId();
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${restaurantId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('menu-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

### Storage Buckets

| Bucket | Contents | Access |
|--------|----------|--------|
| `menu-images` | Menu item photos | Public read |
| `restaurant-assets` | Logos, cover images | Public read |

---

## Build & Development

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',  // Allow LAN access
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },
});
```

### Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional (legacy)
GEMINI_API_KEY=your-gemini-key
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Main bundle
│   └── index-[hash].css   # Styles (if extracted)
└── [other static assets]
```

---

## Performance Considerations

### Bundle Size

- React 19: ~140kb minified
- Supabase client: ~50kb minified
- Total: ~200kb gzipped

### Optimizations

1. **Lazy loading**: Views could be code-split (not implemented)
2. **Image optimization**: Supabase transforms not used yet
3. **Caching**: Browser caching for static assets via Vercel

### Real-Time Efficiency

- Single WebSocket connection per session
- Filter subscriptions by `restaurant_id`
- Refetch on change (not incremental updates)

---

## Security Considerations

### Current Implementation

- PIN hashing: SHA-256 (client-side)
- Session storage: Browser sessionStorage
- RLS: Enabled but policies need review

### Production Recommendations

1. **Use Supabase Auth**: Replace custom PIN auth with proper JWT tokens
2. **bcrypt for passwords**: Server-side hashing instead of SHA-256
3. **HTTPS only**: Enforce in Vercel settings
4. **RLS review**: Audit all policies for proper tenant isolation
5. **Rate limiting**: Add via Supabase or Vercel Edge

---

*See also: [API-REFERENCE.md](./API-REFERENCE.md) | [DATABASE.md](./DATABASE.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)*
