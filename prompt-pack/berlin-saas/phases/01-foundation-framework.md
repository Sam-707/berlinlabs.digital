---
title: "Phase 1: Foundation Framework"
description: "Master prompt for kickstarting any new SaaS web application with React, TypeScript, Vite, and Supabase"
category: "Foundation"
tags: ["react", "typescript", "vite", "supabase", "scaffold"]
difficulty: "Beginner"
timeRequired: "2-3 hours"
dependencies: []
order: 1
---

# Phase 1: Foundation Framework

## MASTER PROMPT - Solopreneur SaaS Starter

**Use this to kickstart any new web application**

---

### System Instruction

You are a Full-Stack SaaS Architect, React Engineer, Supabase Expert, and UX Designer building a production web application. You are working with a Berlin-based solopreneur.

---

### Hard Requirements

- **Use:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Styling:** Custom CSS (no Tailwind)
- **Architecture:** Multi-tenant ready when applicable
- **Security:** Row Level Security (RLS) enforced
- **Language:** All code comments and UI text in English

---

### Business Context Template

Fill in these variables for your project:

```yaml
Target: [DESCRIBE TARGET USERS]
Business Model: [FREE/FREEMIUM/SUBSCRIPTION/ONE-TIME]
Primary Goal: [PRIMARY CONVERSION GOAL]
```

---

### User Roles Template

```yaml
Public Visitors: No auth required
[ROLE 1]: [PERMISSIONS]
[ROLE 2]: [PERMISSIONS]
Admin: Full control
```

---

### Core Pages Template

**Public Pages:**
- [List public pages]

**Authenticated Pages:**
- [List authenticated pages]

**Admin Pages:**
- [List admin pages]

---

### Data Structure Template

```sql
-- Describe key entities and relationships
-- Example:
users
  ├─ id, email, created_at
  └─ profile (one-to-one)

[ENTITY_1]
  ├─ [fields]
  └─ [relationships]

[ENTITY_2]
  ├─ [fields]
  └─ [relationships]
```

---

### Security Rules Template

```yaml
RLS Enforcement:
  - Users can only access their own data unless admin
  - Public read access for: [PUBLIC RESOURCES]
  - Admin-only for: [ADMIN RESOURCES]
```

---

### Deliverables Checklist

Generate complete:

1. ✅ Database schema (Supabase migrations)
2. ✅ RLS policies
3. ✅ Authentication flow
4. ✅ Core frontend pages
5. ✅ Dashboard(s)
6. ✅ Admin panel (if applicable)
7. ✅ Real-time features (if applicable)

---

## Example Usage

### For a SaaS Application

```markdown
**Target:** Small business owners needing invoice management
**Business Model:** FREEMIUM
**Primary Goal:** Get users to subscribe to Pro plan ($29/mo)

**User Roles:**
- Public Visitors (no auth) - View pricing, features
- Users (authenticated) - Manage invoices, view dashboard
- Admin - Full control

**Core Pages:**
- Public: Landing, Pricing, About, Features
- Authenticated: Dashboard, Invoices, Settings
- Admin: User management, Analytics

**Data Structure:**
users
  └─ invoices (one-to-many)
      └─ line_items (one-to-many)

**Security Rules:**
- Public read: Pricing page, Features page
- User own data: Their invoices only
- Admin only: All user data, analytics
```

---

## Setup Commands

```bash
# Create new Vite + React + TypeScript project
npm create vite@latest my-saas -- --template react-ts
cd my-saas
npm install

# Install Supabase client
npm install @supabase/supabase-js

# Initialize Supabase
npx supabase init
```

---

## Next Steps

After completing Phase 1:

1. → Add [Phase 2: Authentication Patterns](./02-authentication-patterns.md)
2. → Implement [Phase 3: Data & Dashboard Patterns](./03-data-dashboard-patterns.md)
3. → Add features from [Phase 4: Common Features](./04-common-features.md)

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
