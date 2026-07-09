# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 01 Homepage
**Next:** 02 Auth

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [ ] 02 Auth
- [ ] 03 PostHog Initialization
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

---

## Notes

- Root layout now uses `next/font/google` Inter (`--font-sans`) per ui-rules.md, replacing the default Geist fonts from create-next-app.
- `components/layout/` and `components/homepage/` created per architecture.md. Added `CTAButtons.tsx`, `Testimonial.tsx`, and `CTASection.tsx` to `components/homepage/` — not explicitly listed in architecture.md's folder sketch, but consistent with its naming conventions and needed to cover every section in the design.
