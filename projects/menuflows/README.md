# MenuFlows — QR Menu + Table Ordering System

**Deploy a complete digital ordering system for any restaurant in under 15 minutes.**
White-label it. Resell it. Keep all the margin.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sam-707/menuflows)

---

## The Agency Math

| | Cost |
|---|---|
| Build this yourself | 4–6 weeks × €80/hr = **€12,800–€19,200** |
| Buy MenuFlows | **€1,497 one-time** |
| Your time to deploy | 1 day |

**How agencies recoup in month one:**
Deploy to 10 restaurants at €150/mo = **€1,500/mo recurring.**
The purchase pays for itself before your second invoice.

---

## What It Does

A restaurant deploys MenuFlows. Their customers scan a QR code at the table, browse the digital menu, and place an order. The order appears in real time on the kitchen and owner dashboards. No app download. No payment integration required — orders are confirmed and paid at the table as usual.

**Customer flow:**
```
Scan QR → Browse menu → Add items → Place order → Waiter confirms table
```

**Restaurant staff flow:**
```
Owner dashboard → Pending queue → Assign table → Kitchen board → Mark served
```

---

## Feature Set

**Customer-facing**
- QR-triggered digital menu (no app, works on any phone)
- Item detail pages with allergens, additives, spice level
- Cart with modifier support (size, extras, dietary swaps)
- Real-time order tracking (pending → confirmed → cooking → served)
- Bilingual item names (primary + translated)

**Restaurant owner**
- Pending orders queue with waiter handshake table assignment
- Live kitchen view — status board for all active orders
- Floor plan / table map with live order status per table
- Inventory management — toggle item availability instantly
- QR code generator — print per-table QRs with embedded table number
- PIN-protected owner login

**White-label**
- All branding via `public/branding.json` — logo, colors, company name
- Zero "MenuFlows" or "Berlin Labs" visible to end-customers
- Full source code — modify anything you need

---

## 15-Minute Setup

### Prerequisites
- Vercel account (free tier works)
- Supabase account (free tier works)
- Node.js 20+

### Step 1 — Fork and connect to Vercel

Click **Deploy with Vercel** above, or clone manually:

```bash
git clone https://github.com/Sam-707/menuflows
cd menuflows
npm install
```

### Step 2 — Create Supabase project and run schema

1. Go to [supabase.com](https://supabase.com) → New project
2. Open the **SQL Editor**
3. Paste and run `supabase/seed.sql` — creates all tables and loads demo data
4. Go to **Settings → API** → copy your project URL and anon key

### Step 3 — Set environment variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add these same variables in Vercel under **Settings → Environment Variables**.

> The service role key is **never used in the browser.** Owner write operations go through Postgres RPC functions with `SECURITY DEFINER`. Only two env vars needed.

### Step 4 — Configure your branding

Edit `public/branding.json`:

```json
{
  "company_name": "Acme Agency Menus",
  "logo": "/logos/acme.png",
  "primary_color": "#3B82F6",
  "support_email": "support@acmeagency.com",
  "domain": "menu.acmeagency.com"
}
```

Add your logo to `public/logos/`. That's the only branding change needed.

### Step 5 — Deploy and verify

```bash
npm run build
vercel deploy
```

**Post-deploy checklist:**
- [ ] `your-deploy.vercel.app/demo` — menu loads and is browsable
- [ ] Add item to cart → place order
- [ ] Open second tab → owner dashboard (PIN: `1234` on seed data)
- [ ] Order appears in pending queue
- [ ] Assign table — order moves to kitchen view
- [ ] Mark as served — order resolves

All five pass = ready for your first restaurant client.

---

## Adding a Restaurant Client

Each restaurant is identified by a URL slug. `menu.yoursite.com/bistro-uno` serves Bistro Uno's menu.

```sql
-- Run in Supabase SQL Editor
INSERT INTO restaurants (slug, name, accent_color, is_open, currency, country)
VALUES ('bistro-uno', 'Bistro Uno', '#c21e3a', true, 'EUR', 'DE');
```

Then populate their menu via the owner dashboard inventory panel, or bulk-import via CSV.

Set up their QR codes in the owner dashboard → QR Generator. Print, laminate, done.

---

## White-Label: Before and After

**Default `branding.json` (what ships in the repo):**
```json
{
  "company_name": "MenuFlows",
  "primary_color": "#c21e3a",
  "support_email": "hello@menuflows.app"
}
```

**Your `branding.json`:**
```json
{
  "company_name": "Digital Menus by Acme Agency",
  "primary_color": "#3B82F6",
  "support_email": "support@acmeagency.com"
}
```

Result: every customer-facing screen shows your brand. Restaurant clients see only your agency name. MenuFlows and Berlin Labs Digital are invisible to them.

---

## Project Structure

```
├── App.tsx                    # Root routing + state
├── views/
│   ├── MenuView.tsx           # Customer menu browser
│   ├── CartView.tsx           # Cart + order submission
│   ├── WaiterHandshakeView/   # Order → table assignment
│   ├── owner/
│   │   ├── DashboardView      # Owner hub
│   │   ├── PendingOrdersView  # Incoming queue
│   │   ├── KitchenView        # Live kitchen board
│   │   ├── InventoryView      # Menu management
│   │   └── TableMapView       # Floor plan
│   ├── LandingView.tsx        # Marketing page (repurpose or remove)
│   ├── PrivacyView.tsx        # GDPR privacy policy
│   └── TermsView.tsx          # Terms of service
├── contexts/
│   └── BrandingContext.tsx    # Loads public/branding.json once
├── lib/
│   ├── supabase.ts            # DB client + TypeScript types
│   └── api.multitenant.ts     # All database operations
├── supabase/
│   ├── seed.sql               # Full schema + demo restaurant data
│   └── functions/             # Edge Functions for owner operations
└── public/
    └── branding.json          # Your logo, colors, company name
```

---

## Customisation

This is your source code. Modify anything.

**Common changes:**
- Brand colors and logo: `public/branding.json`
- Order statuses: `types.ts` → `TableOrder['status']`
- Currency display: search `toFixed(2)` in `lib/` — wrap in your formatter
- Language: find/replace display strings or wire up i18n
- Add payment step: hook into `CartView.tsx` → `generateWaiterCode` before order creation

---

## Troubleshooting

**Blank screen on load**
→ `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not set in Vercel env vars (not just `.env.local`)

**Orders not appearing in owner dashboard**
→ Enable Supabase Realtime on the `orders` table: Database → Replication → toggle `orders` on

**QR code leads to 404**
→ The QR encodes `yoursite.com/your-slug`. Confirm that slug exists in the `restaurants` table

**Owner PIN not working**
→ Seed data default PIN is `1234`. Stored as SHA-256 hash — reset via SQL if needed:
```sql
UPDATE restaurants SET owner_pin_hash = encode(sha256('1234'), 'hex') WHERE slug = 'demo';
```

**Realtime subscription drops after ~60s**
→ Supabase free tier has connection limits. Upgrade to Pro or implement reconnect logic in `api.multitenant.ts`

---

## License

Non-exclusive source code license. You may:
- Deploy to unlimited restaurant clients
- White-label under your agency brand
- Modify the source code for your deployments

You may not:
- Resell or sublicense the source code to other developers
- Remove Berlin Labs Digital attribution from internal developer documentation

**Updates:** Security patches + minor features delivered quarterly via GitHub for active license holders.
**Major version migrations:** Separate paid engagement (€497).
**Post-30-day support:** €97/hr, 1 business day response.

---

## Support

**First 30 days:** Included. Email `hello@berlinlabs.digital` with your order number.
**After 30 days:** €97/hr.

Check Troubleshooting above before reaching out — most setup issues are covered there.

---

*Built by [Berlin Labs Digital](https://berlinlabs.digital) — deployable infrastructure for hospitality agencies.*
