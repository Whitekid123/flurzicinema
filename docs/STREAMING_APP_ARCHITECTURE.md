> Phase 2A update: the ten account-entry and profile interfaces are implemented. See [the current implementation report](./PHASE_2A_IMPLEMENTATION_REPORT.md) for service behavior, validation results and the deferred browser-verification limit. The foundation notes below are retained for context; dashboard/player work is still outside this milestone.

# Flurzi Cinema — Streaming App Architecture

Status: **frontend foundation only**. No production backend is wired up.
Mocks in `lib/api/mocks/` are development-only and flagged `isMock`.
Public marketing site is untouched.

## Route map

| Area | Routes | Guard | Notes |
|---|---|---|---|
| Public (existing) | `/`, `/movies`, `/series`, `/pricing`, `/features`, `/explore`, `/get-started`, `/sign-in`, `/movies/[slug]`, `/series/[slug]`, `/help`, `/about`, `/originals`, `/premieres`, `/contact`, `/legal/*` | none | Existing `PublicShell` + `Header`/`Footer`. `/sign-in` + `/get-started` currently show "coming later" — leave to backend/Codex decision. |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | public | `AuthPlaceholder` only. No credentials collected. |
| Onboarding | `/welcome`, `/subscribe`, `/profiles`, `/profiles/new`, `/profiles/manage` | `RequireAuth` (except `/welcome`, `/subscribe` are page-level public scaffolds — add guard when backend lands) | Profile flow: choose → create → manage. |
| Streaming | `/browse`, `/browse/movies`, `/browse/series`, `/browse/search`, `/browse/title/[id]`, `/browse/my-list`, `/browse/history`, `/watch/[id]` | `SessionProvider` + `RequireAuth` + `StreamingShell` | Public catalog pages (`/movies`, `/series`) stay distinct from `/browse/*`. |
| Account | `/account`, `/account/billing`, `/account/security`, `/account/devices` | `SessionProvider` + `RequireAuth` + `StreamingShell` | |

Future reserved (not scaffolded): Flurzi Cinema Rooms, StoryMatch, StoryLens,
DataSense, Premieres — add under `/browse/rooms`, `/browse/story-match`, etc.
when backend + Codex scopes exist. Do not block current routes on them.

## Component boundaries

- `components/streaming/RoutePlaceholder.tsx` — neutral scaffold; Codex replaces.
- `components/streaming/RequireAuth.tsx` — frontend UX guard only.
- `components/streaming/StreamingShell.tsx` — authenticated app chrome
  (nav: Home/Movies/Series/Search/My List/Account).
- Public site: `components/public/PublicShell.tsx`, `components/home/*`,
  `components/layout/Header.tsx` / `Footer.tsx`, `components/ui/*`.
  **Do not modify public components without need.**

## State strategy

- `lib/state/SessionContext.tsx` (`SessionProvider` / `useSession`):
  holds current `AuthState` + selected `ViewerProfile` only.
- No passwords, no tokens in `localStorage`. Public-site saved-demo
  (`lib/useSavedStories.ts`) is unrelated and stays as-is.
- Server-owned data (account, entitlement, catalog, watchlist, progress)
  is fetched per-route via services — no global cache/duplicated truth.
- Search/filters/navigation/playback-UI state: local component state.
- In production, `getCurrentSession` is a server round-trip
  (cookie session), not local state.

## Authentication flow

`AuthenticationService` (`lib/api/services.ts`):
register → verify email → login → getCurrentSession → logout,
plus recovery/reset. States map to `AuthStatus` in `types/streaming.ts`.

**Frontend guards are not security.** Backend must enforce session +
entitlement on every API/streaming request. `RequireAuth` only prevents
flash-of-unauthenticated-UI and redirects to `/login`.

## Profile flow

`ProfileService.listProfiles` → `selectProfile` → set in context.
Create (`/profiles/new`), edit/delete (`/profiles/manage`),
kids flag + optional PIN (`verifyPin`). PIN is backend-hashed.

## Subscription gating

`SubscriptionService.getEntitlement()` → `Entitlement.canStream`.
UI: if `!canStream`, redirect to `/subscribe`. Backend must also refuse
`PlaybackService.getPlaybackMetadata` without an active entitlement.

## File map (new)

```
types/streaming.ts                 # domain models
lib/api/errors.ts, pagination.ts   # shared API shapes
lib/api/services.ts                # 7 service contracts
lib/api/mocks/mockData.ts          # dev-only fictional data
lib/api/mocks/mockServices.ts      # dev-only adapters (NOT production)
lib/state/SessionContext.tsx       # auth/profile context
components/streaming/*             # shell, guard, placeholder
app/{login,signup,forgot-password,reset-password,verify-email}/
app/{welcome,subscribe,profiles/**}/
app/{browse/**,watch/**,account/**}/
```
