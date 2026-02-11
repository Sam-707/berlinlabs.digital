---
title: "Phase 7: Troubleshooting Prompts"
description: "Audit, optimization, and security prompts for maintaining your application"
category: "Maintenance"
tags: ["debugging", "optimization", "security", "audit", "testing"]
difficulty: "Intermediate"
timeRequired: "2-4 hours"
dependencies: ["Any completed phase"]
order: 7
---

# Phase 7: Troubleshooting Prompts

> Use these prompts to audit, optimize, and secure your application before deployment.

---

## Quick Audit Prompt

**Comprehensive health check of your application**

---

### Prompt

```
Please audit this web application for:

1. All broken or non-functional buttons/links
2. Pages that don't load or have errors
3. Authentication issues (login/signup/logout)
4. Data not displaying correctly
5. Missing error handling

Check:
- Public pages: [LIST YOUR PUBLIC PAGES]
- User dashboard: [PATH]
- Admin panel: [PATH]

Fix all issues found and provide a summary of changes.
```

---

### Audit Checklist

```yaml
Functionality:
  - [ ] All links work
  - [ ] All buttons trigger correct actions
  - [ ] Forms submit properly
  - [ ] Auth flow works end-to-end
  - [ ] Navigation works across all pages

Data Display:
  - [ ] User data loads correctly
  - [ ] Empty states show helpful messages
  - [ ] Loading states display during fetch
  - [ ] Error states handle failures gracefully

Error Handling:
  - [ ] All async operations have try/catch
  - [ ] API errors show user-friendly messages
  - [ ] Form validation provides clear feedback
  - [ ] No uncaught exceptions in console
```

---

### Output Expectations

1. List of all issues found
2. Fixed code for each issue
3. Summary of changes made
4. Recommendations for prevention

---

## Performance Optimization Prompt

**Optimize for speed and efficiency**

---

### Prompt

```
Optimize this application for performance:

1. Reduce initial bundle size
2. Implement code splitting/lazy loading
3. Add loading states for async operations
4. Optimize database queries (add indexes if needed)
5. Cache frequently accessed data
6. Implement proper error boundaries

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 500KB (gzipped)
```

---

### Optimization Techniques

```yaml
Code Splitting:
  - Lazy load routes with React.lazy()
  - Dynamic imports for heavy libraries
  - Separate vendor bundle

Bundle Optimization:
  - Tree shaking for unused code
  - Analyze bundle with rollup-plugin-visualizer
  - Replace heavy libraries with lighter alternatives

Database:
  - Add indexes on frequently queried columns
  - Use select() to fetch only needed columns
  - Implement pagination for large datasets

Caching:
  - Cache API responses in React Query/SWR
  - Cache Supabase queries
  - Implement stale-while-revalidate strategy

Loading States:
  - Skeleton screens for lists
  - Spinners for actions
  - Progressive image loading
```

---

### Code Template: Lazy Loading

```typescript
// Lazy load routes
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

---

### Code Template: Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status) WHERE status = 'published';

-- Composite index for filtered queries
CREATE INDEX idx_posts_user_status ON posts(user_id, status, created_at DESC);

-- Use select() to fetch only needed columns
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at') // Only fetch these columns
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(25)
```

---

## Security Audit Prompt

**Comprehensive security review**

---

### Prompt

```
Perform a security audit:

1. Verify RLS policies are correct
2. Check for exposed API keys
3. Ensure proper input validation
4. Verify admin-only routes are protected
5. Check for XSS vulnerabilities
6. Ensure HTTPS everywhere
7. Validate all Supabase queries
```

---

### Security Checklist

```yaml
Authentication:
  - [ ] Password requirements (min 8 chars)
  - [ ] Email verification enabled
  - [ ] Session timeout configured
  - [ ] Proper logout clears all tokens

Authorization:
  - [ ] RLS enabled on all tables
  - [ ] Admin routes protected
  - [ ] API routes validate permissions
  - [ ] Users can only access own data

Input Validation:
  - [ ] All forms sanitized
  - [ ] SQL injection protection (RLS)
  - [ ] XSS protection (React handles by default)
  - [ ] File upload validation

API Security:
  - [ ] No API keys in client code
  - [ ] Environment variables for secrets
  - [ ] CORS properly configured
  - [ ] Rate limiting on API endpoints

Data Security:
  - [ ] Sensitive data encrypted at rest
  - [ ] HTTPS only (enforce redirect)
  - [ ] Secure cookies (httpOnly, secure)
  - [ ] No sensitive data in URLs
```

---

### Code Template: Secure Environment Variables

```typescript
// lib/env.ts - NEVER commit actual values
const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
}

// Validate at build time
if (!env.supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required')
}

// Secrets ONLY in Edge Functions (server-side)
// Never expose service role keys to client
```

---

### Code Template: RLS Validation

```sql
-- Test RLS policies
-- Run as different users to verify

SET LOCAL jwt.claims.sub = 'user-id-to-test';

-- This should fail for non-admins
SELECT * FROM admin_only_table;

-- This should only return own data
SELECT * FROM user_data WHERE user_id = auth.uid();

-- Verify count matches
SELECT COUNT(*) FROM user_data; -- Should return user's count only
```

---

### Code Template: Protected API Routes

```typescript
// components/ProtectedRoute.tsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setAuthorized(false)
      setLoading(false)
      return
    }

    if (requireAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      setAuthorized(profile?.role === 'admin')
    } else {
      setAuthorized(true)
    }

    setLoading(false)
  }

  if (loading) return <div>Loading...</div>
  if (!authorized) return <Navigate to="/login" />

  return <>{children}</>
}
```

---

## Error Boundary Implementation

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Testing Checklist

```yaml
Before Deploy:
  - [ ] Run audit prompt
  - [ ] Test all user flows
  - [ ] Test on mobile devices
  - [ ] Test with slow network (DevTools throttling)
  - [ ] Test all form validations
  - [ ] Test error states
  - [ ] Verify RLS policies
  - [ ] Check browser console for errors
  - [ ] Test with multiple user roles
  - [ ] Load test critical paths
```

---

## Performance Monitoring

```typescript
// lib/analytics.ts
export function trackPerformance() {
  if (typeof window === 'undefined') return

  // Track page load time
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as any
    console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart)

    // Track to analytics service
    // analytics.track('page_load', { duration: perfData.loadEventEnd })
  })

  // Track Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  })
}
```

---

## Next Steps

After completing Phase 7:

1. Run full security audit
2. Performance optimization
3. Load testing
4. Deploy to production

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
