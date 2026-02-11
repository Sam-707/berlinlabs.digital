# Phase 9: Edge Functions & Serverless

Supabase Edge Functions templates for custom serverless logic.

---

## Overview

Supabase Edge Functions are Deno-based serverless functions that run close to your data. They're perfect for:

- API integrations (Stripe, OpenAI, Twilio)
- Webhook handlers
- Scheduled tasks
- Data processing
- Custom business logic

---

## Prompt 9A - Edge Function Template

Create a new Supabase Edge Function.

---

## Requirements

- Use Deno runtime (TypeScript/JavaScript supported)
- Access Supabase client with service role
- Environment variables for API keys
- CORS handling for web requests
- Error handling and logging

---

## Basic Template

```typescript
// supabase/functions/[function-name]/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { param1, param2 } = await req.json()

    // Your business logic here
    const result = await performBusinessLogic(param1, param2)

    // Return success response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})

// Business logic function
async function performBusinessLogic(param1: any, param2: any) {
  // Example: Query database
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .eq('column', param1)

  if (error) throw error

  return data
}
```

---

## Deployment

```bash
# Link to your Supabase project
supabase link

# Deploy the function
supabase functions deploy [function-name]

# Set environment variables (optional)
supabase secrets set MY_SECRET_KEY=value

# View logs
supabase functions logs [function-name]
```

---

## Common Edge Function Patterns

### 1. Webhook Handler

```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('x-webhook-signature')
  const body = await req.text()

  // Verify webhook signature (for security)
  const expectedSignature = await hmacSignature(body, Deno.env.get('WEBHOOK_SECRET'))
  if (signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Parse webhook data
  const data = JSON.parse(body)

  // Process webhook event
  switch (data.event) {
    case 'payment.success':
      await handlePaymentSuccess(data)
      break
    case 'user.created':
      await handleUserCreated(data)
      break
    default:
      console.log('Unhandled event:', data.event)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

async function hmacSignature(data: string, secret: string | undefined) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function handlePaymentSuccess(data: any) {
  // Update user subscription
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('user_id', data.user_id)
}

async function handleUserCreated(data: any) {
  // Create user profile
  await supabase
    .from('profiles')
    .insert({ user_id: data.user_id })
}
```

### 2. API Proxy

```typescript
// supabase/functions/api-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const API_KEY = Deno.env.get('EXTERNAL_API_KEY')

serve(async (req) => {
  // Extract request details
  const { endpoint, method, body } = await req.json()

  // Make external API call
  const response = await fetch(`https://api.example.com/${endpoint}`, {
    method: method || 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  })
})
```

### 3. Scheduled Task (Cron)

```typescript
// Note: Supabase doesn't have built-in cron, but you can use external services
// like GitHub Actions or cron-job.org to trigger this function

// supabase/functions/cleanup-task/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Verify this is a scheduled task (using a secret key)
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Perform cleanup task
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Delete old logs
  const { data } = await supabase
    .from('logs')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString())

  return new Response(JSON.stringify({
    success: true,
    deleted: data
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 4. Data Processing

```typescript
// supabase/functions/process-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const { userId } = await req.json()

  // Fetch user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Process data
  const report = generateReport(user)

  // Save processed data
  await supabase
    .from('reports')
    .insert({
      user_id: userId,
      data: report,
    })

  return new Response(JSON.stringify({ report }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

function generateReport(user: any) {
  // Your data processing logic
  return {
    summary: '...',
    metrics: { ... },
    generatedAt: new Date().toISOString()
  }
}
```

### 5. File Upload Handler

```typescript
// supabase/functions/upload-handler/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const formData = await req.formData()
  const file = formData.get('file')
  const userId = formData.get('userId')
  const bucket = formData.get('bucket') || 'uploads'

  if (!file || !(file instanceof File)) {
    return new Response('No file uploaded', { status: 400 })
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${userId}/${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(filename, file)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filename)

  // Save file record
  await supabase
    .from('files')
    .insert({
      user_id: userId,
      filename: file.name,
      storage_path: filename,
      public_url: publicUrl,
      size: file.size,
      mime_type: file.type,
    })

  return new Response(JSON.stringify({
    success: true,
    url: publicUrl
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Frontend Integration

```typescript
// Call Edge Function from React
async function callEdgeFunction(functionName: string, data: any) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error('Function call failed')
  }

  return response.json()
}

// Usage
const result = await callEdgeFunction('my-function', {
  param1: 'value1',
  param2: 'value2',
})
```

---

## Environment Variables

```bash
# Set secrets locally (for development)
supabase secrets set MY_SECRET=value

# Set secrets in production (Supabase dashboard)
# Dashboard > Project Settings > Edge Functions > Secrets

# Available in Deno
const secret = Deno.env.get('MY_SECRET')
```

---

## Error Handling Best Practices

```typescript
serve(async (req) => {
  try {
    // Validate input
    const { email, name } = await req.json()

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Business logic
    const result = await processData(email, name)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error:', error)

    // Don't leak sensitive info in error messages
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
```

---

## Authentication in Edge Functions

### User Context

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    }
  )

  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Access user.id in your logic
  const { data } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id)

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Admin/Service Role

```typescript
// Use service role for admin operations (bypasses RLS)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Bypasses RLS
)
```

---

## Common Edge Function Examples

| Function | Purpose | Key Features |
|----------|---------|--------------|
| `stripe-webhook` | Handle Stripe events | Signature verification |
| `ai-chat` | Call OpenAI/Gemini API | API key security |
| `send-email` | Send transactional emails | Resend/Postmark integration |
| `generate-pdf` | Create PDF reports | PDF generation |
| `process-image` | Image manipulation | Sharp library |
| `cleanup-scheduled` | Scheduled cleanup tasks | Cron triggering |
| `export-data` | Export user data | CSV generation |
| `import-csv` | Bulk data import | CSV parsing |

---

## Useful Deno Libraries

```typescript
// HTTP requests
import { fetch } from 'https://deno.land/std@0.168.0/http/fetch.ts'

// CSV parsing
import { parse } from 'https://deno.land/std@0.168.0/csv/parse.ts'

// UUID generation
import { v4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts'

// Date formatting
import { format } from 'https://deno.land/std@0.168.0/datetime/format.ts'

// Hashing
import { sha256 } from 'https://deno.land/std@0.168.0/crypto/sha256.ts'

// HTML parsing
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.36/deno-dom-wasm.ts'
```

---

## Testing Edge Functions Locally

```bash
# Start local development server
supabase functions serve

# Call your function locally
curl -X POST http://localhost:54321/functions/v1/my-function \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"param1": "value1"}'

# View logs
supabase functions serve --debug
```

---

## Monitoring & Logging

```typescript
// Structured logging
console.log({
  level: 'info',
  message: 'Processing request',
  userId: user.id,
  timestamp: new Date().toISOString()
})

// Error logging
console.error({
  level: 'error',
  message: error.message,
  stack: error.stack,
  userId: user?.id
})

// View logs in Supabase dashboard
// Dashboard > Edge Functions > [function-name] > Logs
```

---

## Performance Tips

1. **Cache responses** when possible
2. **Use connection pooling** for external APIs
3. **Process data in batches** for large datasets
4. **Set appropriate timeouts** for external requests
5. **Use streaming** for large file uploads/downloads

---

## Next Steps

After creating Edge Functions:

1. **Test locally** with `supabase functions serve`
2. **Deploy to production** with `supabase functions deploy`
3. **Monitor logs** in Supabase dashboard
4. **Set up alerts** for failures
5. **Implement caching** for performance

---

## Full Prompt Pack Complete!

You now have a complete prompt pack for building SaaS applications as a solopreneur. Review all phases:

1. ✅ Foundation Framework
2. ✅ Authentication Patterns
3. ✅ Data & Dashboard Patterns
4. ✅ Common Features
5. ✅ RLS Policy Templates
6. ✅ Project Templates
7. ✅ Troubleshooting Prompts
8. ✅ WhatsApp & AI Integration
9. ✅ Edge Functions

Start building your next SaaS project!
