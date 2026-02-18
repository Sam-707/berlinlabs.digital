#!/bin/bash

# BERLINLABS DNS Verification Script
# Checks if berlinlabs.digital is correctly pointing to Vercel

DOMAIN="berlinlabs.digital"
WWW_DOMAIN="www.berlinlabs.digital"

# Vercel DNS IPs (correct)
VERCEL_IP_1="76.76.21.21"
VERCEL_IP_2="76.76.19.21"

# Vercel CNAME (correct)
VERCEL_CNAME="cname.vercel-dns.com"

echo "🔍 BERLINLABS DNS Verification"
echo "================================"
echo ""

# Function to color output
pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; }
warn() { echo "⚠️  $1"; }
info() { echo "ℹ️  $1"; }

# Check root domain
echo "📍 Checking Root Domain: $DOMAIN"
ROOT_IP=$(dig +short $DOMAIN A | head -n 1)
echo "   Current IP: $ROOT_IP"

if [[ "$ROOT_IP" == "$VERCEL_IP_1" ]]; then
    pass "Root domain correctly pointing to Vercel ($VERCEL_IP_1)"
elif [[ "$ROOT_IP" == "$VERCEL_IP_2" ]]; then
    pass "Root domain correctly pointing to Vercel ($VERCEL_IP_2)"
else
    fail "Root domain NOT pointing to Vercel"
    echo "   Expected: $VERCEL_IP_1 or $VERCEL_IP_2"
    if [[ -n "$ROOT_IP" ]]; then
        echo "   Got: $ROOT_IP"
    fi
fi
echo ""

# Check WWW subdomain
echo "📍 Checking WWW Subdomain: $WWW_DOMAIN"
WWW_CNAME=$(dig +short $WWW_DOMAIN CNAME | head -n 1 | sed 's/\.$//')
echo "   Current CNAME: $WWW_CNAME"

if [[ "$WWW_CNAME" == "$VERCEL_CNAME" ]]; then
    pass "WWW correctly pointing to Vercel ($VERCEL_CNAME)"
else
    fail "WWW NOT pointing to Vercel"
    echo "   Expected: $VERCEL_CNAME"
    if [[ -n "$WWW_CNAME" ]]; then
        echo "   Got: $WWW_CNAME"
    fi
fi
echo ""

# Check HTTP status
echo "📍 Checking HTTP Status"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null)
echo "   HTTP $HTTP_STATUS"

if [[ "$HTTP_STATUS" == "200" ]]; then
    pass "Website is accessible (HTTP 200)"
elif [[ "$HTTP_STATUS" == "403" ]]; then
    fail "HTTP 403 - Domain likely pointing to wrong server"
elif [[ "$HTTP_STATUS" == "000" ]]; then
    warn "Could not connect to server"
else
    warn "Unexpected HTTP status: $HTTP_STATUS"
fi
echo ""

# Check SSL
echo "📍 Checking SSL Certificate"
if echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | grep -q "Verify return code: 0"; then
    pass "SSL certificate is valid"
else
    warn "SSL certificate issue detected"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo ""
if [[ "$ROOT_IP" != "$VERCEL_IP_1" && "$ROOT_IP" != "$VERCEL_IP_2" ]]; then
    echo "1. Log in to https://sav.com"
    echo "2. Go to: My Domains → berlinlabs.digital → DNS Settings"
    echo "3. Update A record for @ to: $VERCEL_IP_1"
    echo "4. Update CNAME for www to: $VERCEL_CNAME"
    echo "5. Save changes and wait 5-30 minutes for propagation"
else
    pass "DNS is correctly configured!"
    echo "Your website should be accessible at https://$DOMAIN"
fi
echo ""
echo "🔧 Flush local DNS cache if needed:"
echo "   sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder"
echo ""
echo "🌐 Check propagation globally:"
echo "   https://dnschecker.org/#A/$DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
