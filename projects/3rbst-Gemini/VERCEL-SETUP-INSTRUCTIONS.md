# 🚀 Vercel Deployment - Final Steps

Your code is now on GitHub! Follow these steps to deploy:

## Step 1: Import to Vercel

1. Open: **https://vercel.com/new**
2. Sign in with your GitHub account (Sam-707)
3. You should see your repository: **Sam-707/3rbst-Gemini**
4. Click **"Import"** next to it

## Step 2: Configure Project

Vercel will auto-detect:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

Click **"Deploy"** but WAIT - we need to add environment variables first!

## Step 3: Add Environment Variables

**BEFORE clicking Deploy**, scroll down to **"Environment Variables"** section and add these:

### Required Variables

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | `AIzaSyC9H-RMMuUduv4CDcNqjPY9F6gI-iJjwGw` |
| `SUPABASE_URL` | `https://qhcjngmvclreosmpyoqi.supabase.co` |
| `SUPABASE_KEY` | `sb_publishable_2MnrQ_A5XNi3eVEwDd6rtA_mX0QmJeU` |

### Optional (Add Later for WhatsApp)

These can be added after you set up Evolution API:

| Name | Value |
|------|-------|
| `EVOLUTION_API_URL` | (Your VPS domain) |
| `EVOLUTION_API_TOKEN` | (Your token) |
| `EVOLUTION_INSTANCE` | (Your instance name) |

**How to add:**
1. Type variable name in "Key" field
2. Paste value in "Value" field
3. Check all environments: ✅ Production ✅ Preview ✅ Development
4. Click "Add"
5. Repeat for each variable

## Step 4: Deploy!

After adding all environment variables:
1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. You'll get a URL like: `https://3rbst-gemini.vercel.app`

## Step 5: Verify Deployment

1. Visit your deployment URL
2. You should see the 3rbst homepage
3. Try uploading a test document image
4. Check if it analyzes correctly

## Step 6: Check Logs

If something doesn't work:
1. Go to: https://vercel.com/sam-707s-projects/3rbst-gemini
2. Click on the deployment
3. Go to **"Functions"** tab
4. Check logs for any errors

## 🎉 What You'll Have After Deployment

- ✅ Frontend working at your Vercel URL
- ✅ Document analyzer API working
- ✅ Supabase connected
- ✅ Credit system ready
- ⏭️ WhatsApp integration (add later with VPS)

## Next Steps

After successful deployment:

### Test Frontend Only
1. Visit your Vercel URL
2. Upload a German document image on the homepage
3. Verify it returns analysis in Arabic

### Add WhatsApp (Optional, Later)
1. Set up Evolution API on VPS (see DEPLOYMENT.md Part 3)
2. Add the 3 WhatsApp environment variables in Vercel dashboard
3. Configure webhook to point to your Vercel URL
4. Test by sending messages to your WhatsApp number

---

## 🆘 Troubleshooting

### Build Failed
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Try redeploying

### API Not Working
- Check Functions logs
- Verify environment variables are correct
- Check Supabase connection

### 404 Errors
- Ensure vercel.json is in the repository
- Check API folder structure

---

## ✅ Quick Checklist

- [ ] Go to https://vercel.com/new
- [ ] Import Sam-707/3rbst-Gemini
- [ ] Add GEMINI_API_KEY
- [ ] Add SUPABASE_URL
- [ ] Add SUPABASE_KEY
- [ ] Click Deploy
- [ ] Wait for deployment
- [ ] Visit your URL and test
- [ ] ✨ Success!

---

**Your deployment URL will be something like:**
- https://3rbst-gemini.vercel.app
- https://3rbst-gemini-sam-707.vercel.app

Copy this URL - you'll need it for WhatsApp webhook configuration later!
