# BerlinLabs Workframe

Automated quality framework for BerlinLabs products. Provides a single, reusable CI/CD pipeline covering:

- **Smoke tests** — page load, critical user journeys, zero JS errors
- **Accessibility** — axe-core wcag2a/2aa/best-practice scans
- **Brand consistency** — no horizontal overflow, accent CSS var set, touch targets, CTA above fold
- **Responsive screenshots** — visual baselines at 375 / 390 / 768 / 1440px
- **Security scanning** — Semgrep static analysis, Gitleaks secrets detection, npm audit

MenuFlows is the first integrated app. New products drop a config file into `apps/<product>/` and are immediately covered by the full suite.

---

## Folder structure

```
berlinlabs-workframe/
├── playwright.config.ts          # Shared Playwright base config
├── package.json                  # Playwright + axe-core deps
├── tsconfig.json
│
├── core/                         # Reusable framework logic — never app-specific
│   ├── types.ts                  # WorkframeConfig interface + STANDARD_VIEWPORTS
│   └── helpers/
│       ├── a11y.ts               # runA11yScan(), assertNoA11yViolations()
│       ├── brand.ts              # assertNoHorizontalOverflow(), assertTouchTargets(), etc.
│       └── responsive.ts         # applyViewport(), snapshotName(), waitForRoute()
│
└── apps/
    └── menuflows/                # MenuFlows-specific config and tests
        ├── config.ts             # WorkframeConfig implementation for MenuFlows
        └── tests/
            ├── smoke.spec.ts     # @smoke — critical journeys
            ├── a11y.spec.ts      # @a11y — accessibility scans
            ├── brand.spec.ts     # @brand — design-system invariants
            └── responsive.spec.ts  # @responsive — visual snapshots

.github/workflows/
├── quality-pr.yml                # Runs on PRs — smoke + a11y + brand (blocking), screenshots (advisory)
├── quality-main.yml              # Runs on push to main — full suite
└── security-scan.yml             # Weekly + on main push — Semgrep, Gitleaks, npm audit
```

---

## Running locally

```bash
cd berlinlabs-workframe

# Install dependencies (first time only)
npm install
npx playwright install chromium

# Run all tests against production
npm test

# Run a specific suite
npm run test:smoke
npm run test:a11y
npm run test:brand
npm run test:responsive

# Run all MenuFlows tests
npm run test:menuflows

# Run against local dev server
WORKFRAME_BASE_URL=http://localhost:5173 npm test

# Open the HTML report
npm run report
```

---

## Updating visual snapshot baselines

Snapshots are stored as `.png` files alongside the test file in `apps/<product>/tests/`. They are committed to the repo so CI can diff against them.

```bash
# Regenerate all MenuFlows baselines
npm run update-snapshots

# Or update a single test file
npx playwright test apps/menuflows/tests/responsive.spec.ts --update-snapshots
```

After updating, commit the new `.png` files:

```bash
git add apps/menuflows/tests/**/*.png
git commit -m "chore(workframe): update MenuFlows responsive baselines"
```

---

## Blocking vs advisory

| Check | Behavior | Rationale |
|---|---|---|
| Smoke tests | **Blocking** | Site is down or a critical journey is broken |
| Accessibility (a11y) | **Blocking** | WCAG 2.1 AA compliance is a baseline requirement |
| Brand consistency | **Blocking** | Layout/overflow/touch-target regressions ship immediately |
| Responsive screenshots | **Advisory** | Visual drift needs human review before promoting to blocking |
| Semgrep | Advisory | Rule tuning needed; findings reviewed before blocking |
| Gitleaks | **Blocking** | Secrets in the repo are an immediate security incident |
| npm audit | Advisory | High/critical CVEs flagged; patch window depends on fix availability |

---

## Interpreting failures

**Smoke failure** — a critical page didn't load, a key element was missing, or an unhandled JS error occurred. Check the Playwright HTML report artifact. Look at the trace viewer for the exact failure point.

**A11y failure** — axe found WCAG violations. The failure message lists each violation by ID, impact level, and number of affected nodes. Fix the element, then re-run. Use [axe DevTools browser extension](https://www.deque.com/axe/devtools/) for interactive investigation.

**Brand failure** — layout regression (overflow, touch target, CTA above fold). Check the screenshot attached to the failed test in the artifact.

**Responsive snapshot mismatch** — the captured screenshot differs from the baseline. Download the `visual-snapshots` artifact and open `playwright-report/index.html` to see a side-by-side diff. If the change is intentional, run `npm run update-snapshots` and commit.

**Gitleaks failure** — a potential secret was detected. If it's a real secret: rotate immediately, then remove from git history with `git filter-repo`. If it's a false positive: add the pattern to `.gitleaksignore` at the repo root.

**Semgrep finding** — review the finding in the Actions log. If it's a real issue, fix the code. If it's a false positive, add a `# nosemgrep: <rule-id>` comment inline.

---

## Adding a new BerlinLabs app

1. **Create the app directory:**
   ```
   berlinlabs-workframe/apps/<your-app>/
   ├── config.ts
   └── tests/
       ├── smoke.spec.ts
       ├── a11y.spec.ts
       ├── brand.spec.ts
       └── responsive.spec.ts
   ```

2. **Implement `config.ts`** — copy `apps/menuflows/config.ts` as a template, fill in:
   - `appName`, `baseURL`, `routes`
   - `viewports` (use `STANDARD_VIEWPORTS` or define custom ones)
   - `brand.heroCTASelector`, `brand.accentCssVar`
   - `a11y.tags`, `a11y.disabledRules`

3. **Copy and adapt the test files** — replace `../config` with your config, and update selectors and assertions for your app's DOM.

4. **Generate initial snapshots locally:**
   ```bash
   npx playwright test apps/<your-app>/tests/responsive.spec.ts --update-snapshots
   git add apps/<your-app>/tests/**/*.png
   ```

5. **The CI workflows pick it up automatically** — no workflow changes needed. The `quality-pr.yml` and `quality-main.yml` run `npx playwright test` against the full `apps/` directory.

---

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.52 | E2E, smoke, responsive, screenshots |
| `@axe-core/playwright` | ^4.10 | Accessibility scanning |
| Semgrep | `semgrep/semgrep-action@v1` | Static analysis |
| Gitleaks | `gitleaks/gitleaks-action@v2` | Secrets detection |
| npm audit | built-in | Dependency vulnerability scan |
| GitHub Actions | — | CI/CD runner |
