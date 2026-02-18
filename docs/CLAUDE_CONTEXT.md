# MenuFlows — Working Agreement for Claude Code

## Product Identity
MenuFlows helps restaurants upgrade from PDF/image menus to beautiful, mobile-friendly guest menus.

**Current phase:** Revenue wedge + lead capture
**Positioning:** Outcome-first, conversion-focused, no vapor

---

## MVP Strategy (Non-Negotiable)

### 3-Page Flow
1. `/` — Landing (outcome-first, conversion-focused)
2. `/demo` — Guest-facing demo menu (real, static, beautiful)
3. `/get-started` — Lead capture form (email-only)

### User Flow
1. Restaurant owner lands on menuflows.com
2. Instantly understands the outcome
3. Sees a real demo menu
4. Understands what's inside the product
5. Clicks "Get MenuFlows"
6. Submits form → follow-up

### Desired Feeling
- **Relief** ("finally simple")
- **Trust** ("this is real, not vapor")
- **Pride** ("my restaurant will look premium")
- **Low risk** ("no lock-in, no bullshit")

---

## Lead Capture (Locked Decision)

### Implementation
- Email-only lead capture
- Use Formspree (or equivalent)
- Env var: `VITE_FORMSPREE_ENDPOINT`

### Form Fields (Minimum)
- `restaurantName` (required)
- `city` (required)
- `menuSize` (select)
- `currentFormat` (select)
- `email` (required)
- `message` (optional)

### Hidden Fields
- `source` = "menuflows.com"
- `path`
- `timestamp`

### Success State
"We'll review your menu and get back within 24 hours."

---

## Out of Scope (Explicit)
- Auth system
- Payments
- Owner dashboard
- CMS/editor
- Real backend integrations
- Fake numbers or claims

---

## Tech Stack
```
React 19
TypeScript
Vite
Tailwind CSS
```

### Code Rules
- TypeScript-first; strong typing; no `any` unless justified
- Small, predictable components
- Targeted diffs only (no refactors unless necessary)
- Minimal dependencies
- Env vars for secrets only
- Clean production output

---

## UI / UX Requirements
- **Calm, premium, minimal**
- Consistent spacing & typography (Tailwind scale)
- **Mobile-first** (iPhone width must feel great)
- Clear focus states & basic accessibility
- Simple, human microcopy (not salesy)
- Subtle hover/focus states only (no heavy animation)

---

## Response Format (Required)

For every task:
1. **Plan** (short)
2. **Files to change**
3. **Exact code changes** (diff or snippets)
4. **How to verify** (steps + expected result)
5. **Risks / rollback** (if relevant)

### Before Coding
- Restate user flow + desired feeling (max 5 bullets)
- Propose 1-day MVP
- Explicitly list what is OUT of scope

### If Unclear
- Ask **ONE** sharp question max
- OR make the best assumption and **label it**

---

## Operating Principle
**Ship → learn → iterate**

Do not overbuild.
Do not invent features.
Do not drift into SaaS fantasies.
Build proof, capture demand, move forward.
