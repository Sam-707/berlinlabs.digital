
# BerlinLabs Digital — Project Bible

## 1. Brand & Positioning
**Brand Name:** BerlinLabs Digital  
**Entity Type:** Small Product Studio (Berlin-based)  
**Philosophy:** Build internal products first; accept selective client work second.  
**Market Focus:** SaaS for the DACH market.  

### Core Values & Tone
*   **Calm & Confident:** No hype, no buzzwords, no sales-heavy claims.
*   **Proof > Promises:** Focus on what is live and working rather than theoretical capabilities.
*   **Minimalist:** Precision over volume. Every pixel and word must earn its place.
*   **Berlin-Quality:** High engineering standards combined with a raw, functional aesthetic.

---

## 2. Visual Identity (Design System)

### Palette
*   **Primary (Accent):** `#C5A059` (Gold/Bronze) — Used for badges, borders, and primary CTAs.
*   **Background (Dark):** Deep charcoal/black (Parent Studio Theme).
*   **Background (Light):** Off-white/Beige (Product/Experiment Theme e.g., twimnc).
*   **Surface:** Glass-morphism with subtle gold borders.

### Typography
*   **Display/Headlines:** Montserrat (Bold, spaced).
*   **Body/Details:** Inter (Clean, high readability).
*   **Experiment Serif:** Classic Serif (Used specifically for *twimnc* to denote emotional/human space).

---

## 3. Product Roadmap

### Primary Product: MenuFlows
*   **Description:** A guest-first digital menu experience for restaurants.
*   **Value Prop:** Fast, readable, easy to update, and calm for the guest.
*   **Strategy:** Validate through live pilot setups and demo-first lead generation.

### Internal Experiments: twimnc
*   **Description:** "To Whom It May Not Concern" — A digital drain for anonymous emotional expression.
*   **Purpose:** Exploring emotional UX, moderation workflows, and low-friction social interaction.
*   **Tone:** Ethereal, reflective, quiet.

---

## 4. Operational Framework: "The Method"
We reject standard agency "discovery" phases in favor of immediate building:

1.  **Proof:** Build something real, small, and testable immediately.
2.  **Ship:** Launch the smallest functional version to learn from real usage.
3.  **Iterate:** Improve based on recorded feedback and data, not assumptions.

---

## 5. Site Structure (Desktop/Mobile)

### Home (Studio Landing)
*   **Hero:** "Currently building MenuFlows."
*   **What’s Live:** Minimalist list of demo menus, pilot setups, and experiments.
*   **Method Section:** 3-column grid explaining Proof, Ship, and Iterate.
*   **Final CTA:** Direct funnel to MenuFlows pilot requests.

### Project Profiles
*   **Factual Overview:** documentation-style pages explaining *Why this exists* and *What this proves*.
*   **Capability Focus:** Highlighting UX systems, moderation, or technical workflows.

---

## 6. Content Guardrails (The "Do Not" List)
*   **Do NOT** use agency language ("elite team", "disruptive", "launch your SaaS").
*   **Do NOT** show client logos or "trusted by" sections.
*   **Do NOT** use fake metrics or social proof.
*   **Do NOT** use aggressive sales CTAs like "Free Audit".
*   **Do NOT** stretch layouts; keep content centered and contained (max-width 1200px).

---

 ## 7. Technical Stack

Our stack is chosen for speed of development, extreme performance, and a "clean-code" philosophy. We prioritize tools that allow us to move from **Proof** to **Ship** without technical debt.

### Core Frontend
*   **Next.js (App Router):** For server-side rendering, SEO excellence, and optimized performance.
*   **React:** For building modular, reusable UI components.
*   **Tailwind CSS:** For a utility-first styling approach that ensures consistent spacing and rapid iteration.
*   **Framer Motion:** For subtle, high-quality "Berlin-quality" interactions and transitions.

### Backend & Infrastructure
*   **Supabase:** Our go-to for PostgreSQL, Real-time subscriptions, and secure Authentication.
*   **Vercel:** For edge deployments, ensuring the "fast and readable" promise of MenuFlows globally.
*   **Node.js / TypeScript:** To maintain type safety across the entire application lifecycle.

### Security & Privacy
*   **GDPR-First:** Data handling is architected for compliance from the first line of code.
*   **Privacy by Design:** We practice "minimal collection"—if we don't need the data to run the product, we don't ask for it.
*   **Encrypted Communication:** All data in transit is secured via industry-standard SSL/TLS encryption.
*   **Anonymous-First (Experiment Specific):** Products like *twimnc* utilize specialized moderation workflows that preserve user identity by design.
