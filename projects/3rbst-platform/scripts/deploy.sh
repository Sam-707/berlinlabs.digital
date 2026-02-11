#!/bin/bash
# 🚀 Safe Deployment Script for 3rbst WhatsApp Bot
# Prevents repository confusion by deploying to both repos

set -e  # Exit on any error

echo "🚀 Starting 3rbst deployment process..."

# Check if we have uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ You have uncommitted changes. Please commit first."
    exit 1
fi

# Get commit message from user
echo "📝 Enter commit message:"
read -r commit_message

# Validate commit message
if [[ -z "$commit_message" ]]; then
    echo "❌ Commit message cannot be empty."
    exit 1
fi

echo "📦 Committing changes..."
git add .
git commit -m "$commit_message"

echo "🔄 Pushing to BOTH repositories..."
git push origin main
git push whatsapp-repo main

echo "⏳ Deploying to Vercel..."
vercel --prod --yes --scope sam-707s-projects

echo "🧪 Testing deployment..."
sleep 10
response=$(curl -s https://whatsapp-bot-3rbst.vercel.app/api/webhook)
version=$(echo "$response" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)

echo "✅ Deployment complete!"
echo "🔗 Webhook version: $version"
echo "🌐 Production URL: https://whatsapp-bot-3rbst.vercel.app"
echo "💬 WhatsApp: https://wa.me/4917634167680"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Test WhatsApp bot with a real document"
echo "2. Monitor for any errors"
echo "3. Update status if needed"
echo ""
echo "📋 Quick test: Send 'مرحبا' to your WhatsApp bot"