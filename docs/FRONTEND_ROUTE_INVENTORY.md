# Frontend route inventory — Phase 2F.5

Generated from every app/**/page.tsx in the current workspace. “Implemented” describes frontend interfaces, not live production services. 49 page patterns are present, including the protected development lab.

| Route | Frontend status | Source |
| --- | --- | --- |
| `/` | Implemented public editorial/discovery interface | [app/page.tsx](../app/page.tsx) |
| `/about` | Implemented editorial/concept page; approved business/content claims required | [app/(public)/about/page.tsx](../app/(public)/about/page.tsx) |
| `/account` | Implemented account centre; production services/provider integration required | [app/account/page.tsx](../app/account/page.tsx) |
| `/account/billing` | Implemented account centre; production services/provider integration required | [app/account/billing/page.tsx](../app/account/billing/page.tsx) |
| `/account/details` | Implemented account centre; production services/provider integration required | [app/account/details/page.tsx](../app/account/details/page.tsx) |
| `/account/devices` | Implemented account centre; production services/provider integration required | [app/account/devices/page.tsx](../app/account/devices/page.tsx) |
| `/account/preferences` | Implemented account centre; production services/provider integration required | [app/account/preferences/page.tsx](../app/account/preferences/page.tsx) |
| `/account/security` | Implemented account centre; production services/provider integration required | [app/account/security/page.tsx](../app/account/security/page.tsx) |
| `/browse` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/page.tsx](../app/browse/page.tsx) |
| `/browse/history` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/history/page.tsx](../app/browse/history/page.tsx) |
| `/browse/movies` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/movies/page.tsx](../app/browse/movies/page.tsx) |
| `/browse/my-list` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/my-list/page.tsx](../app/browse/my-list/page.tsx) |
| `/browse/rooms` | Implemented Cinema Rooms; production adapter required | [app/browse/rooms/page.tsx](../app/browse/rooms/page.tsx) |
| `/browse/rooms/[roomId]` | Implemented Cinema Rooms; production adapter required | [app/browse/rooms/[roomId]/page.tsx](../app/browse/rooms/[roomId]/page.tsx) |
| `/browse/rooms/create` | Implemented Cinema Rooms; production adapter required | [app/browse/rooms/create/page.tsx](../app/browse/rooms/create/page.tsx) |
| `/browse/rooms/join` | Implemented Cinema Rooms; production adapter required | [app/browse/rooms/join/page.tsx](../app/browse/rooms/join/page.tsx) |
| `/browse/search` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/search/page.tsx](../app/browse/search/page.tsx) |
| `/browse/series` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/series/page.tsx](../app/browse/series/page.tsx) |
| `/browse/storymatch` | Implemented StoryMatch; production adapter required | [app/browse/storymatch/page.tsx](../app/browse/storymatch/page.tsx) |
| `/browse/storymatch/new` | Implemented StoryMatch; production adapter required | [app/browse/storymatch/new/page.tsx](../app/browse/storymatch/new/page.tsx) |
| `/browse/storymatch/results` | Implemented StoryMatch; production adapter required | [app/browse/storymatch/results/page.tsx](../app/browse/storymatch/results/page.tsx) |
| `/browse/storymatch/session/[id]` | Implemented StoryMatch; production adapter required | [app/browse/storymatch/session/[id]/page.tsx](../app/browse/storymatch/session/[id]/page.tsx) |
| `/browse/title/[id]` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/browse/title/[id]/page.tsx](../app/browse/title/[id]/page.tsx) |
| `/contact` | Preview-only inquiry exercise; release unavailable; support workflow required | [app/(public)/contact/page.tsx](../app/(public)/contact/page.tsx) |
| `/explore` | Implemented public editorial/discovery interface | [app/(public)/explore/page.tsx](../app/(public)/explore/page.tsx) |
| `/features` | Implemented public editorial/discovery interface | [app/(public)/features/page.tsx](../app/(public)/features/page.tsx) |
| `/forgot-password` | Implemented entry/onboarding; production auth/payment services required | [app/forgot-password/page.tsx](../app/forgot-password/page.tsx) |
| `/get-started` | Implemented entry page linking to existing auth | [app/(public)/get-started/page.tsx](../app/(public)/get-started/page.tsx) |
| `/help` | Implemented public editorial/discovery interface | [app/(public)/help/page.tsx](../app/(public)/help/page.tsx) |
| `/legal/[document]` | Draft content; approved legal documents required | [app/(public)/legal/[document]/page.tsx](../app/(public)/legal/[document]/page.tsx) |
| `/login` | Implemented entry/onboarding; production auth/payment services required | [app/login/page.tsx](../app/login/page.tsx) |
| `/movies` | Implemented public editorial/discovery interface | [app/(public)/movies/page.tsx](../app/(public)/movies/page.tsx) |
| `/movies/[slug]` | Implemented public editorial/discovery interface | [app/(public)/movies/[slug]/page.tsx](../app/(public)/movies/[slug]/page.tsx) |
| `/originals` | Implemented editorial/concept page; approved business/content claims required | [app/(public)/originals/page.tsx](../app/(public)/originals/page.tsx) |
| `/player-lab` | Development only; excluded from optimized builds | [app/player-lab/page.tsx](../app/player-lab/page.tsx) |
| `/premieres` | Implemented fictional editorial showcase; dated events pending approved scope | [app/(public)/premieres/page.tsx](../app/(public)/premieres/page.tsx) |
| `/pricing` | Implemented editorial/concept page; approved business/content claims required | [app/(public)/pricing/page.tsx](../app/(public)/pricing/page.tsx) |
| `/profiles` | Implemented profile UI; persistent authorized adapter required | [app/profiles/page.tsx](../app/profiles/page.tsx) |
| `/profiles/manage` | Implemented profile UI; persistent authorized adapter required | [app/profiles/manage/page.tsx](../app/profiles/manage/page.tsx) |
| `/profiles/new` | Implemented profile UI; persistent authorized adapter required | [app/profiles/new/page.tsx](../app/profiles/new/page.tsx) |
| `/reset-password` | Implemented entry/onboarding; production auth/payment services required | [app/reset-password/page.tsx](../app/reset-password/page.tsx) |
| `/series` | Implemented public editorial/discovery interface | [app/(public)/series/page.tsx](../app/(public)/series/page.tsx) |
| `/series/[slug]` | Implemented public editorial/discovery interface | [app/(public)/series/[slug]/page.tsx](../app/(public)/series/[slug]/page.tsx) |
| `/sign-in` | Implemented entry page linking to existing auth | [app/(public)/sign-in/page.tsx](../app/(public)/sign-in/page.tsx) |
| `/signup` | Implemented entry/onboarding; production auth/payment services required | [app/signup/page.tsx](../app/signup/page.tsx) |
| `/subscribe` | Implemented entry/onboarding; production auth/payment services required | [app/subscribe/page.tsx](../app/subscribe/page.tsx) |
| `/verify-email` | Implemented entry/onboarding; production auth/payment services required | [app/verify-email/page.tsx](../app/verify-email/page.tsx) |
| `/watch/[id]` | Implemented guarded streaming UI; authorized catalog/playback services required | [app/watch/[id]/page.tsx](../app/watch/[id]/page.tsx) |
| `/welcome` | Implemented entry/onboarding; production auth/payment services required | [app/welcome/page.tsx](../app/welcome/page.tsx) |

## Remaining scope and launch work

- Scheduled premiere discovery/details, event reminders/registration and Creator Lounges/profiles/live participation: pending authoritative scope confirmation. No corresponding application routes or service operations exist. Existing /premieres is a disclosed fictional showcase, not a scheduled screening system.
- Public Contact: actual support submission/delivery remains unavailable. An approved workflow/contract and frontend integration are required.
- Pricing/purchases/payment-method management: approved provider flow, real prices/benefits and payment UI/handoff remain required. Membership preview is not a purchase.
- Legal documents and business/editorial claims: approved final content, entity/contact information and content rights remain required.
- Production adapters, real-session restoration, populated account/billing/device paths, playback/quality telemetry, independent remote Rooms/StoryMatch, enriched StoryLens, authorization and physical-browser acceptance remain integration work; see the production handoff.
- No administrative platform, creator marketplace, uploads, follower system or conferencing infrastructure has confirmed scope.

## Placeholder and link audit

0 active app pages import RoutePlaceholder/AuthPlaceholder. The unused placeholder component remains available; it is not an active customer route.

137 literal internal href references were compared with filesystem page patterns. 0 unresolved page references were found.

Computed destinations, query identities, backend availability, external links and fragment existence are outside this static check. Focused browser evidence separately verifies premiere-to-title navigation and authentication actions. Unavailable service controls are intentional unavailable states, not completed backend operations.

See the [control and content boundaries](./phase2f5/control-boundaries.md) for specific unavailable operations and pages requiring integration or approved content.
