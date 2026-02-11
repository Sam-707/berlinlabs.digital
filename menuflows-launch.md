# MenuFlows Launch Plan

**Product Status:** 70% Complete
**Time to Launch:** 4-6 weeks (post-validation)
**Target Market:** 50K restaurants (DACH region)
**Pricing:** €29-49/month

---

## Overview

This plan covers the complete launch process for MenuFlows, from Stripe integration through beta launch to scaling.

---

## Phase 1: Technical Foundation (Week 1-2)

### Stripe Integration Checklist

#### Week 1: Account Setup & Configuration

**Stripe Account Setup:**
- [ ] Create Stripe account (Germany)
- [ ] Complete business verification
- [ ] Add bank account for payouts
- [ ] Enable SEPA Direct Debit (for German customers)
- [ ] Configure tax settings (19% VAT for Germany)

**Product Configuration:**
- [ ] Create products in Stripe Dashboard
  - [ ] Starter Plan: €29/month
  - [ ] Professional Plan: €49/month
  - [ ] Enterprise Plan: Custom pricing
- [ ] Set up pricing pages with proper tax display
- [ ] Configure trial period logic (3 months free for beta users)
- [ ] Create coupons for early adopters

**Webhook Configuration:**
- [ ] Set up webhook endpoints
  - [ ] `checkout.session.completed` - New subscription
  - [ ] `customer.subscription.created` - Subscription started
  - [ ] `customer.subscription.updated` - Plan changes
  - [ ] `customer.subscription.deleted` - Cancellations
  - [ ] `invoice.paid` - Payment success
  - [ ] `invoice.payment_failed` - Payment retry needed
- [ ] Implement webhook signature verification
- [ ] Test all webhook handlers

#### Week 2: Implementation

**Checkout Flow:**
```
User Flow:
1. Restaurant signs up → Creates account
2. Onboarding wizard → Adds menu items
3. Dashboard → "Go Live" button
4. Stripe Checkout → Enters payment details
5. Subscription activated → QR code generated
6. Welcome email sent
```

**Code Tasks:**
- [ ] Install Stripe SDK
  ```bash
  npm install @stripe/stripe-js stripe
  ```
- [ ] Create checkout session API endpoint
- [ ] Implement customer portal (for plan changes/cancellations)
- [ ] Build subscription management UI
- [ ] Add usage metrics tracking (active restaurants, menus served)
- [ ] Implement dunning logic (payment failure handling)

**Database Schema Updates:**
```sql
-- Add to restaurants table
ALTER TABLE restaurants ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE restaurants ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE restaurants ADD COLUMN subscription_status TEXT;
ALTER TABLE restaurants ADD COLUMN subscription_plan TEXT;
ALTER TABLE restaurants ADD COLUMN trial_end_date TIMESTAMPTZ;
ALTER TABLE restaurants ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
```

**Security:**
- [ ] Add Stripe webhook secret to environment variables
- [ ] Implement webhook signature verification
- [ ] Add rate limiting for checkout endpoint
- [ ] Implement customer authentication checks

---

## Phase 2: Testing & Infrastructure (Week 3)

### Testing Checklist

**Functional Testing:**
- [ ] Complete signup flow test
- [ ] Stripe checkout test (in test mode)
- [ ] Trial period activation test
- [ ] QR code generation test
- [ ] Menu display test (scan QR → view menu)
- [ ] Admin dashboard test (CRUD operations)
- [ ] Subscription upgrade/downgrade test
- [ ] Cancellation flow test

**Payment Testing:**
- [ ] Successful payment test
- [ ] Failed payment test (test decline)
- [ ] Refund test
- [ ] Subscription pause/resume test (if applicable)
- [ ] Invoice generation test

**Integration Testing:**
- [ ] Test all webhooks with Stripe CLI
- [ ] End-to-end: signup → payment → QR generation → menu view
- [ ] Test multi-restaurant account (if supported)
- [ ] Test menu update flow (update reflects immediately)

### Infrastructure Setup

**Vercel Pro Upgrade:**
- [ ] Upgrade to Vercel Pro (€20/month)
- [ ] Configure custom domains
- [ ] Set up environment variables for production
- [ ] Enable analytics

**Monitoring & Error Tracking:**
- [ ] Set up Sentry (free tier - $0)
  - [ ] Add Sentry SDK to frontend
  - [ ] Add Sentry SDK to backend
  - [ ] Configure error alerts
  - [ ] Set up performance monitoring
- [ ] Set up Vercel Analytics
- [ ] Configure log retention

**Domain & Email:**
- [ ] Purchase domain: menuflows.de (€10-15/year)
- [ ] Set up email: [hello@menuflows.de](mailto:hello@menuflows.de)
- [ ] Configure email provider (Resend, SendGrid, or AWS SES)
- [ ] Set up email templates (welcome, payment received, payment failed)

---

## Phase 3: Legal & Compliance (Week 3-4)

### Legal Requirements

**Essential Pages:**
- [ ] **Impressum** (German legal requirement)
  - [ ] Business owner name
  - [ ] Address (use virtual office if needed)
  - [ ] Contact email
  - [ ] VAT ID (if registered)
- [ ] **Datenschutzerklärung** (GDPR/Privacy Policy)
  - [ ] Data collection description
  - [ ] Data storage details
  - [ ] User rights (access, deletion, export)
  - [ ] Cookie policy
- [ ] **AGB** (Terms of Service)
  - [ ] Service description
  - [ ] Payment terms
  - [ ] Liability limitations
  - [ ] Cancellation policy
- [ ] **Widerrufsbelehrung** (Cancellation policy for online services - optional for B2B)

**Data Protection:**
- [ ] Cookie consent banner (use Cookiebot or custom)
- [ ] Privacy policy link in footer
- [ ] Data export functionality (GDPR right)
- [ ] Data deletion functionality (GDPR right)
- [ ] Secure data storage (Supabase RLS already configured)

**Template Cost:**
- [ ] Use Standard IT-Muster AGB/GDPR templates: €50-100
- [ ] Or use generated templates with legal review: €100-200

---

## Phase 4: Beta Launch (Week 4-5)

### Beta Restaurant Recruitment

**Target:** 3-5 restaurants for initial beta

**Selection Criteria:**
- [ ] Restaurants you can visit in person (Berlin preferred)
- [ ] Different cuisines (to test flexibility)
- [ ] Owner/operator available for feedback
- [ ] Willing to commit 2-4 weeks of testing

**Onboarding Checklist:**

#### Pre-Launch (Per Restaurant)
- [ ] Initial discovery call (15 min)
  - [ ] Understand current menu structure
  - [ ] Identify pain points
  - [ ] Set expectations
- [ ] Account creation
  - [ ] Create restaurant account
  - [ ] Generate login credentials
- [ ] Menu setup
  - [ ] Collect menu data (photos, prices, descriptions)
  - [ ] Input menu into system
  - [ ] Review menu together
- [ ] QR code generation
  - [ ] Generate unique QR code
  - [ ] Download printable QR code assets
  - [ ] Help with placement in restaurant

#### Launch Day
- [ ] On-site visit
- [ ] Place QR codes on tables/counter
- [ ] Train staff on how it works
- [ ] Test scan flow (on multiple phones)
- [ ] Provide WhatsApp support contact

#### Post-Launch Support (Weeks 1-2)
- [ ] Daily check-in (first 3 days)
- [ ] Weekly feedback call
- [ ] Monitor for bugs/issues
- [ ] Collect testimonials
- [ ] Iterate based on feedback

### Beta Offer Terms

**Beta Deal:**
- [ ] 3 months free (€0)
- [ ] No credit card required
- [ ] All features included
- [ ] Priority support
- [ ] After 3 months: 50% off for first 6 months

**Commitment Required:**
- [ ] Use the system actively
- [ ] Provide feedback weekly
- [ ] Allow use as case study (with attribution)

---

## Phase 5: Marketing & Growth (Week 5-8)

### Marketing Playbook

**Channel 1: Direct Sales (Primary)**

**Target Restaurants:**
- [ ] Independent restaurants (not chains)
- [ ] Areas: Berlin-Mitte, Kreuzberg, Prenzlauer Berg, Friedrichshain
- [ ] Cuisines: Any (diversity helps credibility)

**Outreach Script:**
```
"Hi, I'm [Name], founder of MenuFlows.

We've built a simple QR menu system for restaurants.
Your customers can scan a code and see your menu on their phone -
no app download needed.

I'm looking for 5 restaurants to try it free for 3 months.
No credit card required.

Would you be open to a 10-minute demo this week?"
```

**Follow-Up Script:**
```
"Hi [Name], following up on my message about MenuFlows.

I can stop by for 10 minutes to show you how it works.
Would [Day] at [Time] work?

If now isn't the right time, no worries - I'll follow up next month.
```

**Target Numbers:**
- [ ] Visit 100 restaurants over 2 months
- [ ] Goal: 20% trial rate (20 trials)
- [ ] Goal: 50% conversion to paid (10 paying customers)

**Channel 2: Google Ads (Secondary)**

**Campaign Setup:**
- [ ] Budget: €200-300/month
- [ ] Keywords: "QR Speisekarte", "digitale Speisekarte Berlin", "QR menu restaurant"
- [ ] Geo-targeting: Berlin only initially
- [ ] Ad copy emphasis: "Keine Kreditkarte erforderlich", "3 Monate kostenlos"

**Channel 3: Restaurant Partnerships**

**Partnership Opportunities:**
- [ ] Restaurant supply companies (POS systems, payment processors)
- [ ] Food delivery platforms (integration opportunity)
- [ ] Restaurant associations (Gastgewerbe)

**Referral Program:**
- [ ] Offer: 1 month free for each successful referral
- [ ] Create referral code system
- [ ] Add referral tracking to dashboard

---

## Phase 6: Pricing & Monetization

### Pricing Structure

| Plan | Price | Features | Target |
|------|-------|----------|--------|
| **Starter** | €29/month | 1 restaurant, 50 menu items, QR codes, basic support | Small cafes, individual locations |
| **Professional** | €49/month | 2 restaurants, 200 items, QR + QR + branded, priority support | Multi-location, growing chains |
| **Enterprise** | Custom | Unlimited restaurants, white-label, API access, dedicated support | Larger chains, franchises |

### Pricing Psychology

**Anchoring:**
- Show Professional as "Recommended" (most popular)
- Highlight savings vs. competitors (often €100+/month)

**Discounts:**
- [ ] Annual: 2 months free (17% discount)
- [ ] Beta users: 50% off for first 6 months
- [ ] Multi-year: negotiable for enterprise

---

## Metrics & KPIs

### Weekly Metrics to Track

| Metric | Month 1 Target | Month 3 Target | Month 6 Target |
|--------|----------------|----------------|----------------|
| Active Restaurants | 5 | 10 | 25-50 |
| MRR | €0 (beta) | €290 | €825-1,750 |
| Trial Start Rate | - | 20% | 20% |
| Trial-to-Paid | - | 20% | 25% |
| Churn (monthly) | - | <10% | <10% |
| NPS Score | - | 4.0+ | 4.5+ |
| Avg. Menu Views/Restaurant | - | 100 | 200+ |

### Monitoring Setup

**Dashboard Metrics:**
- [ ] New signups
- [ ] Active restaurants (logged in last 7 days)
- [ ] Menu views (per restaurant)
- [ ] MRR & ARPU
- [ ] Trial conversions
- [ ] Churn rate

**Alerts:**
- [ ] Revenue drops >10% week-over-week
- [ ] Churn spikes >15% in a month
- [ ] Error rate >1% on checkout

---

## Launch Timeline Summary

```
Week 1:      Stripe account setup, product configuration
Week 2:      Stripe integration implementation
Week 3:      Testing, infrastructure setup, legal pages
Week 4:      Legal compliance, beta recruitment start
Week 5:      Beta launch (3-5 restaurants)
Week 6:      Beta support, feedback collection
Week 7-8:    Iteration based on feedback, start outreach for more users
Month 3-6:  Scale to 10-50 restaurants, optimize conversion
```

---

## Resource Requirements

### Upfront Investment

| Item | Cost | Notes |
|------|------|-------|
| Vercel Pro (first month) | €20 | Infrastructure |
| Domain (menuflows.de) | €15 | First year |
| Legal templates | €100 | Impressum, AGB, GDPR |
| Google Ads (Month 1) | €200 | Validation phase |
| **Total Upfront** | **€335** | One-time costs |

### Monthly Costs (Post-Launch)

| Item | Cost | Notes |
|------|------|-------|
| Vercel Pro | €20 | Hosting |
| Sentry | €0 | Free tier |
| Domain | €1.25 | Amortized |
| Email (Resend) | €0-20 | Free tier to paid |
| **Total Monthly** | **€21-41** | Fixed costs |

### Time Commitment

| Phase | Hours/Week | Duration | Activities |
|-------|------------|----------|-------------|
| Stripe Integration | 15-20 | 2 weeks | Dev work, testing |
| Beta Launch | 10-15 | 2 weeks | Onboarding, support |
| Marketing & Growth | 10-15 | Ongoing | Outreach, sales |
| Support & Iteration | 5-10 | Ongoing | Bug fixes, features |

**Average: 10-15 hours/week**

---

## Success Criteria

### Month 1-2 (Beta Phase)
- [ ] 3-5 restaurants successfully onboarded
- [ ] <3 critical bugs found
- [ ] Positive feedback from 80%+ beta users
- [ ] Clear use case validated

### Month 3-6 (Launch Phase)
- [ ] 10+ paying restaurants
- [ ] MRR >€290
- [ ] Churn <10% monthly
- [ ] NPS >4.0
- [ ] 50+ trial starts

### Month 6+ (Scale Phase)
- [ ] 25-50 active restaurants
- [ ] MRR €825-1,750
- [ ] Repeatable sales process
- [ ] Self-serve onboarding works
- [ ] NPS >4.5

---

## Risk Mitigation

### Technical Risks

**Risk:** Stripe integration bugs
**Mitigation:** Test thoroughly in test mode, use Stripe CLI for webhook testing

**Risk:** QR code scan issues
**Mitigation:** Test on multiple devices, provide backup menu URL

**Risk:** Downtime
**Mitigation:** Vercel has 99.99% uptime, implement monitoring

### Business Risks

**Risk:** Low trial-to-paid conversion
**Mitigation:** Collect feedback during trial, adjust pricing/features as needed

**Risk:** High churn
**Mitigation:** Focus on onboarding quality, provide excellent support, add features that increase stickiness

**Risk:** Competitor enters market
**Mitigation:** Move fast, establish brand, focus on simplicity and support

---

## Next Steps After Validation

If validation is successful (Green Light):

1. [ ] Create Stripe account (Day 1)
2. [ ] Begin integration (Day 2)
3. [ ] Order legal templates (Day 3)
4. [ ] Set up infrastructure (Day 5)
5. [ ] Recruit beta restaurants (Week 2)
6. [ ] Launch beta (Week 4-5)

---

## Appendix: Contact Templates

### Email Template: Beta Invitation

```
Subject: 3 Monate kostenloses QR-Menüsystem für [Restaurant Name]

Hallo [Name],

Ich bin [Dein Name], Gründer von MenuFlows.

Wir haben ein einfaches QR-Menüsystem für Restaurants entwickelt.
Ihre Gäste können einen Code scannen und Ihre Speisekarte auf ihrem
Handy sehen - keine App-Installation nötig.

Ich suche 5 Restaurants, die es 3 Monate lang kostenlos testen.
Keine Kreditkarte erforderlich.

Hätten Sie Zeit für eine 10-minütige Demo diese Woche?

Viele Grüße,
[Dein Name]
MenuFlows
[Telefon]
[Email]
```

### Email Template: Trial to Paid Conversion

```
Subject: Ihr Probeablauf läuft bald ab - So geht es weiter

Hallo [Name],

Ihr 3-monatiger Probezeitraum bei MenuFlows endet am [Datum].

Ich hoffe, das System hat Ihnen gut gefallen!

Um Ihren Account fortzusetzen, können Sie hier einen Plan wählen:
[Link zu Preisseite]

Als Beta-Kunde erhalten Sie 50% Rabatt für die ersten 6 Monate.
Ihr Preis: Nur €14,50/month (statt €29).

Nutzen Sie den Code: BETALAUNCH50

Haben Sie Fragen? Antworten Sie einfach auf diese E-Mail.

Viele Grüße,
[Dein Name]
MenuFlows
```

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Owner:** [Name]
