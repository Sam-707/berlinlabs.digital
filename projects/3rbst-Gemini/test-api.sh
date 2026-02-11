#!/bin/bash
# Test script for 3rbst API

echo "🧪 Testing 3rbst API Endpoints"
echo "================================"
echo ""

# Test 1: Check if site is accessible
echo "1️⃣ Testing Landing Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://3rbst-gemini.vercel.app)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Landing page is accessible (HTTP $STATUS)"
else
    echo "   ❌ Landing page failed (HTTP $STATUS)"
fi
echo ""

# Test 2: Check analyze API endpoint
echo "2️⃣ Testing Analyze API..."
echo "   Creating test request with small base64 image..."

# Small 1x1 pixel PNG image
TEST_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

RESPONSE=$(curl -s -X POST https://3rbst-gemini.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"$TEST_IMAGE\",\"mimeType\":\"image/png\"}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ API endpoint is working (HTTP $HTTP_CODE)"
    echo "   📝 Response preview:"
    echo "$BODY" | head -c 200
    echo "..."
else
    echo "   ⚠️  API returned HTTP $HTTP_CODE"
    echo "   Response: $BODY"
fi
echo ""

echo "================================"
echo "✅ Testing complete!"
echo ""
echo "🌐 Your app is live at:"
echo "   https://3rbst-gemini.vercel.app"
echo ""
echo "📱 To test manually:"
echo "   1. Visit the URL above"
echo "   2. Upload a German document image"
echo "   3. See the AI analysis in Arabic"
