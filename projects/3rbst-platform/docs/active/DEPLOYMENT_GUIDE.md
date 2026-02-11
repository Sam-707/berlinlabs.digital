# 🚀 3rbst Deployment Guide

## Repository Structure
- **PRIMARY REPO**: `whatsapp-bot-3rbst` (Connected to Vercel production)
- **BACKUP REPO**: `3rbst-platform` (Development/backup)
- **ARCHIVE**: `3rbst-whatsapp-bot-Kiro` (Old version - no longer used)

## Deployment Workflow

### ✅ CORRECT Process:
1. Make changes in local working directory
2. Test locally with `vercel dev`
3. Commit and push to BOTH repositories:
   ```bash
   git add .
   git commit -m "🚀 DEPLOY: Your change description"
   git push origin main                    # Push to 3rbst-platform
   git push whatsapp-repo main            # Push to whatsapp-bot-3rbst
   ```
4. Deploy to production:
   ```bash
   vercel --prod --yes --scope sam-707s-projects
   ```

### ❌ AVOID:
- Pushing to only one repository
- Making changes directly on GitHub
- Deploying without testing

## Repository Remotes Setup:
```bash
git remote -v
# Should show:
# origin        https://github.com/Sam-707/3rbst-platform.git (fetch)
# origin        https://github.com/Sam-707/3rbst-platform.git (push)
# whatsapp-repo https://github.com/Sam-707/whatsapp-bot-3rbst.git (fetch)
# whatsapp-repo https://github.com/Sam-707/whatsapp-bot-3rbst.git (push)
```

## Quick Verification:
- Check webhook version: `curl https://whatsapp-bot-3rbst.vercel.app/api/webhook`
- Test WhatsApp bot functionality before declaring success

## Emergency Rollback:
If deployment breaks, immediately run:
```bash
git revert HEAD
git push origin main
git push whatsapp-repo main
vercel --prod --yes --scope sam-707s-projects
```