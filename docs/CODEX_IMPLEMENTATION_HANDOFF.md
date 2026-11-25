> Phase 2A update: the ten account-entry and profile interfaces are implemented. See [the current implementation report](./PHASE_2A_IMPLEMENTATION_REPORT.md) for service behavior, validation results and the deferred browser-verification limit. The foundation notes below are retained for context; dashboard/player work is still outside this milestone.

# Codex Handoff — Streaming App UI

Architecture + services are done. Build final UI on these scaffolds.
Do not redesign the public site.

## Reuse (do not reinvent)

- Public: `components/public/PublicShell`, `components/layout/Header` /
  `Footer`, `components/home/*`, `components/ui/*`, `styles/globals.css`
  tokens (`--ink`, `--amber`, …), `Brand`.
- Streaming shell/guard/placeholder: `components/streaming/*`.
- Types: `types/streaming.ts` — import domain types from there.
- Services: `lib/api/services.ts` + `lib/api/mocks/mockServices.ts`
  (`mockServices` is ready to consume today; swap for HTTP adapters
  when backend lands, per `docs/BACKEND_API_CONTRACTS.md`).
- Session: `useSession()` from `lib/state/SessionContext.tsx`
  (`auth`, `profile`, `refresh`, `signOut`, `setProfile`).

## Routes ready for UI

Auth: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
Onboarding: `/welcome`, `/subscribe`, `/profiles`, `/profiles/new`, `/profiles/manage`
Streaming: `/browse`, `/browse/movies`, `/browse/series`, `/browse/search`,
`/browse/title/[id]`, `/browse/my-list`, `/browse/history`, `/watch/[id]`
Account: `/account`, `/account/billing`, `/account/security`, `/account/devices`

Replace each `RoutePlaceholder` / `AuthPlaceholder` with final design.
Keep the guard/shell structure; restyle inside it.

## Do not modify without need

- `lib/api/services.ts` (contracts), `types/streaming.ts` (models),
  `lib/api/errors.ts`, `lib/api/pagination.ts`,
  `lib/api/mocks/*` (shared mocks), `app/**/layout.tsx` guards,
  public-site files (`app/page.tsx`, `components/home/*`, `lib/catalog/*`).
- Env secrets: if backend reads env, use server-only env vars;
  browser needs `NEXT_PUBLIC_` prefix only.

## Dev mocks (NOT production)

`NEXT_PUBLIC_USE_MOCKS=1` → `mockServices`. Fictional data in
`mockData.ts`. Tests assert `isMock` where relevant. Never present
mock login/catalog as production-ready.

## Testing expectations

- `npm run typecheck`, `npm run lint`, `npm run build` must pass.
- `tests/streaming-arch.spec.ts` covers scaffold routes.
- Add component tests when adding interactive UI; keep mock data
  separate from components.
