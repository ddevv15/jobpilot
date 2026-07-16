# Memory — Phase 1: Foundation

Last updated: 2026-07-11

## What was built

- **02 Auth — complete.** InsForge Google + GitHub OAuth via `@insforge/sdk` (not `@insforge/ssr` — that package doesn't exist).
  - `lib/insforge-client.ts`, `lib/insforge-server.ts` — browser/server client instances
  - `actions/auth.ts` — `initiateOAuth()` Server Action (PKCE init via `createAuthActions()`)
  - `app/api/auth/callback/route.ts` — server-side code exchange, sets httpOnly refresh cookie
  - `app/api/auth/refresh/route.ts` — `createRefreshAuthRouter()`
  - `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) — `updateSession()` + redirects unauthenticated visits to `/dashboard`, `/profile`, `/find-jobs`, `/find-jobs/[id]` to `/login`; redirects authenticated visits to `/login` to `/dashboard`
  - `app/(auth)/login/page.tsx` — redesigned as a two-column split layout (gradient marketing panel + OAuth card) matching a reference screenshot the user shared
  - `insforge.toml` — whitelists `http://localhost:3000/api/auth/callback` in `allowedRedirectUrls` (applied via CLI)
- Corrected stale InsForge SDK docs across `context/library-docs.md`, `context/architecture.md`, `context/code-standards.md` (were describing a nonexistent `@insforge/ssr` package)
- Updated `context/progress-tracker.md` and `context/ui-registry.md` per `AGENTS.md`'s post-feature rule

## Decisions made

- OAuth callback is a Route Handler (`app/api/auth/callback/route.ts`), not the page originally sketched in `architecture.md` (`app/(auth)/callback/page.tsx`) — SSR OAuth requires the code exchange to happen server-side so the refresh token can be written httpOnly.
- Login page auto-redirects an already-authenticated visitor from `/login` to `/dashboard` (server-side `getCurrentUser()` check).
- Login page redesigned to a two-column split (gradient left panel with trust badge/headline/subheadline, OAuth card on right) per a reference screenshot — reuses the existing `bg-hero-gradient` utility rather than inventing a new gradient, and uses generic lucide icons (`Globe`, `GitFork`) in accent purple instead of brand-colored logos since `lucide-react@1.23.0` ships no brand icons.
- Google/GitHub OAuth apps confirmed already registered with InsForge's provider callback URL — no external provider dashboard work needed.

## Problems solved

- `library-docs.md`, `architecture.md`, and `code-standards.md` all documented a nonexistent `@insforge/ssr` package and wrong method names (`getUser()` instead of `getCurrentUser()`, `insforge.from()` instead of `insforge.database.from()`, a `getPublicUrl()` method that doesn't exist). Fixed all three against the actual installed `@insforge/sdk@^1.4.3` API.
- Next.js 16 renamed `middleware.ts` → `proxy.ts` (exported function must be named `proxy`) — confirmed via the installed `node_modules/next/dist/docs`, not assumed from training data.
- `updateSession()` resolves `{ refreshed, accessToken, error }` — no `user` field — so `proxy.ts` checks `accessToken` presence, not a `user` object.
- `createAuthActions().exchangeOAuthCode()` strips `accessToken`/`refreshToken` from its returned `data` by design (written straight to cookies) — the callback route checks `data.user` for success, not `data.accessToken`.
- `NextRequest.cookies` (`RequestCookies`) doesn't structurally satisfy the SDK's `CookieStore` type for `updateSession()`'s `requestCookies` param — fixed with a minimal read-only `{ get }` adapter.
- `lucide-react@1.23.0` ships no brand/logo icons (no `Github`, no Google) — used inline SVGs first, then switched to generic `Globe`/`GitFork` icons in the redesign.
- Dev server showed `Could not find the module .../global-error.js#default in the React Client Manifest` — caused by running `npm run build` immediately followed by `npm run dev`, leaving conflicting manifests in `.next`. Fixed by killing the dev process and deleting `.next`.

## Current state

- **Phase:** Phase 1 — Foundation
- **Done:** 01 Homepage, 02 Auth
- **Not started:** 03 PostHog Initialization, 04 Database Schema
- OAuth flow verified in a real browser up to the point of external control: unauthenticated visits to all four protected routes redirect to `/login`; both OAuth buttons correctly reach Google's and GitHub's real consent/login screens with valid InsForge PKCE state. **Not yet verified:** completing a real sign-in and landing on `/dashboard` (needs live provider credentials — worth the user trying manually).
- Login page redesigned and visually verified at desktop (1440px) and mobile (414px) widths, plus the error-banner state.
- `insforge.toml` is new in the repo (tracks the `allowedRedirectUrls` change) — not yet committed.
- Production `NEXT_PUBLIC_APP_URL` and a production callback whitelist entry are not yet set up — only `localhost:3000` is configured.

## Next session starts with

**03 PostHog Initialization** — see `context/build-plan.md` for the spec. Before implementing, check for a PostHog MCP server / skill and fetch current docs the same way InsForge docs were fetched this session (the project's `library-docs.md` priority order: MCP → skills → `library-docs.md` → training knowledge). Also worth doing first: have the user manually complete a real Google or GitHub sign-in to confirm the `/dashboard` redirect actually works end-to-end (not yet observed with a live session).

## Open questions

- Is the `next.config.ts` turbopack root change (carried over from before this session) intentional/needed? Still unresolved — flagged last session too.
- Should `insforge.toml` be committed now, or held until production config is also finalized?
- Production `NEXT_PUBLIC_APP_URL` and production OAuth redirect whitelist — not yet defined, needed before deploying.
