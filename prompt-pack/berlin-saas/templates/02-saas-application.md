---
title: "SaaS Application Template"
description: "Complete SaaS template for B2B tools, productivity apps, and automation platforms"
category: "Template"
tags: ["saas", "subscription", "usage-tracking", "api-keys"]
difficulty: "Beginner"
timeRequired: "15-25 hours"
dependencies: ["Phase 1", "Phase 2", "Phase 3", "Phase 4A"]
---

# SaaS Application Template

> For: B2B tools, productivity apps, automation platforms

---

## Quick Start

Use this template with the [Foundation Framework](../phases/01-foundation-framework.md).

---

## Business Context

```yaml
Target:
  Professionals and businesses looking for productivity tools

Business Model:
  Freemium with tiered subscriptions

Primary Goal:
  Get users to subscribe to Pro plan ($29-99/mo)
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Public | View pricing, features, documentation |
| Free User | Core features, usage limits |
| Pro User | All features, higher limits, priority support |
| Enterprise User | Everything + custom integrations, dedicated support |
| Admin | Full platform access |

---

## Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| Free | €0 | 5 [unit]/month, email support |
| Basic | €29/mo | 50 [unit]/month, priority support |
| Pro | €99/mo | Unlimited [unit], API access, dedicated support |
| Enterprise | Custom | Everything + custom SLA |

---

## Core Pages

### Public Pages
- Landing page
- Pricing
- Features
- Documentation
- About

### User Pages
- Dashboard
- Usage tracking
- Settings
- Billing/subscription

### Admin Pages
- User management
- Revenue analytics
- Platform metrics

---

## Data Structure

```sql
-- User profiles with role
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'user', -- user, admin
  subscription_tier TEXT DEFAULT 'free', -- free, basic, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT NOT NULL, -- basic, pro, enterprise
  status TEXT DEFAULT 'active', -- active, canceled, past_due
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- api_call, export, etc.
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for B2B integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  name TEXT,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Optional expiration
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting (optional, can use Supabase extensions)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  request_count INTEGER DEFAULT 1,
  UNIQUE(user_id, window_start)
);

-- Feature flags (for gradual rollouts)
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  allowed_user_ids TEXT[], -- Array of user IDs for beta testing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (for compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- login, export, settings_change
  resource TEXT, -- What was affected
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_logs_user_created ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read basic, owner full
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: User read own only
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Usage logs: User read own, insert own
CREATE POLICY "Users can view own usage"
ON usage_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API keys: User CRUD own
CREATE POLICY "Users can manage own api keys"
ON api_keys FOR ALL USING (auth.uid() = user_id);

-- Audit logs: User read own, insert system
CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT WITH CHECK (true);

-- Admin policies (check role in application code or use function)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Example admin policy
CREATE POLICY "Admins can view all subscriptions"
ON subscriptions FOR SELECT USING (is_admin());
```

---

## Key Features

### 1. Usage Tracking & Limits

```typescript
// lib/usage.ts
const LIMITS = {
  free: 50,
  basic: 500,
  pro: -1, // Unlimited
  enterprise: -1
}

export async function checkUsageLimit(userId: string, feature: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const limit = LIMITS[profile.subscription_tier]

  if (limit === -1) return { allowed: true }

  // Get usage for current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', startOfMonth.toISOString())

  return {
    allowed: count < limit,
    used: count,
    limit,
    remaining: limit - count
  }
}

export async function logUsage(userId: string, feature: string, quantity = 1) {
  await supabase.from('usage_logs').insert({
    user_id: userId,
    feature,
    quantity
  })
}
```

### 2. API Key Management

```typescript
// lib/api-keys.ts
import crypto from 'crypto'

export async function createAPIKey(userId: string, name: string) {
  // Generate secure random key
  const key = `sk_${crypto.randomBytes(32).toString('base64url')}`

  // Hash for storage
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))

  // Store
  const { data } = await supabase.from('api_keys').insert({
    user_id: userId,
    key_hash: Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
    key_prefix: key.slice(0, 12) + '...',
    name
  }).select().single()

  // Return full key (only time user sees it)
  return { ...data, full_key: key }
}

export async function verifyAPIKey(key: string) {
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  const hashString = Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join('')

  const { data } = await supabase
    .from('api_keys')
    .select('*, profiles:user_id(subscription_tier)')
    .eq('key_hash', hashString)
    .single()

  if (!data) return null

  // Update last used
  await supabase.from('api_keys')
    .update({ last_used: new Date().toISOString() })
    .eq('id', data.id)

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  return data
}
```

### 3. Middleware for API Routes

```typescript
// supabase/functions/api-endpoint/index.ts
import { verifyAPIKey, checkUsageLimit, logUsage } from '../_shared/usage.ts'

serve(async (req) => {
  // Extract API key from header
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return new Response('Missing API key', { status: 401 })
  }

  // Verify API key
  const keyData = await verifyAPIKey(apiKey)

  if (!keyData) {
    return new Response('Invalid API key', { status: 401 })
  }

  // Check usage limits
  const usage = await checkUsageLimit(keyData.user_id, 'api_call')

  if (!usage.allowed) {
    return new Response(
      JSON.stringify({ error: 'Usage limit exceeded', limit: usage.limit }),
      { status: 429 }
    )
  }

  // Process request...

  // Log usage
  await logUsage(keyData.user_id, 'api_call')

  return new Response(JSON.stringify({ data: '...' }))
})
```

### 4. Subscription Management

```typescript
// components/SubscriptionManager.tsx
export function SubscriptionManager() {
  const [subscription, setSubscription] = useState(null)
  const [portalUrl, setPortalUrl] = useState('')

  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .single()

    setSubscription(data)
  }

  async function openCustomerPortal() {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`
        }
      }
    )

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <div className="subscription-manager">
      <h2>Subscription</h2>
      <p>Current Plan: <strong>{subscription?.plan_id}</strong></p>
      <p>Status: <strong>{subscription?.status}</strong></p>

      {subscription?.cancel_at_period_end && (
        <p className="warning">Your subscription will cancel at period end</p>
      )}

      <button onClick={openCustomerPortal}>
        Manage Subscription
      </button>
    </div>
  )
}
```

---

## Dashboard Widgets

### User Dashboard

```typescript
// components/UserDashboard.tsx
export function UserDashboard() {
  const [usage, setUsage] = useState({ used: 0, limit: 50 })

  useEffect(() => {
    loadUsage()
  }, [])

  async function loadUsage() {
    const { data: { user } } = await supabase.auth.getUser()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const limit = LIMITS[profile.subscription_tier]

    setUsage({
      used: count || 0,
      limit
    })
  }

  const percentage = usage.limit === -1 ? 0 : (usage.used / usage.limit) * 100

  return (
    <div className="dashboard">
      <div className="usage-widget">
        <h3>Usage This Month</h3>
        {usage.limit === -1 ? (
          <p className="unlimited">Unlimited</p>
        ) : (
          <>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${percentage}%` }} />
            </div>
            <p>{usage.used} / {usage.limit} ({Math.round(percentage)}%)</p>
          </>
        )}
      </div>

      <div className="quick-actions">
        <button>New Project</button>
        <button>View Documentation</button>
        <button>Get API Keys</button>
      </div>
    </div>
  )
}
```

---

## Feature Flags

```typescript
// lib/features.ts
export async function isFeatureEnabled(featureName: string, userId: string) {
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('name', featureName)
    .single()

  if (!flag || !flag.enabled) return false

  // Check if user is in allowed list
  if (flag.allowed_user_ids?.includes(userId)) return true

  // Check rollout percentage
  if (flag.rollout_percentage < 100) {
    // Hash user ID to get consistent result
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(userId + featureName)
    )
    const value = new Uint8Array(hash)[0] / 255
    return value <= (flag.rollout_percentage / 100)
  }

  return true
}

// Usage in component
export function BetaFeature() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      const result = await isFeatureEnabled('new-export', user.id)
      setEnabled(result)
    }
    check()
  }, [])

  if (!enabled) return null

  return <div>New Feature!</div>
}
```

---

## Audit Logging

```typescript
// lib/audit.ts
export async function logAudit(
  userId: string,
  action: string,
  resource?: string,
  details?: any
) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    details
  })
}

// Usage
await logAudit(
  user.id,
  'export',
  'projects',
  { format: 'csv', count: 25 }
)
```

---

## Webhook Handler (Stripe)

```typescript
// supabase/functions/stripe-webhook/index.ts
import { stripe } from '../_shared/stripe.ts'

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      await supabase.from('subscriptions').upsert({
        user_id: subscription.metadata.userId,
        plan_id: subscription.items.data[0].price.lookup_key,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_subscription_id: subscription.id
      })

      // Update profile tier
      await supabase.from('profiles')
        .update({ subscription_tier: subscription.items.data[0].price.lookup_key })
        .eq('id', subscription.metadata.userId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)

      await supabase.from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('id', subscription.metadata.userId)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }))
})
```

---

## What's Next

1. Set up Stripe products and prices
2. Deploy webhook handler
3. Implement usage tracking UI
4. Add API key management
5. Set up monitoring and alerts

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
