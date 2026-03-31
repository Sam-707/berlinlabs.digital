claude# 3rbst API Documentation

> **Version**: 1.0
> **Base URL**: `https://your-domain.vercel.app/api`
> **Last Updated**: 2026-02-11

---

## Overview

The 3rbst API is a serverless REST API built on Vercel that handles WhatsApp webhooks, document analysis, and payment processing.

**Tech Stack**:
- Runtime: Node.js 18+ (Vercel serverless)
- Database: Supabase (PostgreSQL)
- AI: Google Gemini 2.0 Flash
- WhatsApp: Evolution API v2
- Payments: PayPal

---

## Authentication

Most endpoints are public (called by Evolution API webhooks). Admin endpoints require API key.

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (admin endpoints only)
```

---

## Endpoints

### 1. Webhook (Main Entry Point)

**POST** `/api/webhook`

Receives WhatsApp messages from Evolution API and processes document analysis requests.

#### Request Body
```json
{
  "From": "whatsapp:+49176123456789",
  "Body": "Optional text message",
  "MessageSid": "msg_12345",
  "NumMedia": 1,
  "MediaUrl0": "https://wa.your-domain.com/media/file.jpg"
}
```

#### Response
```json
{
  "success": true,
  "messageSid": "msg_67890",
  "version": "1.0",
  "processingTimeMs": 3245
}
```

#### Flow Diagram
```
Evolution API → /api/webhook → Check GDPR → Check Credits
                                     ↓
                              /api/analyze (Gemini)
                                     ↓
                              Update Supabase
                                     ↓
                              Evolution API (reply)
```

---

### 2. Analyze Document

**POST** `/api/analyze`

Analyzes a German document image using Google Gemini AI.

#### Request Body
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "mimeType": "image/jpeg",
  "phoneNumber": "+49176123456789"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | string | Yes | Base64-encoded image with data URL prefix |
| mimeType | string | Yes | MIME type (image/jpeg, image/png) |
| phoneNumber | string | No | User phone number for credit deduction |

#### Response (Success)
```json
{
  "text": "🔸 *تحليل الوثيقة*\n\n📄 *الوثيقة: مكالمة محكمة*\n\n...",
  "creditsRemaining": 4
}
```

#### Response (No Credits)
```json
{
  "error": "لا يوجد لديك رصيد كافٍ. يرجى شراء المزيد من التحليلات."
}
```

#### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Missing image or mimeType |
| 402 | Insufficient credits |
| 500 | Internal server error |

---

### 3. PayPal Payment Fulfillment

**POST** `/api/fulfill-order`

Processes PayPal payment and adds credits to user account.

#### Request Body (from PayPal webhook)
```json
{
  "resource_type": "sale",
  "event_type": "PAYMENT.SALE.COMPLETED",
  "resource": {
    "amount": {
      "total": "15.00",
      "currency": "EUR"
    },
    "custom": "+49176123456789"
  }
}
```

#### Processing Logic
```typescript
// 1. Verify webhook signature
// 2. Extract phone number from custom field
// 3. Determine plan amount:
//    - €7   → 5 credits
//    - €15  → 15 credits
//    - €25  → unlimited
// 4. Update user.credits in Supabase
// 5. Send confirmation WhatsApp message
```

#### Response
```json
{
  "success": true,
  "creditsAdded": 15,
  "newBalance": 15
}
```

---

### 4. Admin - Get User Info

**GET** `/api/admin/user/:phoneNumber`

Get user details and statistics (admin only).

#### Headers
```
Authorization: Bearer YOUR_ADMIN_API_KEY
```

#### Response
```json
{
  "phoneNumber": "+49176123456789",
  "credits": 5,
  "documentCount": 12,
  "isUnlimited": false,
  "subscriptionStatus": "free",
  "createdAt": "2026-01-15T10:30:00Z",
  "lastAnalysisAt": "2026-02-10T14:22:00Z"
}
```

---

### 5. Admin - Add Credits

**POST** `/api/admin/add-credits`

Manually add credits to user account (admin only).

#### Request Body
```json
{
  "phoneNumber": "+49176123456789",
  "credits": 5,
  "reason": "Promotional bonus"
}
```

#### Response
```json
{
  "success": true,
  "previousCredits": 5,
  "newCredits": 10,
  "added": 5
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  credits INTEGER DEFAULT 1,           -- Starting free credits
  is_unlimited BOOLEAN DEFAULT FALSE,
  subscription_status VARCHAR(20) DEFAULT 'free',
  document_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Document Analyses Table

```sql
CREATE TABLE document_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20) NOT NULL,
  message_sid VARCHAR(100),
  image_url TEXT,
  analysis_result TEXT,
  processing_time_ms INTEGER,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### GDPR Consent Table

```sql
CREATE TABLE gdpr_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_method VARCHAR(20), -- whatsapp, web
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pricing Plans

| Plan | Price | Credits | Cost Per Analysis |
|------|-------|---------|------------------|
| Free | €0 | 1 | - |
| Basic | €7 | 5 | €1.40 |
| Pro | €15 | 15 | €1.00 |
| Unlimited | €25 | ∞ | - |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_CREDITS` | User has no credits remaining |
| `INVALID_IMAGE` | Image format not supported or too large |
| `AI_ERROR` | Gemini API error |
| `DATABASE_ERROR` | Supabase query failed |
| `UNAUTHORIZED` | Invalid or missing API key |
| `RATE_LIMITED` | Too many requests |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/webhook | 10/hour | Per phone number |
| POST /api/analyze | 10/hour | Per phone number |
| GET /api/admin/* | 100/hour | Per API key |

---

## Webhooks

### PayPal Webhook

**URL**: `https://your-domain.vercel.app/api/fulfill-order`

**Events**:
- `PAYMENT.CAPTURE.COMPLETED` - Payment successful
- `PAYMENT.CAPTURE.DENIED` - Payment failed

**Verification**:
```typescript
// Verify PayPal webhook signature
const webhookId = paypal.webhooks.verify(
  req.body,
  req.headers['paypal-transmission-sig'],
  webhookId
);
```

---

## Testing

### Local Testing with curl

```bash
# Test webhook endpoint
curl -X POST https://your-domain.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "From": "whatsapp:+49176123456789",
    "MessageSid": "test123",
    "NumMedia": 1,
    "MediaUrl0": "https://example.com/test.jpg"
  }'

# Test analyze endpoint
curl -X POST https://your-domain.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg",
    "phoneNumber": "+49176123456789"
  }'
```

---

## Environment Variables

Required for production:

```bash
# AI
GEMINI_API_KEY=your-gemini-api-key

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Evolution API
EVOLUTION_API_URL=https://wa.your-domain.com
EVOLUTION_API_TOKEN=your-api-token
EVOLUTION_INSTANCE=your-instance-name

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_WEBHOOK_ID=your-webhook-id

# Security
ADMIN_API_KEY=your-strong-admin-key

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

---

## SDK / Client Libraries

Currently no official SDK. Use HTTP client of your choice:

### JavaScript/TypeScript
```typescript
const analyze = async (imageBase64: string, mimeType: string) => {
  const response = await fetch('https://your-domain.vercel.app/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      mimeType: mimeType,
      phoneNumber: '+49176123456789'
    })
  });
  return response.json();
};
```

### Python
```python
import requests

def analyze_document(image_base64, mime_type, phone_number):
    response = requests.post(
        'https://your-domain.vercel.app/api/analyze',
        json={
            'image': image_base64,
            'mimeType': mime_type,
            'phoneNumber': phone_number
        }
    )
    return response.json()
```

---

## Changelog

### Version 1.0 (2026-02-11)
- Initial release
- WhatsApp webhook support
- Gemini 2.0 Flash integration
- PayPal payment processing
- GDPR consent tracking

---

## Support

For API support, contact:
- WhatsApp: +49 176 3416 7680
- Email: info@3rbst.com
- Website: https://3rbst.com

---

**Last Updated**: 2026-02-11
**API Version**: 1.0
**Status**: Production Ready
