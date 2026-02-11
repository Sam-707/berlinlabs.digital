# Pre-Project Checklist

Use this checklist before starting any new SaaS project.

---

## Project Definition

### Concept
- [ ] Clearly define the problem you're solving
- [ ] Identify your target users
- [ ] Define your unique value proposition
- [ ] Research competitors
- [ ] Determine business model (free/freemium/subscription/marketplace)

### Requirements
- [ ] List core features (MVP)
- [ ] Define user roles (public, user, admin, etc.)
- [ ] Map user journeys
- [ ] Define success metrics

---

## Technical Planning

### Tech Stack
- [ ] Frontend: React 19 + TypeScript + Vite
- [ ] Backend: Supabase (PostgreSQL + Auth + Real-time)
- [ ] Styling: Custom CSS
- [ ] Payments: Stripe (if applicable)
- [ ] Other services: [List any third-party integrations]

### Database Schema
- [ ] Sketch entity relationships
- [ ] Define tables and columns
- [ ] Plan RLS policies
- [ ] Identify indexes needed
- [ ] Plan for multi-tenancy (if applicable)

### Pages & Routes
- [ ] Public pages (/, /about, /pricing, etc.)
- [ ] Auth pages (/login, /signup)
- [ ] User dashboard pages
- [ ] Admin pages
- [ ] API routes (if any)

---

## Supabase Setup

### Project Creation
- [ ] Create Supabase project at https://supabase.com
- [ ] Save project URL and anon key
- [ ] Set up local development: `npx supabase init`

### Authentication
- [ ] Enable email auth
- [ ] Enable social providers (Google, etc.)
- [ ] Configure email templates
- [ ] Set up redirect URLs

### Database
- [ ] Run migration scripts
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Add indexes for performance
- [ ] Test RLS policies with different roles

### Storage
- [ ] Create storage buckets (if file uploads)
- [ ] Configure bucket permissions
- [ ] Set up CDN (if needed)

---

## Development Setup

### Local Environment
- [ ] Create Vite project: `npm create vite@latest -- --template react-ts`
- [ ] Install dependencies
- [ ] Set up environment variables (.env.local)
- [ ] Configure git repository

### Project Structure
```
src/
├── App.tsx
├── main.tsx
├── index.css
├── lib/
│   └── supabase.ts
├── components/
├── pages/
├── contexts/
├── hooks/
├── types/
└── styles/
```

### Dependencies
- [ ] @supabase/supabase-js
- [ ] react-router-dom
- [ ] [Other project-specific packages]

---

## UI/UX Planning

### Design
- [ ] Choose color scheme (wine-dark theme or custom)
- [ ] Define typography
- [ ] Plan responsive breakpoints
- [ ] Create component library pattern

### Components Needed
- [ ] Layout (Header, Footer, Layout wrapper)
- [ ] Auth forms (Login, Signup, Password reset)
- [ ] Navigation (Sidebar, Breadcrumbs, etc.)
- [ ] UI components (Buttons, Cards, Modals, Forms)
- [ ] Feedback (Toasts, Loading states, Error messages)

---

## Authentication Flow

- [ ] Sign up flow
- [ ] Sign in flow
- [ ] Sign out flow
- [ ] Password reset flow
- [ ] Protected route wrapper
- [ ] Auth context/provider
- [ ] Session management

---

## Payment Setup (If Applicable)

### Stripe
- [ ] Create Stripe account
- [ ] Get API keys (publishable and secret)
- [ ] Create products/prices in Stripe
- [ ] Set up webhook endpoint
- [ ] Create Edge Function for webhook handling

### Database
- [ ] Create payments table
- [ ] Create subscriptions table
- [ ] Create plans table
- [ ] Set up RLS policies

---

## Security Checklist

### RLS Policies
- [ ] All tables have RLS enabled
- [ ] Users can only access their own data
- [ ] Admin-only resources protected
- [ ] Public resources properly configured
- [ ] Test policies with different user roles

### API Security
- [ ] No API keys in client code
- [ ] Environment variables for secrets
- [ ] Edge Functions for sensitive operations
- [ ] Input validation on both client and server
- [ ] CORS properly configured

---

## Testing Plan

### Unit Testing
- [ ] Set up testing framework (Vitest)
- [ ] Test utility functions
- [ ] Test components

### Integration Testing
- [ ] Test auth flow
- [ ] Test data operations
- [ ] Test payment flow (if applicable)

### Manual Testing
- [ ] Test all user flows
- [ ] Test on mobile devices
- [ ] Test error scenarios
- [ ] Test with different user roles

---

## Deployment Plan

### Frontend (Vercel)
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy to production

### Backend (Supabase)
- [ ] Push migrations: `supabase db push`
- [ ] Deploy Edge Functions
- [ ] Set environment variables in dashboard
- [ ] Configure custom domain (optional)

---

## Post-Launch

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics
- [ ] Configure uptime monitoring
- [ ] Set up alerts for failures

### Maintenance
- [ ] Plan regular backups
- [ ] Document update procedures
- [ ] Create runbook for common issues
- [ ] Plan for scaling

---

## Optional Features

### Phase 2 Features (Post-MVP)
- [ ] Real-time updates
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] API access for users
- [ ] Integrations (Zapier, etc.)

### Phase 3 Features (Growth)
- [ ] Multi-language support
- [ ] Advanced search
- [ ] Export functionality
- [ ] Mobile apps
- [ ] White-label options

---

## Cost Estimation

### Fixed Costs
- Domain: ~€10/year
- Vercel Pro: $20/month (optional)
- Supabase Pro: $25/month (optional)

### Variable Costs
- Stripe: 2.9% + $0.30 per transaction
- Supabase: Based on usage (database, storage, bandwidth)
- Third-party APIs: varies

### Projected Monthly Burn Rate
- Development: €[YOUR_HOURLY_RATE * HOURS]
- Hosting: €[SUM]
- APIs: €[SUM]
- **Total**: €[TOTAL]

---

## Success Metrics

### Launch Goals
- [ ] Target: [X] signups in first month
- [ ] Target: [X]% conversion free to paid
- [ ] Target: [X] active users per week
- [ ] Target: €[X] MRR in 3 months

### Tracking
- [ ] Set up analytics (PostHog, Plausible, etc.)
- [ ] Define funnel events
- [ ] Create dashboards
- [ ] Schedule weekly reviews

---

## Documentation

- [ ] README with setup instructions
- [ ] API documentation (if applicable)
- [ ] User guide
- [ ] Admin documentation
- [ ] Change log

---

## Ready to Start?

When all critical items are checked, you're ready to begin development!

Start with:
1. **Phase 1**: Foundation Framework
2. **Phase 2**: Authentication
3. **Phase 3**: Data & Dashboards

Good luck with your project! 🚀
