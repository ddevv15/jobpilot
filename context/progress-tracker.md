# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 03 PostHog Initialization
**Next:** 04 Database Schema

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [ ] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- Homepage built pixel-matched against `context/designs/landing-page.png`. No logic yet (per build plan) — Get Started / Find Your First Match / Start for free all link to `/login` for now, auth wiring comes in 02 Auth.
- Marketing screenshot mockups (dashboard preview, jobs table, agent log, testimonial avatar) use the pre-made assets in `public/images/` as static `next/image` renders rather than rebuilding them as live components — they are decorative marketing images, not real app UI.
- Added two new tokens to `globals.css` beyond the original ui-tokens.md set, needed for the hero/CTA mesh gradient and logo gradient: `--color-gradient-blue`, `--color-gradient-pink`, `--color-accent-deep`. Two derived utility classes (`.bg-hero-gradient`, `.bg-logo-gradient`) live in globals.css so components never reference hex directly.
- Installed `lucide-react` (already an approved dependency in code-standards.md) for the logo mark and CTA icon.
- **02 Auth**: `context/library-docs.md`, `context/architecture.md`, and `context/code-standards.md` all documented a stale InsForge SDK API (`@insforge/ssr` package, `insforge.auth.getUser()`, `insforge.from(...)`, `getPublicUrl()`) — none of which exist in the installed `@insforge/sdk@^1.4.3`. Corrected all three against the current `insforge` skill docs before implementing. See the InsForge section of `library-docs.md` for the corrected patterns.
- OAuth callback is a Route Handler (`app/api/auth/callback/route.ts`), not the page (`app/(auth)/callback/page.tsx`) originally sketched in `architecture.md` — SSR OAuth requires the code exchange to happen server-side so the refresh token can be written httpOnly. `architecture.md`'s folder sketch and Authentication section were updated to match.
- Next.js 16 renamed `middleware.ts` → `proxy.ts` (exported function must be named `proxy`, not `middleware`) — used `proxy.ts` at the project root, not `middleware.ts`.
- `@insforge/sdk/ssr`'s `updateSession()` resolves `{ refreshed, accessToken, error }` — there is no `user` field, so `proxy.ts` treats a non-null `accessToken` as "logged in." Likewise, `createAuthActions().exchangeOAuthCode()` strips `accessToken`/`refreshToken` from its returned `data` (written straight to cookies instead) — the callback route checks `data.user` for success, not `data.accessToken`.
- `lucide-react@1.23.0` (the version pinned in this project) does not export brand/logo icons (no `Github`, no Google icon) — built inline SVGs for both in `app/(auth)/login/page.tsx` rather than pulling in a new icon dependency.
- Whitelisted `http://localhost:3000/api/auth/callback` in InsForge's `allowedRedirectUrls` via `npx @insforge/cli config apply` (tracked in `insforge.toml`, committed to the repo). Production URL still needs to be added when a production `NEXT_PUBLIC_APP_URL` exists.
- Verified end-to-end in a real browser (not just typecheck/build): unauthenticated visits to `/dashboard`, `/profile`, `/find-jobs`, `/find-jobs/[id]` all redirect to `/login`; both OAuth buttons correctly reach Google's and GitHub's real consent/login screens with valid InsForge-issued PKCE state. Could not complete a full sign-in without live provider credentials, so the final code-exchange redirect to `/dashboard` is implemented per the SDK docs but not yet observed with a real session.
- **03 PostHog Initialization**: client (`instrumentation-client.ts`) and server (`lib/posthog-server.ts`) clients, the `/ingest` reverse proxy rewrites, and `cta_clicked` / `navbar_cta_clicked` / `oauth_initiated` / `user_signed_in` events were already wired in (see `posthog-setup-report.md`). Extended it with the missing failure/churn side of the sign-in funnel, which had no visibility before: `oauth_init_failed` in `actions/auth.ts` (OAuth couldn't be initiated) and `sign_in_failed` in `app/api/auth/callback/route.ts` (fired with `reason: oauth_failed | missing_verifier | exchange_failed`), plus `posthog.captureException` server-side wherever an actual error object exists. All new events use `distinctId: "anonymous"` since they fire pre-authentication, matching the existing `oauth_initiated` convention.

---

## Notes

- Root layout now uses `next/font/google` Inter (`--font-sans`) per ui-rules.md, replacing the default Geist fonts from create-next-app.
- `components/layout/` and `components/homepage/` created per architecture.md. Added `CTAButtons.tsx`, `Testimonial.tsx`, and `CTASection.tsx` to `components/homepage/` — not explicitly listed in architecture.md's folder sketch, but consistent with its naming conventions and needed to cover every section in the design.
