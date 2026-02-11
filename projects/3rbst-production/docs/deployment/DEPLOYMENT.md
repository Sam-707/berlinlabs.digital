# 3rbst Deployment Guide

Complete guide for deploying the 3rbst German document analysis WhatsApp service.

## Architecture Overview

- **Frontend**: React + Vite (hosted on Vercel)
- **Backend APIs**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **WhatsApp Integration**: Evolution API (self-hosted)
- **Reverse Proxy**: Nginx (Docker)

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Docker** & **Docker Compose** (for Evolution API)
3. **Domain name** with SSL certificate
4. **Accounts**:
   - [Vercel](https://vercel.com)
   - [Supabase](https://supabase.com)
   - [Google AI Studio](https://aistudio.google.com)

---

## Part 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for database provisioning (~2 minutes)

### 1.2 Create Users Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_phone ON users(phone_number);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage all data
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.3 Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_KEY)

---

## Part 2: Google Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Get API Key"**
3. Create a new API key or use existing one
4. Copy the key (GEMINI_API_KEY)

---

## Part 3: Evolution API Setup (WhatsApp)

### 3.1 Prepare Your Server

You need a VPS (Virtual Private Server) with:
- Ubuntu 20.04+ or similar
- Docker & Docker Compose installed
- A domain pointing to this server (e.g., `wa.your-domain.com`)
- SSL certificate (use Let's Encrypt)

### 3.2 Install SSL Certificate

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d wa.your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/wa.your-domain.com/fullchain.pem
# /etc/letsencrypt/live/wa.your-domain.com/privkey.pem
```

### 3.3 Prepare Docker Environment

1. Create project directory:
```bash
mkdir ~/evolution-api
cd ~/evolution-api
```

2. Copy `docker-compose.yml` and `nginx.conf` from this repo

3. Create certificate directory and copy certs:
```bash
mkdir -p certs
sudo cp /etc/letsencrypt/live/wa.your-domain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/wa.your-domain.com/privkey.pem certs/
sudo chmod 644 certs/*.pem
```

4. Create logs directory:
```bash
mkdir -p logs/nginx
```

### 3.4 Configure Environment

Create `.env` file:
```bash
EVOLUTION_API_TOKEN=your-super-secret-token-here-change-this
```

### 3.5 Update nginx.conf

Edit `nginx.conf` and replace `wa.your-domain.com` with your actual domain.

### 3.6 Start Evolution API

```bash
docker-compose up -d
```

Check logs:
```bash
docker-compose logs -f evolution_api
```

### 3.7 Create WhatsApp Instance

1. Access Evolution API Manager:
   ```
   https://wa.your-domain.com/manager
   ```

2. Login with your API token

3. Create a new instance:
   - Instance Name: `my-instance` (save this for EVOLUTION_INSTANCE)
   - Integration: WhatsApp

4. Scan QR code with WhatsApp to connect

5. Configure Webhook:
   - Go to Instance Settings → Webhooks
   - Enable: **MESSAGES_UPSERT**
   - Enable: **INCLUDE_BASE64** (important for images)
   - Webhook URL: `https://your-vercel-app.vercel.app/api/webhook`
   - Events: Select `messages.upsert`

---

## Part 4: Vercel Deployment

### 4.1 Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 4.2 Configure Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or import from GitHub)
3. Go to **Settings** → **Environment Variables**
4. Add the following:

```
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
EVOLUTION_API_URL=https://wa.your-domain.com
EVOLUTION_API_TOKEN=your-super-secret-token
EVOLUTION_INSTANCE=my-instance
```

### 4.3 Deploy

**Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Import repository in Vercel
3. Vercel will auto-deploy on every push

**Option B: Vercel CLI**
```bash
vercel --prod
```

### 4.4 Update Evolution Webhook URL

After deployment, update the webhook URL in Evolution API:
```
https://your-app.vercel.app/api/webhook
```

---

## Part 5: Testing

### 5.1 Test Frontend

Visit your Vercel URL:
```
https://your-app.vercel.app
```

### 5.2 Test WhatsApp Integration

1. Send a message to your WhatsApp number: "Hello"
2. You should receive a welcome message
3. Send an image of a German document
4. Bot should analyze it and respond in Arabic

### 5.3 Test Payment Flow

1. Go to pricing page on your frontend
2. Complete a test PayPal payment
3. Check if credits are added to your account
4. Verify WhatsApp confirmation message

---

## Part 6: Monitoring & Maintenance

### Monitor Logs

**Vercel Functions:**
```
Vercel Dashboard → Your Project → Logs
```

**Evolution API:**
```bash
cd ~/evolution-api
docker-compose logs -f
```

**Supabase:**
```
Supabase Dashboard → Logs
```

### Common Issues

**Issue 1: "No credits" message on first use**
- Check Supabase table creation
- Verify SUPABASE_URL and SUPABASE_KEY are correct

**Issue 2: No response from WhatsApp**
- Check Evolution API is running: `docker-compose ps`
- Verify webhook URL is correct
- Check Vercel function logs

**Issue 3: Image not analyzed**
- Ensure "INCLUDE_BASE64" is enabled in Evolution webhook settings
- Check Gemini API quota

### SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days:

```bash
# Renew certificate
sudo certbot renew

# Update Docker certs
sudo cp /etc/letsencrypt/live/wa.your-domain.com/fullchain.pem ~/evolution-api/certs/
sudo cp /etc/letsencrypt/live/wa.your-domain.com/privkey.pem ~/evolution-api/certs/
sudo chmod 644 ~/evolution-api/certs/*.pem

# Restart nginx
cd ~/evolution-api
docker-compose restart nginx
```

---

## Security Best Practices

1. **Never commit `.env` or `.env.local` to git**
2. **Use strong, unique tokens** for EVOLUTION_API_TOKEN
3. **Enable Supabase RLS** (Row Level Security)
4. **Regularly update Docker images**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Monitor API usage** to prevent abuse
6. **Set up rate limiting** in Vercel (Pro plan feature)

---

## Scaling Considerations

### High Traffic
- Upgrade Vercel plan for higher function execution limits
- Consider Redis for caching user credits
- Use Supabase connection pooling

### Multiple WhatsApp Numbers
- Create multiple Evolution instances
- Use instance routing based on phone number

### Cost Optimization
- Monitor Gemini API usage (Gemini 2.0 Flash is cost-effective)
- Optimize image size before sending to AI (already implemented with blur)
- Consider caching common document types

---

## Support

For Evolution API issues: [Evolution API Docs](https://doc.evolution-api.com)
For Vercel issues: [Vercel Docs](https://vercel.com/docs)
For Supabase issues: [Supabase Docs](https://supabase.com/docs)

---

## License

This project is for internal use. Ensure compliance with:
- WhatsApp Business API Terms of Service
- Google Gemini API Terms of Service
- Data protection regulations (GDPR, etc.)
