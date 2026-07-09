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
