# BERLINLABS | Pre-Deployment Checklist

## 1. Content & Branding

- [ ] **Footer**: LinkedIn URL is correct (not placeholder)
- [ ] **Footer**: Email address (`mailto:`) is correct
- [ ] **Footer**: Location and timezone are accurate
- [ ] **Copyright year**: Dynamic (`new Date().getFullYear()`) — verify current year
- [ ] **Contact page**: Services list is up to date
- [ ] **Studio page**: Method steps reflect current process
- [ ] **Systems page**: All systems are listed with correct states
- [ ] **Navigation links**: All pages are accessible

---

## 2. Technical Validation

### Build & Run
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` works locally
- [ ] No TypeScript errors
- [ ] No console warnings in browser

### Environment
- [ ] `VITE_API_BASE_URL` is set for production (if backend connected)
- [ ] `.env` variables are not committed to git
- [ ] `.env.example` is up to date

---

## 3. SEO & Metadata

- [ ] `index.html` title is descriptive
- [ ] Meta description exists
- [ ] Favicon is present (`/favicon.ico` or in `index.html`)
- [ ] Open Graph tags (for LinkedIn sharing)
- [ ] Canonical URL (if applicable)

---

## 4. Assets & Performance

- [ ] Images are optimized (WebP preferred)
- [ ] No broken image links
- [ ] Total bundle size is reasonable (<500kb JS preferred)
- [ ] CSS is purged (Tailwind: `content` paths in `tailwind.config.js`)

---

## 5. Responsive & Accessibility

- [ ] **Mobile**: Navigation works (hamburger or scrollable)
- [ ] **Mobile**: Footer stacks properly
- [ ] **Mobile**: All buttons are tappable (min 44×44px)
- [ ] **Desktop**: Hero looks good on 4K
- [ ] **Accessibility**: Aria labels on social links
- [ ] **Accessibility**: Focus states visible on all interactive elements
- [ ] **Accessibility**: Color contrast meets WCAG AA (gold on dark)

---

## 6. Forms & Backend

- [ ] **Contact form**: Submission endpoint works
- [ ] **Contact form**: Success state renders
- [ ] **Contact form**: Loading state on submit button
- [ ] **Onboarding form**: Submission works
- [ ] **API errors**: Handled gracefully with user feedback

---

## 7. External Links

- [ ] LinkedIn link opens in new tab (`target="_blank"`)
- [ ] All external links have `rel="noreferrer"`
- [ ] Email links work (`mailto:` format)
- [ ] No broken internal links

---

## 8. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Safari (latest) — critical for Apple-calm aesthetic
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 9. Security

- [ ] No sensitive data in client-side code
- [ ] No API keys exposed
- [ ] CSP headers configured (if applicable)
- [ ] HTTPS enforced in production

---

## 10. Post-Deployment Verification

- [ ] Site loads from production URL
- [ ] All pages accessible via navigation
- [ ] Contact form submits successfully
- [ ] Footer links work (LinkedIn, Email)
- [ ] No console errors in production
- [ ] Analytics/profitwell configured (if applicable)

---

## Quick Command Reference

```bash
# Build check
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint (if configured)
npm run lint

# Check bundle size
npm run build && du -sh dist
```

---

*Last updated: 2026-02-19*
