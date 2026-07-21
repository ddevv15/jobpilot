# Memory — 04 Database Schema (Phase 1 complete)

Last updated: 2026-07-21 17:59

## What was built

- **04 Database Schema — complete and verified.** Backend was a clean slate before this session (zero tables, zero buckets, no `migrations/` directory).
- **`migrations/20260721110500_create-schema.sql`** — `profiles`, `agent_runs`, `jobs`, `agent_logs`. RLS enabled on all four, 11 owner-only policies, narrowed grants, 12 indexes, `updated_at` trigger on `profiles`.
- **`migrations/20260721111346_storage-resumes-rls.sql`** — path-scoped RLS on `storage.objects` for the `resumes` bucket.
- **Private `resumes` storage bucket** created via CLI.
- **`types/index.ts`** — `Profile`, `Job`, `AgentRun`, `AgentLog`, `CompanyResearch`, plus the union types for every CHECK-constrained column. `tsc --noEmit` exits 0.
- **Docs corrected:** `context/architecture.md` (FK targets, `resume_pdf_key`, storage section), `context/library-docs.md` (Storage section rewritten), `context/progress-tracker.md` (04 ticked, all decisions + drifts recorded), `.gitignore` (`.mcp.json` added).

## Decisions made

- **Ownership FKs point at `auth.users(id)`, not `profiles(id)`** as `architecture.md` originally said. Every policy is a direct `user_id = (SELECT auth.uid())` check. The real reason: FKs pointing at `profiles` meant no job row could be inserted before a profile row existed — an ordering dependency the build plan never states.
- **`is_complete` is the only persisted completion state.** Completion percentage and missing-field tags are derived in app code in Phase 2, despite `build-plan.md:113` saying "calculated and saved" — storing them means recomputing on every write and going stale when required-field rules change.
- **No "tailored fields" on `jobs`** despite `build-plan.md:73` asking for them. Resume tailoring and cover letters are explicitly out of scope in `project-overview.md`.
- **No `CHECK` on `jobs.job_type`** — deliberate exception. It maps straight from Adzuna's `contract_type`, which emits values (`permanent`, `part_time`) outside architecture.md's set. A constraint would reject live Adzuna rows in Feature 10.
- **Minimal grant surface:** `REVOKE ALL` from `anon`/`authenticated` first (InsForge pre-grants broad DML), then grant back only what features perform. No `DELETE` on any table. `agent_logs` is append-only.
- **Feature 04 ships the TypeScript types**, not just DB objects — the types are the schema's contract and Phase 2 needs them immediately.

## Problems solved

- **`library-docs.md` documented a Storage API that does not exist.** Real signature is `upload(path, file)` — no options object, no `contentType`, and **no `upsert`**. The documented `upsert: true` does not overwrite; **the backend auto-renames on key collision**. Consequences: `resume_pdf_key` had to be added to `profiles` (the key is NOT derivable from the user id), and Features 06/08 must `remove()` the old object before uploading or orphaned files accumulate. Same drift class as the 02 Auth discovery — do not trust `library-docs.md` for InsForge APIs without checking `npx @insforge/cli docs <feature> typescript`.
- **`storage.objects` shipped with RLS DISABLED and zero policies** on this backend (v2.2.6), contradicting InsForge's own docs which claim it ships enabled. A `--private` bucket alone therefore meant "any signed-in user", not "own files only". Without the second migration, any authenticated user could have read any other user's resume once Feature 06 started uploading.
- **`turbopack.root` in `next.config.ts` is required — do not remove.** There is a stray `package-lock.json` in the user's home directory (`/Users/ddevv15/package-lock.json`). Turbopack walks up looking for lockfiles, so without the explicit root it resolves to the home folder and traces everything in it. Cosmetic note: `path.join(__dirname)` is a redundant single-arg wrapper.
- **Testing RLS with real sessions required a workaround.** No OAuth credentials available, and email/password signup is blocked because `require_email_verification = true` while `[auth.smtp] enabled = false` — verification can never complete. Solved by creating a throwaway schema-only backend branch, disabling verification on the branch only, testing there, then deleting it. Production auth config was never modified.

## Current state

- **Phase 1 — Foundation is complete.** 01 Homepage, 02 Auth, 03 PostHog, 04 Database Schema all done. Phase 2 not started.
- **RLS is proven, not just inspected — 12/12 assertions passed** under real authenticated sessions: user B sees zero rows across all tables (including when filtering explicitly by user A's id), B is blocked from inserting a row owned by A (confirms `WITH CHECK`), `DELETE` returns 403 (confirms the narrowed grant surface), `anon` returns 401.
- Catalog-verified: 4 tables `rowsecurity=true`, 11 policies correctly shaped with no `USING (true)`, `anon` privilege count 0, 12 indexes, trigger present, 11 CHECK constraints, `storage.objects` RLS on with 4 path-scoped policies, security advisor clean.
- **`AGENTS.md` is broken.** Something overwrote it with generic InsForge SDK boilerplate (136 lines, opens with `alwaysApply: true` and a "Download Template" instruction), destroying the project's read-order, "Rules That Never Change", and skills list. `agent1.md` was also deleted. Both recoverable from commit `35cc0ab`. **Not yet restored.**
- **The InsForge admin API key was rotated** this session (it was hardcoded in `.mcp.json`, untracked but unignored). The key lives in three places — `.mcp.json`, `.env.local`, `.insforge/project.json` — all updated and verified working. `.mcp.json` is now gitignored. Old key expired 2026-07-22T12:26Z.
- **Everything is uncommitted.** Last commit is still `35cc0ab`. Uncommitted: `migrations/`, `types/`, `.gitignore`, the three context doc corrections, plus the pre-existing Phase 1 work.

## Next session starts with

1. **Restore `AGENTS.md`** — `git checkout HEAD -- AGENTS.md agent1.md`. Until this is done, the project's operating rules are missing from context.
2. Then start **05 Profile Page — Full UI** (Phase 2): build the complete profile page with mock data, no save logic. Run `/architect` first per the project rules.

## Open questions

- Production `NEXT_PUBLIC_APP_URL` is still undefined, and the production OAuth redirect URL is not in `insforge.toml`'s `allowed_redirect_urls` (only `http://localhost:3000/api/auth/callback`). Both needed before deploying.
- Email/password auth is non-functional project-wide (`require_email_verification = true` + SMTP disabled). Harmless while the app is OAuth-only, but it blocks any future email/password path.
- Backend is on a `nano` instance and returns intermittent 504s on migration commands. Both migrations applied cleanly on retry. Instance upgrade was offered and declined (costs money).
- Should the uncommitted work be committed as one Phase 1 checkpoint or split per feature?
