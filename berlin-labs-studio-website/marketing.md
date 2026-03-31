You are Claude Code. Implement the “Systems model” across the BerlinLabs site.

DOCTRINE (freeze terminology)
- Studio term: "Operational Product Studio"
- Directory term: "Systems" (replace Products everywhere)
- Method term: "Method"
- Systems share one ontology; maturity is expressed via state badges:
  LIVE / PILOT / EXPERIMENT / ADVISORY
- Gold usage is reserved for:
  1) Primary CTA background
  2) LIVE state badge
  3) One key word in the homepage hero (optional, keep restrained)

GOAL
Unify Products + Experiments + Advisory into a single directory concept: “Systems”.
No separate sections for Experiments or Advisory. No mixed labeling.

SCOPE
Update:
- Navigation labels
- Page titles and meta descriptions
- Home page section structure
- Systems directory page (formerly Products page)
- Any footer references
- Data/content structures that currently separate products/experiments/advisory

HOMEPAGE REQUIREMENTS
1) Hero
- Primary CTA: "View Systems" (gold) routes to /systems (or systems page route)
- Remove secondary CTA entirely (keep only one)

2) Systems Section (single unified grid)
- Replace “Products / Experiments / Advisory” blocks with one section:
  Label: "Systems"
- Render all systems in one consistent grid (2 columns desktop, 1 column mobile)
- Each card must show a state badge: LIVE / PILOT / EXPERIMENT / ADVISORY
- Card geometry must be unified:
  p-8 rounded-2xl glass-card glass-card-hover
- State badge styling rules:
  LIVE = gold/primary background (most prominent)
  PILOT = muted gold tint (less prominent than LIVE)
  EXPERIMENT = neutral/muted grey
  ADVISORY = neutral outline / low emphasis
- Do NOT use gold fills for EXPERIMENT or ADVISORY.

3) Method section remains as-is (label “Method” stays frozen)

SYSTEMS DIRECTORY PAGE (formerly Products)
- Rename route and page copy to “Systems”
- H1: SYSTEMS
- Subtext: “Operational systems at different stages of maturity.”
- Show the same unified systems grid.
- Remove any “Products Directory” / “Products” wording.

DATA MODEL
- Replace separate arrays (products/experiments/advisory) with one array:
  SYSTEMS: [{ id, name, description, state, icon, route, ... }]
- Ensure state is one of: LIVE | PILOT | EXPERIMENT | ADVISORY
- Remove leftover references to:
  “Operational Map”, “System Index”, “Products”, “Experiments section”

ROUTING + LINKS
- Update navigation to point to Systems page:
  Home | Systems | Studio | Contact
- Update footer links accordingly.
- Ensure “View Systems” CTA points to Systems page.

CLEANUP CHECKLIST
- Search and replace across codebase:
  “Products” (as directory term) → “Systems”
  “Experiments” section headings → remove (only keep EXPERIMENT as a badge state)
  “Advisory” section headings → remove (only keep ADVISORY as a badge state)
- Ensure no orphaned layout logic for old sections.
- Ensure consistent container widths and alignment across Home + Systems page.
- Keep performance optimizations (no heavy blur stacking).

TESTING REQUIREMENTS
- Verify in browser these viewports:
  1366x768, 1440x900, 390x844, 360x800
- Acceptance:
  - Homepage hero CTA visible above fold on 1366x768
  - Systems section appears immediately after hero without excessive dead space
  - Systems grid has consistent spacing, no orphan layouts
  - Badges visually communicate maturity clearly
  - Build passes: `npm run build`

OUTPUT
- Return only:
  1) Exact diffs for modified files
  2) Confirmation of successful `npm run build`
  3) A short list of what changed (no long narrative)
