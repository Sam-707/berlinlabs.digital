# DNS Configuration Guide

## Overview

**Domain:** berlinlabs.digital
**Registrar:** sav.com
**Hosting:** Vercel
**Last Updated:** 2026-02-18

## Correct DNS Configuration

### At sav.com DNS Settings

Go to: https://sav.com → **My Domains** → **berlinlabs.digital** → **DNS Settings**

| Type  | Name/Host | Value/Points To      | TTL   | Proxy    |
|-------|-----------|----------------------|-------|----------|
| A     | @         | 76.76.21.21          | Auto  | DNS Only |
| A     | @         | 76.76.19.21          | Auto  | DNS Only |
| CNAME | www       | cname.vercel-dns.com | Auto  | DNS Only |

### Vercel Domain Settings

In Vercel Dashboard → **berlin-labs-studio-website** → **Settings** → **Domains**:

- `berlinlabs.digital` should show "Valid Configuration" ✅
- `www.berlinlabs.digital` should show "Valid Configuration" ✅

---

## Step-by-Step: Fixing DNS at sav.com

### 1. Log in to sav.com

Visit https://sav.com and log in to your account.

### 2. Navigate to DNS Settings

1. Go to **My Domains**
2. Find **berlinlabs.digital**
3. Click **Manage** or **DNS Settings**

### 3. Update Root Domain (A Record)

Find the existing A record for `berlinlabs.digital` or `@`:

| Setting          | Value                    |
|------------------|--------------------------|
| Type             | A                        |
| Name/Host        | @ (or leave blank)       |
| Value/Points To  | **76.76.21.21**          |
| TTL              | Auto or 3600             |
| Proxy/CDN        | **DNS Only** (gray cloud) |

⚠️ **Important:** Set proxy to "DNS Only" - do NOT use sav.com's proxy/cloud service.

### 4. Add Second A Record (Optional but Recommended)

For redundancy, add a second A record:

| Setting          | Value                    |
|------------------|--------------------------|
| Type             | A                        |
| Name/Host        | @ (or leave blank)       |
| Value/Points To  | 76.76.19.21              |
| TTL              | Auto or 3600             |
| Proxy/CDN        | DNS Only                 |

### 5. Update WWW Subdomain (CNAME)

Find the existing CNAME record for `www`:

| Setting          | Value                          |
|------------------|--------------------------------|
| Type             | CNAME                          |
| Name/Host        | www                            |
| Value/Points To  | **cname.vercel-dns.com**       |
| TTL              | Auto or 3600                   |
| Proxy/CDN        | **DNS Only** (gray cloud)      |

### 6. Save Changes

Click **Save Changes** or **Apply**. You should see a success message.

---

## Verification

### Using the Verification Script

```bash
./scripts/verify-dns.sh
```

This script checks:
- ✅ Root domain points to Vercel IPs
- ✅ WWW subdomain uses correct Vercel CNAME
- ✅ HTTP/HTTPS accessibility
- ✅ SSL certificate validity

### Manual Verification

**Step 1: Check DNS records**
```bash
# Root domain should return Vercel IPs
dig berlinlabs.digital +short
# Expected output: 76.76.21.21 or 76.76.19.21

# WWW should return Vercel CNAME
dig www.berlinlabs.digital +short
# Expected output: cname.vercel-dns.com
```

**Step 2: Check website accessibility**
```bash
# Should return HTTP 200
curl -I https://berlinlabs.digital
```

**Step 3: Check global propagation**
Visit: https://dnschecker.org/#A/berlinlabs.digital

**Step 4: Verify in Vercel Dashboard**
- Go to Vercel → **berlin-labs-studio-website** → **Settings** → **Domains**
- Both domains should show "Valid Configuration" ✅

---

## Troubleshooting

| Symptom                    | Cause                           | Solution                                            |
|----------------------------|---------------------------------|-----------------------------------------------------|
| HTTP 403 Forbidden         | Domain pointing to wrong server | Check DNS settings at sav.com                       |
| DNS not updated after 30min | Changes not saved               | Log in to sav.com and verify settings were saved    |
| Site loads on mobile only  | Local DNS cache                 | Flush cache: `sudo dscacheutil -flushcache`         |
| SSL certificate error      | Domain not pointing to Vercel   | Fix DNS first; SSL will auto-provision              |
| ERR_NAME_NOT_RESOLVED      | DNS propagation delay           | Wait up to 24-48 hours for global propagation       |

### Flush Local DNS Cache

```bash
# macOS
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

### Check Current DNS State

```bash
# See what IP your domain is pointing to
dig berlinlabs.digital +short

# See the full DNS response
dig berlinlabs.digital

# Check WWW subdomain
dig www.berlinlabs.digital +short

# Check HTTP status
curl -I https://berlinlabs.digital
```

---

## Vercel DNS Reference

### Official Vercel DNS Records

| Purpose        | Type  | Value                 |
|----------------|-------|-----------------------|
| Root Domain    | A     | 76.76.21.21           |
| Root Domain    | A     | 76.76.19.21           |
| WWW Subdomain  | CNAME | cname.vercel-dns.com  |

### Why These Values?

- **76.76.21.21** and **76.76.19.21**: Vercel's Anycast IPs that route traffic to the nearest edge location
- **cname.vercel-dns.com**: Vercel's unified DNS endpoint for subdomain routing

---

## Support

### If Issues Persist

1. **Check Vercel Dashboard** for domain warnings
2. **Run verification script**: `./scripts/verify-dns.sh`
3. **Check sav.com DNS settings** were saved
4. **Wait for propagation** (up to 48 hours globally)
5. **Contact Vercel Support** via dashboard
6. **Contact sav.com Support** for registrar-specific issues

### Useful Links

- Vercel Domains: https://vercel.com/docs/concepts/projects/domains
- DNS Checker: https://dnschecker.org
- MXToolbox: https://mxtoolbox.com/DNSLookup.aspx

---

*Document maintained as part of BERLINLABS operational documentation.*
