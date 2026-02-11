#!/bin/bash

# 🛡️ Pre-Deployment Manifest Enforcement Script
# This script MUST pass before any deployment

echo "🔍 Running 3rbst Pre-Deployment Checks..."
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check flag
CHECKS_PASSED=true

# 1. Check for doctor finder mentions
echo -n "Checking for unauthorized doctor finder content... "
if grep -r "طبيب\|أطباء\|doctor" public/index.html > /dev/null 2>&1; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "  ERROR: Doctor finder content detected in landing page!"
    echo "  3rbst is DOCUMENT ANALYSIS ONLY - see PROJECT-MANIFEST.md"
    CHECKS_PASSED=false
else
    echo -e "${GREEN}✅ PASSED${NC}"
fi

# 2. Check for multi-service mentions
echo -n "Checking for multi-service offerings... "
if grep -r "خدماتنا المتكاملة\|multiple services\|خدمات متعددة" public/index.html > /dev/null 2>&1; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "  ERROR: Multi-service content detected!"
    echo "  3rbst offers ONE service only - see PROJECT-MANIFEST.md"
    CHECKS_PASSED=false
else
    echo -e "${GREEN}✅ PASSED${NC}"
fi

# 3. Verify correct WhatsApp number
echo -n "Checking WhatsApp number... "
if ! grep "4917634167680\|176 3416 7680" public/index.html > /dev/null 2>&1; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "  ERROR: Correct WhatsApp number not found!"
    CHECKS_PASSED=false
else
    echo -e "${GREEN}✅ PASSED${NC}"
fi

# 4. Check for OpenRouter (should use OpenAI)
echo -n "Checking for deprecated OpenRouter usage... "
if grep -r "openrouter\|or-v1" src/backend/*.js > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  OpenRouter detected - should use OpenAI for GDPR compliance"
fi

# 5. Verify legal pages exist
echo -n "Checking legal pages... "
LEGAL_PAGES_OK=true
for page in privacy terms impressum; do
    if [ ! -f "public/$page/index.html" ] && [ ! -f "public/$page.html" ]; then
        LEGAL_PAGES_OK=false
        break
    fi
done

if [ "$LEGAL_PAGES_OK" = false ]; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "  ERROR: Legal pages missing!"
    CHECKS_PASSED=false
else
    echo -e "${GREEN}✅ PASSED${NC}"
fi

# 6. Verify manifest exists
echo -n "Checking PROJECT-MANIFEST.md exists... "
if [ ! -f "PROJECT-MANIFEST.md" ]; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "  ERROR: PROJECT-MANIFEST.md not found!"
    echo "  This file defines what 3rbst IS and IS NOT"
    CHECKS_PASSED=false
else
    echo -e "${GREEN}✅ PASSED${NC}"
fi

echo "==========================================="

# Final result
if [ "$CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Ready to deploy!${NC}"
    echo ""
    echo "3rbst = German Document Analysis in Arabic (ONLY)"
    exit 0
else
    echo -e "${RED}❌ DEPLOYMENT BLOCKED - Fix issues above${NC}"
    echo ""
    echo "Read PROJECT-MANIFEST.md for product scope definition"
    exit 1
fi