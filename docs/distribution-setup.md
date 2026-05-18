# HUDForge Distribution Setup

## Objective
Turn HUDForge into a launch-ready distribution machine focused on early-access signups, product proof, and community feedback.

## What is now prepared in-repo
- Brand guidelines: `assets/brand-guidelines.md`
- Logos and icons: `public/brand/`
- Launch banners and channel headers: `public/generated/brand/`
- Email templates: `emails/`
- Social bios and launch copy: `marketing/social-captions/`
- Press kit: `public/press-kit/`
- Public links hub: `/links`
- Analytics placeholder component: `components/Analytics.tsx`

## Recommended stack
- **Email:** Resend first. Best fit for launch-phase speed and developer ownership.
- **Analytics:** GA4 with `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- **Payments:** Lemon Squeezy when paid beta is switched on.
- **Community:** Discord for feedback, X for discovery, YouTube Shorts for visual proof.

## Channel-by-channel setup
### 1. X / Twitter
1. Log in to `https://x.com`.
2. Claim handle `@hudforgeapp` or the closest available variant.
3. Upload `public/brand/social-avatar.png` as the avatar.
4. Upload `public/generated/brand/twitter-header.png` as the header.
5. Paste bio from `marketing/social-captions/twitter-bio.txt`.
6. Publish first post from `marketing/social-captions/twitter-launch.txt`.
7. Pin the launch post and link to `https://hudforge.vercel.app` until the final domain is pointed.

### 2. LinkedIn company page
1. Log in to LinkedIn and create a company page named **HUDForge**.
2. Upload `public/brand/social-avatar.png` as the logo.
3. Upload `public/generated/brand/linkedin-banner.png` as the cover.
4. Use bio from `marketing/social-captions/linkedin-bio.txt`.
5. Publish the launch post from `marketing/social-captions/linkedin-launch.txt`.

### 3. Discord server
1. Create a new Discord server named **HUDForge**.
2. Upload `public/brand/social-avatar.png` as the server icon.
3. Use `public/generated/brand/discord-banner.png` in server onboarding or invite landing surfaces.
4. Create channels: `#announcements`, `#showcase`, `#feedback`, `#prompt-help`, `#bug-reports`.
5. Paste intro text from `marketing/social-captions/discord-server-blurb.txt`.
6. Post launch message from `marketing/social-captions/discord-launch.txt`.

### 4. YouTube
1. Create or rename a YouTube channel to **HUDForge**.
2. Claim handle `@hudforgeapp` if available.
3. Upload `public/brand/social-avatar.png` as the profile image.
4. Upload `public/generated/brand/youtube-banner.png` as the channel art.
5. Use channel description from `marketing/social-captions/youtube-channel-about.txt`.
6. Use `marketing/social-captions/youtube-launch.txt` as the first channel trailer/script base.

### 5. GitHub
1. Keep repo public if that supports discovery.
2. Add the new banners and screenshots from `public/generated/brand/` and `public/generated/marketing/` to the README when you want more polish.
3. Use organization/repo bio text from `marketing/social-captions/github-organization-bio.txt`.
4. Publish the launch note from `marketing/social-captions/github-announcement.txt` in discussions or release notes if needed.

### 6. Roblox DevForum
1. Log in to the founder account on the Roblox DevForum.
2. Post a launch thread using `marketing/social-captions/roblox-devforum-post.txt`.
3. Attach product screenshots from `public/generated/marketing/`.
4. Link back to `https://hudforge.vercel.app`.
5. Ask for feedback on the first-use workflow and which UI categories users want most.

### 7. Email provider (Resend or Mailchimp)
1. Create a Resend account if you want developer-controlled transactional flows.
2. Verify your sending domain once the DNS is ready.
3. Import HTML templates from `emails/`.
4. Set up at least three sends:
   - waitlist welcome
   - product update
   - founder pricing announcement
5. Map CTA URLs to the live marketing site.

### 8. Google Analytics 4
1. Create a GA4 property in Google Analytics.
2. Copy the Measurement ID.
3. Add it to Vercel env vars as `NEXT_PUBLIC_GA_MEASUREMENT_ID` for preview and production.
4. Redeploy the site.
5. Verify page views in GA4 Realtime.

### 9. Lemon Squeezy
1. Create the HUDForge store/products.
2. Define at least one founder plan and one standard creator plan.
3. Add webhooks and secret keys to Vercel env vars.
4. Connect checkout links to pricing CTAs once billing is live.

## Manual steps that require your credentials
- Logging into X, LinkedIn, Discord, YouTube, Google Analytics, Roblox DevForum, Lemon Squeezy, Resend, and Vercel.
- Claiming social handles and verifying domains.
- Verifying the production domain and sender domain DNS.
- Uploading images to external platform dashboards.

## Remaining decisions
- Final email provider: Resend vs Mailchimp
- Final paid plan structure in Lemon Squeezy
- Whether to use GA4 only or add Plausible/Hotjar later
- Whether to create a separate GitHub organization for HUDForge
- Whether Discord stays private beta-only or partially public

## Remaining work after this repo pass
- Activate social accounts and upload the prepared assets
- Connect analytics measurement ID
- Verify the sender domain for email
- Connect the final custom domain to Vercel
- Record 3–5 launch demo clips for X and YouTube Shorts
- Collect the first 20–50 creator feedback responses and cluster by requested UI type
