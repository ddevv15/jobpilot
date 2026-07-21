# Memory — Phase 1: Foundation (PostHog + Dashboard placeholder)

Last updated: 2026-07-16

## What was built

- **03 PostHog Initialization — complete.** Client (`instrumentation-client.ts`, Next.js 15.3+ pattern) and server (`lib/posthog-server.ts`, posthog-node with `flushAt: 1`/`flushInterval: 0`) clients, `/ingest` reverse proxy rewrites in `next.config.ts` (avoids ad-blockers), env vars set in `.env.local`.
- Auth funnel events now instrumented end to end across `actions/auth.ts`, `app/api/auth/callback/route.ts`, `app/(auth)/login/page.tsx`:
  `cta_clicked`, `navbar_cta_clicked`, `sign_in_page_viewed`, `oauth_initiated`, `oauth_init_failed`, `user_signed_in`, `sign_in_failed`, `user_signed_out`.
- Server-side `posthog.captureException` added on the OAuth init-failure and code-exchange-failure branches.
- **Dashboard placeholder — `app/dashboard/page.tsx` (new file).** Not the real Phase 5 dashboard — just confirms the signed-in user's email and gives a sign-out button, so the post-login redirect stops 404ing while Phases 2–4 are still unbuilt.
- **`signOutUser` Server Action added to `actions/auth.ts`** — calls `createAuthActions().signOut()` server-side, fires `user_signed_out`, redirects to `/login`.
- Docs kept in sync: `posthog-setup-report.md` (event table), `context/progress-tracker.md`, `context/ui-registry.md` (new "Dashboard placeholder" entry).

## Decisions made

- Dashboard 404 was deliberately NOT fixed by building real Phase 5 UI — user chose the minimal-placeholder option specifically to avoid skipping Phases 2–4 out of order. Replace the placeholder body entirely when Phase 5 starts.
- All pre-auth PostHog events (oauth_initiated, oauth_init_failed, sign_in_failed, sign_in_page_viewed) use `distinctId: "anonymous"` since they fire before a user identity exists — matches the wizard's original convention.

## Problems solved

- User reported "can't use the auth page" — turned out the OAuth flow itself was fine (verified via Playwright: clicking "Continue with Google" correctly reaches Google's live consent screen); the real issue was landing on a 404 at `/dashboard` because that page didn't exist yet.
- Diagnosed PostHog `[SessionRecording]`/`[Dead Clicks]` console warnings from the user's earlier terminal output as browser ad-blocker/privacy-extension noise, not an app bug — reproduced the exact same requests in a clean headless browser and every asset (`posthog-recorder.js`, `dead-clicks-autocapture.js`) returned 200 via the `/ingest` proxy.

## Current state

- **Phase:** Phase 1 — Foundation, essentially complete (01 Homepage, 02 Auth, 03 PostHog all done). 04 Database Schema not started.
- OAuth init and redirect to Google/GitHub confirmed working live. Full round trip (sign-in → dashboard placeholder → sign-out → back to /login) is implemented but **not yet browser-verified** — no real OAuth credentials available in this environment to complete a live sign-in.
- `/review` was run against the dashboard/sign-out work. **6 open findings, none fixed yet** (developer hasn't decided what to do with them):
  - **Critical:** `signOutUser` never calls client-side `posthog.reset()` on logout, despite `build-plan.md:60` explicitly requiring it — PostHog identity can leak across users on a shared browser.
  - **Critical:** `code-standards.md`'s "PostHog Events" table only lists 4 unrelated events (job_search_started, job_found, profile_completed, company_researched) and says no new event may be added without updating that table first — 8 real events now exist (cta_clicked, navbar_cta_clicked, sign_in_page_viewed, oauth_initiated, oauth_init_failed, user_signed_in, sign_in_failed, user_signed_out) and none are documented there. Compounding drift, not new — but never corrected.
  - **Important:** `signOutUser` doesn't check the `{ error }` returned by `auth.signOut()` — a failed sign-out is silently treated as successful (fires `user_signed_out`, redirects to `/login` regardless).
  - **Minor:** dashboard placeholder card uses `p-8`, not the documented Cards token `p-6`.
  - **Minor:** no try/catch around `insforge.auth.getCurrentUser()` in the new dashboard page.
  - **Unverified:** authenticated render of `/dashboard` never actually seen in a browser (only the unauthenticated → /login redirect was tested).

## Next session starts with

Ask the developer what to do with the 6 review findings above before building anything new — especially the missing `posthog.reset()` (already in the plan) and the stale `code-standards.md` PostHog Events table (a standing project rule being silently violated). Once resolved, next planned feature is **04 Database Schema**.

## Open questions

- Should `code-standards.md`'s PostHog Events table be rewritten to reflect all 8 real events, or trimmed/reconciled some other way?
- Is `next.config.ts`'s turbopack root change (flagged in earlier sessions too) still unresolved/intentional?
- Production `NEXT_PUBLIC_APP_URL` and production OAuth redirect whitelist — still not defined, needed before deploying.
