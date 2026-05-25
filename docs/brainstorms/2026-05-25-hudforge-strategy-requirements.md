---
date: 2026-05-25
topic: hudforge-strategy
---

# HUDForge Product & Distribution Strategy

## Summary

HUDForge will win as a Roblox-native UI workflow compression tool: prompt → browser preview → structured export to Studio in minutes. Visual sophistication is the quality bar, not the headline. Phase 1 ships workflow compression plus style lock as the retention layer. Month 1–2 revenue target is 100 paying users on Starter (£10/mo) and Pro (£30/mo). Distribution runs through demo content and template-led DevForum/SEO once the SaaS app is live on production.

---

## Problem Frame

Solo Roblox developers and small teams building simulators, tycoons, RPGs, and live-service games spend disproportionate sprint time on HUD structure, menu states, and inventory polish. Visual consistency breaks as games expand — buttons, trays, and overlays drift stylistically, making products feel cheaper than the gameplay deserves. Teams repeatedly rebuild the same UI patterns in Studio instead of shipping features.

Adjacent tools either optimize for generic AI art (pretty but unusable in Roblox), broad Roblox AI assistants (UI is one feature among many), or Studio plugin sync without trustworthy structured export. HUDForge's moment is compressing the slowest part of the UI workflow while keeping output Roblox-shaped, exportable, and visually consistent.

---

## Actors

- A1. **Solo Roblox developer**: Builds gameplay-heavy games; weak UI design confidence; needs speed and usable exports.
- A2. **Small Roblox team lead**: Coordinates 2–5 builders; cares about visual consistency across screens and reduced repetitive Studio work.
- A3. **Founder/operator (Luke)**: Owns product, distribution, and revenue milestones; ships content and captures creator feedback.
- A4. **Competing tools (Bloxsmith, Metain, etc.)**: Set buyer expectations for Studio sync, style presets, and pricing models.

---

## Key Flows

- F1. **First successful export (activation)**
  - **Trigger:** Creator signs up and describes a UI need (shop, inventory, HUD, menu).
  - **Actors:** A1 or A2
  - **Steps:** Sign in → enter prompt → receive structured spec → generate asset bundle → preview in browser → download ZIP → follow import guide → mount ScreenGui in Studio.
  - **Outcome:** Creator has a working, editable UI in Studio within one session; export feels like a real tool output, not an API response.
  - **Failure path:** If preview or export fails, creator sees a clear error and can retry without losing credits unfairly.
  - **Covered by:** R1, R2, R3, R4

- F2. **Style lock and regeneration (retention)**
  - **Trigger:** Creator completes first export and wants matching components for additional screens.
  - **Actors:** A1, A2
  - **Steps:** Lock style from first generation (genre, palette, art direction) → generate new UI type (e.g., inventory after shop) → assets and layout stay visually consistent → export new ZIP.
  - **Outcome:** Creator builds a coherent UI system without manual style matching across screens.
  - **Covered by:** R5, R6

- F3. **Paid conversion**
  - **Trigger:** Creator exhausts free credits or chooses to upgrade for volume/style-lock access.
  - **Actors:** A1, A2
  - **Steps:** Hit credit limit or choose plan → checkout (Starter £10 or Pro £30) → receive monthly credits → continue generating with style lock.
  - **Outcome:** Creator pays and continues workflow without friction; subscription state reflects in app.
  - **Covered by:** R7, R8

- F4. **Distribution → signup → activation**
  - **Trigger:** Creator sees demo clip, DevForum post, or template gallery.
  - **Actors:** A3, A1, A2
  - **Steps:** View demo/template → click to site → sign up → land in generate flow with example prompt pre-filled → complete first export.
  - **Outcome:** Inbound creator reaches activation, not just waitlist signup.
  - **Covered by:** R9, R10, R11

---

## Requirements

**Product wedge and quality bar**

- R1. The primary product promise is workflow compression: describe a Roblox UI → preview → download usable export in one session.
- R2. Every generation produces structured, deterministic output (layout spec + Luau + asset bundle + import guide), not loose AI art.
- R3. Visual output meets a premium cyber-fantasy quality bar: dark navy scenes, neon cyan/violet accents, production-ready Roblox-native panels — consistent with `assets/brand-guidelines.md`.
- R4. Browser preview must render generated layout and assets well enough that creators trust the export before downloading.

**Style lock (Phase 1 retention)**

- R5. Creators can lock a visual style after first generation and apply it to subsequent UI types within the same project.
- R6. Style-locked generations produce asset bundles that match the locked palette, art direction, and component feel — not one-off unrelated images.

**Revenue and pricing**

- R7. Paid plans are Starter (£10/mo, 150 credits) and Pro (£30/mo, 600 credits) as defined in existing billing docs; checkout and webhook credit grants must be live.
- R8. Month 1–2 revenue milestone: 100 paying users across Starter and Pro tiers.

**Distribution**

- R9. Distribution content demonstrates real export workflows (shop UI, inventory, HUD redesign) — not marketing without product proof.
- R10. Template gallery and DevForum/SEO content drive qualified Roblox creators to signup and first export, not waitlist-only capture.
- R11. SaaS app routes (`/generate`, `/billing`, settings, API) must be live on production by **2026-05-31** before scaled distribution spend.

**Competitive positioning**

- R12. HUDForge differentiates on trustworthy structured export + style lock, not Studio plugin sync (deferred) or generic AI art breadth.
- R13. Primary competitive reference is Bloxsmith (Roblox UI + Studio plugin + style presets); secondary references are Metain/StudByStud (broad assistants) and GameUI AI (style lock, non-Roblox).

---

## Acceptance Examples

- AE1. **Covers R1, R4.** Given a signed-in creator on `/generate`, when they prompt "premium cyber shop UI with currency display" and complete generation, they see a browser preview of the layout with generated assets before downloading.
- AE2. **Covers R2, R4.** Given a completed generation, when the creator downloads the export, the ZIP contains layout spec, Luau entrypoint, asset manifest, and import guide — not a JSON API payload alone.
- AE3. **Covers R5, R6.** Given a creator who locked style from a shop UI generation, when they generate an inventory UI for the same project, the new asset bundle matches the locked palette and visual feel.
- AE4. **Covers R7, R8.** Given Lemon Squeezy is configured in production, when a creator completes checkout for Starter or Pro, their account receives plan credits once and subscription state updates without duplicate grants.
- AE5. **Covers R9, R11.** Given production serves the SaaS app, when a creator clicks through from a demo clip or DevForum post, they reach `/generate` (not 404) and can sign up and export without hitting a broken funnel.

---

## Success Criteria

- 100 paying users (Starter + Pro combined) within Month 1–2 of paid launch.
- Activation: majority of signups complete at least one ZIP export (not just signup/waitlist).
- Style lock: creators who lock style generate at least one additional UI type in the same project (retention signal).
- Distribution: landing page conversion > 8%; at least 10 high-signal creator feedback replies; repeated demand for same UI types validates template investment.
- Competitive clarity: creators can articulate why HUDForge vs Bloxsmith (structured export + style lock) in feedback or support conversations.

---

## Scope Boundaries

### Deferred for later

- Roblox Studio plugin with one-click sync and automatic asset upload to Roblox (Bloxsmith parity).
- Adaptive mode that analyzes existing in-game UIs to match style (Bloxsmith adaptive).
- Shareable preview cards / "Made with HUDForge" watermark on exports (export-as-marketing).
- Long-form YouTube breakdowns, press outreach, newsletter cadence beyond launch updates.
- Pay-as-you-go-only pricing model (credits never expire, no subscription).

### Outside this product's identity

- Expanding to Unity, Unreal, or Godot (GameUI AI / UI Forge territory).
- General-purpose Roblox AI dev assistant covering scripts, 3D, and full game systems (Metain, StudByStud, RoNexus territory).
- Enterprise/studio tier with SLA and custom solutions.
- Generic AI art generation without Roblox-native structure and export.
- Template marketplace as primary product identity (templates are distribution fuel, not the core wedge).

---

## Key Decisions

- **Workflow compression is the primary wedge; visual quality is the bar, not the headline.** Rationale: aligns with repo doctrine, user selection, and defensible differentiation vs Bloxsmith's plugin-first model.
- **Style lock ships in Phase 1 as retention, not Phase 2.** Rationale: addresses pain point #2 (visual consistency), supports "irresistible design" ambition, and creates reason to regenerate within HUDForge instead of one-and-done.
- **100 paying users in Month 1–2 at £10/£30.** Rationale: user-stated milestone; implies aggressive distribution and product readiness, not waitlist-only growth.
- **Product approach: specialist workflow first (Approach A), style lock as retention (Approach B), templates as distribution (Approach C).** Rationale: narrow scope proves value fastest; templates compound distribution without becoming the product identity.
- **Distribution: demo content + DevForum/template SEO now; export-as-marketing after preview quality lands.** Rationale: matches existing `docs/distribution-strategy.md` with production-readiness gate added.
- **Studio plugin deferred until export loop + style lock are proven.** Rationale: high build cost; Bloxsmith already owns sync; structured export + style lock is the near-term differentiator.
- **Production promotion on 2026-05-31.** Rationale: distribution and paid conversion require live SaaS routes on `https://www.hudforge.app`; launch-week content cadence starts after this date.

---

## Dependencies / Assumptions

- `develop` branch SaaS work (auth, generation, ZIP export, billing code) promotes to production on **2026-05-31** before scaled distribution.
- Lemon Squeezy products/variants and webhook secret are configured in Vercel for live checkout.
- Browser preview improvement is required for R4 activation trust.
- Style lock product behavior is net-new (no existing style-lock implementation verified in codebase).
- 100 users in Month 1–2 assumes distribution cadence from `docs/distribution-strategy.md` (3 clips/day launch week, DevForum post, founder outreach) executes once product is live.
- Competitor landscape remains stable: Bloxsmith leads on plugin sync; no major new entrant with both plugin + style lock + structured export before HUDForge ships Phase 1.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R5, R6][Technical] How is style lock represented — per-project setting, per-generation inheritance, or explicit lock action after first export?
- [Affects R4][Technical] What is the minimum viable browser preview — layout wireframe, asset thumbnails, or full composited render?
- [Affects R8][Needs research] What Starter/Pro mix is assumed for 100 users (£1,000 floor at all-Starter vs £3,000 ceiling at all-Pro)? Affects distribution messaging and plan positioning.
- [Affects R10][Needs research] Which 3–5 UI types should lead the template gallery and DevForum content based on waitlist/feedback signals?
