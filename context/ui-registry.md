# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

File: `components/layout/Navbar.tsx`
Last updated: 2026-07-08

| Property         | Class                                             |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                      |
| Border            | `border-b border-border`                          |
| Height            | `h-16`                                            |
| Container         | `mx-auto max-w-[1440px] px-6`                     |
| Text — inactive   | `text-sm font-medium text-text-dark`              |
| Hover state       | `hover:text-accent`                                |
| Logo mark         | `h-9 w-9 rounded-[10px] bg-logo-gradient`          |
| Logo wordmark     | `text-[19px] leading-7 font-bold text-text-darkest` |

**Pattern notes:**
Header padding is `px-6` (24px) — intentionally tighter than the 32px page-section padding used elsewhere, per ui-rules.md. Nav items have no active-state styling on marketing pages; active/purple state is reserved for real in-app navigation.

### Footer

File: `components/layout/Footer.tsx`
Last updated: 2026-07-08

| Property   | Class                                                                |
| ---------- | --------------------------------------------------------------------- |
| Background | `bg-surface`                                                         |
| Border     | `border-t border-border`                                             |
| Container  | `mx-auto max-w-[1440px] px-6 py-8`                                   |
| Links      | `text-sm font-medium text-text-secondary hover:text-accent`          |

**Pattern notes:**
Shares the same logo mark markup as Navbar (`bg-logo-gradient`, `rounded-[10px]`, `h-9 w-9`) — keep both in sync if the logo changes.

### Primary / Secondary Button (CTAButtons)

File: `components/homepage/CTAButtons.tsx`
Last updated: 2026-07-08

| Property           | Class                                                                    |
| ------------------ | --------------------------------------------------------------------- |
| Primary background | `bg-text-darker`                                                       |
| Primary text       | `text-accent-foreground`                                              |
| Secondary bg       | `bg-surface`                                                           |
| Secondary border   | `border border-border`                                                 |
| Secondary text     | `text-text-primary`                                                    |
| Shared             | `rounded-md px-4 py-2 text-sm font-medium`                              |

**Pattern notes:**
`bg-text-darker` (#36394a) is the dark CTA button color used throughout marketing sections (Hero and CTASection) — not `bg-accent`. Reuse this exact component rather than re-implementing the button pair elsewhere on the homepage.

### Hero / Bottom CTA gradient panel

File: `components/homepage/Hero.tsx`, `components/homepage/CTASection.tsx`
Last updated: 2026-07-08

| Property      | Class                                    |
| ------------- | ----------------------------------------- |
| Background    | `bg-hero-gradient` (utility class, globals.css) |
| Radius        | `rounded-2xl`                            |
| Padding       | `px-8 py-20` (`md:py-28` for Hero)        |
| Heading       | `text-4xl md:text-5xl font-bold text-text-primary` |
| Subheading    | `text-base text-text-secondary`          |

**Pattern notes:**
`bg-hero-gradient` and `bg-logo-gradient` are defined as plain CSS classes in `globals.css` (below the `@theme` block) built from new tokens `--color-gradient-blue`, `--color-gradient-pink`, and `--color-accent-deep`. This keeps all hex values confined to globals.css per the no-hardcoded-color rule — components only ever reference the class name.

### Feature list item (bordered list)

File: `components/homepage/HowItWorks.tsx`, `components/homepage/Features.tsx`
Last updated: 2026-07-08

| Property        | Class                                            |
| ---------------- | ------------------------------------------------- |
| Wrapper          | `divide-y divide-border border-t border-border`  |
| Item spacing     | `py-6 pl-6`                                      |
| Item border      | `border-l-2` + `border-accent` (highlighted) or `border-border` (default) |
| Item heading     | `text-base font-semibold text-text-primary`      |
| Item description | `mt-2 text-sm text-text-secondary`               |

**Pattern notes:**
Exactly one item per section is visually highlighted with a colored left border to match the design — `border-accent` (purple) in HowItWorks, `border-success` (green) in Features. Use `border-border` for all non-highlighted items.

### Image showcase panel

File: `components/homepage/HowItWorks.tsx`, `components/homepage/Features.tsx`
Last updated: 2026-07-08

| Property   | Class                          |
| ---------- | ------------------------------- |
| Background | `bg-surface-tertiary`          |
| Radius     | `rounded-2xl`                  |
| Padding    | `p-6`                          |

**Pattern notes:**
Wraps the static marketing screenshots (`jobs-lists.png`, `agnet-log.png`) from `public/images/`. These are pre-made design assets, not live components — never rebuild them as coded UI.

### Login page (split marketing panel + OAuth card)

File: `app/(auth)/login/page.tsx`
Last updated: 2026-07-09

| Property         | Class                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Background        | `bg-surface` (card), `bg-background` (page), `bg-hero-gradient` (left panel) |
| Border            | `border border-border`                                               |
| Border radius     | `rounded-2xl` (outer card), `rounded-md` (buttons), `rounded-full` (badge) |
| Shadow            | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (matches Cards token in ui-tokens.md) |
| Text — primary    | `text-text-primary` (headline, wordmark, button label)                |
| Text — secondary  | `text-text-secondary` ("Welcome to" label, subheading, badge label)   |
| Text — muted      | `text-text-muted` (bottom caption)                                    |
| Spacing           | `p-6 lg:p-10` (page), `px-16 py-16` (left panel), `px-6 py-16` (right panel), `px-4 py-3` (buttons — taller than the standard `py-2` Secondary Button token) |
| Hover state       | `hover:bg-surface-secondary` (OAuth buttons)                          |
| Accent usage      | `text-accent` on badge icon and both OAuth provider icons              |
| Left headline     | `text-4xl font-bold text-text-primary md:text-5xl` (matches Hero heading scale) |
| Trust badge       | `inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary` + `ShieldCheck` icon |
| Wordmark heading  | `text-3xl font-bold text-text-primary`                                |
| Error banner      | `rounded-md bg-accent-muted px-3 py-2 text-xs text-text-secondary`   |

**Pattern notes:**
Reuses `bg-hero-gradient` (the same mesh-gradient utility as the homepage Hero/CTA panels) for the left marketing panel instead of inventing a new gradient. Google and GitHub are represented with generic lucide icons (`Globe`, `GitFork`) in accent purple rather than brand-colored logo marks — `lucide-react@1.23.0` doesn't ship brand/logo icons, and this reads cleaner than mixed-brand-color icons next to the purple accent system anyway. Below the `lg` breakpoint the left panel is dropped entirely and the card collapses to just the sign-in column.

**Updated 2026-07-22 (email/password auth):** the right column's entire form area now delegates to the **AuthPanel** component (see entry below). The page stays a Server Component — it still does the authenticated-redirect and `sign_in_page_viewed` capture — and renders `<AuthPanel initialError={errorMessage} />` in place of the inline OAuth card. The OAuth `<form action={initiateOAuth.bind(...)}>` markup moved *into* AuthPanel (it works identically inside a client component). The old inline error banner (`bg-accent-muted … text-text-secondary`) was removed; error display now lives in AuthPanel with a clearer red-text style (see note there).

### Dashboard placeholder (temporary — pre–Phase 5)

File: `app/dashboard/page.tsx`, `components/auth/SignOutButton.tsx`
Last updated: 2026-07-16

| Property      | Class                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Page          | `flex min-h-screen items-center justify-center bg-background p-6`             |
| Card          | `w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center` (Cards token — corrected from `p-8`) |
| Shadow        | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (matches Cards token) |
| Success icon  | `mx-auto h-10 w-10 text-success` (lucide `CheckCircle2`)                       |
| Heading       | `mt-4 text-2xl font-bold text-text-primary`                                    |
| Email         | `mt-2 text-sm text-text-secondary`                                             |
| Caption       | `mt-6 text-xs text-text-muted`                                                |
| Sign-out button | `w-full rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary` (Secondary Button token) |

**Pattern notes:**
Not the real Dashboard — that's Phase 5 (`14 Dashboard Page — Full UI` in `build-plan.md`) with stat cards, recent activity, and charts. This is a minimal stand-in so the post-login redirect (`/dashboard`) doesn't 404 while Phases 2–4 are still unbuilt; it only proves the sign-in round trip and adds a sign-out path. Replace the body entirely when Phase 5 starts — don't extend this placeholder.

Sign-out button is its own `"use client"` component (`components/auth/SignOutButton.tsx`) rather than inline markup in the page — it needs to call `posthog.reset()` (posthog-js, browser-only) on click before the surrounding `<form action={signOutUser}>` submits, so the page itself can stay a Server Component.

### AuthPanel (email/password + OAuth, in-page modes)

File: `components/auth/AuthPanel.tsx`
Last updated: 2026-07-22

| Property           | Class                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Container          | `w-full max-w-sm`                                                                               |
| Input field        | `w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent` (exact Input Fields token) |
| Field label        | `mb-1.5 block text-xs font-medium text-text-secondary`                                          |
| Primary button     | `flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60` (Primary Button token — `bg-accent`) |
| Secondary/OAuth button | `flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary` |
| Error banner       | `rounded-md border border-border bg-surface-secondary px-3 py-2 text-xs text-error`             |
| Success banner     | `rounded-md bg-success-lightest px-3 py-2 text-xs text-success-foreground`                      |
| Mode / inline link | `text-xs font-medium text-accent hover:underline`                                              |
| Divider            | `h-px flex-1 bg-border` with `text-xs text-text-muted` centered label                          |
| Mode title         | `text-lg font-semibold text-text-primary`                                                       |
| Wordmark heading   | `text-3xl font-bold text-text-primary`                                                          |
| Form spacing       | `flex flex-col gap-3`, sections separated by `mt-6`                                             |
| Accent usage       | `text-accent` on links, OAuth icons; `bg-accent` on primary submit                             |

**Pattern notes:**
Single client component driving five in-page modes (`signin` · `signup` · `verify` · `forgot` · `reset`) via local `useState` — no separate routes, matching architecture.md which only defines `/login`. Calls the `actions/auth.ts` server actions directly inside `useTransition`; actions that establish a session (`verifyEmailCode`, `signInWithPassword`) redirect server-side, so a resolved return value always means the flow stayed on-page (an error or a mode advance). Password strength is validated client-side against the 5-rule checklist (12 chars + upper + lower + number + special) for instant feedback, but InsForge enforces it authoritatively server-side.

This is the project's first **`bg-accent` (purple) primary button** — it follows the Primary Button token in ui-tokens.md. Note the homepage CTAs deliberately use `bg-text-darker` instead (a marketing variant); in-app primary actions use `bg-accent`. Buttons keep the login page's taller `py-3` (not the standard `py-2`) to match the OAuth buttons they sit beside.

**Consistency flag:** the error banner here (`bg-surface-secondary` + `text-error`) intentionally replaces the previous login error style (`bg-accent-muted` + `text-text-secondary`), which read as purple rather than an error. Future error banners should match **this** red-text pattern; the old one is retired. The success/notice banner (`bg-success-lightest` + `text-success-foreground`) is new and should be the standard for inline success messages.
