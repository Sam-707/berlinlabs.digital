# 🚀 AWS EC2 Deployment Guide - Evolution API (WhatsApp)

Complete guide to deploy Evolution API on AWS EC2 for WhatsApp integration with 3rbst.

---

## Prerequisites

- ✅ AWS Account
- ✅ Domain name (e.g., `wa.your-domain.com`)
- ✅ Vercel deployment working (https://3rbst-gemini.vercel.app)
- ⏭️ AWS EC2 instance (we'll create this)

---

## Part 1: Launch AWS EC2 Instance

### Step 1: Create EC2 Instance

1. **Login to AWS Console**: https://console.aws.amazon.com
2. Navigate to **EC2 Dashboard**
3. Click **"Launch Instance"**

### Step 2: Configure Instance

**Name**: `evolution-api-whatsapp`

**Application and OS Images (AMI)**:
- Select: **Ubuntu Server 22.04 LTS**
- Architecture: **64-bit (x86)**

**Instance Type**:
- Recommended: **t3.small** or **t2.small**
- Minimum: **t2.micro** (free tier, but may be slow)
- CPU: 2 vCPUs, 2 GB RAM minimum

**Key Pair**:
- Create new key pair or select existing
- Name: `evolution-api-key`
- Type: **RSA**
- Format: **.pem** (for Mac/Linux) or **.ppk** (for Windows/PuTTY)
- **Download and save securely!**

**Network Settings**:
- Create security group: `evolution-api-security`
- Allow:
  - ✅ **SSH (22)** - Your IP only
  - ✅ **HTTP (80)** - Anywhere (0.0.0.0/0)
  - ✅ **HTTPS (443)** - Anywhere (0.0.0.0/0)

**Storage**:
- **20 GB** GP3 (recommended)
- Minimum: 10 GB

**Click "Launch Instance"**

### Step 3: Get Instance IP

1. Wait for instance to be **Running**
2. Select your instance
3. Copy **Public IPv4 address** (e.g., `54.123.45.67`)

---

## Part 2: Configure Domain

### Point Your Domain to AWS

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add an **A Record**:
   - **Name**: `wa` (or subdomain you want)
   - **Type**: `A`
   - **Value**: Your EC2 Public IP (e.g., `54.123.45.67`)
   - **TTL**: `300` (5 minutes)

3. Wait 5-15 minutes for DNS propagation

4. **Test DNS**:
   ```bash
   ping wa.your-domain.com
   # Should return your EC2 IP
   ```

**Example**: If your domain is `3rbst.com`, create `wa.3rbst.com` → `54.123.45.67`

---

## Part 3: Connect to AWS EC2

### On Mac/Linux:

```bash
# Set correct permissions for key
chmod 400 ~/Downloads/evolution-api-key.pem

# Connect to EC2
ssh -i ~/Downloads/evolution-api-key.pem ubuntu@wa.your-domain.com
# OR use IP directly:
ssh -i ~/Downloads/evolution-api-key.pem ubuntu@54.123.45.67
```

### On Windows:

Use **PuTTY** or **Windows Terminal** with your .ppk key file.

---

## Part 4: Install Docker on EC2

Once connected to your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
# Then reconnect via SSH
```

---

## Part 5: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot -y

# Stop nginx if running (not applicable for first install)
sudo docker-compose down 2>/dev/null || true

# Generate SSL certificate
sudo certbot certonly --standalone -d wa.your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Certificates will be at:
# /etc/letsencrypt/live/wa.your-domain.com/fullchain.pem
# /etc/letsencrypt/live/wa.your-domain.com/privkey.pem

# Verify certificates
sudo ls -l /etc/letsencrypt/live/wa.your-domain.com/
```

**Note**: Replace `wa.your-domain.com` with your actual domain and `your-email@example.com` with your email.

---

## Part 6: Deploy Evolution API

### Step 1: Create Project Directory

```bash
# Create directory
mkdir -p ~/evolution-api
cd ~/evolution-api
```

### Step 2: Upload Configuration Files

**Option A: Manual Creation (Recommended)**

Create `docker-compose.yml`:
```bash
nano docker-compose.yml
```

Paste this content:
```yaml
version: "3.9"

services:
  evolution_api:
    image: atendai/evolution-api:v2.2.2
    container_name: evolution_api
    restart: unless-stopped
    environment:
      AUTHENTICATION_API_KEY: "your-super-secret-token-change-this-now"
    expose:
      - "8080"
    networks:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 20s

  nginx:
    image: nginx:stable-alpine
    container_name: evolution_nginx
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live/wa.your-domain.com:/etc/ssl/certs:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - evolution_api
    networks:
      - backend
      - frontend

networks:
  backend:
    internal: true
  frontend:
    external: false
```

**Important**: Replace `your-super-secret-token-change-this-now` with a strong random token!

Generate a strong token:
```bash
openssl rand -base64 32
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Create Nginx Configuration

```bash
nano nginx.conf
```

Paste this content (replace `wa.your-domain.com` with your domain):
```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  access_log /var/log/nginx/access.log;
  error_log  /var/log/nginx/error.log warn;
  sendfile on;
  keepalive_timeout 65;

  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }

  server {
    listen 80;
    server_name wa.your-domain.com;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name wa.your-domain.com;

    ssl_certificate     /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
      proxy_pass http://evolution_api:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;
    }
  }
}
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Create Logs Directory

```bash
mkdir -p logs/nginx
```

### Step 5: Start Evolution API

```bash
docker-compose up -d
```

### Step 6: Check Status

```bash
# Check running containers
docker-compose ps

# Should show:
# evolution_api    running
# evolution_nginx  running

# Check logs
docker-compose logs -f evolution_api

# Press Ctrl+C to exit logs
```

---

## Part 7: Access Evolution API Manager

1. Open browser: `https://wa.your-domain.com/manager`
2. You should see the Evolution API login page
3. **Enter your API token** (from docker-compose.yml)

If you get SSL warnings, that's normal for self-signed certs. Proceed.

---

## Part 8: Create WhatsApp Instance

### Step 1: Create Instance

1. In Evolution Manager, click **"Create Instance"**
2. **Instance Name**: `3rbst-production` (remember this!)
3. **Integration**: WhatsApp
4. Click **Create**

### Step 2: Connect WhatsApp

1. You'll see a **QR Code**
2. Open WhatsApp on your phone
3. Go to: **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code
5. Wait for connection (status should show "Connected")

### Step 3: Configure Webhook

1. Click on your instance settings (gear icon)
2. Go to **"Webhooks"** tab
3. **Webhook URL**: `https://3rbst-gemini.vercel.app/api/webhook`
4. **Enable Events**:
   - ✅ `MESSAGES_UPSERT`
5. **Enable Settings**:
   - ✅ `INCLUDE_BASE64` (very important!)
6. Click **Save**

---

## Part 9: Add Environment Variables to Vercel

Now add WhatsApp credentials to your Vercel deployment:

```bash
# From your local machine (not EC2), run:
cd /Users/samhizam/Downloads/3rbst---german-document-helper\ \(5\)

# Add Evolution API URL
echo "https://wa.your-domain.com" | vercel env add EVOLUTION_API_URL production

# Add Evolution API Token (the token from docker-compose.yml)
echo "your-super-secret-token-change-this-now" | vercel env add EVOLUTION_API_TOKEN production

# Add Instance Name
echo "3rbst-production" | vercel env add EVOLUTION_INSTANCE production
```

### Redeploy Vercel

```bash
# Trigger redeployment
echo "whatsapp-configured: $(date)" >> .vercel-deploy-trigger
git add . && git commit -m "feat: Add WhatsApp Evolution API integration" && git push origin main
```

Or manually redeploy via Vercel dashboard.

---

## Part 10: Test WhatsApp Integration

### Test 1: Send "Hello"

1. Send message to your WhatsApp number: **"Hello"**
2. You should receive:
   ```
   👋 مرحباً بك في 3rbst

   أنا جاهز لمساعدتك في فهم الوثائق الألمانية.

   📸 أرسل صورة الوثيقة الآن (رسالة، فاتورة، عقد) وسأشرحها لك فوراً.

   💰 رصيدك الحالي: 1 وثائق.
   ```

### Test 2: Send Document Image

1. Take a photo of a German document
2. Send it to your WhatsApp number
3. You should receive:
   - ⏳ "جاري تحليل الوثيقة..."
   - Then: Arabic analysis of the document
   - Footer with remaining credits

### Test 3: Check Database

1. Go to Supabase: https://qhcjngmvclreosmpyoqi.supabase.co
2. Table Editor → `users`
3. You should see your phone number with updated credits

---

## Monitoring & Maintenance

### View Logs

```bash
# Evolution API logs
docker-compose logs -f evolution_api

# Nginx logs
docker-compose logs -f nginx

# All logs
docker-compose logs -f
```

### Restart Services

```bash
docker-compose restart
```

### Stop Services

```bash
docker-compose down
```

### Update Evolution API

```bash
docker-compose pull
docker-compose up -d
```

### SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Create renewal script
sudo nano /etc/cron.daily/certbot-renewal

# Paste:
#!/bin/bash
certbot renew --quiet --deploy-hook "docker-compose -f /home/ubuntu/evolution-api/docker-compose.yml restart nginx"

# Make executable
sudo chmod +x /etc/cron.daily/certbot-renewal
```

---

## Troubleshooting

### Can't access https://wa.your-domain.com

- Check DNS: `ping wa.your-domain.com`
- Check security group allows port 443
- Check Docker containers: `docker-compose ps`
- Check nginx logs: `docker-compose logs nginx`

### QR Code not showing

- Check Evolution API logs: `docker-compose logs evolution_api`
- Try restarting: `docker-compose restart evolution_api`
- Clear browser cache

### WhatsApp not responding

- Check webhook URL in Evolution Manager
- Check Vercel function logs
- Verify EVOLUTION_INSTANCE name matches
- Check INCLUDE_BASE64 is enabled

### "No credits" on first message

- Check Supabase users table exists
- Verify SUPABASE_KEY is correct in Vercel
- Check Vercel function logs

---

## Security Checklist

- ✅ Use strong AUTHENTICATION_API_KEY
- ✅ Limit SSH access to your IP only
- ✅ Keep Docker images updated
- ✅ Enable AWS CloudWatch for monitoring
- ✅ Set up automated backups
- ✅ Use AWS Secrets Manager for sensitive data (optional)

---

## AWS Costs Estimate

- **t3.small EC2**: ~$15-20/month
- **20 GB Storage**: ~$2/month
- **Data Transfer**: ~$5-10/month (depends on usage)
- **Total**: ~$25-35/month

**Free tier**: t2.micro is free for 12 months (new AWS accounts)

---

## 🎉 Success!

You now have:
- ✅ Evolution API running on AWS
- ✅ WhatsApp connected and working
- ✅ Webhook integrated with Vercel
- ✅ End-to-end German document analysis via WhatsApp

**Your system is fully operational!**

For support, check Evolution API docs: https://doc.evolution-api.com
