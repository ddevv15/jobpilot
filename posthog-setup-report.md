# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into JobPilot. Client-side tracking was initialized via `instrumentation-client.ts` (Next.js 15.3+ pattern) with a reverse proxy routed through `/ingest` to avoid ad-blockers. A shared server-side PostHog client was created in `lib/posthog-server.ts` (posthog-node) and wired into the OAuth callback route and the `initiateOAuth` server action. Homepage and navbar CTAs were upgraded to client components so click events fire before navigation. User identification happens server-side on every successful sign-in, linking the InsForge user ID to PostHog person records. Exception autocapture is enabled globally via the `capture_exceptions` init option.

| Event name | Description | File |
|---|---|---|
| `cta_clicked` | User clicked a homepage CTA button ("Get Started" or "Find Your First Match"); property `button_label` distinguishes them. | `components/homepage/CTAButtons.tsx` |
| `navbar_cta_clicked` | User clicked the "Start for free" button in the navigation bar. | `components/layout/NavbarCTA.tsx` |
| `oauth_initiated` | User initiated OAuth sign-in; property `provider` is `google` or `github`. | `actions/auth.ts` |
| `user_signed_in` | User successfully completed OAuth authentication; fires with their InsForge user ID as the PostHog distinct ID. | `app/api/auth/callback/route.ts` |
| `oauth_init_failed` | The OAuth handshake could not be started (InsForge SDK returned an error or an incomplete response); property `provider` is `google` or `github`. | `actions/auth.ts` |
| `sign_in_failed` | A sign-in attempt failed after redirecting back from the provider; property `reason` is `oauth_failed`, `missing_verifier`, or `exchange_failed`. | `app/api/auth/callback/route.ts` |
| `sign_in_page_viewed` | Server-rendered view of the sign-in page; the top of the authentication conversion funnel. | `app/(auth)/login/page.tsx` |
| `user_signed_out` | User signed out from the dashboard placeholder; fires with their InsForge user ID as the distinct ID. | `actions/auth.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — dashboard](https://us.posthog.com/project/492061/dashboard/1832127)
- [CTA clicks by button (wizard)](https://us.posthog.com/project/492061/insights/tzcIxnqm)
- [Signup conversion funnel (wizard)](https://us.posthog.com/project/492061/insights/nZ3HHqcK)
- [User sign-ins over time (wizard)](https://us.posthog.com/project/492061/insights/2V9WxPFc)
- [OAuth initiated by provider (wizard)](https://us.posthog.com/project/492061/insights/h3TLfErQ)
- [All CTA engagement (wizard)](https://us.posthog.com/project/492061/insights/1InnT0DR)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `identify` only fires in the OAuth callback on fresh sign-in; a returning user who already has a session will be on an anonymous distinct ID until they sign in again.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
