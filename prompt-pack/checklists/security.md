# Security Audit Checklist

Use this checklist to ensure your application is secure before deployment.

---

## Authentication & Authorization

### Password Security
- [ ] Passwords minimum 8 characters
- [ ] Password complexity requirements
- [ ] Secure password reset flow
- [ ] No password storage in plain text (use Supabase Auth)
- [ ] Session timeout configured

### Session Management
- [ ] Secure token storage (httpOnly cookies preferred)
- [ ] Token refresh mechanism working
- [ ] Proper logout clears all session data
- [ ] Session invalidation on password change

### OAuth Providers
- [ ] OAuth secrets stored securely
- [ ] OAuth callback URLs configured correctly
- [ ] Account linking handled properly
- [ ] OAuth profile data validated

---

## Row Level Security (RLS)

### Policy Coverage
- [ ] RLS enabled on all tables
- [ ] All operations covered (SELECT, INSERT, UPDATE, DELETE)
- [ ] Policies tested with different user roles
- [ ] Admin bypass verified
- [ ] Public access policies correct

### Common Issues
- [ ] No policies use `auth.uid() = user_id` without checking null
- [ ] No policies allow unrestricted access unintentionally
- [ ] Foreign key relationships respected in policies
- [ ] No recursive policy issues

### Testing RLS
```sql
-- Test as different users
SET LOCAL role to postgres;  -- Admin
SET LOCAL role to authenticated;  -- Regular user

-- View policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## API Security

### Input Validation
- [ ] All user inputs validated on client
- [ ] All user inputs validated on server (Edge Functions)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize HTML)
- [ ] File upload validation (type, size, content)

### Rate Limiting
- [ ] API rate limiting implemented
- [ ] Auth endpoint rate limiting
- [ ] File upload rate limiting
- [ ] Payment endpoint rate limiting

### CORS Configuration
- [ ] CORS restricted to allowed origins
- [ ] No wildcard (`*`) in production for sensitive endpoints
- [ ] Proper headers exposed
- [ ] Preflight requests handled

---

## Data Protection

### Sensitive Data
- [ ] No API keys in client code
- [ ] Environment variables used for secrets
- [ ] `.env` files in `.gitignore`
- [ ] Secrets not logged in error messages
- [ ] No sensitive data in URLs

### Encryption
- [ ] HTTPS enforced in production
- [ ] Database connections encrypted
- [ ] Sensitive fields encrypted at rest (if needed)
- [ ] Secure cookies (httpOnly, secure, sameSite)

### Data Access
- [ ] Least privilege principle applied
- [ ] Service role key only used in Edge Functions
- [ ] Anon key restrictions configured
- [ ] Database access logs reviewed

---

## Webhook Security

### Signature Verification
- [ ] Webhook signatures verified
- [ ] Signature key stored securely
- [ ] Replay attack prevention
- [ ] Webhook URL not guessable

### Error Handling
- [ ] Webhook errors don't leak sensitive info
- [ ] Failed webhooks logged
- [ ] Retry mechanism implemented
- [ ] Idempotency handled

---

## Frontend Security

### XSS Prevention
- [ ] User input sanitized before rendering
- [ ] React's default escaping leveraged
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Content Security Policy (CSP) headers
- [ ] Trusted types configured (if needed)

### CSRF Prevention
- [ ] CSRF tokens for state-changing operations
- [ ] SameSite cookie attribute
- [ ] Origin header verification

### Content Security
- [ ] No `eval()` or similar functions
- [ ] No inline scripts/styles in production
- [ ] Trusted sources for external content
- [ ] Subresource Integrity (SRI) for CDNs

---

## Dependency Security

### Package Management
- [ ] Dependencies kept up to date
- [ ] Vulnerability scanning: `npm audit`
- [ ] No npm packages with known vulnerabilities
- [ ] Lockfile committed

### Third-Party Services
- [ ] Third-party API keys stored securely
- [ ] API access scoped to minimum required
- [ ] Third-party dependencies reviewed
- [ ] Fallback for third-party failures

---

## File Upload Security

### Validation
- [ ] File type validated (magic bytes, not just extension)
- [ ] File size limits enforced
- [ ] File content scanned (if applicable)
- [ ] Filename sanitization

### Storage
- [ ] Uploaded files not web-accessible directly
- [ ] Random filenames generated
- [ ] Storage permissions correct (RLS)
- [ ] Virus scanning (if applicable)

---

## Payment Security

### PCI Compliance
- [ ] No card data stored
- [ ] Stripe Checkout used (not custom forms)
- [ ] Webhook signatures verified
- [ ] Payment logs don't expose sensitive data

### Business Logic
- [ ] Payment amount verified server-side
- [ ] Webhook replay attacks prevented
- [ ] Refunds handled securely
- [ ] Subscription changes validated

---

## Logging & Monitoring

### Security Logging
- [ ] Failed login attempts logged
- [ ] Unauthorized access attempts logged
- [ ] Suspicious activity alerts configured
- [ ] Logs don't contain sensitive data

### Error Handling
- [ ] Generic error messages to users
- [ ] Detailed errors logged (not shown to users)
- [ ] Stack traces not exposed in production
- [ ] Error handling prevents info leakage

---

## Infrastructure Security

### Network Security
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] Rate limiting at edge
- [ ] IP whitelisting (if applicable)

### Secrets Management
- [ ] Secrets rotated regularly
- [ ] No secrets in version control
- [ ] Secrets encrypted at rest
- [ ] Access to secrets audited

### Backup & Recovery
- [ ] Regular database backups
- [ ] Backup encryption
- [ ] Restore procedure tested
- [ ] Disaster recovery plan documented

---

## Compliance (If Applicable)

### GDPR
- [ ] User data export capability
- [ ] User data deletion capability
- [ ] Privacy policy in place
- [ ] Cookie consent (if applicable)
- [ ] Data processing agreement (if needed)

### Other Regulations
- [ ] Industry-specific compliance (HIPAA, SOC2, etc.)
- [ ] Data residency requirements met
- [ ] Required certifications obtained

---

## Pre-Deployment Security Check

### Final Checks
- [ ] Environment variables configured correctly
- [ ] No debug endpoints exposed
- [ ] Error pages don't leak info
- [ ] Admin routes secured
- [ ] API rate limiting active
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSP headers configured

### Security Headers
```
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Security Testing

### Automated Testing
- [ ] SAST (Static Application Security Testing)
- [ ] Dependency scanning
- [ ] Secrets scanning (git-secrets, truffleHog)
- [ ] Container scanning (if using Docker)

### Manual Testing
- [ ] Penetration testing
- [ ] Access control testing
- [ ] Input fuzzing
- [ ] Session hijacking attempts

### Tools
- [ ] OWASP ZAP for scanning
- [ ] npm audit for dependencies
- [ ] Snyk for vulnerability scanning
- [ ] Custom security test suite

---

## Incident Response Plan

### Preparation
- [ ] Security incident response plan documented
- [ ] Team contact list updated
- [ ] Escalation procedure defined
- [ ] Communication templates prepared

### Detection & Response
- [ ] Monitoring alerts configured
- [ ] Incident severity levels defined
- [ ] Response playbooks created
- [ ] Post-incident review process

---

## Pass/Fail Criteria

### Critical Failures (Must Fix Before Deploy)
- Any exposed API keys or secrets
- Broken authentication or authorization
- SQL injection vulnerabilities
- XSS vulnerabilities
- No HTTPS on production
- Missing RLS on user data

### High Priority (Fix Within 24h of Deploy)
- Missing rate limiting
- Inadequate logging
- Missing security headers
- Unvalidated file uploads

### Medium Priority (Fix Within 1 Week)
- Outdated dependencies with vulnerabilities
- Inadequate monitoring
- Missing CSP headers

---

## Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Supabase Security
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Tools
- npm audit
- Snyk
- OWASP ZAP
- git-secrets
- truffleHog

---

Remember: Security is an ongoing process, not a one-time checklist. Regular audits and updates are essential!

---

*For troubleshooting specific security issues, see [Phase 7: Troubleshooting](../phases/phase-7-troubleshooting.md)*
