# 3rbst WhatsApp Integration Setup Guide

## Current Status (December 14, 2024)

✅ **Completed:**
- Evolution API deployed on AWS EC2 (3.235.180.122)
- Docker & Docker Compose configured
- Evolution API v2.0.10 running with PostgreSQL
- Nginx reverse proxy configured
- Webhook configured to Vercel
- Vercel environment variables set
- Landing page updated with WhatsApp number

⏳ **Pending:**
- WhatsApp Business account needs to be 14+ days old to link
- Current account age: NEW (created Dec 14, 2024)
- **Action required on: December 28, 2024** (14 days from now)

---

## WhatsApp Business Number
- **Number:** +491746355261
- **WhatsApp ID:** 491746355261@s.whatsapp.net
- **Account Type:** WhatsApp Business
- **Created:** December 14, 2024
- **Ready to link:** December 28, 2024

---

## Evolution API Configuration

### Server Details
- **Server IP:** 3.235.180.122
- **Evolution Manager:** http://3.235.180.122/manager/
- **API Endpoint:** http://3.235.180.122
- **Instance Name:** 3rbst-production
- **API Key:** 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23
- **Token:** 3rbst-token-2024

### Webhook Configuration
- **URL:** https://3rbst-production.vercel.app/api/webhook
- **Events:** MESSAGES_UPSERT
- **Base64 Encoding:** Enabled
- **Webhook by Events:** false

### Docker Setup
Location: `~/app/docker-compose.yml` on EC2

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: evolution_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: evolution
      POSTGRES_DB: evolution
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

  evolution_api:
    image: atendai/evolution-api:v2.0.10
    container_name: evolution_api
    restart: unless-stopped
    environment:
      AUTHENTICATION_API_KEY: "3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: "postgresql"
      DATABASE_CONNECTION_URI: "postgresql://evolution:evolution@postgres:5432/evolution"
      CACHE_REDIS_ENABLED: "false"
    expose:
      - "8080"
    networks:
      - backend
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 30s

  nginx:
    image: nginx:stable-alpine
    container_name: evolution_nginx
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "8080:8080"
    depends_on:
      - evolution_api
    networks:
      - backend
      - frontend

networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge

volumes:
  postgres_data:
```

---

## Vercel Environment Variables

Add these to your Vercel project (already configured):

```
EVOLUTION_API_URL=http://3.235.180.122
EVOLUTION_API_TOKEN=3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23
EVOLUTION_INSTANCE=3rbst-production
```

---

## Steps to Complete on December 28, 2024

### 1. Connect WhatsApp to Evolution API

**Prerequisites:**
- WhatsApp Business account is 14+ days old ✓
- Evolution API is running on EC2 ✓
- Webhook is configured ✓

**Steps:**

1. **Access Evolution Manager:**
   - Open: http://3.235.180.122/manager/

2. **Find Instance:**
   - Look for instance named: `3rbst-production`
   - Click on it to view details

3. **Scan QR Code:**
   - Open WhatsApp on phone (+491746355261)
   - Go to **Settings** → **Linked Devices**
   - Tap **"Link a Device"**
   - Scan the QR code displayed in Evolution Manager

4. **Wait for Sync:**
   - Keep WhatsApp open for 30-60 seconds
   - Wait for contacts and chats to sync
   - Don't close WhatsApp during initial sync

5. **Verify Connection:**
   ```bash
   curl -X GET "http://3.235.180.122/instance/connectionState/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
   ```

   Expected response:
   ```json
   {
     "instance": {
       "instanceName": "3rbst-production",
       "state": "open"
     }
   }
   ```

### 2. Test WhatsApp Integration

1. **Send Test Message:**
   - From another WhatsApp number, send a message to +491746355261
   - Send a German document image with text

2. **Check Webhook Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Look for incoming webhook calls from Evolution API

3. **Verify API Response:**
   - Check if the webhook received the message
   - Verify the Arabic translation was sent back

4. **Test Full Flow:**
   - Send test message: "مرحباً 3rbst، عندي وثيقة ألمانية وأحتاج مساعدة 📄"
   - Upload a German document image
   - Verify you receive Arabic explanation

---

## Troubleshooting

### If QR Code Doesn't Appear:
1. Refresh Evolution Manager page
2. Check if instance exists:
   ```bash
   curl -X GET "http://3.235.180.122/instance/fetchInstances?instanceName=3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
   ```
3. If needed, reconnect:
   ```bash
   curl -X GET "http://3.235.180.122/instance/connect/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
   ```

### If Connection Fails:
1. **Check WhatsApp Linked Devices:**
   - Go to Settings → Linked Devices
   - Unlink any old/inactive devices (max 4 allowed)

2. **Clear Instance and Retry:**
   ```bash
   # Logout
   curl -X DELETE "http://3.235.180.122/instance/logout/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"

   # Delete instance
   curl -X DELETE "http://3.235.180.122/instance/delete/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"

   # Recreate instance
   curl -X POST "http://3.235.180.122/instance/create" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23" \
     -H "Content-Type: application/json" \
     -d '{"instanceName":"3rbst-production","token":"3rbst-token-2024","qrcode":true}'

   # Reconfigure webhook
   curl -X POST "http://3.235.180.122/webhook/set/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23" \
     -H "Content-Type: application/json" \
     -d '{"enabled":true,"url":"https://3rbst-production.vercel.app/api/webhook","webhookByEvents":false,"webhookBase64":true,"events":["MESSAGES_UPSERT"]}'

   # Get new QR code
   curl -X GET "http://3.235.180.122/instance/connect/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
   ```

### If Messages Not Received:
1. **Check Webhook Configuration:**
   ```bash
   curl -X GET "http://3.235.180.122/webhook/find/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23"
   ```

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Functions → Logs
   - Look for incoming webhook requests

3. **Test Webhook Manually:**
   - Send test message from Evolution API
   ```bash
   curl -X POST "http://3.235.180.122/message/sendText/3rbst-production" \
     -H "apikey: 3rbst-secure-80bbb14ae4ce97a066a985e9a3f70c962b6e88ced914adde05b1ec75bd16bf23" \
     -H "Content-Type: application/json" \
     -d '{"number":"491746355261","text":"Test message from 3rbst"}'
   ```

### Evolution API Management:
```bash
# SSH to EC2
ssh -i "3rbst-key.pem" ec2-user@ec2-3-235-180-122.compute-1.amazonaws.com

# Check status
cd ~/app
docker-compose ps

# View logs
docker-compose logs --tail=100 evolution_api

# Restart services
docker-compose restart evolution_api

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

---

## Important Notes

### WhatsApp Account Age Restriction
- **Requirement:** WhatsApp accounts must be 14+ days old to use multi-device
- **Your account created:** December 14, 2024
- **Can link after:** December 28, 2024
- **Why:** WhatsApp's anti-spam measure for new accounts

### WhatsApp Business vs Personal
- Both types require 14-day age restriction
- No difference in Evolution API integration
- Business accounts recommended for business use

### Rate Limits
- Don't scan QR codes more than 3-4 times per hour
- WhatsApp may temporarily block if too many failed attempts
- If blocked, wait 1-2 hours before trying again

### Data Persistence
- WhatsApp session data is stored in PostgreSQL database
- Database persists across container restarts
- To reset completely: delete instance and recreate

---

## Security Considerations

1. **API Key Protection:**
   - Never commit API key to public repositories
   - Store in environment variables only
   - Rotate key if compromised

2. **EC2 Security:**
   - Only ports 80, 8080, and SSH are exposed
   - Use security groups to restrict access
   - Keep SSH key secure

3. **WhatsApp Number:**
   - Don't share number publicly until ready
   - Monitor for spam/abuse
   - Use WhatsApp Business features for customer management

---

## Next Steps After Connection

1. **Monitor Performance:**
   - Track message processing time
   - Monitor webhook reliability
   - Check Evolution API uptime

2. **Scale if Needed:**
   - Add Redis for better caching
   - Upgrade EC2 instance if needed
   - Set up backup database

3. **Implement Features:**
   - Add message queue for high volume
   - Implement rate limiting
   - Add analytics tracking

---

## Contact & Support

- **Evolution API Docs:** https://doc.evolution-api.com/
- **WhatsApp Business Support:** https://business.whatsapp.com/support
- **3rbst Production:** https://3rbst-production.vercel.app

---

**Last Updated:** December 14, 2024
**Next Action Required:** December 28, 2024
