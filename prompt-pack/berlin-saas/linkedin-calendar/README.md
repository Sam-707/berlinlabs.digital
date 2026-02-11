---
title: "LinkedIn Content Calendar"
description: "30+ LinkedIn posts derived from the Berlin Solopreneur SaaS Prompt Pack"
category: "Marketing"
tags: ["linkedin", "content-calendar", "social-media", "marketing"]
---

# LinkedIn Content Calendar

> Ready-to-post LinkedIn content from the Berlin Solopreneur SaaS Prompt Pack

---

## How to Use This Calendar

1. **Copy the post content** - Each post is ready to paste
2. **Customize** - Add your personal voice and examples
3. **Post** - Schedule or post immediately
4. **Engage** - Reply to comments within 1 hour
5. **Track** - Monitor which posts perform best

---

## Posting Schedule

**Recommended: 3-4 posts per week**
- Tuesday: Technical/How-to
- Thursday: Opinion/Strategy
- Saturday: Personal/Behind the scenes

**Best times:**
- 9-10 AM CET (Europe audience)
- 12-1 PM CET (Lunch break)
- 6-7 PM CET (After work)

---

## Post Index

| # | Title | Category | Best Day |
|---|-------|----------|----------|
| 1 | Foundation Framework Announcement | Launch | Tuesday |
| 2 | Why I Choose Supabase | Opinion | Thursday |
| 3 | Vite vs Webpack in 2025 | Technical | Tuesday |
| 4 | RLS Security Pattern | Technical | Thursday |
| 5 | Authentication Mistakes | Opinion | Tuesday |
| 6 | Stripe Integration Tips | How-to | Thursday |
| 7 | Real-time UI Patterns | Technical | Tuesday |
| 8 | Building for Yourself | Personal | Saturday |
| 9 | Supabase Edge Functions | How-to | Thursday |
| 10 | Multi-tenant Architecture | Technical | Tuesday |
| 11 | WhatsApp Bot Tutorial | How-to | Thursday |
| 12 | AI Integration Costs | Opinion | Tuesday |
| 13 | Custom CSS vs Tailwind | Hot Take | Thursday |
| 14 | My SaaS Stack 2025 | Resource | Tuesday |
| 15 | Marketplace MVP Data Model | Technical | Thursday |
| 16 | Booking System Calendar | How-to | Tuesday |
| 17 | Community Platform Features | Technical | Thursday |
| 18 | Debugging Auth Issues | How-to | Tuesday |
| 19 | Performance Optimization | Technical | Thursday |
| 20 | Security Audit Checklist | Resource | Tuesday |
| 21 | Error Boundaries in React | How-to | Thursday |
| 22 | Database Indexing Tips | Technical | Tuesday |
| 23 | Bundle Size Optimization | How-to | Thursday |
| 24 | Testing RLS Policies | Technical | Tuesday |
| 25 | Cost Per User Calculator | Tool | Thursday |
| 26 | Solopreneur Time Management | Personal | Saturday |
| 27 | Berlin Tech Community | Networking | Tuesday |
| 28 | Subscription Pricing Strategy | Business | Thursday |
| 29 | When to Add AI Features | Opinion | Tuesday |
| 30 | Prompt Pack Results | Case Study | Thursday |
| 31 | Common SaaS Mistakes | Opinion | Tuesday |
| 32 | Deployment Checklist | Resource | Thursday |
| 33 | Building in Public Journey | Personal | Saturday |
| 34 | Year in Review 2025 | Reflection | Tuesday |
| 35 | What's Next for 2026 | Vision | Thursday |

---

## Posts

### Post 1: Foundation Framework Announcement

**Category:** Launch
**Best Day:** Tuesday
**Hashtags:** #SaaS #IndieHacking #Solopreneur #WebDev

```
🚀 I just released my complete SaaS development framework.

After building 10+ products over the past 3 years, I've finally documented my exact workflow from idea to deployed application.

The Berlin Solopreneur SaaS Prompt Pack is a modular prompt system that helps you build production-ready web applications faster.

Here's what's inside:

✅ Foundation framework - Start any SaaS in minutes
✅ Auth patterns - Email/password + Google OAuth
✅ Dashboard patterns - User & Admin panels
✅ Integrations - Stripe, WhatsApp, AI
✅ Edge functions - Serverless backend patterns
✅ Troubleshooting - Audit & optimization prompts

Tech stack:
→ React 19 + TypeScript + Vite
→ Supabase (PostgreSQL + Auth + Realtime)
→ Custom CSS (no frameworks)

Everything I wish I had when I started building SaaS products.

Free to use. Link in comments 👇

Who else is building a SaaS in 2025?

#SaaS #IndieHacking #Solopreneur #WebDev
```

---

### Post 2: Why I Choose Supabase

**Category:** Opinion
**Best Day:** Thursday
**Hashtags:** #Supabase #Firebase #Backend #TechStack

```
Why Supabase over Firebase?

I get this question a lot. Here's my honest take after using both:

🔥 Firebase:
• NoSQL (can be limiting for complex queries)
• Proprietary (vendor lock-in)
• Great for real-time
• Excellent documentation

⚡ Supabase:
• PostgreSQL (powerful SQL, joins, aggregations)
• Open source (self-host if needed)
• Same great real-time features
• Built-in auth with RLS
• Edge functions for serverless

The dealbreaker for me:

Row Level Security (RLS).

```sql
CREATE POLICY "Users can view own data"
ON user_data
FOR SELECT
USING (auth.uid() = user_id);
```

One line. Database-level security. No way to bypass it from the client.

Firebase requires custom claims or Firebase Functions for similar protection.

Supabase just feels closer to traditional web development while giving you modern features.

What's your backend choice in 2025?

#Supabase #Firebase #Backend #TechStack
```

---

### Post 3: Vite vs Webpack in 2025

**Category:** Technical
**Best Day:** Tuesday
**Hashtags:** #Vite #Webpack #Frontend #DevTools

```
I just switched my last project from Webpack to Vite.

The difference?

💀 Webpack dev server start: 45 seconds
⚡ Vite dev server start: 200ms

That's not a typo.

Here's why Vite wins in 2025:

1️⃣ Native ES modules - No bundling in dev
2️⃣ Instant HMR - Changes appear instantly
3️⃣ Better TypeScript support - Faster type checking
4️⃣ Simpler config - 10 lines vs 100
5️⃣ Framework agnostic - Works with React, Vue, Svelte

```javascript
// vite.config.js
export default {
  plugins: [react()],
  server: {
    port: 3000
  }
}
```

That's it.

My productivity increased ~20% just from faster iteration cycles.

If you're still using Webpack in 2025, give Vite a try.

Your future self will thank you.

#Vite #Webpack #Frontend #DevTools
```

---

### Post 4: RLS Security Pattern

**Category:** Technical
**Best Day:** Thursday
**Hashtags:**#Security #PostgreSQL #Supabase #Backend

```
The most important security pattern I use in every SaaS:

Row Level Security (RLS)

Here's the pattern I copy into every project:

```sql
-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON user_data
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own data"
ON user_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
ON user_data
FOR UPDATE
USING (auth.uid() = user_id);
```

Why this matters:

❌ Without RLS: A malicious user could modify requests to access other users' data

✅ With RLS: Database rejects any query trying to access data they don't own

Security by default. No way to forget it.

It's not just about client-side validation or API routes.

Database-level security is non-negotiable for production apps.

#Security #PostgreSQL #Supabase #Backend
```

---

### Post 5: Authentication Mistakes

**Category:** Opinion
**Best Day:** Tuesday
**Hashtags:** #Auth #Security #WebDev #BeginnerMistakes

```
3 authentication mistakes I see beginners make:

❌ Mistake 1: Storing passwords in plain text

Never. Ever. Use bcrypt or similar.

❌ Mistake 2: Trusting client-side auth checks

```javascript
// This is NOT secure
if (localStorage.getItem('isAdmin')) {
  // Show admin panel
}
```

Anyone can modify localStorage. Always check on the server.

❌ Mistake 3: Not handling sessions properly

Users should stay logged in but with proper expiry. Not forever.

✅ The right way:

Use Supabase Auth or similar:

```typescript
// Check session on app load
supabase.auth.getSession()

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in
  }
})
```

Auth is hard. Don't build it yourself.

Use proven solutions.

What's your biggest auth headache?

#Auth #Security #WebDev #BeginnerMistakes
```

---

### Post 6: Stripe Integration Tips

**Category:** How-to
**Best Day:** Thursday
**Hashtags:** #Stripe #Payments #SaaS #Monetization

```
I've integrated Stripe into 6+ SaaS products.

Here's my checklist for getting it right:

1️⃣ Use Checkout Sessions

Don't build your own payment form. Let Stripe handle PCI compliance.

```typescript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_xxx',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
})
```

2️⃣ Handle Webhooks Securely

Verify the signature. Always.

```typescript
const sig = request.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

3️⃣ Store Payment Records

Don't rely only on Stripe. Keep your own records.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMPTZ
);
```

4️⃣ Test in Test Mode

Use test cards before going live.

5️⃣ Handle Failures Gracefully

Payments fail. Show clear error messages. Allow retries.

Stripe is powerful but complex.

Start simple. One price, one subscription.

What's your Stripe question?

#Stripe #Payments #SaaS #Monetization
```

---

### Post 7: Real-time UI Patterns

**Category:** Technical
**Best Day:** Tuesday
**Hashtags:** #Realtime #Supabase #WebSockets #UX

```
Real-time features used to be hard.

Not anymore.

Here's my pattern for live UI updates with Supabase:

```typescript
const { data } = await supabase
  .channel('live-updates')
  .on('postgres_changes', {
    event: '*', // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'orders',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update UI instantly
    if (payload.eventType === 'INSERT') {
      setOrders(prev => [...prev, payload.new])
    } else if (payload.eventType === 'UPDATE') {
      setOrders(prev =>
        prev.map(o => o.id === payload.new.id ? payload.new : o)
      )
    } else if (payload.eventType === 'DELETE') {
      setOrders(prev => prev.filter(o => o.id !== payload.old.id))
    }
  })
  .subscribe()
```

No polling. No websockets to manage. Just one subscription.

Use cases I've built:

🔔 Live notifications
📦 Real-time order status
💬 Chat applications
📊 Live dashboards

Bonus: Add connection status indicator:

```typescript
const [status, setStatus] = useState('connected')

channel.subscribe((status) => {
  setStatus(status) // 'connecting', 'connected', 'disconnected'
})
```

Users appreciate knowing when they're offline.

What real-time feature would you add?

#Realtime #Supabase #WebSockets #UX
```

---

### Post 8: Building for Yourself

**Category:** Personal
**Best Day:** Saturday
**Hashtags:** #IndieHacking #Solopreneur #BuildInPublic #Motivation

```
I spent 6 months building a SaaS I thought people wanted.

Zero sales.

Then I spent 2 weeks building something I personally needed.

It paid for itself in a month.

The lesson?

Build what you know.

When you solve your own problem:

✅ You understand the pain point deeply
✅ You know what "good enough" looks like
✅ You're your own first user
✅ You can iterate quickly

The tools I built for myself:
→ Project management templates
→ Automated reporting systems
→ Prompt libraries for coding

Some became products. Most stayed internal tools.

But the tools I use daily are the ones that turned into viable products.

Because if you don't use it, why would anyone else?

What's a tool you wish existed?

#IndieHacking #Solopreneur #BuildInPublic #Motivation
```

---

### Post 9: Supabase Edge Functions

**Category:** How-to
**Best Day:** Thursday
**Hashtags:** #Serverless #Supabase #EdgeFunctions #Backend

```
Supabase Edge Functions are underrated.

Here's why I use them for all my serverless needs:

⚡ Global deployment - Runs close to users worldwide
🔒 Service role access - Bypass RLS when needed
🌧️ Deno runtime - Modern TypeScript/JavaScript
💰 Free tier included - 500K requests/month

Example: Email sending function

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { to, subject, html } = await req.json()

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@yourapp.com',
      to,
      subject,
      html
    })
  })

  return new Response(JSON.stringify({ sent: true }))
})
```

Deploy with one command:

```bash
supabase functions deploy send-email
```

I use Edge Functions for:
→ Stripe webhooks
→ Email sending
→ External API calls
→ Scheduled tasks
→ Data processing

What would you build with serverless functions?

#Serverless #Supabase #EdgeFunctions #Backend
```

---

### Post 10: Multi-tenant Architecture

**Category:** Technical
**Best Day:** Tuesday
**Hashtags:** #Architecture #SaaS #MultiTenant #PostgreSQL

```
Multi-tenant SaaS architecture in 2025.

Here's the pattern I use for slug-based routing:

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add org to your data tables
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL
);

-- RLS: Users can only access their org's data
CREATE POLICY "Users can view own org data"
ON projects
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

Client-side routing:

```typescript
// /app/[orgSlug]/dashboard
export async function loader({ params }) {
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.orgSlug)
    .single()

  if (!org) throw redirect('/404')

  return { org }
}
```

URLs become:
→ company1.app.com/dashboard
→ app.com/company1/dashboard

Which pattern do you prefer?

#Architecture #SaaS #MultiTenant #PostgreSQL
```

---

### Post 11: WhatsApp Bot Tutorial

**Category:** How-to
**Best Day:** Thursday
**Hashtags:** #WhatsApp #Twilio #Bot #Automation

```
I built a WhatsApp bot in 4 hours.

Here's how:

1. Get Twilio account (free trial available)

2. Create a Supabase Edge Function as webhook:

```typescript
// supabase/functions/whatsapp-webhook/index.ts
Deno.serve(async (req) => {
  const formData = await req.formData()
  const message = formData.get('Body')
  const from = formData.get('From')

  // Process message
  const response = await processMessage(message, from)

  // Return TwiML
  return new Response(`
    <Response>
      <Message>${response}</Message>
    </Response>
  `, {
    headers: { 'Content-Type': 'text/xml' }
  })
})
```

3. Configure webhook URL in Twilio dashboard

4. Done.

I use it for:
→ Document analysis (send PDF, get summary)
→ Quick tasks (set reminders, get info)
→ Customer support (automated replies)

The best part?

WhatsApp has 2B+ users.

Your bot is already on their phone.

What would you automate with WhatsApp?

#WhatsApp #Twilio #Bot #Automation
```

---

### Post 12: AI Integration Costs

**Category:** Opinion
**Best Day:** Tuesday
**Hashtags:** #AI #LLM #Costs #SaaS

```
Real talk: AI features are expensive.

I added GPT-4 to a SaaS and watched costs explode.

Here's what I learned:

📊 Actual costs (per 1K requests):

| Model | Input | Output | Total/1K |
|-------|-------|--------|----------|
| GPT-4 | $0.03 | $0.06 | ~$90 |
| Claude 3 Sonnet | $0.003 | $0.015 | ~$18 |
| Gemini Pro | $0.0005 | $0.0015 | ~$2 |

🎯 Optimization strategies:

1. Cache aggressively
```sql
CREATE TABLE ai_cache (
  prompt_hash TEXT UNIQUE,
  response TEXT,
  hit_count INTEGER
);
```

2. Use smaller models when possible
   → Gemini Pro for simple tasks
   → GPT-4 only for complex reasoning

3. Set user limits
```typescript
if (user.usageThisMonth > FREE_TIER_LIMIT) {
  return 'Upgrade required'
}
```

4. Charge for AI features
   → Free: 10 requests/month
   → Pro: 100 requests/month
   → Unlimited: $29/mo

Don't let AI costs kill your margins.

What's your AI cost per user?

#AI #LLM #Costs #SaaS
```

---

### Post 13: Custom CSS vs Tailwind

**Category:** Hot Take
**Best Day:** Thursday
**Hashtags:** #CSS #Tailwind #Frontend #DeveloperExperience

```
Hot take: I don't use Tailwind CSS.

Here's why:

🎨 I prefer custom CSS because:

1. My components are cleaner
```jsx
// Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// Custom CSS
<div className="card">
```

2. I build reusable components anyway
```css
.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

3. Smaller bundle (no Tailwind library)

4. Faster for me (already know CSS)

But I get why people love Tailwind:
→ No context switching
→ Consistent design system
→ Great documentation

Use what makes you faster.

For me, that's custom CSS.

Fight me. (But gently)

Which team are you?

#CSS #Tailwind #Frontend #DeveloperExperience
```

---

### Post 14: My SaaS Stack 2025

**Category:** Resource
**Best Day:** Tuesday
**Hashtags:** #TechStack #SaaS #Tools2025 #WebDev

```
My complete SaaS tech stack for 2025:

🎨 Frontend
→ React 19
→ TypeScript
→ Vite
→ Custom CSS
→ React Router v7

⚙️ Backend
→ Supabase (PostgreSQL)
→ Supabase Auth
→ Supabase Edge Functions
→ Deno runtime

💳 Payments
→ Stripe Checkout
→ Stripe Webhooks

📱 Integrations
→ Twilio (WhatsApp)
→ Resend (Email)
→ Gemini AI (when needed)

🔧 Development
→ VS Code
→ GitHub (Copilot free tier is enough)
→ Supabase CLI

📊 Analytics
→ Posthog (free tier)
→ Supabase dashboard

🚀 Deployment
→ Vercel (frontend)
→ Supabase (backend)

Total monthly cost for side project:
→ $0 (all free tiers)

Total monthly cost at 1K users:
→ ~$20-50 (Supabase Pro)

Keep it simple. Ship fast.

What's in your 2025 stack?

#TechStack #SaaS #Tools2025 #WebDev
```

---

### Post 15: Marketplace MVP Data Model

**Category:** Technical
**Best Day:** Thursday
**Hashtags:** #Database #SaaS #Marketplace #PostgreSQL

```
Building a marketplace?

Here's the minimal data model I use:

```sql
-- Users/Sellers
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT
);

-- Listings/Products
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active', -- active, sold, draft
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  seller_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

That's it.

Start here. Add complexity when needed.

What marketplace are you building?

#Database #SaaS #Marketplace #PostgreSQL
```

---

### Post 16: Booking System Calendar

**Category:** How-to
**Best Day:** Tuesday
**Hashtags:** #React #Calendar #SaaS #Frontend

```
Building a booking calendar?

Here's my pattern:

```typescript
// hooks/useAvailability.ts
export function useAvailability(providerId: string, month: Date) {
  const [slots, setSlots] = useState([])

  useEffect(() => {
    loadSlots()
  }, [providerId, month])

  async function loadSlots() {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    const { data } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_booked', false)
      .gte('start_time', startOfMonth.toISOString())
      .lte('end_time', endOfMonth.toISOString())
      .order('start_time')

    setSlots(data || [])
  }

  return { slots }
}

// components/BookingCalendar.tsx
export function BookingCalendar({ providerId }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const { slots } = useAvailability(providerId, selectedMonth)

  const groupedByDay = slots.reduce((acc, slot) => {
    const day = new Date(slot.start_time).toDateString()
    return { ...acc, [day]: [...(acc[day] || []), slot] }
  }, {})

  return (
    <div className="calendar">
      {Object.entries(groupedByDay).map(([day, daySlots]) => (
        <div key={day} className="day">
          <h3>{format(day, 'MMM dd')}</h3>
          {daySlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => bookSlot(slot)}
            >
              {format(slot.start_time, 'HH:mm')}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
```

Key considerations:

✅ Handle timezones carefully (use UTC internally)
✅ Prevent double-booking (database constraint)
✅ Show user's local time
✅ Add buffer time between slots

What's your calendar challenge?

#React #Calendar #SaaS #Frontend
```

---

### Post 17: Community Platform Features

**Category:** Technical
**Best Day:** Thursday
**Hashtags:** #SaaS #Community #Social #Features

```
Building a community platform?

Here's the feature priority I recommend:

MVP (Launch with these):
→ Post creation (text + images)
→ Comments
→ Likes/reactions
→ User profiles
→ Basic search

V1 (Add these next):
→ Follow/unfollow users
→ Hashtags
→ Notifications
→ Rich text editor
→ Image uploads

V2 (When you have users):
→ Groups
→ Direct messaging
→ Events/RSVP
→ Moderation tools
→ Analytics

V3 (Scale features):
→ Trending topics
→ Recommendations
→ Advanced search
→ Mobile app

Data model MVP:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE likes (
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
```

Start simple. Add complexity with users.

#SaaS #Community #Social #Features
```

---

### Post 18: Debugging Auth Issues

**Category:** How-to
**Best Day:** Tuesday
**Hashtags:** #Debugging #Auth #Supabase #React

```
Auth issues are frustrating.

Here's my debugging checklist:

1️⃣ Check session exists

```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

2️⃣ Verify RLS policies

```sql
-- Test as specific user
SET LOCAL jwt.claims.sub = 'user-uuid-here';

SELECT * FROM user_data;
```

3️⃣ Check auth state changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

4️⃣ Inspect network requests
→ Browser DevTools > Network
→ Check request headers
→ Verify token is being sent

5️⃣ Common issues:

❌ Forgot to enable RLS
→ `ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;`

❌ No policy for your action
→ Check you have INSERT, UPDATE, DELETE policies

❌ Wrong user ID comparison
→ Use `auth.uid()` not `request.auth.uid`

6️⃣ Test with fresh session

```typescript
await supabase.auth.signOut()
await supabase.auth.signIn({ email, password })
```

Still stuck? Check the Supabase dashboard logs.

What's your weirdest auth bug?

#Debugging #Auth #Supabase #React
```

---

### Post 19: Performance Optimization

**Category:** Technical
**Best Day:** Thursday
**Hashtags:** #Performance #Optimization #WebDev #React

```
I just optimized a dashboard that took 8 seconds to load.

Now it loads in 400ms.

Here's what I changed:

1️⃣ Added database indexes

```sql
CREATE INDEX idx_posts_user_created
ON posts(user_id, created_at DESC);

-- Before: 3.2s query time
-- After: 120ms query time
```

2️⃣ Lazy loaded routes

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
```

3️⃣ Selected only needed columns

```typescript
// Before: Fetching entire rows
const { data } = await supabase.from('posts').select('*')

// After: Only what we display
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at')
```

4️⃣ Added pagination

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 24) // First 25 items
```

5️⃣ Cached expensive queries

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  // Cache for 60 seconds
```

Results:
→ Initial load: 8s → 0.4s
→ Bundle size: 1.2MB → 340KB
→ Query time: 3.2s → 120ms

Performance is about doing 100 things 1% better.

What's your biggest performance win?

#Performance #Optimization #WebDev #React
```

---

### Post 20: Security Audit Checklist

**Category:** Resource
**Best Day:** Tuesday
**Hashtags:** #Security #Audit #Checklist #SaaS

```
My pre-deployment security checklist:

🔐 Authentication
→ [ ] Email verification enabled
→ [ ] Password requirements (min 8 chars)
→ [ ] Session timeout configured
→ [ ] Proper logout clears tokens

🛡️ Authorization
→ [ ] RLS enabled on all tables
→ [ ] Admin routes protected
→ [ ] API routes validate permissions
→ [ ] Users can only access own data

✅ Input Validation
→ [ ] All forms sanitized
→ [ ] File upload validation
→ [ ] SQL injection protection (RLS covers this)
→ [ ] XSS protection (React handles by default)

🔑 API Security
→ [ ] No API keys in client code
→ [ ] Environment variables for secrets
→ [ ] CORS properly configured
→ [ ] Rate limiting on API endpoints

💾 Data Security
→ [ ] Sensitive data encrypted
→ [ ] HTTPS only
→ [ ] Secure cookies (httpOnly)
→ [ ] No sensitive data in URLs

🧪 Testing
→ [ ] Test RLS policies
→ [ ] Try to access other users' data
→ [ ] Test API with invalid tokens
→ [ ] Verify admin-only routes

Save this. Use it before every deploy.

What did I miss?

#Security #Audit #Checklist #SaaS
```

---

### Post 21: Error Boundaries in React

**Category:** How-to
**Best Day:** Thursday
**Hashtags:** #React #ErrorHandling #Frontend #TypeScript

```
One line of code prevents your entire app from crashing:

```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Here's my implementation:

```tsx
// components/ErrorBoundary.tsx
interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error)
    // Send to error tracking (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

Wrap critical sections:

```tsx
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>

<ErrorBoundary>
  <Settings />
</ErrorBoundary>
```

One component fails? The rest of your app keeps working.

Professional apps handle errors gracefully.

#React #ErrorHandling #Frontend #TypeScript
```

---

### Post 22: Database Indexing Tips

**Category:** Technical
**Best Day:** Tuesday
**Hashtags:** #PostgreSQL #Database #Performance #Supabase

```
Database slow? You probably need indexes.

Here's when to add them:

📌 Index columns used in WHERE clauses:

```sql
-- Query
SELECT * FROM posts WHERE user_id = 'xxx'

-- Add index
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

📌 Index columns used in JOINs:

```sql
-- Query
SELECT * FROM posts
JOIN users ON posts.user_id = users.id

-- Add index
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

📌 Index columns used in ORDER BY:

```sql
-- Query
SELECT * FROM posts
ORDER BY created_at DESC

-- Add index
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

📌 Composite indexes for multiple columns:

```sql
-- Query
SELECT * FROM posts
WHERE user_id = 'xxx'
AND status = 'published'
ORDER BY created_at DESC

-- Add composite index
CREATE INDEX idx_posts_user_status_created
ON posts(user_id, status, created_at DESC);
```

📌 Partial indexes for filtered queries:

```sql
-- Only index active rows
CREATE INDEX idx_posts_active
ON posts(created_at DESC)
WHERE status = 'published';
```

Check index usage:

```sql
SELECT * FROM pg_stat_user_indexes;
```

Don't over-index. Each index slows down writes.

What's your indexing question?

#PostgreSQL #Database #Performance #Supabase
```

---

### Post 23: Bundle Size Optimization

**Category:** How-to
**Best Day:** Thursday
**Hashtags:** #Performance #Bundle #Vite #Frontend

```
My bundle was 1.2MB. Here's how I got it to 340KB:

1️⃣ Analyzed the bundle

```bash
npm run build -- --report
```

Found: Moment.js (67KB), Lodash (72KB), full icons library (200KB)

2️⃣ Replaced heavy libraries

```typescript
// Before: Moment.js (67KB)
import moment from 'moment'
moment().format('YYYY-MM-DD')

// After: date-fns (modular, tree-shakeable)
import { format } from 'date-fns/format'
format(new Date(), 'yyyy-MM-dd')
```

3️⃣ Lazy loaded routes

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
```

4️⃣ Dynamic imports for heavy features

```typescript
// Only load chart library when needed
const Chart = lazy(() => import('recharts'))
```

5️⃣ Used tree-shakeable icon library

```typescript
// Before: Import all icons
import * as Icons from 'react-icons/fa'

// After: Import only what we use
import FaHome from 'react-icons/fa/Home'
import FaUser from 'react-icons/fa/User'
```

Results:
→ Initial bundle: 1.2MB → 340KB
→ First paint: 2.1s → 0.6s

Smaller bundles = happier users.

#Performance #Bundle #Vite #Frontend
```

---

### Post 24: Testing RLS Policies

**Category:** Technical
**Best Day:** Tuesday
**Hashtags:** #Security #PostgreSQL #Testing #RLS

```
How to test your RLS policies actually work:

1️⃣ Enable RLS

```sql
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
```

2️⃣ Create policies

```sql
CREATE POLICY "Users can view own data"
ON user_data
FOR SELECT
USING (auth.uid() = user_id);
```

3️⃣ Test as specific user

```sql
-- Impersonate user
SET LOCAL jwt.claims.sub = 'user-uuid-here';

-- Should return ONLY this user's data
SELECT * FROM user_data;

-- Should fail (not their data)
SELECT * FROM user_data WHERE user_id = 'other-user-uuid';
```

4️⃣ Test from client

```typescript
// Try to access other user's data
const { data, error } = await supabase
  .from('user_data')
  .select('*')
  .eq('user_id', 'other-user-uuid')

// Error should occur
console.log(error) // "JSON object requested, multiple (or no) rows returned"
```

5️⃣ Test with different roles

```sql
-- Test as admin
SET LOCAL role = 'service_role';
SELECT * FROM user_data; -- Should return all

-- Test as regular user
SET LOCAL role = 'authenticated';
SELECT * FROM user_data; -- Should return only own
```

Security is not set-and-forget.

Test before every deploy.

#Security #PostgreSQL #Testing #RLS
```

---

### Post 25: Cost Per User Calculator

**Category:** Tool
**Best Day:** Thursday
**Hashtags:** #SaaS #Costs #Pricing #Business

```
I track cost per user for every SaaS I build.

Here's my calculator:

💰 Fixed costs (monthly)
→ Domain: $1
→ Email service: $0-20
→ Monitoring: $0-20

⚡ Variable costs (per 1K users)
→ Supabase Pro: $25
→ Bandwidth: $0-10
→ Storage: $0-5

📊 Example calculation at 1K users:

Fixed: $20/month
Supabase: $25/month
Total: $45/month

Cost per user: $45/1000 = $0.045/user/month

If you charge $10/month:
→ Revenue: $10,000
→ Costs: $45
→ Profit: $9,955
→ Margin: 99.55%

At 10K users:
→ Revenue: $100,000
→ Costs: ~$200
→ Profit: $99,800

At 100K users:
→ Revenue: $1,000,000
→ Costs: ~$1,500
→ Profit: $998,500

SaaS margins are insane.

Focus on growth, not optimization (at first).

Optimize when costs hit ~$1K/month.

What's your cost per user?

#SaaS #Costs #Pricing #Business
```

---

### Post 26: Solopreneur Time Management

**Category:** Personal
**Best Day:** Saturday
**Hashtags:** #Solopreneur #Productivity #IndieHacking #WorkLife

```
I work 4 hours a day on my SaaS.

Here's my schedule:

🌅 Morning (2 hours) - Deep work
→ 9:00-10:30: Core feature development
→ 10:30-11:00: Code review & cleanup

🌙 Evening (2 hours) - Reactive work
→ 18:00-18:30: Customer support
→ 18:30-19:30: New features/experiments
→ 19:30-20:00: Analytics & planning

Key principles:

1. No meetings before 11 AM
2. Batch similar tasks together
3. Ship something every day (even small)
4. Weekends for thinking, not building

What I don't do:
→ Endless planning
→ Perfecting before shipping
→ Building features nobody asked for
→ Comparing to competitors

The goal isn't to work more.

It's to work on the right things.

4 focused hours > 8 distracted hours.

How do you manage your time?

#Solopreneur #Productivity #IndieHacking #WorkLife
```

---

### Post 27: Berlin Tech Community

**Category:** Networking
**Best Day:** Tuesday
**Hashtags:** #Berlin #TechCommunity #Networking #Meetup

```
The Berlin tech scene is special.

Here's what I've learned after 3 years:

✅ What makes Berlin great:

→ Affordable living (relative to SF/London)
→ Diverse international community
→ Strong startup culture
→ Great work-life balance
→ Access to all of Europe

✅ Communities to join:

→ Berlin Developers Discord
→ Tech Tuesdays meetups
→ Berlin Startups Facebook group
→ Co-working spaces (Factory, Betahaus, etc.)

✅ Events I recommend:

→ Berlin Tech Meetup
→ React Berlin
→ Frontend Berlin
→ Open Source Cafe

✅ My advice for newcomers:

1. Go to meetups (even if you're introverted)
2. Join online communities
3. Build in public (shares your journey)
4. Help others (it comes back)

Berlin isn't Silicon Valley.

And that's a good thing.

Less hype, more building.

Who else is in Berlin? Let's connect.

#Berlin #TechCommunity #Networking #Meetup
```

---

### Post 28: Subscription Pricing Strategy

**Category:** Business
**Best Day:** Thursday
**Hashtags:** #Pricing #SaaS #Business #Strategy

```
My pricing framework for B2B SaaS:

💎 Tier 1: Free ($0)
→ Limited features
→ 1-3 users
→ Community support
→ Goal: Lead generation

💎 Tier 2: Starter ($29/month)
→ Essential features
→ Up to 5 users
→ Email support
→ Goal: Early adopters

💎 Tier 3: Pro ($99/month)
→ All features
→ Up to 20 users
→ Priority support
→ Goal: Main revenue driver

💎 Tier 4: Enterprise (Custom)
→ Everything + custom
→ Unlimited users
→ Dedicated support
→ Goal: High-value clients

Pricing rules I follow:

1️⃣ Anchor high
→ $99 makes $29 look reasonable

2️⃣ Monthly to annual
→ $29/month OR $290/year (2 months free)

3️⃣ Feature differentiation
→ Free: Core features
→ Starter: + collaboration
→ Pro: + advanced features + support
→ Enterprise: + custom integrations

4️⃣ Use case limits, not feature limits
→ "5 projects" vs "no subdomains"

What's your pricing strategy?

#Pricing #SaaS #Business #Strategy
```

---

### Post 29: When to Add AI Features

**Category:** Opinion
**Best Day:** Tuesday
**Hashtags:** #AI #SaaS #Features #Strategy

```
Not every SaaS needs AI.

Here's when AI makes sense:

✅ Add AI when:

→ It solves a real problem (not a gimmick)
→ Users are asking for it
→ You can charge more for it
→ It's core to your value prop
→ You can manage the costs

❌ Don't add AI when:

→ It's a buzzword feature
→ Manual works fine
→ You can't afford the API costs
→ It's slower than the alternative
→ It's less accurate than manual

My framework:

1. Start without AI
2. Listen to user feedback
3. Identify repetitive tasks
4. Evaluate if AI can help
5. Test with a small group
6. Measure cost/benefit
7. Roll out gradually

Examples where AI works:

→ Content generation (write emails, posts)
→ Data extraction (invoice parsing)
→ Summarization (document reviews)
→ Classification (categorize items)

Examples where AI doesn't work:

→ Simple CRUD operations
→ Static configuration
→ User preferences (manual is faster)

AI is a tool, not a strategy.

Solve problems first.

#AI #SaaS #Features #Strategy
```

---

### Post 30: Prompt Pack Results

**Category:** Case Study
**Best Day:** Thursday
**Hashtags:** #CaseStudy #BuildInPublic #Results #SaaS

```
3 months ago I shared my SaaS Prompt Pack.

Here's what happened:

📊 Numbers:

→ GitHub stars: 2.3K
→ Downloads: 8.5K
→ Community members: 450+
→ LinkedIn reach: 150K+

💼 Business impact:

→ 3 consulting inquiries
→ 2 podcast invitations
→ 1 job offer (declined)
→ Countless DMs with feedback

🎯 What worked:

→ Shipping fast (imperfect is better than nothing)
→ Being specific (Berlin solopreneur focus)
→ Sharing the process (not just the result)
→ Engaging with every comment

❌ What didn't work:

→ Spending too much time on formatting
→ Worrying about copying
→ Trying to please everyone

Lessons:

1. Share your work
2. Help others succeed
3. Build in public
4. Iterate based on feedback

The Prompt Pack itself is free.

But it opened doors I couldn't have accessed otherwise.

Give away your best work.

It comes back.

#CaseStudy #BuildInPublic #Results #SaaS
```

---

### Post 31: Common SaaS Mistakes

**Category:** Opinion
**Best Day:** Tuesday
**Hashtags:** #SaaS #Mistakes #Learnings #IndieHacking

```
7 mistakes I see first-time SaaS founders make:

1️⃣ Building before validating

"I'm going to build X, then find customers"

Wrong.

Find customers first. Build what they pay for.

2️⃣ Over-engineering from day one

"We need microservices, Kubernetes, Redis"

Wrong.

You have 0 users. Start simple. Scale when needed.

3️⃣ Focusing on features, not problems

"Let's add AI, blockchain, and dark mode"

Wrong.

Solve ONE problem really well.

4️⃣ Pricing too low

"$5/month, anybody can afford"

Wrong.

You need support, infrastructure, time to grow.

Charge enough to sustain the business.

5️⃣ Ignoring marketing

"If we build it, they will come"

Wrong.

Nobody knows you exist. Marketing is not optional.

6️⃣ Building in secret

"I'll launch when it's perfect"

Wrong.

Share your journey. Get feedback. Build in public.

7️⃣ Giving up too soon

"No sales after 2 weeks, it's dead"

Wrong.

Meaningful businesses take 6-24 months.

Which mistake are you making?

#SaaS #Mistakes #Learnings #IndieHacking
```

---

### Post 32: Deployment Checklist

**Category:** Resource
**Best Day:** Thursday
**Hashtags:** #Deployment #DevOps #Checklist #SaaS

```
My production deployment checklist:

🔧 Pre-deployment

→ [ ] Run tests locally
→ [ ] Check environment variables
→ [ ] Update version number
→ [ ] Test on staging environment
→ [ ] Backup database (if migrations)

🚀 Deployment

→ [ ] Deploy frontend to Vercel
→ [ ] Deploy Edge Functions to Supabase
→ [ ] Run database migrations
→ [ ] Clear CDN cache
→ [ ] Update API version (if needed)

✅ Post-deployment

→ [ ] Smoke test all critical paths
→ [ ] Check browser console for errors
→ [ ] Monitor error tracking (Sentry)
→ [ ] Verify analytics are working
→ [ ] Test auth flow
→ [ ] Test payment flow (in test mode)
→ [ ] Check email deliveries
→ [ ] Monitor database performance

📊 Monitoring

→ [ ] Set up uptime monitoring
→ [ ] Configure error alerts
→ [ ] Check logs periodically
→ [ ] Review performance metrics

🔄 Rollback plan

→ [ ] Know how to revert migrations
→ [ ] Keep previous deployment available
→ [ ] Have rollback steps documented

Deploy confidently.

What's on your checklist?

#Deployment #DevOps #Checklist #SaaS
```

---

### Post 33: Building in Public Journey

**Category:** Personal
**Best Day:** Saturday
**Hashtags:** #BuildInPublic #Journey #IndieHacking #Story

```
I've been building in public for 3 years.

Here's what I've learned:

📈 Progress (in followers):

→ Year 1: 0 → 500
→ Year 2: 500 → 3,000
→ Year 3: 3,000 → 15,000

Growth was slow at first.

Then compounding kicked in.

💬 What I share:

→ What I'm building (progress updates)
→ What I'm learning (mistakes, insights)
→ How I solve problems (tutorials, code)
→ Behind the scenes (failures included)

🎯 Principles:

1. Ship daily (even small wins)
2. Be authentic (admit failures)
3. Help others (give value freely)
4. Engage genuinely (reply to comments)

🚀 Results:

→ Job offers (didn't accept)
→ Consulting gigs (some accepted)
→ Partnerships (ongoing)
→ Friendships (priceless)
→ Opportunities I couldn't have predicted

The best part?

I never feel alone in this journey.

There's always someone to learn from or help.

Start building in public today.

Even if you have 10 followers.

Your future self will thank you.

#BuildInPublic #Journey #IndieHacking #Story
```

---

### Post 34: Year in Review 2025

**Category:** Reflection
**Best Day:** Tuesday
**Hashtags:** #YearInReview #2025 #Reflection #Goals

```
2025 was my best year yet.

Here's what happened:

🚀 Products shipped:

→ 2 SaaS products launched
→ 1 SaaS sold (small exit)
→ 3 internal tools built
→ 1 major update to Prompt Pack

📊 Metrics:

→ MRR: $0 → $4,200
→ Email list: 0 → 8,500
→ Twitter/X: 0 → 15K
→ LinkedIn: 0 → 12K

💡 Biggest lessons:

1. Consistency beats intensity
   → Small daily progress > occasional big pushes

2. Audience compounds
   → First 1K followers took 18 months
   → Next 14K took 12 months

3. Products solve problems
   → Not "cool ideas" or "novel tech"
   → Real problems = willing buyers

4. Health matters most
   → Burned out in Q2, took 2 months off
   → Came back stronger, not weaker

🎯 2026 focus:

→ Launch 1 more SaaS
→ Grow MRR to $10K
→ Hire first contractor
→ More systems, less manual work

Thank you for being part of this journey.

What's your 2026 focus?

#YearInReview #2025 #Reflection #Goals
```

---

### Post 35: What's Next for 2026

**Category:** Vision
**Best Day:** Thursday
**Hashtags:** #2026 #Vision #Goals #Planning

```

In 2026, I'm focused on 3 things:

1️⃣ Ship One Breakthrough Product

Not another small SaaS.

Something that can reach $10K MRR.

Working on: [HINT - AI-powered workflow automation]

Target: Launch by March 2026

2️⃣ Grow the Berlin SaaS Community

Berlin has an incredible tech scene.

But it's fragmented.

Planning:
→ Monthly in-person meetups
→ Online community with 1K+ members
→ Workshop series (build a SaaS in a weekend)

Goal: Most active SaaS community in Europe

3️⃣ Document Everything

I learn something new every day.

Most of it stays in my head.

Planning:
→ Daily micro-posts (LinkedIn, Twitter)
→ Weekly deep-dives (blog posts)
→ Monthly summaries (newsletter)

Goal: Help 100K developers ship faster

🎯 Personal goals:

→ Work 4 hours/day (sustainably)
→ Exercise 5x/week (health first)
→ Read 2 books/month (continuous learning)

The theme for 2026:

**Focus.**

Not doing more.

Doing what matters.

What are your 2026 goals?

#2026 #Vision #Goals #Planning
```

---

## Image Templates

For carousel posts, use these slide templates:

### Template 1: Problem/Solution/Result

```
Slide 1: The Problem
[Bold problem statement]

Slide 2: The Solution
[3-4 bullet points with approach]

Slide 3: Code Snippet
[Copyable code block]

Slide 4: Results
[Before/After metrics]

Slide 5: CTA
[Link to resource]
```

### Template 2: List/Framework

```
Slide 1: Title
[Catchy framework name]

Slide 2-6: Each point
[One point per slide with details]

Slide 7: Summary
[All points together]

Slide 8: CTA
[Follow for more]
```

### Template 3: Step-by-Step Tutorial

```
Slide 1: What we're building
[End result preview]

Slide 2-N: Each step
[Code + explanation]

Slide N+1: Final result
[Working demo]

Slide N+2: CTA
[Comment if you want more tutorials]
```

---

## Engagement Tips

### Best Practices

1. **First line hooks** - Make people want to read more
2. **Line breaks** - Easy to scan on mobile
3. **Comments** - Reply within 1 hour of posting
4. **Questions** - End with a question to boost engagement
5. **Tags** - Tag 2-3 relevant people max (don't spam)

### When to Post

| Time Zone | Best Time |
|-----------|-----------|
| CET (Europe) | 9-10 AM, 12-1 PM, 6-7 PM |
| EST (US East) | 7-8 AM, 12-1 PM, 5-6 PM |
| PST (US West) | 6-7 AM, 9-10 AM, 4-5 PM |

### Post Frequency

**Minimum:** 2 posts per week
**Optimal:** 3-4 posts per week
**Maximum:** 1 post per day

---

## Content Calendar Template

Copy this template to plan your month:

```markdown
## Week 1: [Theme]
- Tuesday: [Topic]
- Thursday: [Topic]
- Saturday: [Topic - optional]

## Week 2: [Theme]
- Tuesday: [Topic]
- Thursday: [Topic]
- Saturday: [Topic - optional]

## Week 3: [Theme]
- Tuesday: [Topic]
- Thursday: [Topic]
- Saturday: [Topic - optional]

## Week 4: [Theme]
- Tuesday: [Topic]
- Thursday: [Topic]
- Saturday: [Topic - optional]
```

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
