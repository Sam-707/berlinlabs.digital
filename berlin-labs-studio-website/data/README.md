# BERLINLABS Data Layer

This folder contains the source of truth for all project data. The UI automatically renders projects—no component changes needed when adding new projects.

---

## Quick Start: Add a Project in 3 Steps

### 1. Copy the Template
Open `project-template.ts` and copy the entire `NEW_PROJECT_TEMPLATE` object.

### 2. Fill in Your Content
Replace all `TEMPLATE:` and `template_` placeholder values with your actual project content.

### 3. Add to Projects Array
Paste your project into the `PROJECTS` array in `projects.ts`.

```typescript
// In projects.ts
export const PROJECTS: ProjectItem[] = [
  { /* existing projects... */ },
  {
    id: 'my-new-project',
    slug: 'my-new-project',
    title: 'My New Project',
    // ... rest of your project data
  }
];
```

Run `npm run dev` to verify—your project should render immediately.

---

## Common Icon Names

Use Google Material Symbols icon names for the `icon` field.

| Category | Icons |
|----------|-------|
| **Business** | `business`, `storefront`, `restaurant_menu`, `shopping_cart`, `point_of_sale` |
| **Tech** | `code`, `terminal`, `api`, `integration_instructions`, `hub` |
| **Analytics** | `analytics`, `insights`, `bar_chart`, `query_stats`, `assessment` |
| **Design** | `palette`, `brush`, `architecture`, `draw`, `auto_awesome` |
| **Process** | `settings`, `tune`, `construction`, `engineering`, `handyman` |
| **Growth** | `rocket_launch`, `trending_up`, `show_chart`, `bolt`, `local_fire_department` |
| **Research** | `science`, `biotech`, `psychology`, `school`, `menu_book` |
| **Communication** | `mail`, `notifications`, `forum`, `chat`, `campaign` |
| **General** | `star`, `diamond`, `verified`, `workspace_premium`, `extension` |

[View full icon list](https://fonts.google.com/icons)

---

## State Values

The `state` field indicates where the project is in its lifecycle.

| State | When to Use | Badge Style |
|-------|-------------|-------------|
| `LIVE` | Fully launched, stable, operational | Green/gold badge |
| `PILOT` | Testing with real customers | Blue badge |
| `EXPERIMENT` | R&D phase, validating hypothesis | Purple badge |
| `ADVISORY` | Service offering, not a product | Gray badge |

---

## Type Values

The `type` field categorizes the project's nature.

| Type | Description | Use With |
|------|-------------|----------|
| `product` | Commercial product or service | `promise` field |
| `experiment` | R&D project testing hypothesis | `intent` field |
| `advisory` | Consulting or service offering | `promise` field |

---

## Promise vs Intent

Choose exactly one based on project type:

### promise (products & advisory)
A clear value proposition statement.
```
promise: 'A digital menu system designed to replace printed menus for independent restaurants.'
```

### intent (experiments only)
A hypothesis being tested.
```
intent: 'Testing whether text-only publishing deepens reflection.'
```

---

## External URL Options

The `detail.externalUrl` field determines CTA behavior:

| Value | Behavior | Example Use |
|-------|----------|-------------|
| `https://...` | Opens external link in new tab | External project site |
| `contact` | Opens contact form with project pre-selected | Advisory services |
| `onboarding` | Opens onboarding form | Product signup flow |
| *(omitted)* | No CTA button rendered | Projects without signup |

---

## Detail Page vs Card-Only

### With Detail Page
Include the `detail` object for a full project page:
```typescript
detail: {
  fullTitle: '...',
  tagline: '...',
  philosophy: { label: '...', text: '...' },
  capabilityLabel: '...',
  focusPoints: [ ... ],
  // ... etc
}
```

### Card-Only (Minimal)
Omit the `detail` object for experiments or simple entries:
```typescript
{
  id: 'experiment-1',
  slug: 'experiment-1',
  title: 'Quick Experiment',
  icon: 'science',
  state: 'EXPERIMENT',
  type: 'experiment',
  intent: 'Testing something simple.',
  // No detail object - card only
}
```

---

## Troubleshooting

### TypeScript Error: Property 'xxx' is missing
- Ensure you have all required fields: `id`, `slug`, `title`, `icon`, `state`, `type`
- Choose exactly one: `promise` OR `intent`

### Project Not Rendering
- Verify the project is inside the `PROJECTS` array in `projects.ts`
- Check that `id` and `slug` match exactly
- Look for browser console errors

### Icon Not Showing
- Verify the icon name exists in Material Symbols
- Check for typos (use underscores, not hyphens: `restaurant_menu`)

### Detail Page Not Working
- Ensure `detail.externalUrl` is set for the CTA button
- Check that `slug` matches the project `id`

### Pilot Section Not Showing
- Set `state: 'PILOT'`
- Set `detail.showPilotSection: true`

---

## File Structure

```
/data
├── projects.ts           # Main project data array (add projects here)
├── project-template.ts   # Copy-paste template with documentation
├── content.ts            # Other site content (FAQ, about text, etc.)
└── README.md            # This file
```

---

## Need Help?

- See `project-template.ts` for detailed field documentation
- Check `../types.ts` for TypeScript interfaces
- Review existing projects in `projects.ts` for examples
