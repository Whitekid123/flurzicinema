# Streaming App Foundation — Implementation Summary

## Files created
**Domain/contracts:** `types/streaming.ts`, `lib/api/errors.ts`,
`lib/api/pagination.ts`, `lib/api/services.ts`,
`lib/api/mocks/mockData.ts`, `lib/api/mocks/mockServices.ts`,
`lib/state/SessionContext.tsx`

**UI scaffolds:** `components/streaming/RoutePlaceholder.tsx`,
`RequireAuth.tsx`, `StreamingShell.tsx`

**Routes (scaffolds only, no final design):**
- Auth: `app/login`, `app/signup`, `app/forgot-password`,
  `app/reset-password`, `app/verify-email`
- Onboarding: `app/welcome`, `app/subscribe`, `app/profiles`,
  `app/profiles/new`, `app/profiles/manage`
- Streaming: `app/browse`, `app/browse/movies`, `app/browse/series`,
  `app/browse/search`, `app/browse/title/[id]`, `app/browse/my-list`,
  `app/browse/history`, `app/watch/[id]`
- Account: `app/account`, `app/account/billing`,
  `app/account/security`, `app/account/devices`
- Layouts with guards: `app/browse/layout.tsx`, `app/account/layout.tsx`,
  `app/watch/layout.tsx`, `app/profiles/layout.tsx`

**Docs:** `docs/STREAMING_APP_ARCHITECTURE.md`,
`docs/BACKEND_API_CONTRACTS.md`, `docs/CODEX_IMPLEMENTATION_HANDOFF.md`
(this file: `docs/IMPLEMENTATION_SUMMARY.md`)

**Tests:** `tests/streaming-arch.spec.ts` (Playwright smoke),
`tests/streaming-mocks.unit.test.ts` (Vitest unit for mocks),
`vitest.config.ts`, `playwright.config.ts` (updated)

**Files modified:** `package.json` (added `test:unit` script),
`app/browse/search/page.tsx` (removed unused prop),
`components/streaming/StreamingShell.tsx` (client + active nav),
`lib/state/SessionContext.tsx` (see fixes below),
`lib/api/mocks/mockServices.ts` (unused param).
Public site untouched.

## Fixes (validation phase)
1. `react-hooks/set-state-in-effect` in `lib/state/SessionContext.tsx`:
   initial fetch moved into async `fetchSession` helper; setState happens
   only after await. `requestRef` guards stale/unmounted updates.
2. Vitest discovery: `vitest.config.ts` includes only
   `tests/**/*.unit.test.{ts,tsx}`, excludes `docs/**`, `**/*.spec.ts`,
   `node_modules/.next/out/test-results`. Rollback archives preserved on disk.
3. Playwright discovery: `playwright.config.ts` sets `testMatch:
   "**/*.spec.ts"` + `testIgnore` for `docs/**` and `node_modules/**`.
   Unit tests no longer collected by the browser runner.

## Architecture established
Typed service contracts (auth, profiles, catalog, subscription,
watchlist, playback, recommendations), shared error/pagination shapes,
session context, frontend-only route guards, dev mock adapters with
`isMock` flagging, route separation (public `/movies` vs `/browse/movies`).

## Integration points
Env: `NEXT_PUBLIC_USE_MOCKS=1` (dev mocks) — see
`docs/BACKEND_API_CONTRACTS.md` for endpoints the backend engineer must
provide (session, profiles, catalog, subscription, playback, watchlist).
`lib/state/SessionContext.tsx` has TODOs to swap mocks → HTTP adapters.

## Remaining backend dependencies
All of the above endpoints; session enforcement; entitlement gating for
playback; licensing/region data; billing/payment processing.

## What Codex should implement next
Final UI for all scaffold routes (replace placeholders), using
`mockServices` + `types/streaming.ts` + `useSession()`. See
`docs/CODEX_IMPLEMENTATION_HANDOFF.md`.

## Validation status
Shell tooling (Bash/PowerShell) is blocked by the auto-mode classifier in
this environment, so `npm run typecheck`, `npm run lint`, `npm run build`,
`npm run test:e2e` and `npm run test:unit` **could not be executed** — do
not claim green until they are run in an environment with shell access.
Manual review of every changed file was done instead. Re-run the five
commands above when shell access is available.
