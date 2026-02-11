# 🚀 Deploy to Vercel - Step by Step

## Option A: GitHub Deployment (Recommended)

### Step 1: Commit Your Code

```bash
# Check what files changed
git status

# Stage all files
git add .

# Commit
git commit -m "feat: Complete deployment setup with Vercel config and documentation"

# Push to GitHub
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect it's a Vite project

### Step 3: Configure Environment Variables

Before deploying, click "Environment Variables" and add:

```
GEMINI_API_KEY=AIzaSyC9H-RMMuUduv4CDcNqjPY9F6gI-iJjwGw
SUPABASE_URL=https://qhcjngmvclreosmpyoqi.supabase.co
SUPABASE_KEY=sb_publishable_2MnrQ_A5XNi3eVEwDd6rtA_mX0QmJeU
```

**Note**: Add WhatsApp variables later:
```
EVOLUTION_API_URL=(add when you have VPS)
EVOLUTION_API_TOKEN=(add when you have VPS)
EVOLUTION_INSTANCE=(add when you have VPS)
```

### Step 4: Deploy!

Click "Deploy" and wait ~2 minutes.

You'll get a URL like: `https://your-app.vercel.app`

---

## Option B: Vercel CLI (Faster)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# Run from project root
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No**
- Project name? **3rbst-app** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **No**

### Step 4: Add Environment Variables

```bash
# Add each variable
vercel env add GEMINI_API_KEY
# Paste: AIzaSyC9H-RMMuUduv4CDcNqjPY9F6gI-iJjwGw
# Environment: Production, Preview, Development

vercel env add SUPABASE_URL
# Paste: https://qhcjngmvclreosmpyoqi.supabase.co

vercel env add SUPABASE_KEY
# Paste: sb_publishable_2MnrQ_A5XNi3eVEwDd6rtA_mX0QmJeU
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## After Deployment

### Test Your App

Visit your deployment URL and test:

1. **Homepage** - Should load with document analyzer
2. **Upload Image** - Try uploading a test document
3. **API Test** - Should analyze the document

### Check Logs

If something fails:
```bash
vercel logs
```

Or visit: https://vercel.com/dashboard → Your Project → Logs

---

## Troubleshooting

### Build Failed?
- Check that `package.json` has correct dependencies
- Run `npm run build` locally first

### API Not Working?
- Verify environment variables in Vercel Dashboard
- Check function logs in Vercel

### 404 on API Routes?
- Ensure `vercel.json` is committed
- Check `api/` folder structure

---

## What's Next?

After Vercel deployment works:

1. ✅ Frontend + API working
2. ⏭️ Set up Evolution API (WhatsApp) on VPS
3. ⏭️ Connect WhatsApp webhook to your Vercel URL
4. ⏭️ Test end-to-end flow

For WhatsApp setup, see **DEPLOYMENT.md** Part 3.
