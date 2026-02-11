# MenuFlows Deployment Guide

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sam-707/menuflows)

#### Option B: Manual Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings (see below)

### Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🗄️ Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set project details
4. Wait for project to be ready (~2 minutes)

### 2. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema-multitenant.sql`
3. Paste and run the SQL
4. Verify tables are created in **Table Editor**

### 3. Get API Credentials

1. Go to **Settings → API**
2. Copy your **Project URL** and **anon public** key
3. Add these to your Vercel environment variables

### 4. Configure Storage (Optional)

1. Go to **Storage** in Supabase dashboard
2. Create buckets:
   - `menu-images` (public)
   - `restaurant-assets` (public)

## 🔧 Troubleshooting Common Issues

### Issue: Vercel Build Fails

**Symptoms**: Build fails with TypeScript or dependency errors

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Issue: Environment Variables Not Working

**Symptoms**: App loads but shows connection errors

**Solutions**:
1. Verify environment variables in Vercel dashboard
2. Ensure variable names start with `VITE_`
3. Redeploy after adding variables
4. Check browser console for specific errors

### Issue: Routing Not Working

**Symptoms**: Direct URLs return 404 errors

**Solutions**:
1. Verify `vercel.json` has proper rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Issue: Supabase Connection Fails

**Symptoms**: Database queries fail or timeout

**Solutions**:
1. Check Supabase project is active (not paused)
2. Verify API keys are correct
3. Check RLS policies are properly configured
4. Test connection in Supabase dashboard

### Issue: Large Bundle Size Warning

**Symptoms**: Build succeeds but warns about large chunks

**Solutions**:
```typescript
// In vite.config.ts, add:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

## 📊 Performance Optimization

### 1. Enable Vercel Analytics

Add to your Vercel project:
```bash
npm install @vercel/analytics
```

### 2. Configure Caching

The `vercel.json` includes cache headers for static assets:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Image Optimization

Use Vercel's image optimization for menu images:
```typescript
// Use next/image equivalent or optimize images before upload
const optimizedImageUrl = `${imageUrl}?w=400&q=75`;
```

## 🔒 Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] Supabase RLS policies are enabled
- [ ] API keys are properly scoped (anon key only)
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] No sensitive data in client-side code

## 🌐 Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers

3. **SSL Certificate**:
   - Automatic with Vercel
   - Usually takes 5-10 minutes

## 📈 Monitoring & Analytics

### Vercel Analytics
- Enable in Project Settings
- Monitor performance and usage

### Supabase Monitoring
- Check database usage in Supabase dashboard
- Monitor API requests and performance

### Error Tracking
Consider adding error tracking:
```bash
npm install @sentry/react @sentry/tracing
```

## 🚀 Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Test all user flows (customer, owner, admin)
- [ ] Verify real-time updates work
- [ ] Test on mobile devices
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain
- [ ] Test payment integration (when implemented)

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting Guide](./DOCS/TROUBLESHOOTING.md)
2. Review Vercel deployment logs
3. Check Supabase logs and metrics
4. Open an issue on GitHub

---

**Happy deploying! 🚀**