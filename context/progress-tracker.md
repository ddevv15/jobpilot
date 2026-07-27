# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page (in progress)
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume (Phase 2)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
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
- Confirmed the auth flow itself works end-to-end (real browser test: clicking "Continue with Google" correctly reaches Google's live consent screen). The user's "can't use the auth page" report turned out to be the expected `/dashboard` 404 after a successful sign-in — Phase 5 hasn't started. Added a minimal placeholder `app/dashboard/page.tsx` (see `ui-registry.md`) plus a `signOutUser` Server Action in `actions/auth.ts` (mirrors `initiateOAuth`'s pattern, fires a `user_signed_out` PostHog event) so the full sign-in → sign-out round trip is testable without building Phase 5 early. Replace the placeholder body when Phase 5 starts; don't extend it.
- **Post-`/review` fixes (before starting 04 Database Schema):** addressed all 6 findings from the dashboard/sign-out review.
  - Added `components/auth/SignOutButton.tsx` — a `"use client"` button that calls `posthog.reset()` on click before the surrounding form submits `signOutUser`, satisfying `build-plan.md:60`'s "posthog.reset() called on logout" requirement (client-side reset can't happen inside the Server Action itself).
  - `code-standards.md`'s PostHog Events table was stale (only listed 4 future events); rewritten into "Implemented — Phase 1" (8 events: `cta_clicked`, `navbar_cta_clicked`, `sign_in_page_viewed`, `oauth_initiated`, `oauth_init_failed`, `sign_in_failed`, `user_signed_in`, `user_signed_out`) and "Planned — later phases" (the original 4) sections.
  - `signOutUser` now checks `{ error }` from `auth.signOut()` — on failure it logs, calls `posthog.captureException`, and redirects to `/login?error=sign_out_failed` instead of firing `user_signed_out` and redirecting to `/login` unconditionally. Added the matching message to `ERROR_MESSAGES` in `app/(auth)/login/page.tsx`. No new PostHog *event* name was introduced (uses `captureException`, not a new named capture), so the events-table rule wasn't violated.
  - Dashboard placeholder card padding corrected from `p-8` to the documented Cards token `p-6`.
  - `app/dashboard/page.tsx` now wraps `insforge.auth.getCurrentUser()` in try/catch; `redirect()` is called *outside* the try block (its own internal throw would otherwise be swallowed and logged as a false error).
  - Verified via curl + Playwright: unauthenticated `/dashboard` still 307s to `/login`; `/login?error=sign_out_failed` renders the new error banner correctly. Authenticated `/dashboard` render is still unverified in a real browser — no live OAuth credentials in this environment (same limitation as the original 02 Auth verification).

- **04 Database Schema**: two migrations — `20260721110500_create-schema.sql` (4 tables, RLS, grants, indexes, `updated_at` trigger) and `20260721111346_storage-resumes-rls.sql` (storage policies). Plus the private `resumes` bucket and `types/index.ts`. Backend was a clean slate — zero tables, zero buckets — before this feature.
  - **Ownership keys on `auth.users(id)` directly on all four tables**, not on `profiles(id)` as `architecture.md` originally stated. Every policy is a direct `user_id = (SELECT auth.uid())` check with no cross-table lookup, and — the real reason — it removes a hidden ordering dependency: with FKs pointing at `profiles`, no job could be inserted until a profile row existed, which `build-plan.md` never states. `architecture.md`'s three Notes columns were corrected.
  - **`is_complete` is the only persisted completion state.** `build-plan.md:113` says percentage and missing fields are "calculated and saved", but storing them means recomputing on every write and going stale whenever the required-field rules change. Both are derived in app code in Phase 2 instead.
  - **No "tailored fields" on `jobs`** despite `build-plan.md:73` asking for them — resume tailoring, cover letters, and score recalculation are all explicitly out of scope (`project-overview.md:189-191`), and `architecture.md`'s `jobs` schema has no such columns. Recorded rather than built.
  - **No `CHECK` constraint on `jobs.job_type`** — deliberate exception to the enum-constraint rule. `library-docs.md:264` maps it straight from Adzuna's `contract_type`, which emits values (`permanent`, `part_time`) outside architecture.md's `fulltime/parttime/contract` set. A constraint there would reject live Adzuna rows in Feature 10.
  - **Minimal grant surface:** `REVOKE ALL` from `anon`/`authenticated` first (InsForge pre-grants broad DML on public tables), then grant back only what features perform. No `DELETE` on any table — dismissing jobs is out of scope. `agent_logs` is append-only (SELECT/INSERT). Verified: `anon` holds **zero** privileges on all four tables.
  - **Storage isolation was a real gap, now closed.** `storage.objects` came with RLS **disabled** and zero policies on this backend (v2.2.6) — contradicting InsForge's own docs, which claim RLS ships enabled. A `--private` bucket alone therefore meant "any signed-in user", not `architecture.md:289`'s "own files only". Added path-scoped policies where the first path segment of the key must equal the JWT `sub`, so the `{user_id}/` prefix is now load-bearing. Policies are scoped to `bucket = 'resumes'`, so any future bucket is denied until it gets its own.
  - **`library-docs.md`'s Storage section documented an API that does not exist** — same drift class as the 02 Auth discovery. Real signature is `upload(path, file)`: no options object, no `contentType`, and **no `upsert`**. The documented `upsert: true` does not overwrite — the backend **auto-renames on key collision**. Consequences: `resume_pdf_key` had to be added to `profiles` (the key is not derivable from the user id), and Features 06/08 must `remove()` the old object before uploading or orphaned files accumulate. Section rewritten against `npx @insforge/cli docs storage typescript`.
  - **Verified against the live catalog, not the CLI's success message:** 4 tables with `rowsecurity=true`, 11 policies with correct `USING`/`WITH CHECK` predicates in subquery form and no `USING (true)`, 12 indexes, the `profiles_updated_at` trigger, 11 CHECK constraints, `storage.objects` RLS on with 4 policies, `anon` privilege count = 0, security advisor clean, `tsc --noEmit` exit 0.
  - **RLS proven under real authenticated sessions — 12/12 assertions passed.** The earlier "not verified" gap is now closed. Because OAuth credentials still aren't available, the test used email/password signup instead; because production enforces email verification (and SMTP is disabled, so verification can never complete), the test ran on a **throwaway schema-only backend branch** (`rls-verify`) with verification disabled *on the branch only*. Production auth config was never modified — re-confirmed afterwards by live probe (`requireEmailVerification: true`). Branch deleted; production user count unchanged at 2. Results:
    - User A can insert and read back its own `profiles`, `jobs`, and `agent_runs` rows.
    - User B sees **zero** rows across all three tables, including when explicitly filtering `?user_id=eq.<A's id>` — RLS filters silently rather than erroring, which is the correct shape.
    - User B is **blocked from inserting** a `jobs` row owned by A — confirms `WITH CHECK`, the half of RLS that `SELECT` testing alone cannot detect.
    - `DELETE` returns **403** — confirms the narrowed grant surface denies the privilege before any policy is consulted (a different mechanism from the row filtering above).
    - `anon` returns **401** — confirms zero privileges.
  - **Email/password auth is currently non-functional on this project** — `require_email_verification = true` while `[auth.smtp] enabled = false`, so a verification email can never be sent and signup can never complete. Harmless today (the app only uses OAuth), but it blocks any future email/password path and is why the branch was needed for testing.
  - **Turbopack root question resolved — the setting is correct and must stay.** `next.config.ts`'s `turbopack.root` exists because there is a stray `package-lock.json` in the user's **home directory** (`/Users/ddevv15/package-lock.json`). Turbopack infers the workspace root by walking up for lockfiles, so without the explicit root it would resolve to `/Users/ddevv15` and trace the entire home folder. Not leftover cruft — do not remove. Two cosmetic notes: `path.join(__dirname)` is a redundant single-arg wrapper (plain `__dirname` is equivalent), and deleting the stray home-directory lockfile would make the setting unnecessary.
  - **`.mcp.json` added to `.gitignore`** — it carries a full-access InsForge admin API key and was untracked but unignored, one `git add -A` away from entering history. Never committed; no history rewrite needed.
  - The backend is on a `nano` instance and returned intermittent `504`s on migration commands. Both migrations applied cleanly on retry; state was re-queried after each 504 rather than blindly re-running.

- **Email/password auth (addition beyond the documented build plan)**: the build plan specifies OAuth-only (Google + GitHub). At the developer's request, added a full email/password method *alongside* OAuth — signup → 6-digit email verification → signin → forgot/reset — all on `/login` via in-page modes. Files: 6 new server actions in `actions/auth.ts`, new `components/auth/AuthPanel.tsx` (client), `app/(auth)/login/page.tsx` now renders `AuthPanel`, `code-standards.md` events table extended, `insforge.toml` password policy hardened.
  - **Corrected a stale claim from the previous session:** email/password was recorded as "non-functional because SMTP is disabled." That was an unverified inference and was **wrong** — InsForge's platform delivers auth emails on every plan regardless of the `[auth.smtp]` block (which is only for *custom* SMTP). Verified in backend logs: signup produced `Email verification token created` + `Email sent successfully` (template `email-verification-code`). The feature was pure app-layer; the backend was already ready.
  - **Strong password policy applied to the backend** (`insforge.toml [auth.password]`): min 12 + uppercase + lowercase + number + special. Enforced server-side (verified: a 15-char all-lowercase password is rejected 400) and mirrored in the client-side checklist. Was min 6 / no complexity.
  - **Both `verify_email_method` and `reset_password_method` are `"code"`** (6-digit OTP, same-page) — no redirect handling and no new `allowedRedirectUrls` needed, the simplest SSR path.
  - **Stateless auth operations use the base `@insforge/sdk` client, not `createAuthActions`.** The SSR `createAuthActions` surface is narrower than the browser client — it lacks `resendVerificationEmail`, `sendResetPasswordEmail`, `exchangeResetPasswordToken`, `resetPassword` (caught by typecheck). Those four never establish a session, so they run on a plain `createClient({ baseUrl, anonKey })` (`getPublicAuthClient()` in `actions/auth.ts`). Session-establishing calls (`signUp`, `signInWithPassword`, `verifyEmail`) stay on `createAuthActions` so cookies are written.
  - **PostHog: reuse + extend, not a parallel set.** `user_signed_in`/`user_signed_out` carry a `method` (`oauth`|`password`) property; `sign_in_failed`'s `reason` enum extended (`invalid_credentials`, `email_not_verified`). New events (`sign_up_started`, `sign_up_failed`, `email_verification_sent`, `email_verified`, `password_reset_requested`, `password_reset_completed`) were added to `code-standards.md` **before** any code fired them (the hard project rule). `email_verified` is the signup-completion signal (verification also establishes the first session); `user_signed_in` is reserved for returning sign-ins, so the two don't double-count.
  - **Runtime testing found and fixed a real bug that typecheck + build could not.** On the InsForge branch, the SDK contract test revealed `signUp()` returns `{ requireEmailVerification: true, accessToken: null }` with **no `user` field** when verification is required — the account is still created. The first draft of `signUpWithPassword` treated `!data?.user` as failure, so a *successful* signup would have fired `sign_up_failed` and never advanced to the verify step. Fixed to branch on `error` → `requireEmailVerification` → session, in that order.
  - **Verified on a throwaway schema-only branch (`emailpw-verify`), production untouched** (same technique as Feature 04; re-confirmed production still enforces verification + 2 users afterward). 8/8 SDK-contract checks passed: strong pw accepted + requires verification, weak pw rejected (400), verify-wrong-code errors (400), unverified signin blocked (403), wrong-password errors (401), reset-request responds, reset-exchange-wrong-code errors (400), and — after admin-marking the user verified — signin returns a real session. `tsc --noEmit` and `next build` both clean.
  - **Not runtime-tested (bounded, honest):** the two *emailed-code happy paths* — verify-success and reset-completion — can't be automated here. The OTP is stored hashed (`auth.email_otps.otp_hash`) and there's no inbox in this environment (same limitation class as the missing OAuth credentials). Their SDK calls are identical in shape to the signin path that *was* proven end-to-end, and the React wiring is covered by typecheck + build. First real email delivery to a human inbox is the remaining confirmation.

- **05 Profile Page — Full UI**: new `/profile` route (`app/profile/page.tsx`, Server Component, same auth-guard pattern as the dashboard placeholder) rendering three cards in a `max-w-2xl` column — `CompletionIndicator`, `ResumeUpload`, `ProfileForm` (all new in `components/profile/`). Built to pixel-match `context/designs/profile.png`. Verified: `tsc --noEmit` exit 0, `eslint` exit 0, and a full-page Playwright screenshot against the design (via a throwaway unguarded `/ui-check` route, since `/profile` redirects to `/login` without a session — same OAuth-credential limitation as prior phases; route deleted after).
  - **Interactive local state, zero persistence** (developer's call). The form is a single `useState` seeded from an in-file `MOCK_PROFILE`; editing, skill/industry pill add-remove, "Add role" (cap 3), and the "Currently working here" toggle all work client-side. `Save Profile` and the resume `Generate`/upload actions are inert — Feature 06/07/08 own them. This satisfies code-standards' "every feature must be testable" without touching the DB.
  - **Followed the design over three written ui-rules** (developer's call), all still tokens-only (no hex, no raw palette classes):
    - Active nav = **purple + underline** (`border-b-2 border-accent`), contradicting ui-rules.md's "No underline — active state is color change only". ui-rules.md itself defers to design assets for visual decisions, and `profile.png` underlines the active item.
    - The "needs attention" banner uses a **faint red-tinted surface** (`bg-error/5`, `border-error/15`), contradicting "cards are always white". Confined to this one warning banner; achieved with opacity modifiers on `--color-error`, not a new colour.
    - **Cover Letter Tone dropdown omitted** despite build-plan 05 listing it under Job Preferences — it isn't in the design, and cover-letter generation is out of scope (project-overview.md:186). `profiles.cover_letter_tone` stays in the schema (nullable, harmless).
  - **Shared `Navbar` gained a `variant` prop** rather than forking an app navbar. Links extracted to a new `"use client"` `NavLinks` (`usePathname()` for active state) so `Navbar` stays a Server Component; `variant="app"` hides the marketing `NavbarCTA`. Homepage keeps the default `marketing` variant and is untouched — pathname `/` matches no nav item, so there's no visual regression (re-verified: on `/profile` the Profile link resolves to the active class; on `/` nothing is active).
  - **Email field prefilled from the real session** (read-only), falling back to the design's sample — the one genuinely user-specific value; every other field is mock. The completion banner (70% / PHONE·LOCATION·EDUCATION) is **static mock** this phase; deriving it from actual profile completeness is Feature 06.
  - **shadcn/ui is listed in architecture.md but is not actually installed** (no `components.json`, no Radix/`clsx`/`tailwind-merge` in `package.json`). Kept the existing hand-rolled token pattern (as AuthPanel/Navbar do) rather than introducing shadcn — installing it now would violate code-standards' "never install a package without a clear reason". Worth reconciling architecture.md later.

- **06 Profile Save Logic**: `/profile` now reads and writes real data. `lib/profile.ts` (form↔row mapping + the completion model), `actions/profile.ts` (`saveProfile`, `saveResume`), `ProfileForm` wired to the action, `app/profile/page.tsx` loading the row server-side, and `ResumeUpload` uploading to Storage for real.
  - **A prior session built most of this without recording it.** `lib/profile.ts`, `actions/profile.ts` and the `ProfileForm` wiring already existed as untracked files, but `page.tsx` was never updated to match — the tree did not compile (`TS2741: Property 'initialValues' is missing`). The existing work was kept, not rebuilt. Lesson: run `/remember save` before ending a session, or the next one starts from a stale picture.
  - **Resume uploads from the browser client, not a Server Action.** `library-docs.md:205` prescribes `createBrowserClient()` so the upload carries the user's access token for Storage RLS, and Next.js Server Actions default to a **1MB** body limit while the dropzone promises 5MB. The client uploads, then `saveResume(url, key)` persists the pointer server-side.
  - **Upload first, remove the superseded object second** — deliberately inverting `library-docs.md:202`'s literal "remove before uploading" ordering. That rule exists to stop orphaned auto-renamed files accumulating, which this ordering also achieves, while never leaving the user resumeless if the upload fails. A failed `remove()` is logged and does **not** fail the save — an orphan is recoverable, a lost pointer is not.
  - **`saveResume` re-checks the key prefix.** The client supplies `key`, so the action rejects anything not starting `${user.id}/` — the same predicate the `storage.objects` RLS policy enforces, applied again rather than trusted.
  - **Both writes are partial upserts, which is what makes them safe.** PostgREST's `upsert` only writes the columns present in the payload, so `saveProfile` (whose `ProfileWrite` has no resume columns) cannot clobber an uploaded resume, and `saveResume` cannot clobber the form. It also means a resume can be uploaded before the profile row exists — every column but `id` is nullable or defaulted. Note this needs **both** INSERT and UPDATE grants + policies, since upsert compiles to `INSERT … ON CONFLICT DO UPDATE`; Feature 04 granted both.
  - **`.upsert()` is real despite being absent from `@insforge/sdk`'s `.d.ts`** — `Database` wraps `postgrest-js`, which supplies the method and its types. Grepping the SDK package alone is misleading.
  - **Session email seeds the completion model** (`toCompletionInput`). `email` is 1 of the 10 required fields but is read-only and only reaches the row on first save, so a new user would otherwise see an `EMAIL` missing-pill beside an already-filled email input. Denominator stays 10, so the design's percentages are unchanged.
  - **The completion banner is hidden at 100%**, decided at the page level so `CompletionIndicator` stays presentational. The design only ever specifies the attention state; telling a user with a complete profile that it "needs attention" would be wrong, and a success variant would invent styling the design never specified.
  - **No new PostHog event.** `profile_completed` was already wired and is guarded to the false→true `is_complete` transition, so it fires once and never re-fires on later saves.
  - **No link to the stored resume.** The `resumes` bucket is private with path-scoped RLS, so a plain `<a href>` to `resume_pdf_url` would not carry the access token. The card reports that a resume is on file instead; serving it needs `storage.download()` or a signed URL, which Features 07/08 will need anyway.
  - Verified: `tsc --noEmit` exit 0, `eslint` exit 0, `next build` compiled successfully with `/profile` correctly dynamic (`ƒ`). **Runtime round-trip not yet exercised** — see the verification checklist in the Feature 06 plan; email/password auth now makes a real authenticated session obtainable for the first time.

- **Post-`/review` fixes (Feature 06)**: review found 10 issues — 1 critical, 3 important, 6 minor. **9 fixed; the critical one is not code.**
  - **Code — file input never reset (the only defect a user would have hit).** `<input type="file">` fires no `change` event when the same file is selected twice, so retrying after a rejection, or replacing a resume with an identically-named file, silently did nothing. Now cleared via `event.target.value = ""` after every selection. Applies to any future file input.
  - **Code — numeric fields now reject bad input at the keystroke.** `TextField` gained `numeric` + `maxLength`; Years of Experience and Graduation Year filter to digits and set `inputMode="numeric"`. Previously `"abc"` parsed to `null` silently, so the field looked saved while the banner kept listing it missing. `parseGradYear` independently clamps to 1900–(current year + 10) — the form is not trusted as the only guard.
  - **Code — fully-blank work-experience roles are dropped on save.** Clicking "Add role" and saving wrote an empty object into the JSONB array. Only *entirely* empty roles are filtered, so a partially-filled role never loses data.
  - **Code — `ProfileForm`'s root is now a `<form>`** with a `type="submit"` button, so Enter saves. Safe only because every other button in the subtree is explicitly `type="button"` and `TagInput` preventDefaults Enter — **preserve both when adding controls.**
  - **Docs — `library-docs.md` prescribed `posthog.shutdown()`, which would have broken analytics.** The server client is a process-wide singleton, so `shutdown()` would tear it down for every subsequent request in that process, silently. All 10 call sites already used `flush()`; the doc was wrong, not the code. Section rewritten with an explicit "never call shutdown()" rule and the real `getPostHogClient()` singleton.
  - **Docs — `library-docs.md`'s @react-pdf section still showed the dead storage API** (`upload(path, buffer, { contentType, upsert: true })`) that the same file's Storage section had already corrected — it would have misled Feature 08 directly. Now shows the two-arg signature, the `Buffer` → `Blob` wrap that `upload()` requires, and persisting both `url` and `key`.
  - **Docs — `build-plan.md` still specified `upsert: true`** in both 06 and 08. Corrected in place, preserving the intent (one active resume, replace not accumulate) while naming the real mechanism and pointing at `saveResume` as the reference implementation.
  - **Docs — `code-standards.md`'s env table named a variable and a file that do not exist** (`NEXT_PUBLIC_POSTHOG_KEY` in `lib/posthog-client.ts`). Reality is `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` in `lib/posthog-server.ts` + `instrumentation-client.ts`. Anyone provisioning a fresh environment from that table would have got silently broken analytics. Also flagged which listed variables are contracts for unbuilt features rather than present in `.env.local`.
  - **Docs — `architecture.md` reconciled with reality.** Its boundary table forbade DB calls in `components/` while its own client pattern sanctioned Storage there; added an explicit Storage carve-out so the working `ResumeUpload` isn't "fixed" later. Removed shadcn/ui from the stack, `components/ui/` from the tree, and the never-built `ResumePreview.tsx`; added the three field primitives. Recorded *why* shadcn is deliberately not used, so it doesn't get reinstated.
  - **Not fixed — orphaned storage objects.** A failed `remove()` in `saveResume` is still logged and swallowed. That remains the deliberate trade (an orphan is recoverable, a lost pointer is not); no sweep exists.
  - **Not fixed — the critical item: Feature 06 has still never executed.** `tsc`, `eslint` and `next build` all pass, but no row has been written to InsForge and no object to Storage. Unproven: `onConflict: "id"` round-tripping, browser upload clearing Storage RLS, second-upload removal, and `profile_completed` firing exactly once. This needs a real authenticated session — see the checklist in `memory.md`.

---

## Notes

- Root layout now uses `next/font/google` Inter (`--font-sans`) per ui-rules.md, replacing the default Geist fonts from create-next-app.
- `components/layout/` and `components/homepage/` created per architecture.md. Added `CTAButtons.tsx`, `Testimonial.tsx`, and `CTASection.tsx` to `components/homepage/` — not explicitly listed in architecture.md's folder sketch, but consistent with its naming conventions and needed to cover every section in the design.

---

## Open Items Carried Into Phase 2+

Things known to be unresolved. Check this before starting any feature — several are prerequisites, not preferences.

**Blocking / do first**

- **Feature 06's runtime round-trip has never been executed.** Static checks all pass, but nothing has been written to InsForge or Storage. Unproven: `onConflict: "id"` round-tripping, browser upload clearing Storage RLS, second-upload removal, `profile_completed` firing exactly once. Needs a real authenticated session (email/password auth now makes one obtainable). Checklist in `memory.md`.
- **Nothing can read the private resume back.** `resumes` is private with path-scoped RLS, so `resume_pdf_url` is not directly fetchable — no `storage.download()` or signed-URL helper exists yet. **Feature 07 cannot parse a resume until this is built.**

**Prerequisites for unbuilt features**

- **Dependencies not installed:** `openai` + `pdf-parse` (07), `@react-pdf/renderer` (08), `zod` (10/13), `@browserbasehq/sdk` + `@browserbasehq/stagehand` (13).
- **`recharts` (Feature 17) is missing from code-standards' approved-dependency list.** That list is a hard gate — add it there *before* installing, or 17 stalls on the project's own rules.
- **Env vars not set:** `OPENAI_API_KEY` (07), `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` (10), `BROWSERBASE_API_KEY` / `BROWSERBASE_PROJECT_ID` (13).
- **`lib/utils.ts` with `MATCH_THRESHOLD = 70`** is mandated by code-standards but does not exist. Needed from Feature 10.
- **`/find-jobs` is already protected by `proxy.ts` but the route does not exist** — currently an auth-guarded 404 until Feature 09.
- **`app/dashboard/page.tsx` is a placeholder.** Replace its body when Phase 5 starts; do not extend it.

**Design / consistency debt**

- **3-level nested border-radius in Work Experience** (card `rounded-2xl` → role box `rounded-xl` → input `rounded-md`) breaches ui-rules' "max 2 levels" but is design-mandated. Kept the design; flattening the role box is a ~1-line change. **Awaiting a decision.**
- **Label-casing mismatch blocks form-field unification.** `TextField`'s input token exactly matches `AuthPanel`'s inline input, but profile uses an uppercase caption and AuthPanel does not. Reconcile the casing before trying to share one component across auth + profile.

**Deployment**

- Production `NEXT_PUBLIC_APP_URL` and its OAuth callback added to InsForge's `allowedRedirectUrls` — neither exists yet.
- The backend is a `nano` instance and intermittently 504s on slow DB/migration operations. Retry works; re-query state rather than blindly re-running.
