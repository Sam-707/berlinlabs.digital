# Supabase Setup Guide for BERLINLABS.DIGITAL

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization (or create one)
4. Project name: `berlinlabs-digital` (or any name)
5. Database Password: Generate and save it securely
6. Region: Choose closest to your users (EU for Berlin)
7. Click "Create new project" and wait ~2 minutes

### Step 2: Run Database Migration
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire content of `setup_complete.sql`
4. Paste into the editor
5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
6. You should see "Success. No rows returned" in the results panel

### Step 3: Get Your Credentials
1. Go to **Settings** → **API** (left sidebar gear icon)
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (long JWT token - keep this secret!)

### Step 4: Configure Environment Variables

#### For Local Development
Create `.env.local` in project root:
```bash
# Copy from .env.example and fill in your actual values
cp .env.example .env.local
```

Edit `.env.local`:
```bash
VITE_API_BASE_URL=/api

# Replace with your actual Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-full-key-here
```

#### For Vercel Deployment
1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables (select **Production**, **Preview**, **Development**):
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Deploy
```bash
vercel --prod
```

## Verification

### Test in Supabase Dashboard
1. Go to **Table Editor** (left sidebar)
2. You should see the `leads` table
3. Initially empty (0 rows)

### Test Forms on Deployed Site
1. Go to your deployed Vercel URL
2. Navigate to `/contact` and submit a test form
3. Navigate to `/onboarding` and submit a test application
4. Check Supabase Table Editor - you should see 2 new rows

### Expected Data Structure

**Contact Form Submission:**
```
{
  lead_type: "contact",
  name: "John Doe",
  email: "john@example.com",
  inquiry_type: "General Inquiry",
  message: "I'd like to learn more...",
  status: "new",
  created_at: "2025-02-18T10:00:00Z"
}
```

**Onboarding Form Submission:**
```
{
  lead_type: "onboarding",
  name: "Jane Smith",
  restaurant_name: "Bistro Berlin",
  email: "jane@bistro.berlin",
  phone: "+49 30 12345678",
  location: "Mitte",
  message: "We're interested in the pilot...",
  status: "new",
  created_at: "2025-02-18T10:05:00Z"
}
```

## Security Checklist

- ✅ Service role key stored in environment variables (not in code)
- ✅ RLS (Row Level Security) enabled on `leads` table
- ✅ API endpoints only accessible via POST requests
- ✅ Service role key only used server-side (never exposed to frontend)
- ✅ Validation at three layers: frontend, API, database constraints

## Troubleshooting

### "Failed to save lead" error
- Check that Supabase URL and key are correct in environment variables
- Verify RLS policy "Service role can manage all leads" exists
- Check Supabase logs: https://supabase.com/dashboard/project/_/logs

### Forms submit but no data in Supabase
- Check Vercel function logs in Vercel dashboard
- Verify environment variables are set in Vercel (not just locally)
- Make sure you deployed after adding environment variables

### "Missing required fields" error
- Check browser console for actual error message
- Verify all required fields are being sent from frontend

### CORS errors
- Verify `vercel.json` has the API rewrite rule
- Check that API routes return proper CORS headers

## Next Steps (Optional)

### Add Admin Dashboard
1. Create `/admin` page with authentication
2. Add `/api/leads` endpoint to fetch leads
3. Build UI to view, filter, and update lead status
4. Use Supabase Auth for admin authentication

### Add Email Notifications
1. Use Supabase Edge Functions or Resend
2. Send email on new lead submission
3. Notify admin team immediately

### Add Analytics
1. Track conversion rate (contact → qualified)
2. Monitor response time (created_at → first_contacted_at)
3. Dashboard charts in Supabase

## Useful Supabase Queries

```sql
-- View all new leads (for admin dashboard)
SELECT
  id,
  lead_type,
  name,
  email,
  inquiry_type,
  restaurant_name,
  status,
  created_at
FROM leads
WHERE status = 'new'
ORDER BY created_at DESC;

-- Count leads by type
SELECT
  lead_type,
  COUNT(*) as count
FROM leads
GROUP BY lead_type;

-- Recent leads (last 30 days)
SELECT *
FROM leads
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

## File Locations

- Database Setup: `/supabase/setup_complete.sql`
- API Endpoints: `/api/contact.js`, `/api/onboarding.js`
- Frontend Forms: `/views/Contact.tsx`, `/pages/Onboarding.tsx`
- Environment Template: `/.env.example`
- Deployment Config: `/vercel.json`

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Support: https://supabase.com/support
- Project Issues: Check in `/supabase` directory for additional scripts
