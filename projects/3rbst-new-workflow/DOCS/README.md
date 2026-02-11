# MenuFlows - Digital Restaurant Experience Platform

> Empowering every restaurant to offer a premium digital ordering experience

## What is MenuFlows?

MenuFlows is a multi-tenant SaaS platform that enables restaurants, cafes, bars, and food trucks to offer mobile-first digital ordering without expensive POS systems or app downloads.

**Key Value Proposition:**
- Customers order via QR code scan (no app download required)
- Waiter handshake system preserves the hospitality experience
- Full modifier/variation support for complex orders
- Real-time order updates for kitchen and staff
- Multi-tenant architecture for scalable SaaS delivery

## Project Status

**Current State: MVP Complete**

Implemented features:
- Customer ordering flow (menu → cart → checkout → handshake)
- Owner dashboard with kitchen display system (KDS)
- Admin multi-tenant restaurant management
- Modifier/variation system for item customization
- Real-time order updates via Supabase subscriptions
- Multi-language support structure (translations ready)

## Quick Start

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd menuflows

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 19.2.3 |
| Language | TypeScript | 5.8.2 |
| Build Tool | Vite | 6.2.0 |
| Styling | Tailwind CSS | (via CDN) |
| Backend | Supabase | 2.90.1 |
| Database | PostgreSQL | (via Supabase) |
| Real-time | Supabase Realtime | (included) |
| Hosting | Vercel | - |
| Source Control | GitHub | - |

## Documentation Index

| Document | Description |
|----------|-------------|
| [Vision & Roadmap](./VISION.md) | Mission, future plans, design decisions |
| [Architecture](./ARCHITECTURE.md) | System design, frontend/backend structure |
| [API Reference](./API-REFERENCE.md) | API methods, parameters, return types |
| [Database Guide](./DATABASE.md) | Schema reference, tables, relationships |
| [Deployment](./DEPLOYMENT.md) | Vercel, GitHub, Supabase setup |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common bugs, debugging checklist |
| [Features](./FEATURES.md) | Feature documentation by user type |
| [Modifiers](./MODIFIERS.md) | Modifier system deep dive |

## Project Structure

```
menuflows/
├── App.tsx                 # Main app component with routing
├── types.ts                # TypeScript type definitions
├── api.ts                  # Single-tenant Supabase API
├── api.multitenant.ts      # Multi-tenant Supabase API
├── api.admin.ts            # Platform admin API
├── lib/
│   ├── supabase.ts         # Supabase client & auth helpers
│   ├── menu-modifiers.ts   # Modifier validation utilities
│   └── menu-categories.ts  # Category utilities
├── views/
│   ├── MenuView.tsx        # Customer menu browsing
│   ├── CartView.tsx        # Shopping cart
│   ├── owner/              # Owner dashboard views
│   └── admin/              # Platform admin views
├── components/
│   └── ModifierSelector.tsx # Modifier selection component
├── supabase-schema.sql     # Single-tenant database schema
├── supabase-schema-multitenant.sql # Multi-tenant schema
└── DOCS/                   # Documentation (you are here)
```

## Target Users

1. **Customers** - Order food via mobile browser
2. **Restaurant Owners/Managers** - Manage menu, view orders, update branding
3. **Kitchen Staff** - View orders on kitchen display, mark items ready
4. **Waiters** - Confirm orders via handshake code, assign tables
5. **Platform Admins** - Manage multiple restaurant tenants

## Business Model

Multi-tenant SaaS with subscription tiers:
- **Trial** - 14 days free
- **Starter** - Basic features
- **Professional** - Full features + analytics
- **Enterprise** - Custom solutions

## License

Proprietary - All rights reserved

---

*Last updated: January 2026*
