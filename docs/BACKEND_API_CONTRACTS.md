# Flurzi Cinema — Backend API Contracts (required, not yet implemented)

Frontend contracts live in `lib/api/services.ts` + `types/streaming.ts`.
This document is what the backend engineer must provide. Base URL comes
from env (e.g. `NEXT_PUBLIC_API_URL`); never bake secrets into the client.
All responses JSON. Errors use the shape in `lib/api/errors.ts`.

## Error format

```json
{ "code": "VALIDATION", "message": "Human-safe message", "status": 422, "requestId": "req_123", "details": {} }
```

Required codes: `UNAUTHENTICATED`, `SESSION_EXPIRED`,
`EMAIL_VERIFICATION_REQUIRED`, `SUBSCRIPTION_REQUIRED`, `NOT_FOUND`,
`VALIDATION`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`.

## Session assumptions

- Cookie-based session (httpOnly, Secure, SameSite). Frontend never
  sees or stores access tokens. `Session.isMock=false` in production.
- `GET session` returns `{ user, account, session }` or 401.
- Every authenticated endpoint must verify session + entitlement server-side.

## Auth endpoints

| Method | Path | Req | Res |
|---|---|---|---|
| POST | `/auth/register` | `RegisterRequest` | `AuthResult` (or 202 if email verification required) |
| POST | `/auth/login` | `LoginRequest` | `AuthResult` |
| POST | `/auth/logout` | — | 204 |
| GET | `/auth/session` | — | `AuthResult` \| 401 |
| POST | `/auth/verify-email` | `{ token }` | 204 |
| POST | `/auth/resend-verification` | — | 204 |
| POST | `/auth/password-recovery` | `{ email }` | 204 (no account enumeration) |
| POST | `/auth/reset-password` | `{ token, newPassword }` | 204 |
| GET | `/auth/providers` | — | `[{ id, label }]` (OAuth, optional) |
| GET | `/account` | — | `Account` |

## Profiles

| Method | Path | Res |
|---|---|---|
| GET | `/profiles` | `ViewerProfile[]` |
| POST | `/profiles` | `ViewerProfile` (PIN hashed server-side) |
| PATCH | `/profiles/:id` | `ViewerProfile` |
| DELETE | `/profiles/:id` | 204 |
| POST | `/profiles/:id/select` | `ViewerProfile` |
| POST | `/profiles/:id/verify-pin` | `{ ok: boolean }` |

## Catalog

`GET /titles?page&pageSize&search&genre&year&sort&mediaType` → `Page<CatalogTitle>`
`GET /titles/:id` → `CatalogTitle` (Movie w/ duration, or Series w/ seasons/episodes)
`GET /titles/search?q=` → `Page<CatalogTitle>`
`GET /genres` → `Genre[]`
`GET /titles/:id/recommendations` → `CatalogTitle[]`
`GET /watching?profileId=` → `ViewingProgress[]`
`GET /history?profileId=&page=` → `Page<ViewingProgress>`

Availability: `StreamingAvailability.status` + `isLicensedForPlayback`.
Metadata-only titles must not return a playback manifest.

## Subscription / billing / devices

`GET /plans` → `SubscriptionPlan[]`
`GET /subscription` → `Subscription | null`
`GET /entitlement` → `Entitlement`
`GET /billing?page=` → `Page<BillingHistoryItem>`
`POST /subscription/change-plan { planId }` → `Subscription`
`POST /subscription/cancel` → `Subscription`
`GET /devices` → `DeviceInfo[]`
`DELETE /devices/:id` → 204

## Watchlist / playback / notifications

Watchlist: `GET/POST/DELETE /watchlist?profileId=` / `/watchlist/:titleId`
Playback: `GET /playback/:titleId?episodeId=` → `PlaybackMetadata`
(short-lived signed manifest URL only when licensed + entitled; never
`isLicensedForPlayback=false` with a URL). `POST /playback/progress`,
`POST /playback/completed`.
Notifications: `GET /notifications` → `Page<Notification>`,
`POST /notifications/:id/read`.
Home rails: `GET /home?profileId=` → `{ id, title, items }[]`

## Open questions for backend

1. Confirm cookie-session vs token + refresh flow.
2. Final plan/pricing source of truth (public `/pricing` is a preview).
3. Region/licensing enforcement point for playback.
4. OAuth providers in scope for v1?
