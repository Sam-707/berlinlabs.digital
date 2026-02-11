---
title: "Phase 9: Edge Functions & Serverless"
description: "Serverless functions with Supabase Edge Functions (Deno runtime)"
category: "Backend"
tags: ["edge-functions", "serverless", "deno", "api", "webhooks"]
difficulty: "Advanced"
timeRequired: "2-4 hours"
dependencies: ["Phase 1: Foundation Framework"]
order: 9
---

# Phase 9: Edge Functions & Serverless

> Supabase Edge Functions let you run serverless code close to your users worldwide.

---

## Prompt 9A: Edge Function Template

**Create a Supabase Edge Function for any purpose**

---

### Requirements

- Use Deno runtime (TypeScript/JavaScript supported)
- Access Supabase client with service role
- Environment variables for API keys
- CORS handling for web requests
- Error handling and logging

---

### Template Structure

```typescript
// supabase/functions/[function-name]/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase with service role (bypasses RLS)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Your logic here
    const { data, error } = await supabase
      .from('[TABLE]')
      .select('*')

    if (error) throw error

    return new Response(
      JSON.stringify(data),
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

---

### Deployment

```bash
# Deploy single function
supabase functions deploy [function-name]

# Deploy all functions
supabase functions deploy

# With environment variables
supabase functions deploy [function-name] --env-file .env

# View logs
supabase functions logs [function-name]
```

---

## Common Edge Function Patterns

---

### Pattern 1: Authenticated API Endpoint

```typescript
// supabase/functions/protected-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const token = authHeader.replace('Bearer ', '')

    // Verify JWT and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new Error('Invalid token')
    }

    // User is authenticated, proceed with logic
    const { data } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return new Response(
      JSON.stringify({ user, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 401, headers: corsHeaders }
    )
  }
})
```

---

### Pattern 2: Webhook Handler

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()

    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${WEBHOOK_SECRET}.${body}`)
    )

    // Process webhook event
    const event = JSON.parse(body)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancel(event.data.object)
        break
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})

async function handlePaymentSuccess(paymentIntent: any) {
  await supabase.from('payments').insert({
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    status: 'succeeded'
  })
}

async function handleSubscriptionCancel(subscription: any) {
  await supabase.from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)
}
```

---

### Pattern 3: Scheduled Task (Cron)

```typescript
// supabase/functions/daily-cleanup/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Verify cron secret
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Delete old logs
  const { error } = await supabase
    .from('logs')
    .delete()
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ deleted: true }))
})

// Schedule with: supabase functions invoke daily-cleanup --no-verify-jwt
```

---

### Pattern 4: External API Integration

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to,
        subject,
        html
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(JSON.stringify({ sent: true }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

---

### Pattern 5: Data Processing

```typescript
// supabase/functions/process-export/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { userId, format = 'csv' } = await req.json()

    // Fetch user data
    const { data: records } = await supabase
      .from('user_records')
      .select('*')
      .eq('user_id', userId)

    if (!records) throw new Error('No data found')

    // Convert to requested format
    let output, contentType

    if (format === 'csv') {
      output = convertToCSV(records)
      contentType = 'text/csv'
    } else if (format === 'json') {
      output = JSON.stringify(records, null, 2)
      contentType = 'application/json'
    } else {
      throw new Error('Unsupported format')
    }

    return new Response(output, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="export.${format}"`
      }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})

function convertToCSV(data: any[]) {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] ?? '')).join(','))

  return [headers.join(','), ...rows].join('\n')
}
```

---

## Environment Variables

### Setting Secrets

```bash
# Via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets list

# Via Dashboard
# Go to: Project Settings > Edge Functions > Add Secret
```

### Accessing in Functions

```typescript
const apiKey = Deno.env.get('API_KEY')

// Check for required env vars
if (!apiKey) {
  throw new Error('API_KEY environment variable is required')
}
```

---

## Testing Edge Functions

### Local Development

```bash
# Start local emulator
supabase start

# Call function locally
supabase functions call my-function --no-verify-jwt

# With data
supabase functions call my-function \
  --data '{"foo":"bar"}' \
  --no-verify-jwt
```

### Remote Testing

```bash
# Deployed function
supabase functions call my-function \
  --project-ref YOUR_PROJECT_REF \
  --data '{"foo":"bar"}'
```

### Testing with curl

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/my-function \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"foo":"bar"}'
```

---

## Best Practices

```yaml
Error Handling:
  - Always wrap in try/catch
  - Return appropriate HTTP status codes
  - Log errors for debugging
  - Don't expose sensitive data in errors

Security:
  - Never expose service role key to client
  - Always verify JWT for protected routes
  - Validate all input
  - Use secrets for API keys
  - Rate limit external API calls

Performance:
  - Cache when possible
  - Use pagination for large datasets
  - Keep functions stateless
  - Return early on errors

CORS:
  - Include OPTIONS handler
  - Set specific origin in production
  - Include all necessary headers
```

---

## Common Use Cases

| Use Case | Function Example |
|----------|------------------|
| Payment webhooks | Stripe webhook handler |
| Email sending | Resend/SendGrid integration |
| Scheduled tasks | Daily cleanup, reports |
| External APIs | Fetch data from third-party APIs |
| Data processing | Generate exports, transform data |
| Auth helpers | Custom auth logic |
| File processing | Image optimization, PDF generation |

---

## Output Deliverables

1. ✅ Edge Function deployed to Supabase
2. ✅ Environment variables configured
3. ✅ CORS enabled for your domain
4. ✅ Error handling and logging
5. ✅ Local and remote testing

---

## Setup Checklist

- [ ] Initialize Supabase project
- [ ] Create functions directory
- [ ] Write Edge Function code
- [ ] Set environment variables
- [ ] Deploy function
- [ ] Test locally and remotely
- [ ] Monitor logs

---

## Next Steps

After completing Phase 9:

1. Deploy to production
2. Set up monitoring
3. Configure scheduled tasks
4. Run [Phase 7: Troubleshooting](./07-troubleshooting-prompts.md)

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
