# Phase 7: Troubleshooting Prompts

Use these prompts to audit, debug, and optimize your application.

---

## Quick Audit Prompt

```
Please audit this web application for:

1. All broken or non-functional buttons/links
   - Check every button has an onClick handler or proper link
   - Verify form submissions work correctly
   - Test navigation links

2. Pages that don't load or have errors
   - Check console for errors
   - Verify all routes render correctly
   - Test loading states

3. Authentication issues
   - Login flow works
   - Signup flow works
   - Logout works
   - Protected routes redirect correctly

4. Data not displaying correctly
   - Check data fetching
   - Verify RLS policies allow access
   - Check error handling

5. Missing error handling
   - Form validations
   - API error responses
   - User feedback for actions

Check these pages:
- [LIST PUBLIC PAGES]
- [LIST USER DASHBOARD PAGES]
- [LIST ADMIN PAGES]

Fix all issues found and provide a summary of changes.
```

---

## Performance Optimization

```
Optimize this application for performance:

1. Reduce initial bundle size
   - Implement code splitting
   - Lazy load routes
   - Remove unused dependencies
   - Use dynamic imports

2. Implement loading states
   - Show skeleton screens
   - Add spinners for async operations
   - Prevent double-clicks on forms

3. Optimize database queries
   - Add indexes for commonly filtered columns
   - Use select() to limit returned columns
   - Implement pagination (25-50 items per page)
   - Cache frequently accessed data

4. Optimize images
   - Use modern formats (WebP, AVIF)
   - Implement lazy loading
   - Responsive images with srcset
   - Compress images

5. Implement proper error boundaries
   - Catch component errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

6. Debounce/throttle expensive operations
   - Search input
   - Scroll handlers
   - Resize handlers

Provide before/after metrics where possible.
```

---

## Security Audit

```
Perform a comprehensive security audit:

1. Verify RLS policies are correct
   - Users can only access their own data
   - Admin-only resources are protected
   - Public resources are properly configured
   - Test policies with different user roles

2. Check for exposed API keys
   - Search for hardcoded keys in code
   - Verify environment variables are used
   - Check .gitignore for sensitive files

3. Ensure proper input validation
   - Validate form inputs on client
   - Validate on server-side (Edge Functions)
   - Sanitize user-generated content
   - Prevent SQL injection

4. Verify admin-only routes are protected
   - Check ProtectedRoute components
   - Verify role checks in components
   - Test direct URL access

5. Check for XSS vulnerabilities
   - Sanitize HTML from users
   - Use React's built-in escaping
   - Validate URLs before redirecting

6. Ensure HTTPS everywhere
   - Redirect HTTP to HTTPS
   - Use secure cookies
   - Set proper CORS headers

7. Validate all Supabase queries
   - Never trust client data
   - Use server-side validation
   - Implement rate limiting

Document all findings and provide fixes.
```

---

## SEO Audit

```
Audit this application for SEO best practices:

1. Meta tags
   - Title tags on all pages
   - Meta descriptions
   - Open Graph tags
   - Twitter Card tags

2. Semantic HTML
   - Proper heading hierarchy (h1, h2, h3...)
   - Use semantic elements (nav, main, article, footer)
   - Alt text on images

3. Performance
   - Core Web Vitals (LCP, FID, CLS)
   - Mobile-friendly
   - Page speed

4. Content
   - Unique page titles
   - Descriptive URLs
   - Sitemap.xml
   - Robots.txt

5. Structured data
   - JSON-LD markup
   - Schema.org vocabulary

6. Accessibility
   - ARIA labels
   - Keyboard navigation
   - Screen reader compatibility

Provide actionable recommendations.
```

---

## Mobile Responsiveness Audit

```
Audit this application for mobile responsiveness:

1. Test on multiple screen sizes
   - Mobile: 320px - 480px
   - Tablet: 768px - 1024px
   - Desktop: 1024px+

2. Touch targets
   - Buttons at least 44x44px
   - Adequate spacing between interactive elements
   - No hover-only interactions

3. Typography
   - Readable font sizes (minimum 16px body text)
   - Line height for readability
   - Text doesn't overflow viewport

4. Navigation
   - Hamburger menu on mobile
   - Easy to reach navigation
   - Back buttons where needed

5. Forms
   - Input fields are easy to tap
   - Proper input types (email, tel, number)
   - Zoom doesn't interfere

6. Images
   - Responsive images
   - Don't overflow viewport
   - Load appropriate sizes

Document issues and provide fixes.
```

---

## Database Performance Audit

```
Analyze and optimize database performance:

1. Identify slow queries
   - Check query execution time
   - Add missing indexes
   - Optimize SELECT statements

2. Check table sizes
   - Identify large tables
   - Consider partitioning for very large tables
   - Archive old data if needed

3. Index analysis
   - List all indexes
   - Check index usage
   - Remove unused indexes
   - Add composite indexes for common query patterns

4. RLS policy performance
   - Check if policies use indexed columns
   - Optimize policy functions
   - Consider materialized views for complex queries

5. Connection pooling
   - Configure proper pool size
   - Check for connection leaks
   - Use prepared statements

6. Caching strategy
   - Identify cacheable data
   - Set appropriate TTLs
   - Implement cache invalidation

Provide optimization recommendations.
```

---

## Accessibility Audit

```
Perform WCAG AA compliance audit:

1. Keyboard Navigation
   - All functionality available via keyboard
   - Visible focus indicators
   - Logical tab order
   - Skip to main content link

2. Screen Reader Compatibility
   - Proper ARIA labels
   - Announce dynamic content changes
   - Alt text for images
   - Label form inputs

3. Color Contrast
   - Text contrast ratio at least 4.5:1
   - Large text at least 3:1
   - Don't rely on color alone

4. Text Alternatives
   - Alt text for meaningful images
   - Captions for videos
   - Transcripts for audio

5. Forms
   - Labels associated with inputs
   - Error messages clearly communicated
   - Required fields indicated

6. Resizable Text
   - Text can be enlarged 200%
   - Layout doesn't break
   - No horizontal scrolling at 320px zoomed

Document violations and fixes.
```

---

## Error Handling Review

```
Review and improve error handling:

1. Client-side errors
   - Form validation messages
   - API error responses displayed to users
   - Graceful degradation when features fail
   - Clear error messages

2. Server-side errors
   - Proper HTTP status codes
   - Error messages don't leak sensitive info
   - Logging for debugging
   - User-friendly error pages

3. Network errors
   - Retry logic for failed requests
   - Offline indication
   - Queue requests when offline (optional)

4. Edge cases
   - Empty states
   - Zero results for search
   - Deleted/not found resources
   - Permission denied

5. Error tracking
   - Set up error monitoring (Sentry, etc.)
   - Log errors with context
   - Alert on critical errors

Provide improvements for each category.
```

---

## Migration Safety Check

```
Before deploying database migrations, verify:

1. Test migrations on staging first
   - Copy production data to staging
   - Run migrations
   - Test all features

2. Backward compatibility
   - Old API still works during rollout
   - Can rollback if needed
   - No breaking changes to clients

3. Data integrity
   - No data loss
   - All foreign keys valid
   - Constraints satisfied

4. Performance impact
   - No significant slowdown
   - Indexes created efficiently
   - Queries still fast

5. Rollback plan
   - Document rollback steps
   - Test rollback procedure
   - Have ready-to-run reverse migration

6. RLS policies
   - All tables have RLS enabled
   - Policies cover all operations
   - Test with different user roles

Provide safety report before deploying.
```

---

## Pre-Deployment Checklist

```
Before deploying to production, verify:

Frontend:
- [ ] All pages load without errors
- [ ] All links and buttons work
- [ ] Forms validate correctly
- [ ] Mobile responsive on all major devices
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Build succeeds
- [ ] Bundle size is reasonable

Backend:
- [ ] All migrations run successfully
- [ ] RLS policies tested
- [ ] API endpoints return correct data
- [ ] Error handling in place
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Webhook endpoints work

Security:
- [ ] No API keys in code
- [ ] Environment variables set in production
- [ ] HTTPS enforced
- [ ] Admin routes protected
- [ ] Input validation in place
- [ ] SQL injection prevention verified

Performance:
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Database indexes added
- [ ] Caching strategy in place
- [ ] Bundle size monitored

Testing:
- [ ] Smoke tests pass
- [ ] Critical user paths tested
- [ ] Payment flow tested (if applicable)
- [ ] Email notifications work
- [ ] Webhooks work (if applicable)

Monitoring:
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

Provide sign-off for deployment.
```

---

## Debug Template

```
Help me debug this issue:

ISSUE DESCRIPTION:
[Describe what's happening vs what should happen]

CONTEXT:
- Page/Component: [Which page has the issue]
- User Role: [What role is logged in]
- Browser: [Browser and version]
- Error Message: [Any error shown]
- Console Errors: [Any console errors]

STEPS TO REPRODUCE:
1. [First step]
2. [Second step]
3. [Third step]

EXPECTED BEHAVIOR:
[What should happen]

ACTUAL BEHAVIOR:
[What actually happens]

CODE SNIPPETS:
[Paste relevant code]

INVESTIGATION:
1. Check [First thing to check]
2. Verify [Second thing to check]
3. Test [Third thing to test]

Please help identify the root cause and provide a fix.
```

---

## Code Review Prompt

```
Please review this code for:

1. Correctness
   - Does it work as intended?
   - Any bugs or edge cases?
   - Error handling?

2. Security
   - Any vulnerabilities?
   - Input validation?
   - Authentication/authorization?

3. Performance
   - Any inefficiencies?
   - Unnecessary re-renders?
   - Memory leaks?

4. Best practices
   - React/TypeScript conventions
   - Code organization
   - Naming conventions

5. Maintainability
   - Code clarity
   - Comments where needed
   - Test coverage

[PASTE CODE HERE]

Provide specific, actionable feedback with examples.
```

---

## Common Issues and Solutions

### Issue: Supabase Auth Not Working

```
Check:
1. Is Supabase initialized correctly? (lib/supabase.ts)
2. Are environment variables set? (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Is AuthContext wrapping the app?
4. Are RLS policies blocking access?

Solution:
- Verify Supabase client initialization
- Check console for auth errors
- Test with a simple sign up/sign in
- Review RLS policies
```

### Issue: Real-time Not Working

```
Check:
1. Is Realtime enabled on the table? (ALTER PUBLICATION supabase_realtime ADD TABLE)
2. Is the filter correct? (user_id=eq.${userId})
3. Is the channel subscribed? Check console
4. Are RLS policies too restrictive?

Solution:
- Enable Realtime on tables
- Verify subscription syntax
- Check browser console for errors
- Test with simple subscription first
```

### Issue: Stripe Webhook Failing

```
Check:
1. Is webhook secret set in environment?
2. Is the signature verification correct?
3. Is the endpoint deployed?
4. Is Stripe sending to correct URL?

Solution:
- Verify STRIPE_WEBHOOK_SECRET
- Check Edge Function logs
- Test with Stripe CLI webhook forward
- Verify webhook endpoint in Stripe dashboard
```

### Issue: Build Failing

```
Check:
1. Are all dependencies installed?
2. Are there TypeScript errors?
3. Are environment variables defined in build?
4. Is Vite config correct?

Solution:
- Run npm install
- Fix TypeScript errors
- Add .env.example with required variables
- Check import paths
```

---

## Next Steps

After troubleshooting:

1. **Verify fixes work** - Test all affected features
2. **Add tests** - Prevent regressions
3. **Document** - Note solutions for future reference
4. **Deploy** - Push fixes to production
