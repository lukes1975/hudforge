# HUDForge Multi-Page Fantasy Redesign Plan

> **For Hermes:** Implement on `develop` only. Preserve backend logic except where small frontend-supporting changes are required.

**Goal:** Replace the current one-page landing page with a modern, immersive multi-page marketing frontend for HUDForge.

**Architecture:** Keep the existing Next.js App Router stack. Build a shared marketing UI system with a route-aware header/footer, typed local content source, reusable cards/sections, and dynamic routes for template details and blog posts. Use local structured content for V1 instead of introducing CMS/backend complexity now.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, CSS variables, Clerk (existing), Supabase waitlist API (existing).

---

## Existing codebase snapshot

- Current public site is a single route: `app/page.tsx`
- Existing marketing sections/components:
  - `components/Header.tsx`
  - `components/Hero.tsx`
  - `components/Features.tsx`
  - `components/Showcase.tsx`
  - `components/Pricing.tsx`
  - `components/Waitlist.tsx`
- Existing public backend dependency to preserve:
  - `app/api/waitlist/route.ts`
- Existing app routes to avoid breaking:
  - `app/sign-in/[[...sign-in]]/page.tsx`
  - `app/sign-up/[[...sign-up]]/page.tsx`
  - `app/dashboard/page.tsx`

---

## New information architecture

### Primary pages
- `/` — home
- `/templates` — template gallery
- `/templates/[id]` — template detail
- `/how-it-works` — process + workflow
- `/pricing` — pricing and FAQ
- `/blog` — post index
- `/blog/[slug]` — blog article
- `/documentation` — docs landing
- `/contact` — contact / partnership / waitlist CTA

### Shared layout structures
- Global marketing header with desktop nav + mobile drawer
- Shared footer with product, resources, company, legal columns
- Reusable section intro pattern
- Reusable page hero pattern
- Reusable CTA ribbon/banner
- Reusable card patterns for features, blog, docs, pricing, and templates

---

## Content/data plan

Create typed local content in `lib/marketing-content.ts` for V1:
- navigation items
- feature blocks
- stats / trust signals
- template cards
- template detail records
- pricing plans
- FAQs
- blog posts
- docs categories
- contact channels
- image prompt registry

### Why local content first
No backend/CMS change is necessary to ship the redesign. The fastest path is:
1. ship production-grade frontend with static typed content
2. validate conversion and navigation behavior
3. later replace blog/templates/docs content source with CMS or Supabase if needed

---

## Visual direction

- Aesthetic: cinematic cyber-fantasy / premium Roblox world-building tool
- Base colors: midnight navy, obsidian, ink blue
- Accents: electric cyan, violet bloom, ember gold, aurora mint
- Typography:
  - display: stylized fantasy serif with authority
  - body: modern readable sans
  - mono/meta: compact control-room mono
- Component language:
  - glass + rune-frame cards
  - subtle bevels and inner glows
  - layered gradients and grid overlays
  - bold framed screenshots
  - strong CTA contrast with neon energy

---

## CSS variable system

Define/refresh variables for:
- `--bg`, `--bg-elevated`, `--panel`, `--panel-strong`
- `--text`, `--text-soft`, `--text-muted`
- `--primary`, `--primary-strong`, `--secondary`, `--accent`
- `--line`, `--line-strong`, `--shadow`
- `--radius-sm`, `--radius-md`, `--radius-lg`
- spacing rhythm tokens for section gaps and shell widths

---

## Page-by-page component hierarchy

### Home
- Header
- Hero
- Trust/proof strip
- Feature grid
- Template showcase preview
- Workflow steps
- Pricing preview
- Blog highlights
- CTA banner
- Footer

### Templates
- Page hero
- Filters/chips (static V1)
- Template card grid
- category banner
- CTA

### Template detail
- Breadcrumbs
- Hero/media split
- tags + use cases
- exported asset stack
- workflow steps
- related templates
- CTA

### How it works
- Page hero
- 4-step process timeline
- output stack section
- export workflow section
- FAQ strip
- CTA

### Pricing
- Page hero
- pricing table
- plan comparison callouts
- FAQs
- CTA

### Blog
- Page hero
- featured post
- article grid
- CTA

### Blog detail
- article hero
- rich content sections
- key takeaway/sidebar box
- related posts
- CTA

### Documentation
- Page hero
- docs category cards
- quick-start checklist
- support/contact links

### Contact
- Page hero
- contact cards
- partnership / creator / studio options
- waitlist form block
- FAQ/support note

---

## Accessibility requirements

- semantic landmarks (`header`, `main`, `nav`, `footer`, `article`, `section`)
- aria labels for mobile menu and decorative icon handling
- visible focus styles
- color contrast tuned against dark backgrounds
- reduced-motion respect for decorative animation
- keyboard reachable mobile nav and CTA controls

---

## Image generation requirements

### Needed assets
1. Hero world illustration
2. Hero HUD preview screenshot
3. Templates index banner artwork
4. 3–4 template preview images
5. Blog/docs ambient accent images only if time permits

### Prompt set

**World hero image**
> A cinematic cyber-fantasy world-building scene for a Roblox UI creation platform, towering rune-lit citadel, heroic female mage and armored sentinel overlooking a floating holographic interface forge, midnight navy atmosphere, electric cyan and violet energy trails, ember gold highlights, volumetric fog, premium game key art, highly detailed, no text, 16:9

**Hero HUD preview**
> Premium game-ready HUD interface for a Roblox action RPG, transparent panel styling, neon cyan and violet highlights, polished quest tracker, inventory frame, currency counters, party status bars, modular layout, dark background, ultra clean UI presentation, no baked text logos, highly detailed, 16:9

**Templates gallery banner**
> Fantasy interface arsenal display for a Roblox creator toolkit, multiple floating HUD panels, shop UI, quest board, inventory grid, profile card, cinematic blue and gold lighting, dark atmospheric background, premium concept art, 16:9

**Template preview prompt family**
> Game-ready Roblox [template type] HUD, premium cyber-fantasy UI, transparent PNG style, neon cyan accents, gold micro-highlights, dark polished surfaces, clean readable modular layout, no background clutter, highly detailed, 4:3

Template types:
- inventory
- quest board
- faction dashboard
- loot shop

---

## Backend / CMS decision

### For this implementation
- **No additional backend changes required**
- Keep blog/templates/docs content local and typed
- Reuse existing waitlist API for conversion capture

### Later if traction warrants it
- blog/doc content can move to MDX or CMS
- templates can move to Supabase-backed catalog if generation/export ties to real product objects

---

## Verification checklist

Run before shipping:
- `npm run lint`
- `npm run type-check`
- `npm run build`
- browser sanity check of all routes
- verify mobile nav
- verify waitlist form still posts
- verify no broken links

---

## Remaining likely follow-ups after ship
- replace placeholder blog copy with real founder content
- connect templates to live generation examples
- add OG image pipeline per route
- add docs search if docs volume grows
- add analytics events for CTA, nav, and waitlist conversions
