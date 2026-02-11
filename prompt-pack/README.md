# Berlin Solopreneur Digital Solutions Prompt Pack

A reusable, modular prompt system for rapidly building SaaS/web applications as a solopreneur.

---

## 🎯 Purpose

This prompt pack is designed for Berlin-based solopreneurs who want to quickly build production-ready web applications using modern technologies. Each prompt is modular and can be combined with others to create complete applications.

---

## 🚀 Quick Start

### For a New SaaS Project

```
Use the MASTER PROMPT from Phase 1 with these customizations:
- Target: [YOUR TARGET USERS]
- Business Model: [SUBSCRIPTION/FREEMIUM]
- Primary Goal: [GET USERS TO SUBSCRIBE]
- User Roles: Users, Admin
- Core Pages: Landing, Pricing, Dashboard, Settings
- Data Structure: [YOUR ENTITIES]
```

### For a WhatsApp + AI Bot

```
Combine prompts from:
- Phase 1: Foundation (basic structure)
- Phase 8A: WhatsApp Bot
- Phase 8B: AI Integration
- Phase 8C: Combined WhatsApp + AI
```

### For a Multi-Tenant SaaS

```
Use MASTER PROMPT + these customizations:
- Multi-tenant architecture (slug-based routing)
- Each tenant has isolated data
- Admin can manage all tenants
- Users belong to specific tenant
```

---

## 📦 Phase Overview

| Phase | Description | Status |
|-------|-------------|--------|
| [Phase 1](./phases/phase-1-foundation.md) | Foundation Framework - Master SaaS Starter | ✅ |
| [Phase 2](./phases/phase-2-authentication.md) | Authentication Patterns (Email/Password + OAuth) | ✅ |
| [Phase 3](./phases/phase-3-data-dashboard.md) | Data & Dashboard Patterns | ✅ |
| [Phase 4](./phases/phase-4-common-features.md) | Common Features (Stripe, Real-time) | ✅ |
| [Phase 5](./phases/phase-5-rls-templates.md) | RLS Policy Templates | ✅ |
| [Phase 6](./phases/phase-6-project-templates.md) | Quick Project Templates | ✅ |
| [Phase 7](./phases/phase-7-troubleshooting.md) | Troubleshooting Prompts | ✅ |
| [Phase 8](./phases/phase-8-whatsapp-ai.md) | WhatsApp & AI Integration | ✅ |
| [Phase 9](./phases/phase-9-edge-functions.md) | Edge Functions & Serverless | ✅ |

---

## 🛠️ Tech Stack Preferences

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React 19 + TypeScript + Vite | Fast, modern, type-safe |
| Backend | Supabase (PostgreSQL + Auth + Real-time) | All-in-one, easy RLS |
| Styling | Custom CSS | Full control, no dependencies |
| Payments | Stripe Checkout | Industry standard |
| Deployment | Vercel + Supabase | Zero-config deployment |

---

## 📋 Before Starting Any Project

Use the [Pre-Project Checklist](./checklists/pre-project.md) to ensure you're ready.

---

## 💡 Usage Guide

### Step 1: Choose Your Foundation
Start with **Phase 1: Foundation Framework** and customize for your specific project type.

### Step 2: Add Authentication
Choose **Phase 2** prompts based on your auth needs:
- 2A: Email/password (essential)
- 2B: Add Google OAuth (optional)

### Step 3: Implement Data Layer
Choose **Phase 3** prompts based on your dashboards:
- 3A: User dashboard (almost always needed)
- 3B: Admin dashboard (if you need admin panel)

### Step 4: Add Features
Select **Phase 4** prompts for specific features:
- 4A: Stripe payments
- 4B: Real-time features

### Step 5: Add Advanced Features (Optional)
- **Phase 8**: WhatsApp bot, AI integration, or combined
- **Phase 9**: Edge Functions for custom serverless logic

### Step 6: Deploy & Test
Use **Phase 7** prompts to audit and optimize.

---

## 🎨 Common Patterns

### Multi-Tenant Architecture
```typescript
// Slug-based routing pattern
/tenant-[slug]/dashboard
/tenant-[slug]/settings
/admin/tenants
```

### Wine-Dark Theme
```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --accent: #e94560;
  --text-primary: #eee;
  --text-secondary: #aaa;
}
```

### Real-time Updates
```typescript
supabase
  .channel('changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' })
  .subscribe()
```

---

## 📂 Templates

Ready-to-use templates for common project types:

- [Marketplace Platform](./templates/marketplace.md)
- [SaaS Application](./templates/saas.md)
- [Content Platform](./templates/content.md)
- [Booking System](./templates/booking.md)
- [Community Platform](./templates/community.md)

---

## 🧪 Example Projects

See the [examples](./examples/) directory for full implementations:
- Document Analyzer SaaS
- WhatsApp AI Bot
- Multi-tenant Platform

---

## 🔧 Pro Tips

1. **Always specify your tech stack** upfront (React + TS + Vite + Supabase)
2. **Start small** - build core features first, add advanced features later
3. **Use the troubleshooting prompts** before deploying to production
4. **Customize RLS rules** based on your exact security needs
5. **Keep a consistent UI pattern** - copy components from previous projects
6. **Version control your prompts** - keep improving them based on results
7. **Cache AI responses** to save costs on repeated queries
8. **Use Edge Functions** for any logic that needs API keys
9. **Test WhatsApp bots** with Twilio's sandbox before going live

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel login
vercel link
vercel --prod
```

### Backend (Supabase)
```bash
supabase link
supabase db push
supabase functions deploy
```

---

## 📞 Support

For issues or improvements, please refer to:
- [Troubleshooting Guide](./phases/phase-7-troubleshooting.md)
- [Security Audit Checklist](./checklists/security.md)
- [Performance Optimization](./phases/phase-7-troubleshooting.md#performance-optimization)

---

*Created for Berlin-based solopreneurs building digital solutions with modern web technologies.*
