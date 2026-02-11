# Phase 4: Common Features

---

## Prompt 4A - Stripe Payments

Add subscription or one-time payments with Stripe Checkout.

---

## Requirements

- Use Stripe Checkout for payments
- Supabase Edge Function for payment processing
- Webhook handler for payment.success events
- Store payment records in payments table
- Handle subscription management (cancel, update)

---

## Flow

```
1. User clicks pricing/upgrade button
2. Create Stripe Checkout session via Supabase function
3. Redirect to Stripe hosted checkout
4. Webhook receives payment.success event
5. Update user subscription/entitlement in database
6. Redirect user to success page
```

---

## Data Structure

```sql
-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year', 'one_time')),
  features JSONB,
  stripe_price_id TEXT UNIQUE,
  active BOOLEAN DEFAULT true
);

-- Insert sample plans
INSERT INTO public.plans (id, name, description, price, currency, interval, features) VALUES
  ('free', 'Free', 'Basic access', 0, 'EUR', 'month', '["5 analyses/month"]'::jsonb),
  ('basic', 'Basic', 'For individuals', 9, 'EUR', 'month', '["50 analyses/month", "Priority support"]'::jsonb),
  ('pro', 'Pro', 'For professionals', 29, 'EUR', 'month', '["200 analyses/month", "Priority support", "API access"]'::jsonb);

-- Indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active plans"
  ON public.plans FOR SELECT
  USING (active = true);
```

---

## Deliverables

### 1. Supabase Edge Function for Checkout

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planId, userId } = await req.json()

    // Get plan details
    const { data: plan } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan || !plan.stripe_price_id) {
      throw new Error('Invalid plan')
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: (await supabase.auth.admin.getUserById(userId)).data.user?.email,
      line_items: [{
        price: plan.stripe_price_id,
        quantity: 1,
      }],
      mode: plan.interval === 'one_time' ? 'payment' : 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        userId,
        planId,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})
```

### 2. Webhook Handler

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (session.mode === 'subscription') {
        // Create subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          current_period_end: new Date((session as any).current_period_end * 1000).toISOString(),
        })
      } else {
        // One-time payment
        await supabase.from('payments').insert({
          user_id: userId,
          amount: session.amount_total! / 100,
          currency: session.currency.toUpperCase(),
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_checkout_session_id: session.id,
          completed_at: new Date().toISOString(),
        })
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({ subscription_tier: planId })
        .eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 3. Frontend Checkout Component

```typescript
// src/components/CheckoutButton.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function CheckoutButton({ planId, price }: { planId: string; price: number }) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { planId, userId: user.id }
    })

    if (error) {
      console.error('Error creating checkout session:', error)
      setLoading(false)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <button onClick={handleSubscribe} disabled={loading} className="subscribe-button">
      {loading ? 'Processing...' : `Subscribe for €${price}/month`}
    </button>
  )
}
```

### 4. Pricing Page

```typescript
// src/pages/public/PricingPage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckoutButton } from '../../components/CheckoutButton'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  features: string[]
}

export function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true })
    if (data) setPlans(data)
    setLoading(false)
  }

  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      <div className="pricing-grid">
        {plans.map(plan => (
          <div key={plan.id} className="pricing-card">
            <h2>{plan.name}</h2>
            <p className="price">€{plan.price}<span className="interval">/{plan.interval}</span></p>
            <p className="description">{plan.description}</p>
            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <CheckoutButton planId={plan.id} price={plan.price} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5. Subscription Management

```typescript
// src/pages/app/SubscriptionPage.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()

    setSubscription(data)
    setLoading(false)
  }

  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.functions.invoke('cancel-subscription', {
      body: { userId: user.id }
    })

    fetchSubscription()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="subscription-page">
      <h1>My Subscription</h1>
      {subscription ? (
        <div className="subscription-card">
          <h2>{subscription.plans.name} Plan</h2>
          <p>Status: <span className={`status ${subscription.status}`}>{subscription.status}</span></p>
          <p>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
          {subscription.cancel_at_period_end && (
            <p className="warning">Your subscription will be canceled at the end of the period.</p>
          )}
          <button onClick={cancelSubscription} className="cancel-button">
            {subscription.cancel_at_period_end ? 'Resume Subscription' : 'Cancel Subscription'}
          </button>
        </div>
      ) : (
        <div className="no-subscription">
          <p>You don't have an active subscription.</p>
          <a href="/pricing">View Plans</a>
        </div>
      )}
    </div>
  )
}
```

---

## CSS

```css
.pricing-page {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.pricing-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.pricing-card h2 {
  margin: 0 0 0.5rem;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1rem 0;
}

.price .interval {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  text-align: left;
}

.features li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.features li::before {
  content: '✓';
  color: var(--success);
  font-weight: bold;
}

.subscribe-button {
  margin-top: auto;
  padding: 1rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.subscribe-button:hover {
  background: var(--accent-hover);
}
```

---

## Prompt 4B - Real-time Features

Add live updates using Supabase Realtime.

---

## Requirements

- Enable Realtime on specific tables
- Subscribe to changes for current user's data
- Update UI instantly when data changes
- Handle connection errors gracefully
- Show connection status indicator

---

## Subscription Patterns

```typescript
// Basic real-time subscription
const channel = supabase
  .channel('custom-channel')
  .on('postgres_changes', {
    event: '*', // '*', 'INSERT', 'UPDATE', 'DELETE'
    schema: 'public',
    table: '[TABLE_NAME]',
    filter: 'user_id=eq.[CURRENT_USER_ID]'
  }, (payload) => {
    // Handle change
    console.log('Change received:', payload)
  })
  .subscribe()

// Cleanup
return () => supabase.removeChannel(channel)
```

---

## Use Cases

- **Live notifications**: Real-time alerts for important events
- **Real-time order updates**: Track order status changes
- **Collaborative editing**: Multi-user document editing
- **Status changes**: Live updates on processing/completion

---

## Deliverables

### 1. Enable Realtime

```sql
-- Enable Realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### 2. Real-time Hook

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtime<T>(
  table: string,
  filter: { column: string; value: string },
  options: { event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE' } = {}
) {
  const [data, setData] = useState<T[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    fetchData()

    channelRef.current = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', {
        event: options.event || '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new as T])
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item =>
            (item as any).id === payload.new.id ? payload.new as T : item
          ))
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => (item as any).id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected')
        }
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, filter])

  async function fetchData() {
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq(filter.column, filter.value)
    if (data) setData(data as T[])
  }

  return { data, connectionStatus, refresh: fetchData }
}
```

### 3. Connection Status Indicator

```typescript
// src/components/ConnectionStatus.tsx
import { useRealtime } from '../hooks/useRealtime'

export function ConnectionStatus() {
  const { connectionStatus } = useRealtime('any-table-for-status', { column: 'id', value: 'dummy' })

  return (
    <div className={`connection-indicator ${connectionStatus}`}>
      <span className="status-dot" />
      <span className="status-text">
        {connectionStatus === 'connected' && 'Live'}
        {connectionStatus === 'connecting' && 'Connecting...'}
        {connectionStatus === 'disconnected' && 'Disconnected'}
      </span>
    </div>
  )
}
```

### 4. Notification System

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Notification {
  id: string
  user_id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotification = payload.new as Notification
        setNotifications(prev => [newNotification, ...prev])
        setUnread(prev => prev + 1)

        // Show toast for new notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.message)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
      setUnread(data.filter(n => !n.read).length)
    }
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnread(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return { notifications, unread, markAsRead, markAllAsRead }
}
```

### 5. Notification List Component

```typescript
// src/components/NotificationList.tsx
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../contexts/AuthContext'

export function NotificationList() {
  const { user } = useAuth()
  const { notifications, unread, markAsRead, markAllAsRead } = useNotifications(user?.id || '')

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>Notifications {unread > 0 && <span className="badge">{unread}</span>}</h3>
        {unread > 0 && <button onClick={markAllAsRead}>Mark all read</button>}
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="empty">No notifications</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} type-${notification.type}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <p>{notification.message}</p>
              <span className="time">
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

---

## CSS

```css
.connection-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connection-indicator.connected .status-dot {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.connection-indicator.connecting .status-dot {
  background: var(--warning);
  animation: pulse 1s infinite;
}

.connection-indicator.disconnected .status-dot {
  background: var(--error);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.notifications-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.badge {
  background: var(--accent);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.notification-item.unread {
  background: var(--bg-tertiary);
}

.notification-item:hover {
  background: var(--bg-tertiary);
}

.notification-item .time {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}
```

---

## Next Steps

After implementing common features:

1. **Add RLS Templates** → Go to [Phase 5: RLS Templates](./phase-5-rls-templates.md)
2. **Use Project Templates** → Go to [Phase 6: Project Templates](./phase-6-project-templates.md)
