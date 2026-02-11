# Phase 8: WhatsApp & AI Integration

Advanced features for building AI-powered WhatsApp bots and integrations.

---

## Prompt 8A - WhatsApp Bot with Twilio

Add WhatsApp messaging capabilities to your application.

---

## Requirements

Implement a WhatsApp bot using Twilio API for:

- **Use Case**: [Specify - e.g., Customer support, Document analysis, Information retrieval]
- **Send and receive** WhatsApp messages
- **Handle media** (images, documents, audio)
- **Conversation state management**
- **Message templates** for structured responses

---

## Twilio Setup

### Prerequisites

1. Create a Twilio account: https://www.twilio.com
2. Get your credentials:
   - Account SID
   - Auth Token
   - WhatsApp Business Number (or use sandbox)
3. Configure webhook URL to your Supabase Edge Function

### Environment Variables

```bash
# Supabase Edge Function secrets
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Data Structure

```sql
-- WhatsApp conversations
CREATE TABLE public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  conversation_state TEXT DEFAULT 'new',
  subscription_tier TEXT DEFAULT 'free',
  total_credits INTEGER DEFAULT 5,
  credits_remaining INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message history
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_body TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'template')),
  media_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.whatsapp_conversations(id),
  action TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,
  was_free BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits_included INTEGER NOT NULL,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month',
  features JSONB,
  active BOOLEAN DEFAULT true
);

-- Insert plans
INSERT INTO public.subscription_plans (id, name, credits_included, price, features) VALUES
  ('free', 'Free', 5, 0, '["5 messages/month"]'::jsonb),
  ('basic', 'Basic', 50, 9, '["50 messages/month", "Priority support"]'::jsonb),
  ('pro', 'Pro', 200, 29, '["200 messages/month", "Priority support", "Advanced features"]'::jsonb);

-- Indexes
CREATE INDEX idx_whatsapp_messages_conversation ON public.whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);
CREATE INDEX idx_usage_logs_conversation ON public.usage_logs(conversation_id);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin can view all, users view their own by phone)
CREATE POLICY "Admins can view all conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can view all messages"
  ON public.whatsapp_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
```

---

## Deliverables

### 1. Supabase Edge Function - WhatsApp Webhook

```typescript
// supabase/functions/whatsapp-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Twilio helper function
async function sendWhatsAppMessage(to: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber!,
        To: to,
        Body: message,
      }),
    }
  )

  return response.json()
}

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Parse form data from Twilio
    const formData = await req.formData()
    const messageBody = formData.get('Body') as string
    const fromNumber = formData.get('From') as string // whatsapp:+1234567890
    const mediaUrl = formData.get('MediaUrl0') as string | null

    // Get or create conversation
    const { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .upsert({
        phone_number: fromNumber,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (convError) throw convError

    // Store incoming message
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'incoming',
      message_body: messageBody,
      message_type: mediaUrl ? 'image' : 'text',
      media_url: mediaUrl,
    })

    // Check credits
    if (conversation.credits_remaining <= 0) {
      await sendWhatsAppMessage(fromNumber,
        "You've used all your credits. Upgrade to continue:\n\n" +
        "- Basic: 50 credits for $9\n" +
        "- Pro: 200 credits for $29\n\n" +
        "Visit https://your-app.com/pricing to upgrade"
      )
      return new Response('<?xml version="1.0"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Process message and generate response
    const response = await processMessage(messageBody, conversation)

    // Store outgoing message
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outgoing',
      message_body: response,
      message_type: 'text',
    })

    // Log usage and deduct credit
    await supabase.from('usage_logs').insert({
      conversation_id: conversation.id,
      action: 'message_response',
      credits_used: 1,
      was_free: conversation.credits_remaining > 0,
    })

    await supabase.from('whatsapp_conversations')
      .update({
        credits_remaining: conversation.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    // Send response via TwiML
    const twiML = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
      </Response>`

    return new Response(twiML, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response('<?xml version="1.0"?><Response></Response>', {
      status: 500,
      headers: { 'Content-Type': 'text/xml' }
    })
  }
})

// Message processing logic
async function processMessage(messageBody: string, conversation: any): Promise<string> {
  const trimmed = messageBody.toLowerCase().trim()

  // Handle different message types
  if (trimmed === 'help' || trimmed === '/help') {
    return `🤖 *Welcome!*

I can help you with:
• Type "analyze [URL]" to analyze a document
• Type "credits" to check your balance
• Type "help" to see this message

You have ${conversation.credits_remaining} credits remaining.`
  }

  if (trimmed === 'credits' || trimmed === 'balance') {
    return `💳 *Your Credits*

Remaining: ${conversation.credits_remaining}/${conversation.total_credits}
Tier: ${conversation.subscription_tier}

Need more? Visit https://your-app.com/pricing`
  }

  // Document analysis
  if (trimmed.startsWith('analyze ')) {
    const url = trimmed.replace('analyze ', '').trim()
    if (isValidUrl(url)) {
      // In a real implementation, you would:
      // 1. Fetch the document
      // 2. Extract text/content
      // 3. Send to AI for analysis
      // 4. Return formatted results

      return `📄 *Analysis Complete*

Here's what I found:
• [Point 1]
• [Point 2]
• [Point 3]

1 credit used. Remaining: ${conversation.credits_remaining - 1}`
    }
    return 'Please provide a valid URL. Usage: analyze https://example.com/document.pdf'
  }

  // Default response
  return `I didn't understand that. Type "help" to see available commands.

You have ${conversation.credits_remaining} credits remaining.`
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}
```

### 2. Frontend - Conversation Management

```typescript
// src/pages/admin/WhatsAppConversationsPage.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function WhatsAppConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetchConversations()
    subscribeToNewMessages()
  }, [])

  async function fetchConversations() {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
    setConversations(data || [])
  }

  async function fetchMessages(conversationId: string) {
    const { data } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  function subscribeToNewMessages() {
    const channel = supabase
      .channel('whatsapp-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'whatsapp_messages'
      }, () => {
        if (selectedConversation) {
          fetchMessages(selectedConversation.id)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  return (
    <div className="whatsapp-admin">
      <h1>WhatsApp Conversations</h1>
      <div className="conversations-grid">
        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedConversation(conv)
                fetchMessages(conv.id)
              }}
            >
              <span className="phone">{conv.phone_number}</span>
              <span className="credits">{conv.credits_remaining}/{conv.total_credits} credits</span>
            </div>
          ))}
        </div>
        <div className="messages-panel">
          {selectedConversation && (
            <>
              <div className="messages-list">
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.direction}`}>
                    <div className="message-bubble">{msg.message_body}</div>
                    <span className="time">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Subscription Tiers

| Tier | Credits | Price | Features |
|------|---------|-------|----------|
| Free | 5/month | €0 | Basic access |
| Basic | 50/month | €9 | Priority support |
| Pro | 200/month | €29 | Priority support, advanced features |
| Unlimited | Unlimited | €99 | Everything |

---

## CSS

```css
.whatsapp-admin {
  padding: 2rem;
}

.conversations-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: calc(100vh - 100px);
}

.conversations-list {
  overflow-y: auto;
  border-right: 1px solid var(--border);
}

.conversation-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.conversation-item:hover,
.conversation-item.active {
  background: var(--bg-tertiary);
}

.messages-panel {
  display: flex;
  flex-direction: column;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message.incoming {
  align-items: flex-start;
}

.message.outgoing {
  align-items: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
}

.message.incoming .message-bubble {
  background: var(--bg-tertiary);
  border-bottom-left-radius: 2px;
}

.message.outgoing .message-bubble {
  background: var(--accent);
  border-bottom-right-radius: 2px;
}

.message .time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
```

---

## Prompt 8B - AI Integration

Add AI capabilities using popular providers.

---

## Requirements

Integrate [PROVIDER] AI for [PURPOSE]:

### Providers (Choose One)

| Provider | Best For | Pricing |
|----------|----------|---------|
| Google Gemini | Document analysis, multimodal | Free tier, then per-token |
| OpenAI GPT-4 | Chat, code, reasoning | Per-token |
| Anthropic Claude | Complex reasoning, long context | Per-token |
| Open-source (Llama, Mistral) | Cost-effective, privacy | Various |

### Use Cases

- Document analysis and extraction
- Chatbot/conversational AI
- Content generation
- Image analysis
- Code generation
- Translation/summarization

---

## Deliverables

### 1. Supabase Edge Function - AI API

```typescript
// supabase/functions/ai-analyze/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Gemini AI integration
async function analyzeWithGemini(prompt: string, content: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt}\n\n${content}` }]
        }]
      })
    }
  )

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// Main handler
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, content, userId } = await req.json()

    // Check cache first
    const cacheKey = btoa(prompt + content).substring(0, 32)
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('response')
      .eq('prompt_hash', cacheKey)
      .single()

    if (cached) {
      return new Response(JSON.stringify({ result: cached.response, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Call AI API
    const result = await analyzeWithGemini(prompt, content)

    // Cache result
    await supabase.from('ai_cache').insert({
      prompt_hash: cacheKey,
      model: 'gemini-pro',
      response: result,
      tokens_used: 0, // Gemini doesn't return tokens by default
    })

    // Log usage
    await supabase.from('ai_interactions').insert({
      user_id: userId,
      model: 'gemini-pro',
      prompt,
      response: result,
      tokens_used: 0,
    })

    return new Response(JSON.stringify({ result, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: corsHeaders
    })
  }
})
```

### 2. Database Schema for AI

```sql
-- AI interactions
CREATE TABLE public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI cache (deduplicate similar prompts)
CREATE TABLE public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own AI interactions"
  ON public.ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI interactions"
  ON public.ai_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view AI cache"
  ON public.ai_cache FOR SELECT
  USING (true); // Public cache for deduplication
```

### 3. Frontend - AI Interface

```typescript
// src/components/AIAnalyzer.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AIAnalyzer() {
  const [prompt, setPrompt] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)

  async function analyze() {
    setLoading(true)
    setResult('')

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.functions.invoke('ai-analyze', {
      body: { prompt, content, userId: user?.id }
    })

    if (error) {
      setResult('Error: ' + error.message)
    } else {
      setResult(data.result)
      setCached(data.cached)
    }

    setLoading(false)
  }

  return (
    <div className="ai-analyzer">
      <h2>AI Document Analyzer</h2>
      <div className="input-section">
        <textarea
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <textarea
          placeholder="Paste your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={analyze} disabled={loading || !prompt || !content}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {result && (
        <div className="result-section">
          <div className="result-header">
            <h3>Result</h3>
            {cached && <span className="badge">From Cache</span>}
          </div>
          <div className="result-content">{result}</div>
        </div>
      )}
    </div>
  )
}
```

---

## Cost Tracking

```typescript
// src/hooks/useAIUsage.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAIUsage() {
  const [usage, setUsage] = useState({ tokens: 0, cost: 0, requests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  async function fetchUsage() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get this month's usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('ai_interactions')
      .select('tokens_used, cost')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if (data) {
      setUsage({
        tokens: data.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
        cost: data.reduce((sum, r) => sum + (r.cost || 0), 0),
        requests: data.length
      })
    }
    setLoading(false)
  }

  return { usage, loading, refresh: fetchUsage }
}
```

---

## Prompt 8C - Combined WhatsApp + AI

Build an AI-powered WhatsApp assistant.

---

## Use Cases

- **Document Analyzer**: Send PDF/image via WhatsApp, get AI analysis
- **AI Customer Support**: Automated customer service via WhatsApp
- **Information Retrieval**: Ask questions, get AI-powered answers
- **Conversational Assistant**: Chat with AI through WhatsApp

---

## Combined Flow

```typescript
// Enhanced processMessage function for AI analysis
async function processMessage(messageBody: string, conversation: any): Promise<string> {
  const trimmed = messageBody.toLowerCase().trim()

  // Document analysis via URL
  if (trimmed.startsWith('analyze ')) {
    const url = trimmed.replace('analyze ', '').trim()

    if (isValidUrl(url)) {
      // Fetch document
      const content = await fetchDocument(url)

      // AI analysis
      const analysis = await analyzeWithGemini(
        'Analyze this document and extract key information',
        content
      )

      // Deduct credit
      await supabase.from('whatsapp_conversations')
        .update({ credits_remaining: conversation.credits_remaining - 1 })
        .eq('id', conversation.id)

      return `📄 *Analysis*\n\n${analysis}\n\n1 credit used. Remaining: ${conversation.credits_remaining - 1}`
    }
  }

  // AI chat
  if (trimmed.startsWith('ask ')) {
    const question = trimmed.replace('ask ', '')

    const response = await analyzeWithGemini(
      'Answer this question concisely:',
      question
    )

    return `🤖 ${response}`
  }

  // Help menu
  return `🤖 *WhatsApp AI Bot*

Commands:
• analyze [URL] - Analyze a document
• ask [question] - Ask AI anything
• credits - Check your balance
• help - Show this menu

Credits: ${conversation.credits_remaining}/${conversation.total_credits}`
}

// Helper to fetch document content
async function fetchDocument(url: string): Promise<string> {
  // In production, use a proper document parser
  const response = await fetch(url)
  const text = await response.text()
  return text.substring(0, 10000) // Limit for demo
}
```

---

## Pricing Examples

| Use Case | Free | Basic | Pro | Unlimited |
|----------|------|-------|-----|-----------|
| Document Analysis | 5/month | 50/month - €9 | 200/month - €29 | Unlimited - €99 |
| AI Chat | 10/month | 100/month - €9 | 500/month - €29 | Unlimited - €99 |
| Combined | 5 total | 50 total - €9 | 200 total - €29 | Unlimited - €99 |

---

## CSS

```css
.ai-analyzer {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
}

.result-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.result-content {
  padding: 1rem;
  white-space: pre-wrap;
  line-height: 1.6;
}

.badge {
  background: var(--success);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}
```

---

## Next Steps

After implementing WhatsApp & AI:

1. **Test with Twilio Sandbox** - Before going live
2. **Add Webhook Security** - Verify Twilio signatures
3. **Implement Rate Limiting** - Prevent abuse
4. **Add Analytics** - Track usage patterns
5. **Deploy Edge Functions** → Go to [Phase 9: Edge Functions](./phase-9-edge-functions.md)
