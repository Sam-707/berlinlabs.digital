# 3rbst WhatsApp Bot - Complete Deployment Plan

## Service Overview
**3rbst** is a WhatsApp-based AI service that helps Arabic speakers in Germany understand German documents using Gemini AI.

### User Flow:
1. User sends German document image via WhatsApp
2. Evolution API receives message → forwards to Vercel webhook
3. Vercel processes image with Gemini AI → returns Arabic explanation
4. User receives analysis via WhatsApp
5. User can purchase credits via PayPal for continued usage

---

## Architecture

```
┌─────────────┐
│   User's    │
│  WhatsApp   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Evolution API v2   │ ← Running on AWS EC2
│  (WhatsApp Gateway) │
└──────┬──────────────┘
       │
       │ Webhook
       ▼
┌─────────────────────┐
│  Vercel Functions   │
│  - /api/webhook     │ ← Receives WhatsApp messages
│  - /api/analyze     │ ← Processes with Gemini AI
│  - /api/fulfill     │ ← Handles PayPal payments
└──────┬──────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Gemini AI   │   │   Supabase   │
│  (Analysis)  │   │  (Database)  │
└──────────────┘   └──────────────┘
```

---

## Deployment Phases

### ✅ Phase 0: GitHub & Vercel Setup (COMPLETED)
- [x] Code on GitHub with all fixes
- [x] Vercel project created and linked
- [x] Environment variables added:
  - GEMINI_API_KEY
  - SUPABASE_URL
  - SUPABASE_KEY

**Status**: Ready for testing

---

### 🔄 Phase 1: Verify Core API (IN PROGRESS)

**Goal**: Confirm `/api/analyze` works with Gemini AI

**Steps**:
1. ⏳ Redeploy Vercel to activate environment variables
2. ⏳ Test `/api/analyze` endpoint
3. ⏳ Verify Gemini AI responds with Arabic text
4. ⏳ Verify Supabase connection works

**Test Command**:
```bash
./test-api.sh
```

**Expected Result**:
```
✅ Landing page is accessible (HTTP 200)
✅ API endpoint is working (HTTP 200)
```

**Blocker**: Waiting for Vercel redeploy

---

### 📱 Phase 2: Deploy Evolution API on AWS (CRITICAL)

**Goal**: Set up WhatsApp gateway on AWS EC2

**Prerequisites**:
- AWS account with EC2 access
- Domain name for SSL (e.g., `wa.yourdomain.com`)
- Existing EC2 instance (user mentioned AWS VPS exists)

**Steps**:

#### 2.1 Prepare AWS EC2 Instance
```bash
# SSH into your AWS instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

#### 2.2 Upload Evolution API Configuration
```bash
# Copy docker-compose.yml and nginx.conf to EC2
scp -i your-key.pem docker-compose.yml ubuntu@your-ec2-ip:~/
scp -i your-key.pem nginx.conf ubuntu@your-ec2-ip:~/
```

#### 2.3 Configure SSL Certificate
```bash
# On EC2 instance
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d wa.yourdomain.com
```

#### 2.4 Start Evolution API
```bash
cd ~/
docker-compose up -d

# Check logs
docker-compose logs -f evolution-api
```

#### 2.5 Configure WhatsApp Instance
1. Open browser: `https://wa.yourdomain.com/manager`
2. Create new instance: `3rbst-bot`
3. Scan QR code with WhatsApp Business number
4. Save API key and instance name

**Deliverables**:
- Evolution API URL: `https://wa.yourdomain.com`
- API Token: (generated from manager)
- Instance Name: `3rbst-bot`

**Reference**: See `AWS-DEPLOYMENT.md` for detailed instructions

---

### 🔗 Phase 3: Configure WhatsApp Webhook (CRITICAL)

**Goal**: Connect Evolution API to Vercel webhook

**Steps**:

#### 3.1 Add Evolution API Environment Variables to Vercel
```bash
cd "/Users/samhizam/Downloads/3rbst---german-document-helper (5)"

# Add Evolution API credentials
echo "https://wa.yourdomain.com" | vercel env add EVOLUTION_API_URL production
echo "your-api-token" | vercel env add EVOLUTION_API_TOKEN production
echo "3rbst-bot" | vercel env add EVOLUTION_INSTANCE production
```

#### 3.2 Configure Webhook in Evolution API
```bash
# Set webhook URL to point to Vercel
curl -X POST https://wa.yourdomain.com/webhook/set/3rbst-bot \
  -H "apikey: your-api-token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://3rbst-gemini.vercel.app/api/webhook",
    "enabled": true,
    "events": ["messages.upsert"]
  }'
```

#### 3.3 Redeploy Vercel
- Trigger redeploy to load new environment variables

#### 3.4 Test WhatsApp Flow
1. Send text message to WhatsApp Business number: "Hello"
2. Should receive: Arabic greeting from 3rbst bot
3. Send German document image
4. Should receive: Arabic analysis of document

**Test Message**:
```
Send to WhatsApp: "مرحبا"
Expected Response: Arabic explanation of service
```

---

### 💳 Phase 4: Set Up PayPal Integration (CRITICAL)

**Goal**: Enable users to purchase credits

**Steps**:

#### 4.1 Create PayPal App
1. Go to: https://developer.paypal.com/dashboard/applications
2. Create new app: "3rbst Credits"
3. Copy:
   - Client ID
   - Client Secret

#### 4.2 Add PayPal Environment Variables
```bash
echo "your-paypal-client-id" | vercel env add PAYPAL_CLIENT_ID production
echo "your-paypal-secret" | vercel env add PAYPAL_CLIENT_SECRET production
```

#### 4.3 Configure PayPal Webhook
1. In PayPal Dashboard → Webhooks
2. Create webhook URL: `https://3rbst-gemini.vercel.app/api/fulfill-order`
3. Subscribe to events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `CHECKOUT.ORDER.APPROVED`

#### 4.4 Update Frontend
- Verify PayPal button uses correct Client ID
- Test payment flow on landing page

**Test Payment**:
1. Go to: https://3rbst-gemini.vercel.app
2. Click "Buy Credits"
3. Use PayPal Sandbox account
4. Verify credits added to Supabase users table

---

### ✅ Phase 5: End-to-End Testing

**Goal**: Verify complete WhatsApp bot flow

**Test Scenarios**:

#### Test 1: New User Flow
1. New user sends "Hello" to WhatsApp
2. Bot responds with greeting in Arabic
3. User sends German document image
4. Bot deducts 1 credit (or shows "no credits" message)
5. Bot returns Arabic analysis

#### Test 2: Credit Purchase Flow
1. User runs out of credits
2. Bot sends payment link
3. User pays via PayPal
4. Credits added to user account in Supabase
5. User can analyze documents again

#### Test 3: Document Analysis Accuracy
1. Send various German documents:
   - Tax letter (Steuerbescheid)
   - Rental contract (Mietvertrag)
   - Medical bill (Arztrechnung)
   - Bank statement (Kontoauszug)
2. Verify Arabic responses are accurate
3. Verify formatting is WhatsApp-friendly

**Success Criteria**:
- ✅ WhatsApp messages received and processed
- ✅ Gemini AI analyzes documents correctly
- ✅ Credits deducted from Supabase
- ✅ PayPal payments add credits
- ✅ Response time < 10 seconds
- ✅ Arabic text displays correctly on WhatsApp

---

## Environment Variables Checklist

### Vercel Production Environment:
- [x] `GEMINI_API_KEY` - Google Gemini API
- [x] `SUPABASE_URL` - Database URL
- [x] `SUPABASE_KEY` - Database key
- [ ] `EVOLUTION_API_URL` - WhatsApp gateway URL
- [ ] `EVOLUTION_API_TOKEN` - Evolution API authentication
- [ ] `EVOLUTION_INSTANCE` - WhatsApp instance name
- [ ] `PAYPAL_CLIENT_ID` - PayPal app client ID
- [ ] `PAYPAL_CLIENT_SECRET` - PayPal app secret

---

## AWS EC2 Requirements

### Minimum Specs:
- **Instance Type**: t3.small or better
- **vCPUs**: 2
- **RAM**: 2 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Network Configuration:
- **Inbound Rules**:
  - Port 22 (SSH)
  - Port 80 (HTTP - for Certbot)
  - Port 443 (HTTPS - for Evolution API)
  - Port 8080 (Evolution API Manager UI)

### Domain Setup:
- A Record: `wa.yourdomain.com` → EC2 public IP
- SSL Certificate: Let's Encrypt via Certbot

---

## Monitoring & Maintenance

### Daily Checks:
- [ ] Evolution API status: `docker-compose ps`
- [ ] Vercel deployment status: https://vercel.com/sam-707s-projects/3rbst-gemini
- [ ] Supabase usage: Check credits balance
- [ ] Gemini API quota: Monitor daily requests

### Weekly Checks:
- [ ] Review error logs: `vercel logs`
- [ ] Check WhatsApp Business number status
- [ ] Review PayPal transactions
- [ ] Backup Supabase database

### Monthly Maintenance:
- [ ] Update Evolution API: `docker-compose pull && docker-compose up -d`
- [ ] Review AWS costs
- [ ] Analyze user feedback
- [ ] Optimize Gemini prompts based on accuracy

---

## Troubleshooting

### Issue: WhatsApp not receiving messages
**Check**:
1. Evolution API running: `docker-compose ps`
2. Webhook configured: Check Evolution API manager
3. Vercel logs: `vercel logs --follow`

### Issue: Gemini API errors
**Check**:
1. API key valid: Test with `node test-gemini.js`
2. Quota not exceeded: Check Google AI Studio
3. Model name correct: `gemini-1.5-flash`

### Issue: Credits not deducted
**Check**:
1. Supabase connection: Check environment variables
2. User exists in database: Query users table
3. Transaction logs: Review Vercel function logs

---

## Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| AWS EC2 (t3.small) | ~$15-20 |
| Domain name | ~$1-2 |
| Vercel Pro (if needed) | $20 (or Free tier) |
| Gemini API | Free (1500 req/day) |
| Supabase | Free tier |
| PayPal fees | 2.9% + $0.30 per transaction |

**Total**: ~$16-42/month (excluding PayPal fees)

---

## Next Steps

**RIGHT NOW**:
1. ⏳ Waiting for Vercel redeploy with environment variables
2. ⏳ Test `/api/analyze` endpoint

**TODAY**:
3. Deploy Evolution API on AWS EC2
4. Configure WhatsApp webhook
5. Test WhatsApp message flow

**THIS WEEK**:
6. Set up PayPal integration
7. End-to-end testing
8. Launch to beta users

---

## Support Resources

- **GitHub Issue**: https://github.com/Sam-707/3rbst-Gemini/issues/1
- **Evolution API Docs**: https://doc.evolution-api.com/
- **Vercel Docs**: https://vercel.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **AWS Deployment Guide**: `AWS-DEPLOYMENT.md`

---

**Last Updated**: 2025-12-12 17:00 CET
