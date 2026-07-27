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

**Updated 2026-07-24 (Feature 05):** `Navbar` now takes `variant?: "marketing" | "app"` (default `marketing`). The three links moved into a new `NavLinks` client component (entry below) so `usePathname()` can drive the active state; `Navbar` stays a Server Component. In `app` variant the marketing `NavbarCTA` is hidden, so `justify-between` leaves the logo left and nav right (matching the in-app design). Homepage is untouched — it uses the default `marketing` variant and pathname `/` matches no nav item, so no active highlight appears there.

### NavLinks (active in-app navigation)

File: `components/layout/NavLinks.tsx`
Last updated: 2026-07-24

| Property          | Class                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Wrapper           | `hidden items-center gap-8 md:flex`                                    |
| Link — active     | `border-b-2 border-accent pb-0.5 text-sm font-medium text-accent`     |
| Link — inactive   | `text-sm font-medium text-text-dark transition-colors hover:text-accent` |

**Pattern notes:**
`"use client"` — reads `usePathname()`; a link is active when `pathname === href` or `pathname.startsWith(href + "/")` (so `/find-jobs/[id]` keeps Find Jobs active). The active treatment is **purple text + a purple underline** (`border-b-2 border-accent`). This deliberately diverges from ui-rules.md's Navbar rule ("No underline — active state is color change only") to match `context/designs/profile.png`, which shows the active item underlined; per ui-rules.md's own "design assets are the source of truth for visual decisions", the design wins here.

### Profile completion banner (CompletionIndicator)

File: `components/profile/CompletionIndicator.tsx`
Last updated: 2026-07-27

| Property        | Class                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Card            | `flex items-center justify-between gap-6 rounded-2xl border border-error/15 bg-error/5 p-6` + Cards shadow token |
| Heading row     | `AlertCircle` (`h-5 w-5 text-error`) + `text-base font-semibold text-text-primary`                |
| Description     | `mt-2 max-w-md text-sm text-text-secondary`                                                        |
| Missing pill    | `rounded-md bg-error/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-error`     |
| Progress ring   | inline SVG donut, `viewBox 0 0 100 100`, `-rotate-90`; track `stroke-border-light`, arc `stroke-error` `strokeLinecap="round"`, `strokeWidth 8`, `r=42` |
| Ring label      | absolutely-centered `text-lg font-bold text-text-primary`                                          |

**Pattern notes:**
The "needs attention" red wash is achieved with **opacity modifiers on the `--color-error` token** (`bg-error/5`, `border-error/15`, `bg-error/10`) — not new hex, not raw palette classes — so the no-hardcoded-color rule holds. This is the project's first use of a lightly tinted card surface (all prior cards are `bg-surface` white); it's confined to this warning banner. The ring is a pure-SVG donut: `strokeDasharray = circumference`, `strokeDashoffset = circumference * (1 - percentage/100)`. Props are `percentage` and `missingFields: string[]`. **The component stays presentational — it has no notion of "complete".** Feature 06 derives both values server-side via `getProfileCompletion()` and renders the banner only when `!completion.isComplete`, so a finished profile shows nothing rather than a green variant the design never specified. Keep the show/hide decision at the call site; do not push an `isComplete` prop into this component.

### Resume upload card (ResumeUpload)

File: `components/profile/ResumeUpload.tsx`
Last updated: 2026-07-27

| Property          | Class                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Card              | `rounded-2xl border border-border bg-surface p-6` + Cards shadow token                        |
| Dropzone          | `flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border-muted px-6 py-10 text-center transition-colors hover:border-accent hover:bg-surface-secondary` |
| Upload icon badge | `flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted` + `UploadCloud` (`h-6 w-6 text-accent`) |
| Select button     | Secondary Button token (`rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium … hover:bg-surface-secondary`) |
| Generate button   | Primary Button token (`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark`) + `FileText` icon |

**Pattern notes:**
`"use client"` — the dropzone is a **`<label>` wrapping an `sr-only` `<input type="file" accept="application/pdf">`**, so clicking anywhere opens the picker natively and the input stays keyboard-focusable (Tab reaches it; `focus-within:ring-1 focus-within:ring-accent` surfaces focus on the dropzone). "Select Resume" is a styled **`<span>`, not a nested button** — avoids the button-inside-clickable-region interactive-nesting anti-pattern. `onDrop` and the input share one `handleFile` path. First project use of a **dashed** border (`border-dashed border-border-muted`) — reserved for file dropzones.

Feature 06 made the upload real. Props are `userId` and `resumeUrl: string | null`. State is a **discriminated union** `Status = idle | uploading | error | success` rather than parallel booleans, so "uploading and errored" is unrepresentable. Validation (PDF mime + 5MB cap) runs **before** any network call. While uploading, the input is `disabled` and the dropzone swaps `cursor-pointer hover:*` for `cursor-wait opacity-70` — the hover affordance is removed rather than left lying. The icon badge swaps `UploadCloud` → `CheckCircle2` once a resume exists. Feedback reuses the ProfileForm banner tokens (`bg-success-lightest`/`text-success-foreground`, `bg-surface-secondary`/`text-error`) — **match those for any future inline form feedback.** `Generate Resume from Profile` is still inert (Feature 08).

**No link to the stored file.** The `resumes` bucket is private with path-scoped RLS, so a plain `<a href>` to `resume_pdf_url` would not carry the access token. The card states that a resume is on file instead of shipping a link that would 401 — serving it needs `storage.download()` or a signed URL.

**The file input is cleared after every selection** (`event.target.value = ""`). A `<input type="file">` fires no `change` event when the same file is picked twice, so without this, retrying after a rejection — or replacing a resume with an identically-named file — was a dead click with no feedback. **Any future file input in this project must do the same.**

### Profile form (ProfileForm + field primitives)

File: `components/profile/ProfileForm.tsx`
Last updated: 2026-07-27

| Property           | Class                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Card               | `<form>` element carrying `rounded-2xl border border-border bg-surface p-6` + Cards shadow token         |
| Card title         | `text-base font-semibold text-text-primary` + subtitle `mt-1 text-sm text-text-secondary`               |
| Section wrapper    | `mt-6 border-t border-border pt-6` (hairline divider between each of the 5 sections)                     |
| Section heading    | `mb-4 text-sm font-semibold text-text-primary`                                                            |
| Field grid         | `grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2`; full-width fields use `sm:col-span-2`                 |
| Field caption      | `mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary` (shared by every field primitive) |
| Field primitives   | **TextField / SelectField / TagInput** — canonical field classes live in their own entries below |
| Work-experience box| `rounded-xl border border-border p-4` per role                                                            |
| "Currently working"| native checkbox `h-4 w-4 rounded border-border accent-accent` (purple via `accent-accent`)               |
| "+ Add role" link  | `flex items-center gap-1 text-sm font-medium text-accent hover:underline` + `Plus` icon                  |
| Save button        | full-width Primary (`w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-dark`) |

The three reusable field primitives (`TextField`, `SelectField`, `TagInput`) have their own entries below — **build any future form field by matching those**, not by re-deriving input styles.

**Pattern notes:**
`"use client"` — a single `useState<ProfileFormState>` seeded from an in-file `MOCK_PROFILE`; a generic `setField<K extends keyof State>(key, value)` keeps every field type-safe. Each work-experience role carries a **stable `id`** (`crypto.randomUUID()` on add; a fixed literal for the mock role) used as the React `key` and for `updateRole`/`removeRole` — never the array index, so removing a middle role can't desync inputs. Interactions (edit, add/remove skill & industry pills, add role up to 3, toggle "Currently working here" which clears+disables End Date) are wired to local state. Feature 06 replaced `MOCK_PROFILE` with an `initialValues: ProfileFormValues` prop seeded server-side from the DB row, and `Save Profile` now calls the `saveProfile` Server Action inside `useTransition` — the button disables and reads "Saving…" while pending, and a `role="status"` banner reports the result above it.

**The card root is a `<form>`, not a `<section>`** (Feature 06 review). `Save Profile` is `type="submit"` and Enter in any text field now saves — previously nothing happened. This is only safe because **every other button in the subtree is explicitly `type="button"`** (Add role, Remove, and TagInput's Add / remove-tag), and `TagInput` calls `preventDefault()` on Enter so tag entry adds a tag instead of submitting. **Keep both invariants when adding controls to this form** — an unmarked `<button>` defaults to `type="submit"` and would silently save the profile. Dates use native `<input type="month">`; dropdowns are native `<select>`. The **Cover Letter Tone** dropdown that build-plan 05 lists is intentionally **omitted** — it isn't in the design and cover-letter generation is out of scope (project-overview.md). `accent-accent` is the first use of Tailwind's `accent-color` utility for a native form control.

**Return types:** all Feature-05 components (and the modified `Navbar`) carry explicit `: JSX.Element` return annotations (async page → `Promise<JSX.Element>`) per code-standards' "all return types must be explicitly typed", importing `type JSX` from `react`. Pre-existing components (AuthPanel, Footer, homepage) still omit these — reconcile opportunistically, not as part of this feature.

### TextField (form text input)

File: `components/profile/TextField.tsx`
Last updated: 2026-07-27

| Property           | Class                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Wrapper            | `<label className="block …">` (implicit label association; `className` prop adds `sm:col-span-2` etc.) |
| Caption            | `mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary`            |
| Background         | `bg-surface` (read-only → `bg-surface-secondary`)                                          |
| Border             | `border border-border`                                                                     |
| Border radius      | `rounded-md`                                                                               |
| Text — value       | `text-sm text-text-primary`                                                                |
| Text — placeholder | `placeholder:text-text-muted`                                                              |
| Spacing            | `px-3 py-2`                                                                                |
| Focus state        | `focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`                    |
| Read-only state    | `cursor-not-allowed bg-surface-secondary text-text-secondary`                              |

**Pattern notes:**
The Input Fields token from ui-tokens.md, extracted as a reusable primitive. `optional` prop appends "(Optional)" to the uppercased caption; also used for `type="month"` date fields. Any future single-line form field should render this component rather than re-writing the token.

**`numeric` + `maxLength` props (added Feature 06 review).** `numeric` strips non-digits on every keystroke and sets `inputMode="numeric"` for a numeric mobile keypad. Used by Years of Experience (`maxLength={2}`) and Graduation Year (`maxLength={4}`). This **rejects bad input at the keystroke** rather than parsing-and-discarding it later — previously `"abc"` silently became `null`, so the field looked saved while the completion banner kept reporting it missing. Prefer this over post-hoc validation messages for any numeric field. Note it is not a substitute for server-side bounds: `parseGradYear` in `lib/profile.ts` independently clamps to 1900–(current year + 10).

### SelectField (form dropdown)

File: `components/profile/SelectField.tsx`
Last updated: 2026-07-24

| Property        | Class                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- |
| Wrapper         | `<label className="block …">` + same caption class as TextField                            |
| Select          | `w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-9 text-sm text-text-primary` |
| Focus state     | `focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`                    |
| Chevron         | `pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted` (`ChevronDown`) |

**Pattern notes:**
Native `<select>` styled to match TextField (`appearance-none` + a manually-placed `ChevronDown` in a `relative` wrapper). **Exports the shared `Option = { value; label }` type** — option constants (work-auth, experience, degree, remote) are typed `Option[]` and live in ProfileForm. Reuse this component + the `Option` type for any future dropdown.

### TagInput (add/remove pill input)

File: `components/profile/TagInput.tsx`
Last updated: 2026-07-24

| Property        | Class                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- |
| Caption         | same `text-xs … uppercase … text-text-secondary` caption; `optional` appends "(Optional)" |
| Input row       | `flex gap-2` — a TextField-style input + a Secondary `Add` button (`shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium … hover:bg-surface-secondary`) |
| Pill            | `inline-flex items-center gap-1 rounded-md border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-primary` |
| Pill remove     | `X` icon button, `text-text-muted hover:text-error`, `aria-label="Remove {tag}"`          |

**Pattern notes:**
`"use client"` — owns local `useState` for the pending text; Enter (preventDefault) or the Add button commits via the `onAdd` callback, with trim/dedup enforced by the parent. Used for Skills and Industries; reuse for any future multi-value tag field.

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
