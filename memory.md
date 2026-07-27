# Memory — Feature 06 (Profile Save Logic) built + reviewed + fixed

Last updated: 2026-07-27

## What was built

**Feature 06 — Profile Save Logic**, Phase 2, then a full `/review` pass and 9 fixes. `/profile` now reads and writes real InsForge data. Not committed; working tree holds Features 05 + 06 stacked together.

Roughly 70% of 06 already existed as untracked files from a session that ended without `/remember save` — kept, not rebuilt, but it had left the tree not compiling.

**Feature 06 build:**

- `lib/profile.ts` — added `toCompletionInput(row, sessionEmail)`. Mapping (`rowToFormValues`, `formValuesToRow`), `ProfileWrite`, `CompletionInput`, the 10-field completion model and `getProfileCompletion` all pre-existed.
- `actions/profile.ts` — added `saveResume(url, key)`. `saveProfile` pre-existed.
- `app/profile/page.tsx` — rewritten. Reads the row server-side, derives completion, renders the banner only when incomplete, passes `initialValues` / `userId` / `resumeUrl` down. Extracts `userId`+`email` as scalars rather than coupling to `UserSchema`'s shape. `redirect()` outside the try block.
- `components/profile/ResumeUpload.tsx` — rewritten. Real browser-client upload, `Status` discriminated union, PDF+5MB validation before any network call.

**Post-review fixes (9 of 10 findings):**

- `ResumeUpload` — file input cleared (`event.target.value = ""`) after every selection.
- `TextField` — new `numeric` + `maxLength` props; digits-only filtering + `inputMode="numeric"`. Applied to Years of Experience (2) and Graduation Year (4).
- `lib/profile.ts` — `parseGradYear` clamped to 1900–(current year + 10); fully-blank work-experience roles filtered out in `formValuesToRow`.
- `ProfileForm` — root is now a `<form>` with a `type="submit"` button, so Enter saves.
- Docs corrected: `library-docs.md` (PostHog `shutdown()`→`flush()`, and the @react-pdf section's dead storage API), `build-plan.md` (`upsert: true` in both 06 and 08), `code-standards.md` (env table), `architecture.md` (Storage carve-out, shadcn/`ResumePreview` removed).
- `progress-tracker.md` + `ui-registry.md` updated, including a new **Open Items Carried Into Phase 2+** section in the tracker.

## Decisions made

- **Resume uploads from the browser client, not a Server Action.** `library-docs.md:205` prescribes `createBrowserClient()` for Storage RLS, and Server Actions default to a **1MB** body limit while the dropzone promises 5MB.
- **Upload first, remove the superseded object second** — inverting library-docs' literal ordering. Still prevents orphan accumulation, but never leaves the user resumeless if the upload fails. A failed `remove()` is logged and does **not** fail the save.
- **`saveResume` re-checks the `${user.id}/` key prefix** — the client supplies the key, so the storage-RLS ownership predicate is applied again rather than trusted.
- **Session email seeds the completion model** — `email` is required but read-only and only reaches the row on first save. Denominator stays 10.
- **Completion banner hidden at 100%**, decided at page level so `CompletionIndicator` stays presentational. Do not push an `isComplete` prop into it.
- **Numeric fields reject bad input at the keystroke** rather than reporting it afterwards — the old failure was silent (`"abc"` → `null`, field looks saved, banner still says missing). Server-side bounds are independent of the UI.
- **No new PostHog event.** `profile_completed` was already wired and transition-guarded.
- **shadcn/ui is deliberately not used** — recorded in `architecture.md` with reasoning so it doesn't get reinstated.

## Problems solved

- **The tree did not compile on arrival** — `TS2741: Property 'initialValues' is missing` in `page.tsx`. Fixed by wiring the page to the DB.
- **`.upsert()` looks fake but is real.** Grepping `@insforge/sdk` returns zero matches; `Database` wraps `postgrest-js`, which supplies it. Grep `node_modules/@supabase/postgrest-js` instead. Don't re-panic.
- **Partial upserts are what make two write paths safe.** PostgREST writes **only the columns in the payload**, so `saveProfile` can't clobber the resume and `saveResume` can't clobber the form — no transaction needed. Also lets a resume be uploaded before the profile row exists (every column but `id` is nullable/defaulted). Needs **both** INSERT and UPDATE grants + policies, since upsert compiles to `INSERT … ON CONFLICT DO UPDATE`; Feature 04 granted both.
- **`<input type="file">` fires no `change` event when the same file is picked twice.** Retrying after a rejection, or replacing a resume with an identically-named file, was a dead click. Any future file input must clear its value.
- **`posthog.shutdown()` would have silently broken analytics.** The server client is a process-wide singleton; `shutdown()` tears it down for every subsequent request in the process. All 10 call sites correctly use `flush()` — the doc was wrong, not the code.
- `storage.upload()` returns `{ url, key, size, bucket, uploadedAt, mimeType? }`; `url` and `key` are both non-optional. It takes `File | Blob` — **not** a Buffer (matters for Feature 08).

## Current state

- **Feature 06 is code-complete and reviewed.** `tsc --noEmit` exit 0, `eslint` exit 0 across the full tree, `next build` clean with `/profile` correctly dynamic (`ƒ`). No hardcoded hex, no raw Tailwind palette classes anywhere.
- **The runtime round-trip has still never executed.** No row written to InsForge, no object to Storage. This is the one open critical item.
- **1 review finding intentionally not fixed:** orphaned storage objects. A failed `remove()` is logged and swallowed — the deliberate trade (an orphan is recoverable, a lost pointer is not). No sweep exists.
- **Working tree not committed.** Features 05 + 06 together: new `app/profile/`, `components/profile/`, `components/layout/NavLinks.tsx`, `actions/profile.ts`, `lib/profile.ts`; modified `Navbar.tsx` + five context docs.
- Phase status: **Phase 1 complete; Phase 2 → 05 and 06 done, 07 next.**

## Next session starts with

**Decide how to close the runtime verification gap — it is the only thing between "compiles" and "works".** Two options were put to the developer and neither was chosen yet:

1. **Developer drives it** — `npm run dev`, sign up with a real inbox, walk the checklist. Slower but exercises the real path including email verification.
2. **Claude drives it via a throwaway InsForge branch** — the technique Features 04 and email/password both used (schema-only branch, verification disabled, script the round-trip, delete the branch). Faster, but creates and destroys backend state, so it **needs explicit developer authorisation** before touching project infrastructure.

The checklist either way:

1. Fresh user → `/profile` shows an empty form; banner does **not** list `EMAIL`
2. Fill required fields → Save → reload → values pre-fill from DB
3. At 100% the banner **disappears entirely**
4. `profile_completed` fires **exactly once**; saving again does not re-fire
5. Upload a PDF → reload → persists; `resume_pdf_url` *and* `resume_pdf_key` both populated
6. Upload a **second** PDF → old Storage object gone (no accumulation)
7. Non-PDF and >5MB both rejected client-side with no network call
8. Profile save after a resume upload does **not** null the resume columns, and vice versa

Then **07 AI Profile Extraction from Resume** — but see the blocker below first.

## Open questions

- **Feature 07 is blocked until a resume can be read back.** The `resumes` bucket is private with path-scoped RLS, so `resume_pdf_url` is not directly fetchable and no `storage.download()` / signed-URL helper exists. 07 cannot parse a PDF it cannot fetch. Build this first.
- **Nested border-radius, unanswered since Feature 05** — Work Experience is 3 levels (`rounded-2xl` → `rounded-xl` → `rounded-md`) against ui-rules' "max 2 levels", but design-mandated. Flattening the role box is ~1 line. **Awaiting a yes/no.**
- **Form-field unification** — `TextField`'s input token matches `AuthPanel`'s, but profile uses an uppercase caption and AuthPanel does not. Reconcile casing before sharing one component.
- **`recharts` (Feature 17) is not on code-standards' approved-dependency list** — that list is a hard gate; add it there before installing.

_Full prerequisite list (missing deps, env vars, `lib/utils.ts`, `/find-jobs` route, deployment items) now lives in `progress-tracker.md` → "Open Items Carried Into Phase 2+" rather than only here._

_Parked (developer closed these): inbox-test the emailed-code happy paths on first real email; delete the merged `feat/database-schema` branch; the `nano` backend intermittently 504s on slow DB ops — retry works, re-query state rather than re-running blindly._
