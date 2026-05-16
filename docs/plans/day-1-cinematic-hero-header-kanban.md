# HUDForge Day 1 — Cinematic Hero + Header Kanban Plan

> Based on `/home/herm/.hermes/cache/documents/doc_ebf0b7f80a29_Day-1-.txt`

**Goal:** Replace the current premium SaaS/game landing feel with a more cinematic, Roblox-creator-operating-system hero and header that immediately signals premium developer infrastructure.

**Outcome required today:** a shippable header + hero redesign spec, implementation order, asset generation setup, and file-by-file build map.

**Non-goals:** auth, dashboard, pricing experiments, plugin work, deep backend changes beyond safe server-side image plumbing.

---

## Day 1 definition of done

- Sticky transparent header exists and transitions cleanly on scroll
- Mobile nav exists and feels premium rather than generic
- Hero is full-height, cinematic, and centered around one focal composition
- Hero messaging clearly communicates: **Describe → Generate → Preview → Export → Ship**
- Visual system uses controlled cyan/violet lighting without neon clutter
- fal.ai is wired server-side only for asset generation workflow
- Local asset strategy is defined so visuals are generated once and reused
- Implementation summary maps each task to exact files

---

## Kanban board

## BACKLOG

### D1-01 — Audit current header and hero implementation
**Owner:** frontend-builder  
**Priority:** P0  
**Why:** Prevent blind redesign and avoid breaking working sections.

**Scope**
- Read current `app/page.tsx`
- Read current hero-related components
- Read `app/globals.css`
- Identify which pieces should be replaced vs. extended

**Acceptance criteria**
- Clear list of existing hero/header elements
- Keep/remove/replace decision for each
- Notes on animation, spacing, and responsive constraints

**Files to inspect**
- `app/page.tsx`
- `components/*.tsx` involved in above-the-fold UI
- `app/globals.css`

---

### D1-02 — Define cinematic visual direction tokens
**Owner:** ui-designer  
**Priority:** P0

**Scope**
- Lock Day 1 palette
- Lock typography direction
- Lock spacing rhythm
- Define overlay, line, glow, and glass treatment rules

**Acceptance criteria**
- Primary background pair: `#050816`, `#0B1020`
- Accent pair: `#00D1FF`, `#7C5CFF`
- Typography recommendation for display/body
- Explicit anti-pattern list: no esports, no generic SaaS, no neon overload

**Output**
- Token list for colors, shadows, blur, borders, gradients, spacing, and type scale

---

### D1-03 — Redesign sticky cinematic header
**Owner:** frontend-builder  
**Priority:** P0

**Scope**
- Transparent initial header
- Glassmorphism nav container
- Minimal HUDForge logo area
- Centered nav links
- Right-side Join Private Beta CTA
- Scroll-state transition from transparent to darker blurred shell

**Acceptance criteria**
- Sticky behavior works
- Readability preserved over dark/cinematic backgrounds
- Nav links: Features, Workflow, Examples, Pricing
- CTA visually dominant but not oversized

**Files likely touched**
- `app/page.tsx` or a new `components/Header.tsx`
- `app/globals.css`

---

### D1-04 — Build premium mobile navigation overlay
**Owner:** frontend-builder  
**Priority:** P0

**Scope**
- Hamburger below 1024px
- Fullscreen overlay menu
- Slide/fade animation
- Close state and focus management

**Acceptance criteria**
- Mobile nav feels cinematic, not default drawer UI
- Overlay preserves blur, lighting, and frame-line language
- Tap targets are clean and readable

**Files likely touched**
- `components/Header.tsx`
- `app/globals.css`

---

### D1-05 — Compose new hero information architecture
**Owner:** goal-validator + ui-designer  
**Priority:** P0

**Scope**
- Lock section order
- Define content hierarchy
- Ensure value is understood in 5 seconds

**Required structure**
1. Transparent header
2. Cinematic background
3. Overlay lighting layer
4. Main hero typography
5. CTA group
6. Product preview overlays
7. Floating UI cards
8. Workflow strip
9. Ambient effects

**Acceptance criteria**
- Hero story is immediately legible
- Strongest message is product value, not vague atmosphere
- Supports `Build Your World` without sounding like a game studio site

---

### D1-06 — Rewrite hero copy for cinematic product clarity
**Owner:** content-creator  
**Priority:** P0

**Scope**
- Hero headline
- Subheadline
- CTA labels
- Workflow strip copy
- Supporting microcopy on overlay cards

**Acceptance criteria**
- Headline is cinematic but still concrete
- Subheadline explains Roblox UI workflow, not abstract AI hype
- CTA pair:
  - Primary: `Join Private Beta`
  - Secondary: `See Generated UI`
- Workflow line communicates: `Describe → Generate → Preview → Export → Ship`

---

### D1-07 — Build cinematic hero layout shell
**Owner:** frontend-builder  
**Priority:** P0

**Scope**
- Minimum 100vh hero
- 12-column grid
- Max width 1600px
- 48px desktop padding
- Central focal layout with layered cards around it
- Responsive collapse for tablet/mobile

**Acceptance criteria**
- Desktop: wide cinematic composition
- Tablet: stacked layered composition
- Mobile: simplified vertical cinematic flow
- No cramped spacing

**Files likely touched**
- `app/page.tsx`
- `app/globals.css`
- optional `components/Hero.tsx`

---

### D1-08 — Create ambient background and lighting system
**Owner:** ui-designer + frontend-builder  
**Priority:** P0

**Scope**
- Cinematic dark background treatment
- Cyan fog / violet edge glow
- Soft white highlight lighting
- Top light gradients
- HUD frame lines and subtle overlays

**Acceptance criteria**
- Background creates atmosphere without competing with copy
- Effects are layered and restrained
- No rainbow or chaotic FX

**Files likely touched**
- `app/globals.css`

---

### D1-09 — Design hero focal composition
**Owner:** ui-designer  
**Priority:** P0

**Scope**
- Define centerpiece: silhouette / creator object / portal ring
- Define spatial position of surrounding HUD cards
- Define z-index / blur / depth rules

**Acceptance criteria**
- One obvious focal anchor
- Cards orbit or frame the center rather than creating noise
- Hero feels like advanced creator tooling, not a generic sci-fi poster

---

### D1-10 — Build floating HUD overlay card system
**Owner:** frontend-builder  
**Priority:** P0

**Scope**
- Inventory UI card
- Settings/config card
- Quest tracker card
- Health/status HUD
- Prompt input panel
- Luau export card

**Acceptance criteria**
- Cards look generated, modular, and production-ready
- Cards vary in size and depth
- Cards remain readable on large screens and degrade gracefully on mobile

**Files likely touched**
- `components/HeroOverlayCard.tsx` or similar
- `app/page.tsx`
- `app/globals.css`

---

### D1-11 — Add workflow indicator strip
**Owner:** frontend-builder + content-creator  
**Priority:** P1

**Scope**
- Create strip showing end-to-end product flow
- Use restrained technical styling

**Acceptance criteria**
- Contains: `Describe`, `Generate`, `Preview`, `Export`, `Ship`
- Visually supports the hero without turning into a feature grid

---

### D1-12 — Set up fal.ai server-side asset workflow
**Owner:** backend-api  
**Priority:** P0

**Scope**
- Add `.env.local` support for `FAL_KEY`
- Ensure key is server-only
- Create route or server utility for generating assets offline/on demand
- Define save path for generated assets

**Acceptance criteria**
- No client-side exposure of `FAL_KEY`
- Clear asset generation entry point exists
- Static/generated assets are reusable and not regenerated on every load

**Files likely touched**
- `.env.local` (local only, not committed)
- `app/api/.../route.ts` or `lib/fal.ts`
- `public/...` or a local asset cache directory

---

### D1-13 — Generate Day 1 visual asset set
**Owner:** content-creator + backend-api  
**Priority:** P1

**Scope**
Generate and save:
1. Hero cinematic background
2. HUDForge product preview
3. Floating Roblox UI cards
4. Inventory system UI
5. Shop UI
6. Health/status HUD
7. Quest tracker UI
8. Roblox Studio export visual

**Acceptance criteria**
- Assets follow one coherent visual language
- No anime, no random fantasy chaos, no text baked into backgrounds
- Saved locally for direct use in hero composition

**Base prompt**
`A cinematic futuristic Roblox-inspired game creation environment, premium developer-tool atmosphere, dark navy environment, centered focal composition, glowing portal structure, floating modular HUD panels, inventory UI, quest tracker UI, health/status HUD, futuristic creator workstation, cyan and violet lighting, cinematic volumetric fog, advanced game interface overlays, premium SaaS/game-tool aesthetic, ultra-clean composition, realistic lighting, immersive atmosphere, no text, no logos, no clutter, high-end visual storytelling, 16:9.`

---

### D1-14 — Implement responsive hero behavior
**Owner:** frontend-builder  
**Priority:** P1

**Scope**
- Desktop: cinematic spread
- Tablet: reduce overlap and card count
- Mobile: simplify to vertical flow with fewer floating elements

**Acceptance criteria**
- Hero remains impressive on desktop
- Mobile remains readable and performant
- No clipping, inaccessible text, or stacked visual chaos

---

### D1-15 — Run Day 1 quality pass
**Owner:** quality-assurance + reviewer  
**Priority:** P0

**Scope**
- Build
- Test
- Visual QA
- Responsive QA
- Copy QA
- Performance sanity check above the fold

**Acceptance criteria**
- Build passes
- Existing tests pass or updated tests pass
- Header/hero feel premium and intentional on major breakpoints
- No obvious contrast/readability failures
- No broken nav/menu states

---

## READY FIRST (execution order)

1. D1-01 Audit current implementation
2. D1-02 Define cinematic visual tokens
3. D1-05 Compose hero information architecture
4. D1-06 Rewrite hero copy
5. D1-03 Redesign sticky header
6. D1-04 Build mobile navigation
7. D1-07 Build hero layout shell
8. D1-08 Add ambient background/lighting system
9. D1-09 Define focal composition
10. D1-10 Build overlay card system
11. D1-11 Add workflow strip
12. D1-12 Set up fal.ai server-side workflow
13. D1-13 Generate Day 1 asset set
14. D1-14 Implement responsive behavior
15. D1-15 Run quality pass

---

## Parallel lanes

### Lane A — Visual direction
- D1-02
- D1-05
- D1-09

### Lane B — Copy + product clarity
- D1-06
- D1-11

### Lane C — Frontend build
- D1-03
- D1-04
- D1-07
- D1-08
- D1-10
- D1-14

### Lane D — Asset pipeline
- D1-12
- D1-13

### Lane E — Verification
- D1-15

---

## File-by-file implementation summary

### `app/page.tsx`
- Replace current above-the-fold structure with cinematic header + hero architecture
- Add hero content hierarchy
- Add workflow strip
- Mount floating UI card cluster

### `app/globals.css`
- Add header glass styles
- Add scroll-state classes
- Add ambient lighting gradients
- Add frame lines / HUD overlays
- Add hero grid, spacing, and overlay positioning system
- Add mobile overlay nav animation rules

### `components/Header.tsx` (new, recommended)
- Encapsulate sticky header behavior
- Nav links
- CTA
- Mobile menu trigger and overlay

### `components/Hero.tsx` (new, recommended)
- Encapsulate hero shell
- Typography block
- CTA group
- Workflow strip
- Background layers

### `components/HeroOverlayCard.tsx` (new, recommended)
- Reusable floating UI card primitive
- Variants for inventory/shop/quest/status/export/prompt

### `components/HeroVisualCluster.tsx` (new, recommended)
- Central focal composition
- Arranges floating cards around centerpiece

### `lib/fal.ts` (new, recommended)
- Server-only fal.ai helper
- Prompt wrapper and asset generation utility

### `app/api/generate-hero-assets/route.ts` (optional)
- Server route for generating and saving Day 1 assets offline/on demand

### `.env.local`
- Add `FAL_KEY=...`
- Never commit
- Never expose client-side

### `public/images/hero/`
- Store generated hero background and overlay assets

---

## Brutal priority filter

If Day 1 gets tight, do these first:
1. Header redesign
2. Hero composition shell
3. Hero copy
4. Lighting/background system
5. One strong visual cluster

Cut or defer if needed:
- too many floating cards
- overcomplicated animations
- live generation behavior for hero assets
- any decorative section below the fold

---

## Risks

- Overbuilding atmosphere and losing product clarity
- Making it look like a game studio site instead of developer tooling
- Too many floating cards causing visual noise
- Exposing `FAL_KEY` incorrectly
- Shipping image generation dependency before static asset caching exists
- Mobile hero becoming cluttered and slow

---

## Recommended Day 1 handoff sequence

1. ui-designer locks direction
2. content-creator locks hero copy
3. frontend-builder implements header + hero shell
4. backend-api wires fal.ai helper
5. content-creator/backend-api generate assets
6. frontend-builder integrates assets
7. quality-assurance checks breakpoints and flow
8. reviewer makes go/no-go call
