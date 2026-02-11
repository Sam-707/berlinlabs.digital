# MenuFlows Deployment Guide

This guide covers deploying MenuFlows to production using Vercel, GitHub, and Supabase.

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier works)
- [ ] Supabase account and project (free tier works)
- [ ] Node.js 20.x installed locally (for testing)

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     GitHub      │────>│     Vercel      │────>│    Supabase     │
│   Repository    │     │   Static Host   │     │    Backend      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │ Push to main          │ Edge CDN              │ PostgreSQL
        │ Triggers deploy       │ Static files          │ Realtime
        └───────────────────────┴───────────────────────┘
```

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Configure:
   - **Name**: menuflows-production (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Frankfurt for EU)
4. Click **Create new project**
5. Wait for project to initialize (~2 minutes)

### Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

Save these for Vercel configuration.

### Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase-schema-multitenant.sql`
4. Click **Run** (or Cmd+Enter)
5. Verify tables were created in **Table Editor**

Expected tables:
- `platform_admins`
- `restaurants`
- `restaurant_staff`
- `menu_categories`
- `menu_items`
- `item_modifier_groups`
- `item_modifiers`
- `menu_item_modifiers`
- `restaurant_tables`
- `orders`
- `order_items`
- `operating_hours`
- `daily_analytics`

### Configure Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Create these buckets:

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `menu-images` | Yes | Menu item photos |
| `restaurant-assets` | Yes | Logos, cover images |

4. For each bucket, click **Policies** → **New Policy**:
   ```sql
   -- Allow public read
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'menu-images');

   -- Allow authenticated upload
   CREATE POLICY "Authenticated upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'menu-images');
   ```

### Enable Realtime

1. Go to **Database** → **Replication**
2. Under **Supabase Realtime**, click **Enable**
3. Add these tables to replication:
   - `orders`
   - `order_items`

Or run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
```

### Create Platform Admin

Run this SQL to create your first admin account:

```sql
INSERT INTO platform_admins (email, name, password_hash, role, is_active)
VALUES (
  'admin@yourcompany.com',
  'Platform Admin',
  -- SHA-256 hash of your password (replace with actual hash)
  '5e884898da28047d...',  -- Hash of "password"
  'super_admin',
  true
);
```

To generate a SHA-256 hash, you can use:
```javascript
// In browser console
const hash = await crypto.subtle.digest('SHA-256',
  new TextEncoder().encode('your-password'));
const hashHex = Array.from(new Uint8Array(hash))
  .map(b => b.toString(16).padStart(2, '0')).join('');
console.log(hashHex);
```

### Create Test Restaurant

```sql
INSERT INTO restaurants (name, slug, business_type, accent_color, is_open)
VALUES (
  'Test Restaurant',
  'test-restaurant',
  'restaurant',
  '#10B981',
  true
);

-- Create owner staff
INSERT INTO restaurant_staff (restaurant_id, name, pin_hash, role, is_active)
SELECT
  id,
  'Owner',
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',  -- PIN: 1234
  'owner',
  true
FROM restaurants WHERE slug = 'test-restaurant';
```

---

## 2. GitHub Setup

### Repository Structure

Ensure your repository has:

```
menuflows/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── App.tsx
├── ...
└── .gitignore
```

### .gitignore

Ensure these are ignored:

```gitignore
node_modules/
dist/
.env.local
.env
*.log
.DS_Store
```

### Branch Strategy (Recommended)

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/new-feature
  │     └── fix/bug-fix
  │
  └── hotfix/critical-fix
```

- `main` → Production deployments
- `develop` → Staging/preview deployments
- Feature branches → Pull request previews

---

## 3. Vercel Setup

### Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:

### Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### Environment Variables

Add these in Vercel project settings → **Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |

**Important:** Variables must start with `VITE_` to be exposed to the browser.

### Deploy

1. Click **Deploy**
2. Wait for build to complete (~1-2 minutes)
3. Your app is live at `https://your-project.vercel.app`

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `menuflows.app`)
3. Configure DNS:
   - **A Record**: `76.76.21.21`
   - **CNAME** (www): `cname.vercel-dns.com`
4. Wait for SSL certificate (~10 minutes)

---

## 4. Environment Configuration

### Development (.env.local)

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Optional
GEMINI_API_KEY=your-gemini-key-if-used
```

### Production (Vercel Environment Variables)

Same variables, configured in Vercel dashboard.

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `GEMINI_API_KEY` | No | Google Gemini API key (for AI features) |

---

## 5. Deployment Workflow

### Automatic Deployments

Vercel automatically deploys on:

| Trigger | Environment | URL |
|---------|-------------|-----|
| Push to `main` | Production | `menuflows.app` |
| Push to other branches | Preview | `branch-name.vercel.app` |
| Pull request | Preview | `pr-123.vercel.app` |

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Rollback

1. Go to Vercel dashboard → **Deployments**
2. Find previous working deployment
3. Click **...** → **Promote to Production**

---

## 6. Post-Deployment Checklist

### Verify Deployment

- [ ] App loads at production URL
- [ ] Supabase connection works (check console for errors)
- [ ] Menu loads correctly
- [ ] Orders can be created
- [ ] Real-time updates work (open two tabs)
- [ ] Image upload works
- [ ] Owner login works (try PIN: 1234)
- [ ] Admin login works

### Test Multi-Tenant Routing

- [ ] `yoursite.com/test-restaurant` → Shows test restaurant menu
- [ ] `yoursite.com/nonexistent` → Shows appropriate error
- [ ] `yoursite.com/admin` → Shows admin login

### Performance Check

- [ ] Page loads in < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No console errors in production

---

## 7. Monitoring & Maintenance

### Vercel Analytics

1. Go to project → **Analytics**
2. Enable Web Analytics (free tier available)
3. Monitor:
   - Page views
   - Load time
   - Error rates

### Supabase Monitoring

1. Go to Supabase dashboard → **Reports**
2. Monitor:
   - Database size
   - API requests
   - Realtime connections

### Logs

**Vercel Logs:**
- Project → **Deployments** → Click deployment → **Functions** tab

**Supabase Logs:**
- Dashboard → **Logs** → **API** or **Postgres**

### Database Backups

Supabase automatically backs up daily (Pro plan).

For free tier, manually export:
```bash
# Using pg_dump (requires PostgreSQL CLI)
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## 8. Scaling Considerations

### Supabase Limits (Free Tier)

| Resource | Limit |
|----------|-------|
| Database size | 500 MB |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| API requests | 500K/month |
| Realtime connections | 200 concurrent |

Upgrade to Pro ($25/month) for production workloads.

### Vercel Limits (Free Tier)

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Build minutes | 6000/month |
| Deployments | Unlimited |
| Team members | 1 |

Upgrade to Pro ($20/month) for team access.

### Performance Optimization

1. **Enable Supabase connection pooling** for high traffic
2. **Add Vercel Edge caching** for static assets
3. **Optimize images** using Supabase transforms
4. **Implement code splitting** for large bundles

---

## 9. Troubleshooting Deployment

### Build Fails

**Error:** `Module not found`
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**Error:** `Type errors`
```bash
# Check locally first
npm run build
```

### Supabase Connection Fails

1. Verify environment variables in Vercel
2. Check Supabase project is not paused (free tier pauses after 1 week inactivity)
3. Verify RLS policies allow anonymous access

### Real-time Not Working

1. Check Realtime is enabled for tables
2. Verify WebSocket connection in browser DevTools
3. Check Supabase connection limits

### 404 on Routes

Vercel needs to serve `index.html` for all routes. Add `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 10. Security Checklist

### Before Going Live

- [ ] Remove test data from production database
- [ ] Change default admin password
- [ ] Change default owner PINs
- [ ] Review RLS policies
- [ ] Enable Supabase Auth (recommended for production)
- [ ] Configure CORS in Supabase (if needed)
- [ ] Enable HTTPS only (Vercel does this automatically)

### Ongoing

- [ ] Rotate Supabase anon key periodically
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Review access logs

---

## Quick Reference

### URLs

| Environment | URL |
|-------------|-----|
| Production | `https://menuflows.app` |
| Vercel Dashboard | `https://vercel.com/your-team/menuflows` |
| Supabase Dashboard | `https://app.supabase.com/project/xxxxx` |
| GitHub Repo | `https://github.com/your-org/menuflows` |

### Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

### Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- GitHub: [docs.github.com](https://docs.github.com)

---

*See also: [ARCHITECTURE.md](./ARCHITECTURE.md) | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)*
