# GitHub Repository Inventory - Complete Catalog

> **Generated**: 2026-02-11
> **Total Repositories**: 8 active commercial projects
> **Analysis Scope**: Sam-707 (Lionbridge Digital)

---

## Executive Summary

| Category | Count | Status |
|----------|-------|--------|
| Commercial Projects | 4 | Active development |
| Production-Ready | 1 | 3rbst-platform (80-90%) |
| MVP Complete | 1 | MenuFlow (70%) |
| SaaS Platforms | 2 | MenuFlow, 3rbst-unified |
| Translation/Services | 3 | 3rbst-platform, 3rbst-Gemini, 3rbst-new-workflow |

---

## Commercial Projects (Priority Order)

### 1. MenuFlows - Restaurant Platform 🍽️

**Location**: `/menuflows/`
**Status**: 70% Complete (MVP done)
**Tech Stack**: React 19 + TypeScript + Vite + Supabase
**Revenue Potential**: HIGH (€29-149/month per restaurant)

| Attribute | Details |
|-----------|---------|
| **Frontend** | React 19.2.3, TypeScript 5.8.2, Vite 6.2.0 |
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **Database** | Multi-tenant SQL schema (see `/supabase-schema-multitenant.sql`) |
| **Key Features** | QR ordering, menu management, kitchen display, analytics |
| **Migrations** | 15+ SQL migrations (active development) |
| **Documentation** | Excellent - `/DOCS/` folder with 9+ guides |
| **Blocking Issues** | No payments, no tests, no error monitoring |
| **Launch Timeline** | 4-6 weeks |

**Files**:
- `package.json` - React 19 + Supabase dependencies
- `supabase-schema-multitenant.sql` - Multi-tenant database
- `/DOCS/README.md` - Comprehensive documentation
- `/DOCS/ARCHITECTURE.md` - Technical design

**Assets**:
- QR code generation (`qrcode.react`)
- PDF generation (`jspdf`)
- 15+ migration files
- Studio-OS submodule included

---

### 2. 3rbst-platform - WhatsApp Translation Bot 📱

**Location**: `/3rbst-platform/`
**Status**: 80-90% Complete (LIVE at Vercel)
**Tech Stack**: Node.js serverless + Twilio + OpenAI GPT-4 Vision + PayPal + Supabase
**Revenue Potential**: MEDIUM (PayPal per-use model)

| Attribute | Details |
|-----------|---------|
| **Backend** | Node.js 18+, Vercel serverless functions |
| **WhatsApp** | Twilio API (sandbox approved, production pending) |
| **AI Engine** | OpenAI GPT-4 Vision |
| **Payments** | PayPal integration (complete) |
| **Database** | Supabase with 3 migrations |
| **Legal** | GDPR compliance structure in place |
| **Documentation** | Excellent legal/launch guides |
| **Blocking Issues** | Business registration (€50-60), legal page updates |
| **Launch Timeline** | 7-10 days after registration |

**Files**:
- `api/webhook.js` - Main WhatsApp handler
- `api/paypal-payment.js` - Payment processing
- `public/impressum.html` - Legal imprint (needs update)
- `public/privacy.html` - GDPR privacy policy (needs update)
- `/supabase/migrations/` - 3 migration files

**Key Features**:
- German→Arabic document translation
- Credit-based system
- GDPR consent tracking
- PayPal payment integration

---

### 3. 3rbst-Gemini - Alternative Translation Version 🤖

**Location**: `/3rbst-Gemini/`
**Status**: Similar to 3rbst-platform, uses Gemini 2.0 Flash
**Tech Stack**: React 18 + Vite + TypeScript + Google Gemini 2.0 Flash + Evolution API + PayPal
**Revenue Potential**: MEDIUM (cheaper AI costs than GPT-4)

| Attribute | Details |
|-----------|---------|
| **Frontend** | React 18.2.0, TypeScript 5.2.2, Vite 5.0.0 |
| **AI Engine** | Google Gemini 2.0 Flash (lower cost) |
| **WhatsApp** | Evolution API v2 (self-hosted) |
| **Payments** | PayPal SDK (@paypal/react-paypal-js) |
| **Database** | Supabase 2.39.0 |
| **Documentation** | DEPLOYMENT.md, README.md |
| **Infrastructure** | Docker + Nginx setup |

**Key Difference from 3rbst-platform**:
- Uses **Google Gemini 2.0 Flash** instead of GPT-4 Vision (cheaper)
- Uses **Evolution API** instead of Twilio (self-hosted WhatsApp)
- More modern React stack
- Docker deployment included

**Files**:
- `api/analyze.ts` - Document analysis with Gemini
- `api/webhook.ts` - WhatsApp webhook (Evolution API)
- `services/geminiService.ts` - Gemini AI integration
- `docker-compose.yml` - Evolution API deployment

---

### 4. 3rbst-new-workflow - Unified Version 🔄

**Location**: `/3rbst-new-workflow/`
**Status**: Development iteration
**Tech Stack**: React 19 + Vite + TypeScript + Supabase (similar to MenuFlow)
**Notes**: Newer iteration combining elements from both projects

| Attribute | Details |
|-----------|---------|
| **Frontend** | React 19 (same as MenuFlow) |
| **Database** | Supabase with 4 SQL files |
| **Documentation** | `/DOCS/` folder present |

**Files**:
- `supabase-schema.sql`
- `supabase-schema-multitenant.sql`
- `supabase-seed.sql`
- `supabase-reset.sql`

---

### 5. 3rbst-production - Production Deployment 🚀

**Location**: `/3rbst-production/`
**Status**: Production configuration
**Notes**: Deployment configs and production settings

**Files**:
- `setup-supabase.sql`
- `/docs/deployment/DEPLOYMENT.md`

---

## Database Assets (SQL Files)

| File | Lines | Purpose |
|------|-------|---------|
| `menuflows/supabase-schema-multitenant.sql` | ~500+ | Multi-tenant restaurant database |
| `menuflows/migrations/*` | 15+ files | RLS policies, fixes, triggers |
| `3rbst-platform/supabase/migrations/001_initial_schema.sql` | ~200 | User tracking, credits |
| `3rbst-Gemini/setup-supabase.sql` | ~150 | User management |
| `3rbst-new-workflow/supabase-schema*.sql` | 4 files | Schema variants |

---

## Documentation Assets

### MenuFlows Documentation (Comprehensive)
```
/menuflows/DOCS/
├── README.md           - Quick start + features overview
├── ARCHITECTURE.md     - Technical design & multi-tenant
├── DATABASE.md         - Schema & relationships
├── FEATURES.md         - Complete feature list
├── DEPLOYMENT.md       - Production deployment guide
├── API-REFERENCE.md    - API documentation
├── MODIFIERS.md        - Menu modifier system
├── TROUBLESHOOTING.md  - Common issues
├── VISION.md           - Product vision
└── WAITER-TRAINING.md  - Staff training guide
```

### 3rbst Documentation (Legal-Focused)
```
/3rbst-platform/docs/
├── legal/
│   ├── LEGAL_QUICK_START.md
│   ├── BUDGET_LAUNCH_PLAN.md
│   └── MVP_LAUNCH_PLAN.md
├── active/
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── FINAL_WORKFLOW.md
└── archive/
    └── Historical documentation
```

---

## Package.json Dependency Analysis

### MenuFlows Dependencies
```json
{
  "@supabase/supabase-js": "^2.90.1",
  "qrcode.react": "^4.2.0",
  "jspdf": "^4.0.0",
  "react": "^19.2.3",
  "react-dom": "^19.2.3"
}
```

### 3rbst-Gemini Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "@paypal/react-paypal-js": "^8.1.3",
  "@supabase/supabase-js": "^2.39.0",
  "lucide-react": "^0.294.0",
  "react": "^18.2.0"
}
```

### 3rbst-platform Dependencies
```json
{
  "@supabase/supabase-js": "^2.45.4",
  "twilio": "^5.3.2",
  "dotenv": "^16.4.5"
}
```

---

## Tech Stack Summary

| Technology | Projects Using | Version |
|------------|----------------|---------|
| React 19 | MenuFlows, 3rbst-new-workflow | 19.2.3 |
| React 18 | 3rbst-Gemini | 18.2.0 |
| Supabase | All projects | 2.39-2.90 |
| PayPal | 3rbst-Gemini, 3rbst-platform | 8.1.3 / API |
| TypeScript | MenuFlows, 3rbst-Gemini, 3rbst-new-workflow | 5.2-5.8 |
| Vite | MenuFlows, 3rbst-Gemini, 3rbst-new-workflow | 5.0-6.2 |
| Twilio | 3rbst-platform | 5.3.2 |
| OpenAI GPT-4 | 3rbst-platform | Vision API |
| Google Gemini | 3rbst-Gemini | 2.0 Flash |

---

## Launch Readiness Assessment

| Project | Technical Complete | Legal Complete | Launch Time |
|---------|-------------------|----------------|-------------|
| 3rbst-platform | 90% | 20% (€50-60 + updates) | 7-10 days |
| 3rbst-Gemini | 85% | 20% | 7-10 days |
| MenuFlows | 70% | 60% | 4-6 weeks |
| 3rbst-new-workflow | 60% | 20% | 2-3 weeks |

---

## Recommended Priority Order

1. **First Launch**: 3rbst-unified (hybrid of platform + Gemini)
2. **Second Launch**: MenuFlows (after payments + tests)
3. **Third**: Expand 3rbst to more languages

---

## File Locations Reference

| Purpose | Path |
|---------|------|
| Main restaurant platform | `/menuflows/` |
| WhatsApp bot (GPT-4) | `/3rbst-platform/` |
| WhatsApp bot (Gemini) | `/3rbst-Gemini/` |
| New unified version | `/3rbst-new-workflow/` |
| Production configs | `/3rbst-production/` |
| Analysis docs (this folder) | `/analysis/` |
| Business docs | `/documentation/` |

---

**Last Updated**: 2026-02-11
**Next Review**: After unified 3rbst implementation
