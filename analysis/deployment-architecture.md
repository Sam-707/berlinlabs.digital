# Deployment Architecture - Hosting Recommendations

> **Generated**: 2026-02-11
> **Purpose**: Complete deployment architecture for all Lionbridge Digital projects
> **Target**: Cost-effective, scalable, production-ready deployments

---

## Executive Summary

| Project | Hosting | Monthly Cost | Scalability | Setup Time |
|---------|----------|--------------|-------------|------------|
| 3rbst-unified | Vercel + VPS | €5-35 | High | 2-3 hours |
| MenuFlows | Vercel + Supabase | €20-85 | Very High | 1-2 hours |
| 3rbst-platform | Vercel (existing) | €0-20 | High | Already deployed |

---

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │      Cloudflare CDN (Optional)       │
                    │   DDoS Protection, Caching, SSL    │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │         Vercel Edge Network          │
                    │   (Frontend + Serverless API)       │
                    │   • Global CDN                       │
                    │   • Automatic HTTPS                 │
                    │   • Zero cold starts for SPA        │
                    └─────────────────┬───────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
┌────────▼─────────┐    ┌──────────▼────────┐    ┌──────────▼──────────┐
│  Supabase Cloud  │    │   VPS (Hetzner)   │    │   OpenAI/Gemini    │
│  (PostgreSQL)     │    │  Evolution API    │    │   AI Services      │
│  • Database       │    │  • WhatsApp       │    │   • Vision AI      │
│  • Auth          │    │  • Docker         │    │   • Inference      │
│  • Realtime      │    │  • Nginx          │    │                    │
│  • Storage       │    │  • €5-10/mo      │    │   • Pay per use    │
│  • €25/mo       │    │                   │    │                    │
└──────────────────┘    └───────────────────┘    └─────────────────────┘
         │                       │
         └───────────┬─────────┘
                     │
         ┌───────────▼────────────┐
         │  Stripe (Payments)      │
         │  • Subscriptions      │
         │  • 2.9% + €0.30/trx  │
         └───────────────────────┘
```

---

## Project 1: 3rbst-unified Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        3rbst-unified                        │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐      ┌──────────────────┐                │
│  │   Vercel      │──────│  Supabase        │                │
│  │               │      │  • PostgreSQL    │                │
│  │  • Frontend   │      │  • Auth          │                │
│  │    (React)    │      │  • Row Level     │                │
│  │               │      │    Security      │                │
│  │  • API        │──────│                  │                │
│  │    (Node.js)  │      │                  │                │
│  │               │      │                  │                │
│  └───────────────┘      └──────────────────┘                │
│         │                                                   │
│         │ Webhook                                           │
│         ▼                                                   │
│  ┌────────────────┐      ┌──────────────────┐                │
│  │  VPS          │      │  Gemini AI       │                │
│  │  (Hetzner)    │──────│  • 2.0 Flash     │                │
│  │               │      │  • Vision API    │                │
│  │  Evolution    │      │                  │                │
│  │  API          │      │                  │                │
│  │  • WhatsApp   │      └──────────────────┘                │
│  │  • Docker     │                                           │
│  │  • Nginx      │                                           │
│  └────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Hosting Providers

#### Vercel (Frontend + Serverless API)

**Purpose**: Host React frontend and serverless API endpoints

**Pricing**:
| Plan | Price | Features | Limit |
|------|-------|----------|-------|
| Hobby | FREE | 100GB bandwidth, 100h serverless | 6 deployments/day |
| Pro | €20/mo | 1TB bandwidth, unlimited deployments | Best for production |

**Recommended**: Start on Hobby, upgrade to Pro if needed

**Setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd 3rbst-unified
vercel

# Set environment variables in Vercel dashboard:
# - GEMINI_API_KEY
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - EVOLUTION_API_URL
# - EVOLUTION_API_TOKEN
```

---

#### Hetzner VPS (Evolution API)

**Purpose**: Host Evolution API for WhatsApp

**Pricing**:
| Plan | Price | Specs | Region |
|------|-------|-------|--------|
| CX22 | €4.89/mo | 2 vCPU, 4GB RAM | Falkenstein |
| CX32 | €8.64/mo | 4 vCPU, 8GB RAM | Falkenstein |

**Recommended**: CX22 (sufficient for Evolution API)

**Setup**:
```bash
# 1. Create server at hetzner.com
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Clone your repo
git clone https://github.com/your-repo/evolution-api.git
cd evolution-api

# 5. Run docker-compose
docker-compose up -d

# 6. Setup Nginx reverse proxy (SSL)
apt install nginx certbot python3-certbot-nginx
certbot --nginx -d wa.your-domain.com
```

**Docker Compose** (from 3rbst-Gemini):
```yaml
version: '3.8'
services:
  evolution-api:
    image: evolution/evolution-api:v2.0.0
    container_name: evolution-api
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=your-strong-api-key
      - SERVER_PORT=8080
    restart: unless-stopped
```

---

#### Supabase (Database)

**Purpose**: PostgreSQL database + Auth + Realtime

**Pricing**:
| Plan | Price | Features |
|------|-------|----------|
| Free | €0 | 500MB DB, 1GB bandwidth |
| Pro | €25/mo | 8GB DB, 50GB bandwidth |

**Recommended**: Start on Free tier

**Setup**:
1. Go to supabase.com
2. Create project
3. Run SQL migrations in SQL editor
4. Get URL and anon key from Settings → API

---

### Environment Variables

**Vercel** (frontend + API):
```bash
# AI
GEMINI_API_KEY=your-gemini-key

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Evolution API
EVOLUTION_API_URL=https://wa.your-domain.com
EVOLUTION_API_TOKEN=your-api-token
EVOLUTION_INSTANCE=your-instance-name

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

**VPS** (Evolution API):
```bash
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=your-strong-random-key
SERVER_PORT=8080
```

---

### Deployment Steps

**Step 1: Deploy to Vercel** (15 minutes)
```bash
cd 3rbst-unified
vercel --prod
```

**Step 2: Set up Supabase** (10 minutes)
1. Create project
2. Run `supabase-schema.sql` migrations
3. Enable RLS policies
4. Get credentials

**Step 3: Set up VPS** (1 hour)
1. Create Hetzner server
2. Install Docker
3. Deploy Evolution API
4. Setup SSL with Let's Encrypt

**Step 4: Update DNS** (5 minutes)
```
# Add A record for Evolution API
wa.your-domain.com → your-vps-ip

# CNAME for Vercel
app.your-domain.com → your-vercel-app.vercel.app
```

**Step 5: Test End-to-End** (10 minutes)
1. Send test WhatsApp message
2. Verify AI analysis works
3. Test payment flow
4. Check database records

**Total Time**: ~2 hours

---

### Cost Summary (3rbst-unified)

| Service | Monthly | Notes |
|---------|---------|-------|
| Vercel (Hobby) | €0 | Upgrade to Pro if needed |
| Hetzner VPS | €4.89 | CX22 plan |
| Supabase (Free) | €0 | Upgrade to Pro if needed |
| Gemini AI | €0-5 | Pay per usage |
| Evolution API | €0 | Self-hosted |
| **Total** | **~€5-10/mo** | At 1000 users |

---

## Project 2: MenuFlows Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MenuFlows                            │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐      ┌──────────────────┐                │
│  │   Vercel      │──────│  Supabase        │                │
│  │               │      │                  │                │
│  │  • React 19   │      │  • PostgreSQL    │                │
│  │    Frontend   │      │  • Realtime      │                │
│  │               │      │  • Storage       │                │
│  │  • Edge CDN   │      │  • Auth          │                │
│  │               │      │  • RLS           │                │
│  └───────────────┘      └──────────────────┘                │
│         │                      │                              │
│         │                      │                              │
│         │              ┌───────▼────────┐                    │
│         │              │  Stripe       │                    │
│         └──────────────│  Payments     │                    │
│                        │  • Webhooks   │                    │
│                        └───────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### Hosting Providers

#### Vercel (Frontend Only)

**Plan**: Pro (€20/mo recommended for production)

**Why Pro?**
- Unlimited deployments (frequent updates)
- 1TB bandwidth (100 restaurants × traffic)
- Faster edge caching
- Team access

---

#### Supabase (Database)

**Plan**: Pro (€25/mo)

**Why Pro?**
- 8GB database (100 restaurants × data)
- 50GB file storage (menu images)
- Daily backups (critical!)
- 50GB bandwidth (realtime updates)
- No pause on inactivity

**Database Size Estimate**:
```
Per restaurant:
- Menu items: ~100 items × 1KB = 100KB
- Orders: ~1000 orders × 2KB = 2MB
- Images: ~20 items × 500KB = 10MB

Total per restaurant: ~12MB
100 restaurants: ~1.2GB

Plus indexes, logs, overhead: ~3-4GB

8GB plan = sufficient for 100-200 restaurants
```

---

#### Stripe (Payments)

**Cost**: 2.9% + €0.30 per transaction

**Setup**:
1. Create Stripe account
2. Create products and prices:
   - `starter_monthly`: €29/month
   - `professional_monthly`: €49/month
3. Set up webhook endpoint: `https://your-domain.com/api/stripe-webhook`
4. Configure webhook events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`

---

### Environment Variables

**Vercel**:
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Sentry (optional)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Vercel
VERCEL_URL=your-domain.vercel.app
```

---

### Deployment Steps

**Step 1: Deploy to Vercel** (5 minutes)
```bash
cd menuflows
vercel --prod
```

**Step 2: Set up Supabase** (15 minutes)
1. Create project at supabase.com
2. Run `supabase-schema-multitenant.sql`
3. Enable Row Level Security
4. Configure storage buckets
5. Set up CDN for images

**Step 3: Set up Stripe** (20 minutes)
1. Create products and prices
2. Add webhook endpoint
3. Test checkout flow
4. Verify webhook signatures

**Step 4: Configure Custom Domain** (5 minutes)
1. Add domain in Vercel dashboard
2. Update DNS records
3. Wait for SSL propagation

**Step 5: Test Production** (10 minutes)
1. Create test restaurant
2. Place test order
3. Process test payment
4. Verify all features work

**Total Time**: ~1 hour

---

### Cost Summary (MenuFlows)

| Service | Monthly | Notes |
|---------|---------|-------|
| Vercel Pro | €20 | 100 restaurants |
| Supabase Pro | €25 | 8GB DB, backups |
| Stripe | Variable | 2.9% + €0.30/trx |
| Sentry | $26 (€24) | Error monitoring |
| **Total Fixed** | **~€69/mo** | 100 restaurants |
| **Variable** | **~2.9% revenue** | ~€57 at €1,950 MRR |

---

## Project 3: 3rbst-platform (Already Deployed)

**Current Status**: ✅ Deployed to Vercel

**URL**: (existing vercel.app domain)

**Migration Needed**: Move to unified 3rbst version

---

## DNS Configuration

### Recommended Domain Structure

```
# 3rbst
3rbst.com                → Main landing page
app.3rbst.com            → Web application
wa.3rbst.com             → Evolution API (VPS)
api.3rbst.com            → API endpoints (Vercel)
docs.3rbst.com           → Documentation

# MenuFlows
menuflows.com             → Main landing page
app.menuflows.com         → Web application
admin.menuflows.com       → Admin dashboard
api.menuflows.com         → API endpoints (same as app)
```

### DNS Records

```
# A Records (point to VPS)
wa.3rbst.com            A    your-vps-ip

# CNAME Records (point to Vercel)
app.3rbst.com           CNAME  your-vercel-app.vercel.app
app.menuflows.com         CNAME  your-vercel-app.vercel.app
admin.menuflows.com       CNAME  your-vercel-app.vercel.app

# MX Records (email)
@                        MX    mail.protonmail.com
```

---

## Security Checklist

### Vercel
- [ ] Enable environmental variables (never commit secrets)
- [ ] Enable Vercel authentication (team access)
- [ ] Set up branch protection (require PRs)
- [ ] Enable Vercel Analytics

### VPS (Hetzner)
- [ ] SSH key authentication only (no password login)
- [ ] Firewall (ufw) configured
- [ ] SSL certificates (Let's Encrypt)
- [ ] Automatic security updates
- [ ] Docker non-root user
- [ ] Nginx security headers
- [ ] Fail2ban for SSH protection

### Supabase
- [ ] Row Level Security enabled on all tables
- [ ] Service role key never exposed to client
- [ ] API keys rotated regularly
- [ ] Backups enabled
- [ ] Two-factor authentication

### Stripe
- [ ] Webhook signature verification
- [ ] Test mode before production
- [ ] Radar fraud prevention
- [ ] Strong customer authentication

---

## Scaling Strategy

### Phase 1: Launch (0-100 users)
- Vercel Hobby/Pro
- Supabase Free/Pro
- Single VPS

### Phase 2: Growth (100-1000 users)
- Vercel Pro
- Supabase Pro
- Upgrade VPS if needed

### Phase 3: Scale (1000+ users)
- Vercel Pro (or Enterprise)
- Supabase Pro/Team
- Load balancer + multiple VPS
- Redis caching
- CDN for static assets

---

## Monitoring & Observability

### Tools
- **Sentry**: Error tracking ($29/mo)
- **Vercel Analytics**: Performance monitoring (free)
- **Supabase Dashboard**: Database metrics (free)
- **UptimeRobot**: Uptime monitoring (free)

### Key Metrics to Monitor
- Error rate
- Response time (p95, p99)
- Uptime percentage
- Database connection pool
- Server CPU/memory usage

---

## Backup Strategy

### Database Backups
- **Supabase**: Automatic daily backups (Pro plan)
- **Retention**: 7 days (free) / 30 days (Pro)
- **Point-in-time recovery**: Available

### Application Backups
- Git repository (GitHub)
- Environment variables (documented in 1Password)
- VPS configuration (Docker Compose in repo)

### Disaster Recovery
- RTO (Recovery Time Objective): 1-4 hours
- RPO (Recovery Point Objective): 24 hours (daily backups)
- Restoration process documented

---

## Cost Optimization

### Quick Wins
1. **Vercel**: Use Hobby tier until 10K monthly visits
2. **Supabase**: Compress old images, delete unused data
3. **Gemini AI**: Use free tier while experimental
4. **VPS**: Use smaller instance (CX22) until necessary

### Long-term Optimization
1. **CDN caching**: Reduce bandwidth costs
2. **Image optimization**: Reduce Supabase storage
3. **Query optimization**: Reduce database load
4. **Code splitting**: Faster Vercel builds

---

## Migration Guide

### From 3rbst-platform → 3rbst-unified

1. **Export data** from existing Supabase
2. **Import to new Supabase** project
3. **Update DNS** to point to new Vercel app
4. **Switch Evolution API** gradually
5. **Monitor** for issues
6. **Decommission** old deployment after 1 week

---

## Support & Maintenance

### Monthly Tasks
- Review and pay bills
- Check error rates in Sentry
- Review database storage usage
- Update dependencies (npm packages)
- Review security advisories

### Quarterly Tasks
- Review and optimize costs
- Security audit
- Performance optimization
- Backup verification
- Documentation updates

---

**Last Updated**: 2026-02-11
**Status**: Ready for deployment
**Next Steps**: Execute deployment steps for 3rbst-unified
