# Flurzi Cinema — Phase 2A implementation

The existing project now has complete account-entry and viewer-profile interfaces. It remains a frontend development preview, with no production authentication, billing or playback backend.

## Screens completed

- /login: cinematic split layout, email/password validation, visibility control, demo autofill, recovery and account-creation links.
- /signup: email/password guidance, visibility control, preview legal acknowledgement and feedback.
- /forgot-password: validation, neutral request confirmation and an explicitly labeled demo reset link.
- /reset-password: new-password confirmation, missing/invalid-link states and reset confirmation.
- /verify-email: confirmation, invalid-link, resend-request, verified and return-to-sign-in states.
- /welcome: account setup introduction and next-step routing.
- /subscribe: service-backed plan choices, saved preference and activation/error states.
- /profiles: avatar selection, kids/PIN indicators, loading, profile creation/management links and PIN entry.
- /profiles/new: name, six original monochrome avatars, kids setting and optional demo PIN.
- /profiles/manage: editing, supported preferences, PIN changes/removal, save/cancel and deletion confirmation.

The new scoped design uses the current neutral palette, Manrope, existing fictional-film artwork, generous spacing, visible focus states and restrained CSS motion. Responsive rules address 1920, 1440, 1024, 768, 390 and 320px. The viewport matrix has NOT been browser-verified.

## Journey and service behavior

Registration leads through verification, welcome, a viewing preference, profiles and the existing app entry. Returning viewers with a saved demo choice skip welcome. The existing SessionProvider is shared at the root; retained nested providers reuse the owner so profile selection survives client navigation.

Scaffold mock behavior needed correction: it previously returned a session unconditionally, discarded profile changes and returned the first profile regardless of selection. Opt-in mocks now start signed out, preserve mutations during client navigation, validate matching profiles and honor verification/PIN demo states.

Without NEXT_PUBLIC_USE_MOCKS=1, services fail closed rather than silently using mocks. The ignored local .env.local enables the development preview; .env.example documents the flag.

Mock limitations:
- One in-memory fixture account; login does not authenticate real credentials. Refresh/new-tab state resets.
- Passwords, session tokens and entered PINs are not persisted. No cookie session is created.
- No email is delivered. Verification/reset links use labeled, single-use demo fixtures.
- The demo PIN is 1234. Kids, maturity and PIN controls are not secure parental restrictions.
- Preferences are saved demo data, not live translation, playback or filtering settings.
- Plan prices are unannounced in the UI. Saving a choice returns status none and canStream remains false. No payment, active membership or playback access is fabricated.

## Files

- components/streaming/{EntryUI,AuthScreens,OnboardingScreens,ProfileScreens}.tsx
- components/streaming/{RequireAuth,StreamingShell}.tsx
- The ten corresponding app route page.tsx files listed above
- lib/entry-flow.ts, lib/api/client.ts, lib/api/mocks/mockServices.ts, lib/state/SessionContext.tsx
- styles/streaming-entry.css, app/layout.tsx, app/{browse,watch}/layout.tsx
- app/(public)/{sign-in,get-started}/page.tsx and the Header invocation in components/home/CinemaHome.tsx
- .env.example, ignored .env.local, tests/streaming-entry.unit.test.ts
- scripts/phase2a-{browser-qa,preview-qa,http-qa}.mjs and this report

Models and API contracts are unchanged. No dashboard or player was built. Existing public composition, motion hooks, legacy styles, film records, Header/Footer components and catalog integration were preserved. Original touched files are backed up in rollback/pre-phase2a.

## Validation

- npm run typecheck: PASS
- npm run lint: PASS, no remaining warnings
- npm run build: PASS; build D7gOse0u3f04JBjqnacBh
- npm run test:unit: PASS, 19 tests including the original 4
- Production HTTP checks: all ten routes returned 200; both public entry redirects returned the expected 307 destinations.
- Compiled CSS audit confirmed the final 44px standalone-link touch targets.
- Source comparison confirmed the homepage differs only at the sign-in Header invocation.

[HTTP evidence](./phase2a/http-observations.json)

Browser inspection did not pass: the focused Chromium attempt timed out waiting for the login email field to become visible. No console errors were recorded, but no successful screenshots or interaction assertions were collected. The pre-existing Playwright suite/configuration was left unchanged and its navigation timeout investigation was not undertaken. Visual wrapping, keyboard/touch behavior and the requested viewport matrix remain unverified.

[Browser attempt evidence](./phase2a/browser-observations.json)

## Backend dependencies

Real cookie-session adapters; registration/login and email recovery/verification delivery; persistent, authorized profile CRUD; hashed PIN and maturity enforcement; authoritative plans, billing and entitlements. Streaming licensing, dashboard and player work remain separate milestones.

Functional UX references: [Netflix password recovery](https://help.netflix.com/en/node/365) and [profile PIN flow](https://help.netflix.com/en/node/114277). No reference-site artwork or branding was copied.
