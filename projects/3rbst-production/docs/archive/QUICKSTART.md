# 🚀 Quick Deployment Checklist

Follow these steps in order to deploy 3rbst:

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup (5 minutes)
- [ ] Go to https://qhcjngmvclreosmpyoqi.supabase.co
- [ ] SQL Editor → New Query
- [ ] Copy/paste contents of `setup-supabase.sql`
- [ ] Click **Run**
- [ ] Verify: You should see "users" table in Table Editor

### 2. Verify Credentials Work
Your current credentials (from .env.local):
```
✅ GEMINI_API_KEY: AIzaSyC9H-RMMuUduv4CDcNqjPY9F6gI-iJjwGw
✅ SUPABASE_URL: https://qhcjngmvclreosmpyoqi.supabase.co
✅ SUPABASE_KEY: sb_publishable_2MnrQ_A5XNi3eVEwDd6rtA_mX0QmJeU
```

### 3. Evolution API Setup (30 minutes)
You need a VPS server for WhatsApp integration.

**Option A: You have a VPS**
- [ ] SSH into your server
- [ ] Install Docker & Docker Compose
- [ ] Copy `docker-compose.yml` and `nginx.conf` to server
- [ ] Get SSL certificate for your domain
- [ ] Configure `.env` on server
- [ ] Run: `docker-compose up -d`

**Option B: You don't have a VPS yet**
- [ ] Skip this for now
- [ ] You can test without WhatsApp first
- [ ] Deploy frontend + API to Vercel
- [ ] Set up VPS later

### 4. Deploy to Vercel (10 minutes)

**Option A: Using GitHub (Recommended)**
- [ ] Push code to GitHub: `git push`
- [ ] Go to https://vercel.com/new
- [ ] Import your GitHub repository
- [ ] Add environment variables (see below)
- [ ] Deploy

**Option B: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Environment Variables to Add in Vercel:**
```
GEMINI_API_KEY=AIzaSyC9H-RMMuUduv4CDcNqjPY9F6gI-iJjwGw
SUPABASE_URL=https://qhcjngmvclreosmpyoqi.supabase.co
SUPABASE_KEY=sb_publishable_2MnrQ_A5XNi3eVEwDd6rtA_mX0QmJeU

# Add these after Evolution API is set up:
# EVOLUTION_API_URL=https://wa.your-domain.com
# EVOLUTION_API_TOKEN=your-token
# EVOLUTION_INSTANCE=your-instance
```

### 5. Test Frontend Only (Without WhatsApp)
After Vercel deployment:
- [ ] Visit your Vercel URL: https://your-app.vercel.app
- [ ] Test the document analyzer on the homepage
- [ ] Upload a test image
- [ ] Verify it returns analysis

### 6. Connect Evolution API (After VPS Setup)
- [ ] Get your Vercel deployment URL
- [ ] Go to Evolution API Manager: https://wa.your-domain.com/manager
- [ ] Create instance and scan QR code
- [ ] Configure webhook: https://your-app.vercel.app/api/webhook
- [ ] Enable: MESSAGES_UPSERT + INCLUDE_BASE64
- [ ] Test by sending "Hello" to your WhatsApp number

### 7. Test End-to-End
- [ ] Send "Hello" to WhatsApp bot
- [ ] Receive welcome message
- [ ] Send image of German document
- [ ] Receive Arabic analysis
- [ ] Check Supabase: Credits should be deducted

---

## 🎯 Minimum Viable Deployment (Start Here!)

If you want to deploy quickly and test:

1. **Run Supabase SQL** (2 min)
2. **Deploy to Vercel** (5 min)
3. **Test Frontend** - Upload document on website

This gives you a working document analyzer without WhatsApp.

Add WhatsApp later when you have a VPS ready.

---

## ⚡ Current Status

Based on what you have:
- ✅ Gemini API key configured
- ✅ Supabase project created
- ⏳ Need to run SQL to create tables
- ⏳ Need to deploy to Vercel
- ⏳ Need VPS for WhatsApp (optional for now)

---

## 🆘 Need Help?

See detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)
