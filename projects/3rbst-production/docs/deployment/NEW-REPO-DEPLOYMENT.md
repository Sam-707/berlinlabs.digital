# Deployment Guide: New Private Repository Setup

**Purpose:** Deploy 3rbst to a new private GitHub repository to avoid git author permission issues

**Date:** 2025-12-13

---

## Step 1: Create New Private GitHub Repository

### Option A: Via GitHub Web Interface

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name:** `3rbst-production` (or your preferred name)
   - **Description:** "3rbst - WhatsApp German Document Helper"
   - **Visibility:** ⚪ Private (selected)
   - **Initialize:** ❌ Do NOT initialize with README, .gitignore, or license
3. Click **"Create repository"**
4. Copy the repository URL (e.g., `https://github.com/YOUR-USERNAME/3rbst-production.git`)

### Option B: Via GitHub CLI (if installed)

```bash
gh repo create 3rbst-production --private --source=. --remote=origin-new
```

---

## Step 2: Prepare Current Codebase

### Clean Up Unnecessary Files

```bash
# Navigate to project directory
cd "/Users/samhizam/Downloads/3rbst---german-document-helper (5)"

# Remove files that shouldn't be in version control (if not already in .gitignore)
rm -f .env.local
rm -f AWSCLIV2.pkg

# Check what will be committed
git status
```

### Update .gitignore (if needed)

Create or update `.gitignore`:

```bash
# .gitignore
node_modules/
.env
.env.local
.env.*.local
.vercel
dist/
*.log
.DS_Store
AWSCLIV2.pkg
docker-compose.yml
```

---

## Step 3: Push to New Repository

### Method 1: Fresh Git History (Recommended)

This creates a clean git history without any previous commits:

```bash
# Remove old git history
rm -rf .git

# Initialize new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: 3rbst WhatsApp document helper

- Complete API infrastructure (analyze, webhook, check-credits)
- Gemini AI integration (gemini-2.5-flash)
- Supabase user management
- PayPal payment integration
- WhatsApp Evolution API integration ready
- Landing page vision (FMA + Lexical Simplicity)
- Viral growth strategies (review incentive + referrals)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Rename branch to main (if needed)
git branch -M main

# Add new remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR-USERNAME/3rbst-production.git

# Push to new repository
git push -u origin main
```

### Method 2: Keep Existing History

If you want to preserve commit history:

```bash
# Add new remote
git remote add origin-new https://github.com/YOUR-USERNAME/3rbst-production.git

# Push all branches and tags
git push -u origin-new main --force
```

---

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your new repository: `YOUR-USERNAME/3rbst-production`
5. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add **Environment Variables**:

```
GEMINI_API_KEY=AIzaSyBkBYiOyJ5yW3EFTxpTdpfZNsZNaureCFk
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
EVOLUTION_API_URL=your_evolution_api_url (when ready)
EVOLUTION_API_KEY=your_evolution_key (when ready)
```

7. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for configuration)
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your personal account
# - Link to existing project? No
# - What's your project's name? 3rbst-production
# - In which directory is your code located? ./
# - Want to override settings? No
```

### Add Environment Variables via CLI

```bash
# Add environment variables
vercel env add GEMINI_API_KEY production
# (paste your API key when prompted)

vercel env add SUPABASE_URL production
# (paste your Supabase URL)

vercel env add SUPABASE_KEY production
# (paste your Supabase anon key)

# ... add all other environment variables
```

---

## Step 5: Verify Deployment

### Test API Endpoints

```bash
# Get your deployment URL from Vercel dashboard
# Example: https://3rbst-production.vercel.app

# Test analyze endpoint
curl -X POST https://YOUR-DEPLOYMENT-URL.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_test_image",
    "mimeType": "image/jpeg"
  }'

# Test check-credits endpoint
curl -X POST https://YOUR-DEPLOYMENT-URL.vercel.app/api/check-credits \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+491234567890"
  }'
```

### Test Frontend

1. Visit your deployment URL in browser
2. Test interactive tutorial (when implemented)
3. Verify WhatsApp links work correctly

---

## Step 6: Configure Custom Domain (Optional)

### In Vercel Dashboard:

1. Go to your project → **"Settings"** → **"Domains"**
2. Add your domain: `3rbst.com` or `www.3rbst.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate to provision (automatic)

---

## Step 7: Set Up Auto-Deploy on Push

Vercel automatically deploys when you push to the `main` branch. To push updates:

```bash
# Make changes to your code
# ...

# Stage and commit
git add .
git commit -m "feat: Add interactive tutorial component

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (triggers auto-deploy)
git push origin main
```

Vercel will automatically:
- Detect the push
- Build the project
- Run deployment
- Update production URL

---

## Troubleshooting

### Issue: Git Author Permission Error

If you still get git author errors:

```bash
# Update git config locally
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Or use workaround:
mv .git .git-backup
vercel deploy --prod --force
mv .git-backup .git
```

### Issue: Build Fails on Vercel

Check build logs in Vercel dashboard. Common issues:

1. **Missing dependencies:** Run `npm install` locally first
2. **TypeScript errors:** Run `npm run build` locally to test
3. **Environment variables missing:** Add them in Vercel dashboard

### Issue: API Returns 500 Errors

1. Check Vercel function logs
2. Verify environment variables are set
3. Check Gemini API quota
4. Verify Supabase connection

---

## Repository Structure

Your new repository should have:

```
3rbst-production/
├── api/
│   ├── analyze.ts
│   ├── check-credits.ts
│   ├── webhook.ts
│   └── fulfill-order.ts
├── components/
│   └── Analyzer.tsx
├── services/
│   ├── geminiService.ts
│   └── whatsappService.ts
├── src/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── LANDING-PAGE-VISION.md
├── DEPLOYMENT-PLAN.md
├── AWS-DEPLOYMENT.md
└── NEW-REPO-DEPLOYMENT.md
```

---

## Next Steps After Deployment

1. ✅ Verify all API endpoints work
2. ✅ Test WhatsApp integration (when Evolution API is deployed)
3. ✅ Configure PayPal webhook URL in PayPal dashboard
4. ✅ Update WhatsApp Evolution API webhook to point to new Vercel URL
5. ✅ Monitor Vercel analytics for errors
6. ✅ Set up Vercel notifications (optional)

---

## Security Checklist

- [ ] All sensitive data in environment variables (not committed)
- [ ] `.env.local` in `.gitignore`
- [ ] Repository set to **Private**
- [ ] Supabase RLS policies configured
- [ ] CORS configured for API endpoints (if needed)
- [ ] Rate limiting implemented (optional, but recommended)

---

**Status:** Ready to execute
**Estimated Time:** 15-20 minutes
**Risk Level:** Low (fresh start, no git conflicts)

---

**Pro Tip:** After successful deployment, delete the old Vercel project to avoid confusion and prevent accidental deploys to the wrong project.
