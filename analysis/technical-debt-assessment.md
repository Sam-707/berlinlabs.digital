# Technical Debt Assessment - Critical Blockers

> **Generated**: 2026-02-11
> **Purpose**: Prioritize technical issues blocking production launch
> **Scope**: All Lionbridge Digital projects

---

## Executive Summary

| Project | Technical Debt Score | Launch Blocking | Priority |
|---------|---------------------|-----------------|----------|
| 3rbst-platform | LOW (20%) | Legal only | P1 |
| 3rbst-Gemini | LOW (25%) | Legal only | P1 |
| MenuFlows | **HIGH (30%)** | **Payments + Tests** | **P0** |
| 3rbst-new-workflow | MEDIUM (40%) | Incomplete | P2 |

---

## MenuFlows - Critical Technical Debt

### P0 - Launch Blockers (Must Fix Before Launch)

#### 1. No Payment Integration 🔴

**Severity**: CRITICAL
**Impact**: ZERO REVENUE
**Effort**: 1-2 weeks
**Risk**: Low (well-documented Stripe integration)

**Current State**:
```typescript
// ❌ NOT IMPLEMENTED
// No Stripe checkout flow
// No webhook handlers
// No subscription management
// Database has subscription_plan column but no payment trigger
```

**Required Implementation**:
```typescript
// 1. Create Stripe products/prices
// 2. Build checkout flow
// 3. Webhook handler for:
//    - customer.subscription.created
//    - customer.subscription.updated
//    - customer.subscription.deleted
//    - invoice.paid
//    - invoice.payment_failed
// 4. Update restaurant subscription_status
// 5. Handle trial → paid transition
```

**Files to Create**:
- `api/create-checkout-session.ts`
- `api/stripe-webhook.ts`
- `components/PricingPage.tsx`
- `lib/stripe.ts`

**Estimate**: 40-60 hours

---

#### 2. Zero Test Coverage 🔴

**Severity**: CRITICAL
**Impact**: HIGH RISK - Production bugs guaranteed
**Effort**: 1-2 weeks
**Risk**: Medium (writing tests takes time)

**Current State**:
```
Test Files: 0
Test Coverage: 0%
```

**Required Coverage Targets**:
| Component Type | Target | Priority |
|----------------|--------|----------|
| Core components (Cart, Menu) | 80%+ | HIGH |
| Payment flow | 90%+ | HIGH |
| API endpoints | 70%+ | HIGH |
| Utilities | 60%+ | MEDIUM |
| UI components | 50%+ | LOW |

**Test Stack**:
- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Supabase test database
- **E2E Tests**: Playwright (optional but recommended)

**Example Test Structure**:
```typescript
// components/__tests__/Cart.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Cart from '../Cart';

describe('Cart', () => {
  it('displays cart items', () => {
    render(<Cart items={[{ id: 1, name: 'Burger', price: 12 }]}/>);
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('€12.00')).toBeInTheDocument();
  });

  it('calculates total correctly', () => {
    // ...
  });
});
```

**Estimate**: 40-60 hours

---

#### 3. No Error Monitoring 🔴

**Severity**: HIGH
**Impact**: NO VISIBILITY - Can't debug production issues
**Effort**: 4-8 hours
**Risk**: Low (standard setup)

**Current State**:
```
Error Monitoring: NONE
Logging: Console.log only
Performance Tracking: NONE
```

**Required Implementation**:
```typescript
// Add to src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    environment: import.meta.env.MODE,
  });
}

// Error Boundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

**Files to Modify**:
- `src/main.tsx` - Initialize Sentry
- `src/components/ErrorBoundary.tsx` - NEW
- `App.tsx` - Wrap with error boundary

**Cost**: $29/mo (Sentry Starter)

**Estimate**: 4-8 hours

---

### P1 - High Priority (Should Fix Soon)

#### 4. No CI/CD Pipeline 🟡

**Severity**: MEDIUM-HIGH
**Impact**: MANUAL DEPLOYMENTS - Slow, error-prone
**Effort**: 8-16 hours
**Risk**: Low (standard GitHub Actions)

**Current State**:
```
CI/CD: NONE
Deployments: Manual (git push)
Tests: Run manually (or not at all)
```

**Required Workflow**:
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint
```

**Benefits**:
- Tests run automatically on PR
- Catch bugs before merge
- Consistent builds
- Deploy preview environments

**Estimate**: 8-16 hours

---

#### 5. No User Authentication 🟡

**Severity**: MEDIUM
**Impact**: NO ORDER HISTORY - Can't retain customers
**Effort**: 1 week
**Risk**: Low (Supabase Auth built-in)

**Current State**:
```typescript
// ❌ Customer accounts NOT IMPLEMENTED
// Only restaurant staff can authenticate with PIN
// Customers are anonymous
```

**Required Implementation**:
```typescript
// Add Supabase Auth for customers
// 1. Sign up / Sign in UI
// 2. Order history page
// 3. Saved favorites
// 4. Reorder functionality
// 5. Password reset flow
```

**Files to Create**:
- `components/AuthModal.tsx`
- `pages/OrderHistory.tsx`
- `lib/auth.ts`

**Database Changes**:
- Add `customer_orders` table
- Add `favorites` table
- RLS policies for customer data

**Estimate**: 40 hours

---

### P2 - Medium Priority (Post-Launch)

#### 6. No SEO Optimization 🟠

**Severity**: LOW-MEDIUM
**Impact**: POOR DISCOVERABILITY
**Effort**: 16-24 hours
**Risk**: Low

**Current State**:
```html
<!-- Minimal meta tags -->
<title>MenuFlows</title>
```

**Required Implementation**:
```typescript
// Dynamic meta tags per restaurant
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{restaurant.name} - Digital Menu</title>
  <meta name="description" content={restaurant.description} />
  <meta property="og:title" content={restaurant.name} />
  <meta property="og:image" content={restaurant.logo_url} />
  <meta property="og:type" content="restaurant" />

  {/* Structured data */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": restaurant.name,
      "address": { ... },
      "menu": [ ... ]
    })}
  </script>
</Helmet>
```

**Files to Modify**:
- `App.tsx` - Add Helmet
- `components/RestaurantMeta.tsx` - NEW
- Create sitemap.xml generator
- Add robots.txt

**Estimate**: 16-24 hours

---

#### 7. Hard-Coded Assets 🟠

**Severity**: LOW
**Impact**: MAINTENANCE ISSUES
**Effort**: 8 hours
**Risk**: Low

**Issues Found**:
```typescript
// ❌ Hard-coded colors, strings, etc.
const accentColor = '#c21e3a'; // Should come from DB
const taxRate = 19.00; // Should come from DB
```

**Fix**:
```typescript
// ✅ Use restaurant settings
const accentColor = restaurant.accent_color;
const taxRate = restaurant.tax_rate;
```

**Most are already in database**, just need to use them consistently.

**Estimate**: 4-8 hours

---

## 3rbst-platform & 3rbst-Gemini Technical Debt

### P0 - Launch Blockers

#### 1. Business Registration 🔴

**Severity**: CRITICAL
**Impact**: LEGAL - Can't operate legally in Germany
**Effort**: 30 minutes + €50-60
**Timeline**: 3-5 days processing

**Action Required**:
```
1. Go to: gewerbeanmeldung-online.de
2. Register Einzelunternehmen
3. Pay €50-60 fee
4. Wait 3-5 days for Gewerbeschein
5. Update legal pages with business info
```

---

#### 2. Legal Pages Outdated 🔴

**Severity**: CRITICAL
**Impact**: LEGAL - GDPR violations
**Effort**: 2-4 hours
**Cost**: €0 (use free generators)

**Files to Update**:
- `/3rbst-platform/public/impressum.html`
- `/3rbst-platform/public/privacy.html`
- `/3rbst-platform/public/terms.html`

**Free Generators**:
- https://www.impressum-generator.de
- https://www.datenschutz-generator.de
- https://www.agb-generator.de

---

### P1 - High Priority

#### 3. WhatsApp Business API Approval 🟡

**Severity**: HIGH (platform only)
**Impact**: CANNOT USE PRODUCTION WHATSAPP
**Effort**: 1-2 hours + approval wait
**Timeline**: 2-4 weeks (Twilio)

**For 3rbst-platform (Twilio)**:
1. Requires business registration FIRST
2. Submit WhatsApp Business Profile
3. Wait for approval (2-4 weeks)
4. Template approval for message templates

**For 3rbst-Gemini (Evolution API)**:
- ✅ NO approval needed
- ✅ Works immediately
- ✅ Self-hosted

**Recommendation**: Use Evolution API in unified version

---

## Debt by Project

### MenuFlows

| Issue | Priority | Effort | Blocker? |
|-------|----------|--------|----------|
| Stripe payments | P0 | 1-2 weeks | YES |
| Test coverage | P0 | 1-2 weeks | YES |
| Error monitoring | P0 | 4-8 hours | YES |
| CI/CD | P1 | 1-2 days | NO |
| User auth | P1 | 1 week | NO |
| SEO | P2 | 2-3 days | NO |
| Hard-coded assets | P2 | 4-8 hours | NO |

**Total to Launch**: 4-6 weeks

---

### 3rbst-platform

| Issue | Priority | Effort | Blocker? |
|-------|----------|--------|----------|
| Business registration | P0 | €50-60, 3-5 days | YES |
| Legal pages update | P0 | 2-4 hours | YES |
| Twilio approval | P1 | 2-4 weeks | NO (use sandbox) |

**Total to Launch**: 7-10 days after registration

---

### 3rbst-Gemini

| Issue | Priority | Effort | Blocker? |
|-------|----------|--------|----------|
| Business registration | P0 | €50-60, 3-5 days | YES |
| Legal pages update | P0 | 2-4 hours | YES |
| Evolution API setup | P1 | 1-2 days | NO |

**Total to Launch**: 7-10 days after registration

---

## Recommended Fix Order

### Phase 1: Launch 3rbst-unified (Week 1-2)
1. Register business (€50-60, 3-5 days)
2. Update all legal pages (2-4 hours)
3. Set up Evolution API on VPS (1 day)
4. Deploy unified version to Vercel (4 hours)
5. Test with beta users (2-3 days)

**Timeline**: 10-14 days

---

### Phase 2: Fix MenuFlows Critical Issues (Week 3-8)
**Parallel workstreams**:

**Stream A** (Week 3-4):
- Stripe integration (1-2 weeks)

**Stream B** (Week 3-4):
- Test suite setup + critical tests (1-2 weeks)

**Stream C** (Week 5):
- Error monitoring + CI/CD (2-3 days)

**Week 6-8**:
- Beta testing with 3 restaurants
- Bug fixes
- Performance tuning

**Timeline**: 4-6 weeks

---

### Phase 3: MenuFlows Improvements (Month 3-4)
1. User authentication
2. SEO optimization
3. Admin dashboard enhancements

---

## Cost to Fix All Technical Debt

| Item | Cost |
|------|------|
| Business registration | €50-60 (one-time) |
| Sentry monitoring | $29/mo |
| Vercel Pro (if needed) | €20/mo |
| Supabase Pro | €25/mo |
| **Monthly Fixed** | **~€74-114/mo** |
| **Development Time** | **0 (founder work)** |

---

## Risk Assessment

### High Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe integration takes longer | 30% | Launch delay | Start early, use docs |
| Test writing too slow | 40% | Launch delay | Focus on critical paths first |
| Supabase RLS bugs | 20% | Data leak | Thorough testing |
| Twilio approval denied | 10% | Use Evolution API instead | Already planned |

---

## Success Criteria

### Technical Debt Resolution

| Project | Target | Measure |
|----------|--------|---------|
| 3rbst-unified | Legal compliant | Business registered + pages updated |
| MenuFlows | Production ready | Payments + 70% test coverage |
| All projects | Monitored | Sentry installed + configured |

---

## Next Actions

### This Week
- [ ] Register business for 3rbst
- [ ] Start MenuFlows Stripe integration
- [ ] Set up Sentry for all projects
- [ ] Create CI/CD workflow

### Next 2 Weeks
- [ ] Complete 3rbst-unified build
- [ ] Deploy and test 3rbst-unified
- [ ] Complete Stripe payments
- [ ] Write critical tests for MenuFlows

### Next Month
- [ ] Launch 3rbst-unified publicly
- [ ] Complete MenuFlows test suite
- [ ] Onboard MenuFlows beta restaurants
- [ ] Fix all P0 issues

---

**Last Updated**: 2026-02-11
**Status**: Active work in progress
**Next Review**: After 3rbst-unified launch
