# Security & Privacy Plan for 3rbst

## Current Security Status

✅ **Verified Secure:**
- Repository is **PRIVATE** on GitHub
- SSH keys excluded from git via `.gitignore`
- Environment variables not committed to repository
- API keys stored in Vercel environment (encrypted)
- Database credentials in Supabase (managed service)

---

## Security Checklist

### 1. Repository & Code Security

- [x] Repository set to PRIVATE on GitHub
- [x] `.gitignore` configured to exclude sensitive files:
  ```
  3rbst-key.pem
  *.pem
  *.key
  *.cert
  .env.local
  .env
  ```
- [x] No API keys or secrets in codebase
- [ ] **TODO:** Enable GitHub Dependabot alerts
- [ ] **TODO:** Set up GitHub secret scanning
- [ ] **TODO:** Add branch protection rules (require PR reviews)

### 2. API Keys & Secrets Management

#### Current Storage:
| Secret | Location | Status |
|--------|----------|--------|
| `GEMINI_API_KEY` | Vercel Environment Variables | ✅ Secure |
| `SUPABASE_URL` | Vercel Environment Variables | ✅ Secure |
| `SUPABASE_KEY` | Vercel Environment Variables | ✅ Secure |
| `EVOLUTION_API_TOKEN` | Vercel Environment Variables | ✅ Secure |
| `EVOLUTION_API_URL` | Vercel Environment Variables | ✅ Public (non-sensitive) |
| `EVOLUTION_INSTANCE` | Vercel Environment Variables | ✅ Public (non-sensitive) |
| AWS EC2 SSH Key (`3rbst-key.pem`) | Local only, gitignored | ✅ Secure |

#### Security Actions:

- [ ] **Rotate Evolution API Token** (recommended every 90 days)
  ```bash
  # Generate new token on AWS EC2
  ssh -i "3rbst-key.pem" ec2-user@3.235.180.122
  # Update docker-compose.yml with new AUTHENTICATION_API_KEY
  # Update Vercel EVOLUTION_API_TOKEN environment variable
  ```

- [ ] **Rotate Gemini API Key** (if compromised)
  - Generate new key at: https://aistudio.google.com/app/apikey
  - Update Vercel environment variable
  - Delete old key

- [ ] **Review Supabase Access Logs** (monthly)
  - Check for suspicious activity
  - Review API usage patterns

### 3. AWS EC2 Security

#### Current Configuration:
- **IP:** 3.235.180.122 (public)
- **Open Ports:** 80 (HTTP), 8080 (Evolution API), 22 (SSH)
- **SSH Access:** Key-based authentication only

#### Security Improvements Needed:

- [ ] **Add HTTPS/SSL Certificate**
  ```bash
  # Install Certbot on EC2
  sudo yum install certbot python3-certbot-nginx

  # Get SSL certificate (requires domain)
  sudo certbot --nginx -d wa.3rbst.com
  ```

- [ ] **Restrict SSH Access by IP**
  ```bash
  # In AWS Security Group, limit SSH (port 22) to your IP only
  # Current: 0.0.0.0/0 (any IP) → Change to: YOUR_IP/32
  ```

- [ ] **Set Up Firewall (UFW)**
  ```bash
  ssh -i "3rbst-key.pem" ec2-user@3.235.180.122
  sudo yum install ufw
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 8080/tcp
  sudo ufw enable
  ```

- [ ] **Enable CloudWatch Monitoring**
  - Monitor CPU, memory, network usage
  - Set up alerts for unusual activity

- [ ] **Automated Backups**
  ```bash
  # Backup PostgreSQL database daily
  sudo crontab -e
  # Add: 0 2 * * * docker exec evolution_postgres pg_dump -U evolution evolution > /backup/db_$(date +\%Y\%m\%d).sql
  ```

### 4. Evolution API Security

- [x] API key authentication enabled
- [x] Webhook configured with HTTPS (Vercel)
- [ ] **TODO:** Implement webhook signature verification
- [ ] **TODO:** Rate limiting on API endpoints
- [ ] **TODO:** Monitor for suspicious WhatsApp activity

#### Webhook Security Enhancement:

```typescript
// In api/webhook.ts - Add signature verification
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return hash === signature;
}
```

### 5. Database Security (Supabase)

- [x] Row Level Security (RLS) policies enabled
- [x] API keys stored securely
- [ ] **TODO:** Regular database backups (automatic in Supabase)
- [ ] **TODO:** Review and audit RLS policies

#### Current RLS Policies:

```sql
-- Users table: Users can only read/update their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Action Required:**
- [ ] Review all tables have appropriate RLS policies
- [ ] Audit who has database admin access
- [ ] Enable database activity logs

### 6. Frontend Security

- [x] API keys NOT exposed in frontend code
- [x] All API calls go through Vercel serverless functions
- [ ] **TODO:** Implement rate limiting on analyze endpoint
- [ ] **TODO:** Add CAPTCHA for abuse prevention

#### Rate Limiting Implementation:

```typescript
// In api/analyze.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again later'
});
```

### 7. WhatsApp Security

- [x] Evolution API requires authentication
- [x] Webhook URL uses HTTPS
- [ ] **TODO:** Implement message content filtering
- [ ] **TODO:** Monitor for spam/abuse
- [ ] **TODO:** Set up user blocking system

#### Abuse Prevention:

```typescript
// Implement in api/webhook.ts
const SPAM_KEYWORDS = ['spam', 'scam', 'phishing'];
const MAX_MESSAGES_PER_HOUR = 20;

function isSpam(message: string): boolean {
  return SPAM_KEYWORDS.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
}
```

### 8. Data Privacy (GDPR/Privacy)

- [x] Images are anonymized (blurred) before AI processing
- [x] No personal data stored unnecessarily
- [ ] **TODO:** Add privacy policy page
- [ ] **TODO:** Implement data deletion request system
- [ ] **TODO:** Add consent mechanism for data processing

#### Privacy Policy Requirements:

1. **What data we collect:**
   - WhatsApp phone number
   - Uploaded document images (temporary)
   - Chat history (for support)

2. **How we use it:**
   - Provide document analysis service
   - Improve AI accuracy
   - Customer support

3. **How we protect it:**
   - Encrypted transmission (HTTPS)
   - Limited data retention
   - No third-party sharing

4. **User rights:**
   - Request data deletion
   - Opt-out of data collection
   - Export personal data

### 9. Incident Response Plan

#### If API Key is Compromised:

1. **Immediate Actions:**
   ```bash
   # 1. Rotate the compromised key immediately
   # 2. Update Vercel environment variables
   # 3. Redeploy application
   # 4. Monitor for unauthorized usage
   ```

2. **Investigation:**
   - Check AWS CloudWatch logs
   - Review Vercel function logs
   - Check Supabase activity logs
   - Identify how key was exposed

3. **Notification:**
   - Document the incident
   - Notify affected users (if applicable)
   - Report to authorities (if required by law)

#### If Database is Compromised:

1. **Immediate Actions:**
   - Disable public database access
   - Rotate all database credentials
   - Take database snapshot
   - Investigate extent of breach

2. **Recovery:**
   - Restore from backup if needed
   - Audit all data access
   - Strengthen security policies

#### If WhatsApp Account is Banned:

1. **Immediate Actions:**
   - Contact WhatsApp Business support
   - Document the ban reason
   - Prepare appeal if needed

2. **Backup Plan:**
   - Have backup WhatsApp Business number ready
   - Document all setup steps for quick migration
   - Notify users of new number

### 10. Monitoring & Alerts

#### Set Up Monitoring For:

- [ ] **AWS EC2:**
  - CPU usage > 80%
  - Disk usage > 80%
  - Unusual network traffic
  - Failed SSH login attempts

- [ ] **Evolution API:**
  - API downtime
  - Failed webhook deliveries
  - Unusual message volume
  - WhatsApp disconnections

- [ ] **Vercel:**
  - Function errors
  - High latency
  - Failed deployments
  - Unusual traffic spikes

- [ ] **Supabase:**
  - Database connection errors
  - Slow queries
  - Unauthorized access attempts

#### Alert Channels:

- [ ] Email notifications
- [ ] SMS for critical issues
- [ ] Slack/Discord webhook (optional)

---

## Security Audit Schedule

### Daily:
- [ ] Monitor Evolution API connection status
- [ ] Check Vercel function logs for errors

### Weekly:
- [ ] Review AWS EC2 system logs
- [ ] Check database usage and performance
- [ ] Monitor WhatsApp message volume

### Monthly:
- [ ] Audit Supabase access logs
- [ ] Review and update RLS policies
- [ ] Check for software updates (Docker images, npm packages)
- [ ] Test backup restoration

### Quarterly:
- [ ] Rotate API keys
- [ ] Security vulnerability scan
- [ ] Review and update security policies
- [ ] Conduct penetration testing (if budget allows)

### Annually:
- [ ] Full security audit
- [ ] Update privacy policy
- [ ] Review compliance requirements
- [ ] Disaster recovery drill

---

## Compliance Considerations

### GDPR (if serving EU users):
- [ ] Privacy policy in place
- [ ] User consent mechanism
- [ ] Data deletion on request
- [ ] Data portability (export user data)
- [ ] Appoint Data Protection Officer (if needed)

### German Data Protection Laws:
- [ ] Server location compliance (currently AWS US-East-1)
  - **Action:** Consider moving to AWS EU region
- [ ] Data processing agreement with vendors
- [ ] Register with data protection authority (if required)

---

## Emergency Contacts

| Service | Support | Emergency Contact |
|---------|---------|-------------------|
| AWS | https://aws.amazon.com/support | AWS Support Dashboard |
| Vercel | support@vercel.com | Vercel Dashboard > Help |
| Supabase | support@supabase.io | Supabase Dashboard > Support |
| WhatsApp Business | https://business.whatsapp.com/support | Online Support Form |
| Google Gemini | https://ai.google.dev/support | API Console Support |

---

## Security Best Practices

### For Developers:

1. **Never commit secrets to git**
   - Always use environment variables
   - Double-check before pushing

2. **Use strong passwords**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols
   - Use password manager

3. **Enable 2FA everywhere**
   - GitHub
   - AWS
   - Vercel
   - Supabase

4. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

5. **Code review before merging**
   - Check for security issues
   - Verify no secrets exposed
   - Test changes locally

### For Operations:

1. **Regular backups**
   - Database: Daily
   - Code: Git commits
   - Configuration: Documented

2. **Monitor everything**
   - Set up alerts
   - Review logs regularly
   - Investigate anomalies

3. **Principle of least privilege**
   - Only grant necessary permissions
   - Revoke access when not needed
   - Audit access regularly

4. **Incident response ready**
   - Have plan documented
   - Test recovery procedures
   - Keep emergency contacts updated

---

## Next Steps (Priority Order)

1. **High Priority (This Week):**
   - [x] Verify repository is private
   - [x] Ensure `.gitignore` excludes sensitive files
   - [ ] Enable GitHub Dependabot alerts
   - [ ] Set up AWS Security Group IP restrictions for SSH

2. **Medium Priority (This Month):**
   - [ ] Add SSL/HTTPS to Evolution API
   - [ ] Implement rate limiting on API endpoints
   - [ ] Set up monitoring alerts
   - [ ] Create privacy policy page

3. **Low Priority (Next Quarter):**
   - [ ] Move to AWS EU region (GDPR compliance)
   - [ ] Implement webhook signature verification
   - [ ] Set up automated backups
   - [ ] Conduct security audit

---

**Last Updated:** December 14, 2024
**Next Security Review:** January 14, 2025
