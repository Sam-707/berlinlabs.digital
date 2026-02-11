---
title: "Phase 8: WhatsApp & AI Integration"
description: "Build WhatsApp bots with Twilio and integrate AI capabilities (Gemini, OpenAI, Claude)"
category: "Integrations"
tags: ["whatsapp", "twilio", "ai", "gemini", "openai", "claude", "bots"]
difficulty: "Advanced"
timeRequired: "6-10 hours"
dependencies: ["Phase 1: Foundation Framework", "Phase 9: Edge Functions"]
order: 8
---

# Phase 8: WhatsApp & AI Integration

---

## Prompt 8A: WhatsApp Bot with Twilio

**Add WhatsApp messaging capabilities**

---

### Requirements

- Use Twilio Programmable Messaging API
- Supabase Edge Function as webhook endpoint
- Store conversation history in Supabase
- Handle incoming messages and send responses
- Support rich messages (text, media, templates)

---

### Twilio Setup

1. **Create Twilio account** and get:
   - Account SID
   - Auth Token
   - WhatsApp Business Number

2. **Configure webhook URL** to your Supabase Edge Function

---

### Database Schema

```sql
-- WhatsApp conversations
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  conversation_state TEXT DEFAULT 'welcome', -- welcome, active, paused
  subscription_tier TEXT DEFAULT 'free', -- free, basic, premium, unlimited
  total_credits INTEGER DEFAULT 5,
  credits_remaining INTEGER DEFAULT 5,
  credits_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message history
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- incoming, outgoing
  message_body TEXT,
  message_type TEXT DEFAULT 'text', -- text, image, document, template
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  document_type TEXT,
  analysis_result JSONB,
  was_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits_included INTEGER NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'eur',
  interval TEXT DEFAULT 'monthly', -- monthly, yearly
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, credits_included, price, interval) VALUES
  ('Free', 5, 0, 'monthly'),
  ('Basic', 50, 9, 'monthly'),
  ('Premium', 200, 29, 'monthly'),
  ('Unlimited', -1, 99, 'monthly'); -- -1 means unlimited
```

---

### Edge Function: WhatsApp Webhook

```typescript
// supabase/functions/whatsapp-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')

// CORS headers
corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse Twilio form data
    const formData = await req.formData()
    const messageBody = formData.get('Body') as string
    const fromNumber = formData.get('From') as string
    const mediaUrl = formData.get('MediaUrl0') as string | null

    // Get or create conversation
    const { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .upsert({
        phone_number: fromNumber,
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone_number' })
      .select()
      .single()

    if (convError) throw convError

    // Store incoming message
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'incoming',
      message_body: messageBody,
      message_type: mediaUrl ? 'image' : 'text',
      media_url: mediaUrl
    })

    // Check credits
    if (conversation.credits_remaining <= 0 && conversation.subscription_tier !== 'unlimited') {
      const response = "You've used all your credits. Upgrade to continue.\n\nPlans:\n• Basic: 50 credits - €9/mo\n• Premium: 200 credits - €29/mo\n• Unlimited: €99/mo"

      await sendWhatsAppMessage(fromNumber, response)
      await storeOutgoingMessage(conversation.id, response)

      return new Response('OK', { headers: corsHeaders })
    }

    // Process message and generate response
    const response = await processMessage(messageBody, conversation, mediaUrl)

    // Store response
    await storeOutgoingMessage(conversation.id, response)

    // Deduct credit (unless free tier and first message)
    const { data: usageCount } = await supabase
      .from('usage_logs')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversation.id)

    const isFirstUsage = !usageCount || usageCount.count === 0

    if (!isFirstUsage && conversation.subscription_tier !== 'unlimited') {
      await supabase.from('whatsapp_conversations')
        .update({
          credits_remaining: conversation.credits_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)
    }

    // Send response via Twilio
    await sendWhatsAppMessage(fromNumber, response)

    // Log usage
    await supabase.from('usage_logs').insert({
      conversation_id: conversation.id,
      was_free: isFirstUsage
    })

    // Return TwiML response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response}</Message>
      </Response>`,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function processMessage(message: string, conversation: any, mediaUrl?: string | null) {
  // Add your message processing logic here
  // This could include AI analysis, document processing, etc.

  if (mediaUrl) {
    return "I received an image! I can analyze it if you'd like."
  }

  // Simple command handling
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('help') || lowerMessage.includes('start')) {
    return `Welcome! Send me:\n• A document URL to analyze\n• An image to process\n• "balance" to check credits\n• "plans" to see subscription options`
  }

  if (lowerMessage.includes('balance') || lowerMessage.includes('credits')) {
    return `Credits: ${conversation.credits_remaining}/${conversation.total_credits}\nPlan: ${conversation.subscription_tier}`
  }

  if (lowerMessage.includes('plans') || lowerMessage.includes('upgrade')) {
    return `Available Plans:\n\n• Free: 5 credits/month\n• Basic: 50 credits - €9/mo\n• Premium: 200 credits - €29/mo\n• Unlimited: €99/mo\n\nReply with the plan name to upgrade.`
  }

  // Default: acknowledge message
  return `I received your message: "${message}"\n\nSend "help" to see what I can do.`
}

async function sendWhatsAppMessage(to: string, body: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

  const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

  await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      To: to,
      From: 'whatsapp:+YOUR_TWILIO_NUMBER',
      Body: body
    })
  })
}

async function storeOutgoingMessage(conversationId: string, message: string) {
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversationId,
    direction: 'outgoing',
    message_body: message,
    message_type: 'text'
  })
}
```

---

### Subscription Tiers

| Tier | Credits/Month | Price |
|------|---------------|-------|
| Free | 5 | €0 |
| Basic | 50 | €9 |
| Premium | 200 | €29 |
| Unlimited | ∞ | €99 |

---

### Output Deliverables

1. ✅ Supabase Edge Function for Twilio webhook
2. ✅ Database migrations for conversations, messages, usage logs
3. ✅ Credit checking middleware
4. ✅ Subscription management page
5. ✅ Usage dashboard showing credits and history

---

## Prompt 8B: AI Integration

**Add AI capabilities using Gemini, OpenAI, or Claude**

---

### Providers

| Provider | Best For | Model |
|----------|----------|-------|
| Google Gemini | Document analysis | gemini-pro |
| OpenAI GPT-4 | Chat/conversational | gpt-4 |
| Anthropic Claude | Complex reasoning | claude-3-sonnet |
| Open-source | Cost-effective | Llama, Mistral |

---

### Requirements

- Use Supabase Edge Function to hide API keys
- Cache AI responses to reduce costs
- Track usage for billing
- Handle rate limits gracefully
- Stream responses when applicable (for chat)

---

### Database Schema

```sql
-- AI interactions
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI cache (deduplicate similar prompts)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX idx_ai_cache_hash ON ai_cache(prompt_hash);
```

---

### Edge Function: Google Gemini

```typescript
// supabase/functions/ai-analyze/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, content, model = 'gemini-pro' } = await req.json()

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization')

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (!user) throw new Error('Invalid token')

    // Check cache first
    const cacheKey = await hashString(`${prompt}\n\n${content}`)

    const { data: cached } = await supabase
      .from('ai_cache')
      .select('response, tokens_used, hit_count')
      .eq('prompt_hash', cacheKey)
      .eq('model', model)
      .single()

    if (cached) {
      // Update cache hit count
      await supabase.from('ai_cache')
        .update({ hit_count: cached.hit_count + 1 })
        .eq('prompt_hash', cacheKey)

      return new Response(
        JSON.stringify({
          response: cached.response,
          cached: true,
          tokens_used: cached.tokens_used
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call AI API
    const aiModel = genAI.getModel(model)
    const result = await aiModel.generateContent(`${prompt}\n\n${content}`)
    const response = result.response.text()
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0

    // Calculate cost (approximate Gemini pricing)
    const cost = calculateCost(model, tokensUsed)

    // Cache result
    await supabase.from('ai_cache').insert({
      prompt_hash: cacheKey,
      model,
      response,
      tokens_used: tokensUsed
    })

    // Log usage
    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      model,
      prompt: `${prompt}\n\n${content}`.substring(0, 1000), // Truncate for storage
      response,
      tokens_used: tokensUsed,
      cost
    })

    return new Response(
      JSON.stringify({
        response,
        cached: false,
        tokens_used: tokensUsed,
        cost
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})

async function hashString(str: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function calculateCost(model: string, tokens: number) {
  const prices = {
    'gemini-pro': { input: 0.0000005, output: 0.0000015 },
    'gemini-pro-vision': { input: 0.0000025, output: 0.00001 }
  }

  const rate = prices[model] || prices['gemini-pro']
  return (tokens * (rate.input + rate.output) / 2)
}
```

---

### Client-Side Usage

```typescript
// lib/ai.ts
export async function analyzeDocument(prompt: string, content: string) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ prompt, content })
    }
  )

  if (!response.ok) {
    throw new Error('AI analysis failed')
  }

  const { response: text, cached, tokens_used, cost } = await response.json()

  return { text, cached, tokens_used, cost }
}

// Usage in component
const result = await analyzeDocument(
  'Extract all invoice details from this document',
  documentContent
)

console.log(result.text)
console.log(`Tokens: ${result.tokens_used}, Cost: €${result.cost}`)
```

---

### Cost Tracking Dashboard

```typescript
// components/AIUsage.tsx
export function AIUsage() {
  const [usage, setUsage] = useState([])

  useEffect(() => {
    loadUsage()
  }, [])

  async function loadUsage() {
    const { data } = await supabase
      .from('ai_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    setUsage(data)
  }

  const totalCost = usage.reduce((sum, item) => sum + item.cost, 0)
  const totalTokens = usage.reduce((sum, item) => sum + item.tokens_used, 0)

  return (
    <div className="ai-usage">
      <h2>AI Usage</h2>
      <div className="stats">
        <div className="stat">
          <label>Total Cost</label>
          <span>€{totalCost.toFixed(4)}</span>
        </div>
        <div className="stat">
          <label>Total Tokens</label>
          <span>{totalTokens.toLocaleString()}</span>
        </div>
        <div className="stat">
          <label>Requests</label>
          <span>{usage.length}</span>
        </div>
      </div>
    </div>
  )
}
```

---

### Output Deliverables

1. ✅ Supabase Edge Function for AI API calls
2. ✅ Database migrations for ai_interactions, ai_cache
3. ✅ Utility functions (lib/ai.ts)
4. ✅ Usage dashboard widget
5. ✅ Cost tracking per user/month

---

## Prompt 8C: WhatsApp + AI Combined

**Build an AI-powered WhatsApp assistant**

---

### Use Cases

- Document analyzer via WhatsApp
- AI customer support via WhatsApp
- AI-powered information retrieval
- Conversational AI assistant through WhatsApp

---

### Combined Edge Function

```typescript
// Process WhatsApp message with AI
async function processMessageWithAI(
  message: string,
  conversation: any,
  mediaUrl?: string | null
) {
  // Check if it's a URL to analyze
  const urlMatch = message.match(/(https?:\/\/[^\s]+)/)

  if (urlMatch || mediaUrl) {
    const url = urlMatch ? urlMatch[0] : mediaUrl

    // Fetch document/image
    const content = await fetchDocument(url)

    // Analyze with AI
    const { text: analysis } = await analyzeWithAI(
      'Extract and summarize the key information from this document.',
      content
    )

    return `📄 Analysis:\n\n${analysis}`
  }

  // Regular chat with AI
  const { text: response } = await analyzeWithAI(
    'You are a helpful assistant. Respond concisely.',
    message
  )

  return response
}
```

---

### Pricing Examples

| Tier | Analyses/Month | Price |
|------|----------------|-------|
| Free | 5 | €0 |
| Basic | 50 | €9 |
| Premium | 200 | €29 |
| Unlimited | Unlimited | €99 |

---

### Output Deliverables

1. ✅ Combined WhatsApp + AI Edge Function
2. ✅ Document upload/download utilities
3. ✅ Credit deduction on each analysis
4. ✅ Pricing page with tiers
5. ✅ Usage dashboard
6. ✅ Admin panel for viewing all conversations

---

## Setup Checklist

### WhatsApp Bot
- [ ] Create Twilio account
- [ ] Get WhatsApp sandbox number
- [ ] Deploy Edge Function
- [ ] Configure webhook in Twilio
- [ ] Test with sandbox

### AI Integration
- [ ] Get API key from provider
- [ ] Deploy Edge Function
- [ ] Test with sample prompts
- [ ] Set up cost tracking
- [ ] Configure cache TTL

---

## Next Steps

After completing Phase 8:

1. Deploy to production
2. Monitor costs and usage
3. Set up alerts for quota limits
4. Run [Phase 7: Troubleshooting](./07-troubleshooting-prompts.md)

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
