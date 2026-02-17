
# BerlinLabs — Frontend Handoff

## Quick Start
1. `npm install`
2. `npm run dev`
3. Backend wiring in `api/endpoints.ts`

## Folder Structure
- `pages/`: Route-level components.
- `components/`: Pure UI components.
- `data/`: Single source of truth for projects and content.
- `api/`: Client configuration and typed endpoint placeholders.
- `lib/`: Shared utilities.

## Integration Seams
- **Projects**: Data is kept in `data/projects.ts`. For a dynamic backend, replace the export in that file with an API call in `App.tsx` or a custom hook.
- **Forms**:
  - `Contact.tsx`: Calls `api.submitContact(formData)`.
  - `Onboarding.tsx`: Calls `api.submitOnboarding(formData)`.
- **Environment**: Update `.env` with `VITE_API_BASE_URL`.

## Routes Map
- `/` -> `Home.tsx`
- `/products` -> `Products.tsx` (Index)
- `/studio` -> `Studio.tsx`
- `/contact` -> `Contact.tsx`
- `/onboarding` -> `Onboarding.tsx`
- `/projects/:id` -> `ProjectDetail.tsx` (Handled via state in `App.tsx`)

## Accessibility
Ensure `StateBadge` and form labels maintain contrast. All icon-only buttons have `aria-label`.
