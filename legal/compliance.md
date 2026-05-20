# HUDForge Contact, Compliance, and Launch Readiness

**Status:** Founder review required before public launch

This page is intended to act as HUDForge's public contact/compliance hub and internal launch checklist.

## 1. Public Contact Details

Replace the placeholders below before publishing:

- **Legal Entity:** [INSERT LEGAL ENTITY NAME]
- **Trading Name:** HUDForge
- **Support Email:** [INSERT SUPPORT EMAIL]
- **Privacy Email:** [INSERT PRIVACY EMAIL]
- **Billing Email:** [INSERT BILLING EMAIL]
- **Abuse/Safety Email:** [INSERT ABUSE EMAIL]
- **Legal Notices Email:** [INSERT LEGAL NOTICE EMAIL]
- **Registered Address:** [INSERT REGISTERED BUSINESS ADDRESS]
- **Country of Incorporation:** [INSERT COUNTRY]
- **Company Number / Registration Number:** [INSERT IF APPLICABLE]
- **VAT Number:** [INSERT IF APPLICABLE]

## 2. Recommended Footer Links Structure

Minimum footer/legal navigation for SaaS launch and Lemon Squeezy review:

### Product
- Pricing
- How It Works
- Documentation
- Contact

### Company
- Terms of Service
- Privacy Policy
- Cookie Policy
- Refund Policy

### Compliance
- Acceptable Use Policy
- AI Output Disclaimer
- Copyright / DMCA Policy
- Compliance / Contact

Recommended route structure:

- `/legal/terms`
- `/legal/privacy`
- `/legal/cookies`
- `/legal/acceptable-use`
- `/legal/refunds`
- `/legal/ai-disclaimer`
- `/legal/dmca`
- `/legal/compliance`

## 3. Implementation Steps for Next.js Routing

Recommended approach for the current HUDForge App Router stack:

1. Create a route segment at `app/legal/`.
2. Create one page per legal document, or a dynamic route backed by a local content map.
3. Keep pages server-rendered and static unless there is a strong reason not to.
4. Render the markdown from `/legal/*.md` using a trusted markdown pipeline or convert them into typed content modules if you want stricter control.
5. Add metadata per page (`title`, `description`) for compliance review and SEO clarity.
6. Link all legal routes from the marketing footer and checkout-relevant pages.
7. Ensure the footer appears on pricing, landing, contact, and checkout pre-entry pages.
8. Include public contact details on the contact/compliance page and, if applicable, in the site footer.

Example implementation shape:

- content source: `legal/*.md`
- renderer: `app/legal/[slug]/page.tsx`
- optional index page: `app/legal/page.tsx`
- footer links: `components/marketing/MarketingFooter.tsx`

## 4. Footer Integration Steps for This Repo

Based on the current repo structure, the clean insertion point is `components/marketing/MarketingFooter.tsx`.

Recommended changes:

1. Add a new **Legal** column to the footer.
2. Include at minimum: Terms, Privacy, Cookies, Refunds, AI Disclaimer.
3. Optionally keep a second **Compliance** column if you want AUP, DMCA, and Contact/Compliance separated.
4. Add the same links to any pricing page CTA area if Lemon Squeezy review asks for more obvious visibility.
5. Ensure the pricing page has direct access to Terms, Privacy, and Refunds.

## 5. Missing Compliance Gaps Before Launch

These are the real gaps, not cosmetic ones:

### Critical

- **Legal entity details are missing.** You need the actual contracting entity, address, and support/legal emails.
- **Refund rules are not finalized.** Lemon Squeezy approval can stall if billing/refund expectations are vague.
- **Cookie/analytics stack is not fully enumerated.** Do not publish claims about consent categories until the actual tracking stack is confirmed.
- **Children's privacy posture is unresolved.** Roblox skews young. If you knowingly onboard under-13 users, you may trigger COPPA and child-data obligations.
- **AI provider disclosure must match reality.** If prompts/files are sent to specific AI vendors, the privacy policy needs to stay accurate.

### Important

- define a published data-retention position for prompts, uploads, and generated assets;
- confirm whether generated outputs are stored by default and for how long;
- confirm whether support inboxes, logs, and analytics capture personal data beyond what is strictly necessary;
- confirm whether you need a DPA, SCC language, or vendor list for business customers later;
- confirm a takedown workflow for infringing user uploads or generated assets.

## 6. Product Model Legal Risk Areas

HUDForge's main legal risk is not generic SaaS boilerplate. It is the combination of **AI output + Roblox audience + user-uploaded references + paid subscriptions**.

Key risk areas:

### A. Intellectual property risk

Users may try to generate UI that imitates copyrighted games, branded interfaces, or protected visual identities. Your terms help, but enforcement and moderation still matter.

### B. Minor-audience risk

Roblox creators and players include minors. If the product is marketed directly at children or knowingly collects child data, your compliance burden rises fast.

### C. Output reliance risk

Users may assume exports are production-ready or safe to ship. The AI disclaimer must be visible enough to reduce reliance claims.

### D. Billing clarity risk

Subscription plans, credits, beta limitations, and refund boundaries must be obvious before checkout. Hidden billing ambiguity creates chargeback risk.

### E. Data handling risk

Prompts and uploads may contain third-party assets, PII, or commercially sensitive game materials. Your privacy posture and internal retention discipline matter.

## 7. Weaknesses Before Public Launch

Current likely weaknesses:

- legal pages are not yet publicly routed;
- footer legal visibility is incomplete;
- company identity placeholders are unresolved;
- child-audience posture is not finalized;
- refund policy is still partly placeholder-driven;
- analytics/cookie disclosure may be ahead of operational reality if published without verification.

## 8. Recommended Pre-Launch Sequence

1. Finalize legal entity and contact details.
2. Finalize refund position and billing language.
3. Confirm live analytics/cookie tooling.
4. Confirm AI provider disclosure wording matches the actual backend.
5. Publish the legal routes.
6. Add footer links across the marketing site.
7. Re-check pricing and checkout pages for visible Terms, Privacy, and Refunds links.
8. Only then submit for Lemon Squeezy review.

## 9. Internal Note

These documents improve launch readiness, but they are **not a substitute for jurisdiction-specific legal advice**. If HUDForge is launched under a UK entity serving the UK/EU and a youth-adjacent market, a short solicitor review is worth doing once payment is live.
