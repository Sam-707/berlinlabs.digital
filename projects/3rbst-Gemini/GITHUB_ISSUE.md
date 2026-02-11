# Bug Report: Vercel Deployment Issues

## Summary
Multiple critical deployment and runtime errors preventing the 3rbst API from functioning on Vercel.

## Environment
- **Platform**: Vercel Serverless Functions
- **Framework**: Vite + React + TypeScript
- **Backend**: Vercel API routes (`/api/analyze.ts`, `/api/webhook.ts`)
- **AI Provider**: Google Generative AI (Gemini)
- **Database**: Supabase

## Issues Encountered

### 1. ❌ Sharp Library Incompatibility
**Error**: `FUNCTION_INVOCATION_FAILED` - 500 errors on `/api/analyze`

**Root Cause**:
- `sharp` library (native image processing) is incompatible with Vercel serverless functions
- Package was added for image anonymization but causes function crashes

**Fix Applied** (commits 0dc3513, 312efb5):
```bash
# Removed sharp from code
git commit -m "fix: remove sharp dependency"
# Removed sharp from package.json
npm uninstall sharp
```

**Status**: ✅ Fixed

---

### 2. ❌ Wrong Google AI Package
**Error**: `FUNCTION_INVOCATION_FAILED` - Module import errors

**Root Cause**:
- Using incorrect package name: `@google/genai` (doesn't exist)
- Should be: `@google/generative-ai` (official package)
- Wrong API syntax: `GoogleGenAI` vs `GoogleGenerativeAI`

**Fix Applied** (commit 44af529):
```json
// package.json - BEFORE
"@google/genai": "^0.11.0"

// package.json - AFTER
"@google/generative-ai": "^0.24.1"
```

```typescript
// services/geminiService.ts - BEFORE
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({...});

// services/geminiService.ts - AFTER
import { GoogleGenerativeAI } from "@google/generative-ai";
const ai = new GoogleGenerativeAI(apiKey);
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
const result = await model.generateContent({...});
```

**Status**: ✅ Fixed

---

### 3. ❌ Invalid/Expired Gemini API Key
**Error**: `403 PERMISSION_DENIED` from Google Generative AI API

**Root Cause**:
- Old API key in `VERCEL-ENV-VARS.txt` was invalid/expired
- Direct API calls returned: `"Method doesn't allow unregistered callers"`

**Fix Applied**:
1. Created new API key at https://aistudio.google.com/app/apikey
2. Updated Vercel environment variable:
   ```bash
   vercel env rm GEMINI_API_KEY production
   vercel env add GEMINI_API_KEY production
   ```

**Status**: ✅ Fixed (new key added to Vercel)

---

### 4. ❌ Environment Variables Not Available at Module Load
**Error**: `FUNCTION_INVOCATION_FAILED` - API key missing at runtime

**Root Cause**:
- Gemini client initialized during **module load time**
- Vercel serverless functions only have `process.env` available during **function execution**

**Code Issue**:
```typescript
// ❌ WRONG - Initialized at module load (build time)
const apiKey = process.env.GEMINI_API_KEY; // undefined at build time!
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const analyzeGermanDocument = async (...) => {
  if (!ai) return "error"; // Always fails!
}
```

**Fix Applied** (commit c519d2b):
```typescript
// ✅ CORRECT - Initialize inside function (runtime)
export const analyzeGermanDocument = async (...) => {
  const apiKey = process.env.GEMINI_API_KEY; // Available at runtime!
  if (!apiKey) return "error";

  const ai = new GoogleGenerativeAI(apiKey);
  // ... rest of code
}
```

**Status**: ✅ Fixed (needs deployment)

---

### 5. ⚠️ Git Author Permission Errors (Ongoing)
**Error**: `Git author sam707@users.noreply.github.com must have access to the team sam-707's projects`

**Root Cause** (from [Vercel Community Discussion](https://community.vercel.com/t/deployment-request-did-not-have-a-git-author-with-access/4448)):
- **GitHub account can only be linked to ONE Vercel account at a time**
- If using same GitHub credentials across multiple Vercel accounts → authentication conflicts
- Vercel intentionally restricts one-to-one GitHub-to-Vercel mapping

**Solutions Available**:
1. **Consolidate Vercel accounts** - Merge personal/work accounts into one
2. **Separate GitHub accounts** - Create distinct accounts for different projects
3. **Use Vercel CLI for manual deploys** - Bypass GitHub integration
4. **Dashboard manual redeploys** - Use UI instead of CLI/webhooks

**Current Workaround**:
- Manual redeployment via Vercel Dashboard
- Uncheck "Use existing Build Cache" for fresh builds

**Status**: ⚠️ Workaround in place (CLI blocked, dashboard works)

---

### 6. ⚠️ Vercel Build Cache Issues (Ongoing)
**Error**: Deployments using old cached code instead of latest GitHub commits

**Observations**:
- Multiple "Redeploy" operations kept using old commit (b802b4c with sharp bug)
- Latest code (c519d2b with fixes) not being pulled from GitHub
- All deployments show "Redeploy of..." instead of fresh builds

**Current Workaround**:
- Always **uncheck "Use existing Build Cache"** when redeploying
- Trigger fresh deployments from Vercel Dashboard

**Status**: ⚠️ Workaround required for each deployment

---

## Commits Timeline

| Commit | Description | Status |
|--------|-------------|--------|
| `0dc3513` | Remove sharp from code | ✅ Merged |
| `312efb5` | Remove sharp from package.json | ✅ Merged |
| `44af529` | Fix Google AI package name & API | ✅ Merged |
| `c519d2b` | Fix Gemini client runtime initialization | ✅ Merged, ⚠️ Needs deployment |

---

## Current Status

### What's Working ✅
- Landing page accessible (HTTP 200)
- Code fixes committed and pushed to GitHub
- Environment variables configured in Vercel
- New valid Gemini API key added

### What's Not Working ❌
- `/api/analyze` endpoint returns 500 errors
- Latest code (c519d2b) not yet deployed to production
- Need manual dashboard redeploy to apply fixes

---

## Next Steps

1. **Immediate**: Redeploy from Vercel Dashboard with latest code (c519d2b)
   - Go to: https://vercel.com/sam-707s-projects/3rbst-gemini
   - Deployments → Latest → "..." → Redeploy
   - ⚠️ **Uncheck "Use existing Build Cache"**

2. **Test**: Verify `/api/analyze` endpoint works after deployment
   ```bash
   ./test-api.sh
   ```

3. **Long-term**: Fix GitHub auto-deploy or switch to CLI-based deployment
   - Review Vercel account/GitHub account linking
   - Consider consolidating accounts or using separate GitHub credentials

---

## Files Modified

- `package.json` - Removed sharp, fixed Google AI package
- `package-lock.json` - Updated after package changes
- `services/geminiService.ts` - Fixed imports, API calls, runtime initialization
- `api/analyze.ts` - Removed sharp imports
- `api/webhook.ts` - Removed sharp imports

---

## Testing Commands

```bash
# Test API locally
./test-api.sh

# Test Gemini API directly
node test-gemini.js

# Check deployments
vercel ls 3rbst-gemini

# View environment variables
vercel env ls production
```

---

## References

- [Vercel Community: Git Author Access Error](https://community.vercel.com/t/deployment-request-did-not-have-a-git-author-with-access/4448)
- [Google Generative AI Node.js SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Sharp Library (incompatible with Vercel)](https://sharp.pixelplumbing.com/)

---

## Notes

- ⚠️ All redeployments **MUST** uncheck build cache to get fresh code
- 🔑 New Gemini API key created on 2025-12-12 (old key expired)
- 🐛 Latest fix (c519d2b) addresses the core runtime initialization issue
- 📱 WhatsApp integration (Evolution API) not yet set up (optional, AWS deployment)
