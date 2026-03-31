<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18XhSU9Ys5DfmuxJC6deQ1-70QLTeiyr7

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## DNS Configuration

**Domain:** berlinlabs.digital

The site is deployed on Vercel. DNS records at sav.com should be configured as:

| Type  | Name/Host | Value/Points To      | Proxy    |
|-------|-----------|----------------------|----------|
| A     | @         | 76.76.21.21          | DNS Only |
| A     | @         | 76.76.19.21          | DNS Only |
| CNAME | www       | cname.vercel-dns.com | DNS Only |

### Verify DNS Configuration

Run the provided verification script:

```bash
./scripts/verify-dns.sh
```

This will check:
- Root domain points to Vercel IPs
- WWW subdomain uses correct Vercel CNAME
- HTTP/HTTPS accessibility
- SSL certificate status

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Site not loading | Run `./scripts/verify-dns.sh` to check DNS |
| DNS not updated | Log in to sav.com and verify DNS settings |
| Local cache issue | `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` |
| Check propagation | https://dnschecker.org/#A/berlinlabs.digital |
