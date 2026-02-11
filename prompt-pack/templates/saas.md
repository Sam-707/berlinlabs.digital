# SaaS Application Template

Ready-to-use template for building SaaS applications.

---

## Quick Start

Copy and paste this prompt when starting a new SaaS project:

```
You are a Full-Stack SaaS Architect building a subscription-based SaaS application.

BUSINESS CONTEXT:
- Target: [YOUR TARGET USERS - e.g., Freelancers, Small businesses, Developers]
- Problem: [THE PROBLEM YOU'RE SOLVING]
- Solution: [YOUR SOLUTION]
- Business Model: FREEMIUM with tiered subscriptions
- Primary Goal: Get users to sign up for free, then convert to paid subscription

USER ROLES:
- Public: Landing page, pricing, features
- Users: Access core features with usage limits based on tier
- Admin: Manage users, subscriptions, platform analytics

CORE PAGES:
- / - Landing page with hero, features, social proof
- /pricing - Tier comparison and checkout
- /dashboard - Main application interface
- /dashboard/[FEATURE] - Core feature pages
- /dashboard/settings - User settings and subscription
- /admin - Admin dashboard for platform management

DATA STRUCTURE:
- users (Supabase auth.users)
- profiles (user profiles with subscription_tier)
- subscriptions (subscription status and plan)
- usage_logs (track feature usage for billing limits)
- [RESOURCE_1] (your core data entity)
- [RESOURCE_2] (your core data entity)

SUBSCRIPTION TIERS:
- Free: [X] [UNIT] per month, basic features
- Basic: €[X]/month, [X] [UNIT] per month, pro features
- Pro: €[X]/month, unlimited [UNIT], all features

SECURITY RULES:
- Users can only access their own data
- Usage limited by subscription tier
- Check subscription tier before allowing access to features
- Admin full access to all resources

FEATURES:
- Tiered pricing with feature comparison
- Usage tracking dashboard
- Upgrade prompts when limits reached
- Subscription management (upgrade/downgrade/cancel)
- Core SaaS feature: [DESCRIBE MAIN FEATURE]

DELIVERABLES:
1. Complete database migrations with RLS
2. Authentication flow (email + Google OAuth)
3. User dashboard with usage tracking
4. Pricing page with Stripe Checkout
5. Subscription management
6. Admin dashboard
7. Core [FEATURE] implementation

Please generate the complete code for this SaaS application.
```

---

## Customization Guide

### Define Your SaaS

Replace the placeholders with your specific details:

| Placeholder | Description | Example |
|------------|-------------|---------|
| `[YOUR TARGET USERS]` | Who will use this? | "Content creators who need to analyze documents" |
| `[THE PROBLEM]` | What pain point? | "Manual document analysis is time-consuming" |
| `[YOUR SOLUTION]` | How do you solve it? | "AI-powered document analysis" |
| `[FEATURE]` | Main feature? | "Upload and analyze documents" |
| `[RESOURCE_1]` | Data entity? | "documents, analyses" |
| `[UNIT]` | Usage metric? | "analyses, API calls, documents" |
| `[X]` | Numbers | "5, 50, 200" |

---

## Common SaaS Patterns

### 1. Usage Tracking Pattern

```typescript
// Track usage and enforce limits
async function useFeature(userId: string, feature: string) {
  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .single()

  const tier = profile.subscription_tier

  // Get tier limits
  const limits = {
    free: 5,
    basic: 50,
    pro: Infinity
  }

  const limit = limits[tier]

  if (limit === Infinity) {
    // Unlimited usage
    return { allowed: true }
  }

  // Check current month usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: usage } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', startOfMonth.toISOString())

  if (usage >= limit) {
    return { allowed: false, limit, current: usage }
  }

  // Log usage
  await supabase.from('usage_logs').insert({
    user_id: userId,
    feature,
    tier
  })

  return { allowed: true, limit, current: usage + 1 }
}
```

### 2. Feature Flags Pattern

```typescript
// Check if user has access to feature
const TIER_FEATURES = {
  free: ['basic_feature'],
  basic: ['basic_feature', 'pro_feature_1'],
  pro: ['basic_feature', 'pro_feature_1', 'pro_feature_2', 'api_access']
}

function hasFeature(tier: string, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature) || false
}

// Usage
if (hasFeature(user.subscription_tier, 'api_access')) {
  // Show API access features
}
```

### 3. Upgrade Prompt Pattern

```typescript
// Show upgrade prompt when limit reached
function UsagePrompt({ usage, limit, tier }: { usage: number; limit: number; tier: string }) {
  const percentage = (usage / limit) * 100

  if (percentage >= 100) {
    return (
      <div className="upgrade-prompt limit-reached">
        <p>You've reached your {tier} plan limit ({usage}/{limit})</p>
        <button onClick={() => navigate('/pricing')}>
          Upgrade to continue
        </button>
      </div>
    )
  }

  if (percentage >= 80) {
    return (
      <div className="usage-warning">
        <p>You've used {usage} of {limit} {tier} plan credits</p>
      </div>
    )
  }

  return null
}
```

---

## Pricing Page Template

```typescript
// src/pages/public/PricingPage.tsx
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      `${process.env.VITE_FREE_LIMIT || 5} [UNIT]/month`,
      'Basic features',
      'Community support'
    ],
    cta: 'Get Started'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    interval: 'month',
    features: [
      `50 [UNIT]/month`,
      'All basic features',
      'Pro feature 1',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited [UNIT]',
      'All features',
      'API access',
      'Priority support',
      'Custom integrations'
    ],
    cta: 'Start Free Trial'
  }
]

export function PricingPage() {
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      <p className="subtitle">Start free, upgrade when you need more</p>
      <div className="pricing-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <span className="badge">Most Popular</span>}
            <h2>{plan.name}</h2>
            <p className="price">
              €{plan.price}
              <span className="interval">/{plan.interval}</span>
            </p>
            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <CheckoutButton planId={plan.id} price={plan.price}>
              {plan.cta}
            </CheckoutButton>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Database Schema Template

```sql
-- User profiles with subscription
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core [RESOURCE] table
CREATE TABLE public.[RESOURCE] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_logs_user_feature_month ON public.usage_logs(user_id, feature, created_at);
CREATE INDEX idx_[RESOURCE]_user ON public.[RESOURCE](user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.[RESOURCE] ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own [RESOURCE]" ON public.[RESOURCE] FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own [RESOURCE]" ON public.[RESOURCE] FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Common SaaS Features by Type

| SaaS Type | Key Features | Example |
|-----------|--------------|---------|
| **Analytics** | Dashboards, reports, exports | Google Analytics alternative |
| **Automation** | Workflows, triggers, integrations | Zapier alternative |
| **Communication** | Messaging, notifications, channels | Slack alternative |
| **Content** | CMS, editor, publishing | CMS alternative |
| **CRM** | Contacts, deals, pipelines | Salesforce alternative |
| **Development** | Code hosting, CI/CD, deployments | GitHub alternative |
| **Design** | Canvas, templates, collaboration | Figma alternative |
| **Documentation** | Wikis, docs, knowledge base | Notion alternative |
| **Project Management** | Tasks, projects, teams | Asana alternative |
| **Storage** | File storage, sharing, sync | Dropbox alternative |

---

## Next Steps

1. **Customize the template** with your specific details
2. **Run through Phases 1-4** to build the foundation
3. **Add your unique features** that differentiate your SaaS
4. **Deploy and iterate** based on user feedback

---

## See Also

- [Marketplace Template](./marketplace.md) - For two-sided platforms
- [Content Platform Template](./content.md) - For UGC platforms
- [Booking System Template](./booking.md) - For appointment-based SaaS
