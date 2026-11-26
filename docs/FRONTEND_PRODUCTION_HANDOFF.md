# Flurzi Cinema — frontend production handoff

The interfaces through Phase 2F.4, including StoryLens and DataSense, are implemented. Phase 2F.5 audits authentication and remaining product scope; scheduled premieres and Creator Lounges remain pending scope confirmation. Production services remain unavailable until approved adapters are installed. This correction milestone preserves the existing design, authentication guards, profile isolation and independent playback authorization. No backend endpoint or payment workflow has been invented.

## Architecture and routes

Next.js App Router, React, scoped CSS and existing GSAP animations. Root SessionProvider owns account/session/profile state. RequireAuth protects the streaming application; server authorization is still required for every operation. Public catalog reads run server-side. Viewer state is remounted on profile/session changes in Rooms and StoryMatch.

Public routes: /, /explore, /movies, /movies/[slug], /series, /series/[slug], /originals, /premieres, /features, /about, /pricing, /help, /contact, /get-started, /sign-in and /legal/[document]. Authentication: /login, /signup, /forgot-password, /reset-password, /verify-email. Onboarding: /welcome, /subscribe, /profiles, /profiles/new, /profiles/manage. Streaming: /browse, /browse/movies, /browse/series, /browse/search, /browse/my-list, /browse/history, /browse/title/[id], /watch/[id]. Account: /account, /account/details, /account/billing, /account/security, /account/devices, /account/preferences. Rooms: /browse/rooms, /create, /join, /[roomId]. StoryMatch: /browse/storymatch, /new, /session/[id], /results.

## Service integration matrix

| Frontend | Contract | Development adapter | Production status / backend work | Remaining frontend integration |
| --- | --- | --- | --- | --- |
| Sign-in, signup, recovery, verification, session | AuthenticationService, lib/api/services.ts | lib/api/mocks/mockServices.ts | lib/api/client.ts fails closed; implement cookie-session operations, recovery and verified email delivery | Register adapter in client.ts; run real-session/error/expiry verification |
| Profiles and preferences | ProfileService | mockServices.ts | Authorized persistent profile CRUD/select, preference merge, PIN enforcement | Register adapter; verify persistence, profile selection restoration and restrictions |
| Dashboard, search, details, history | CatalogService | mockServices.ts | Viewer-authorized catalog/search/genres/recommendations/progress/history | Register adapter; test paging, episodes, missing metadata and rights |
| My List | WatchlistService | mockServices.ts | Account/profile-scoped persistent reads/add/remove | Register adapter and test concurrent responses |
| Membership, billing and devices | SubscriptionService; optional AuthenticationService.updateAccount | mockServices.ts | Supply membership, entitlement, invoices, devices; optional display-name write | Register adapter; verify populated states. Approved purchase/payment-provider handoff still needs a defined contract/UI integration before enabling purchases |
| Player | PlaybackService | Metadata-only mock; isolated development player lab | Authorized exact title/episode/profile sessions, source expiry, progress/completion | Register adapter; verify real codecs, captions, autoplay, source renewal and devices |
| Home rails and notifications | RecommendationService | mockServices.ts | Authorized rails and notifications | Register adapter; verify real data and empty/error states |
| Cinema Rooms | RoomService, lib/rooms.ts | lib/api/mocks/room-preview.ts | lib/api/room-service.ts fails closed; authorized transport, presence, invitation lifecycle and monotonic snapshots | Install adapter through lib/api/experience-services.ts; independently connected clients must verify synchronization/moderation |
| StoryMatch | StoryMatchService, lib/storymatch.ts | lib/api/mocks/storymatch-preview.ts | lib/api/storymatch-service.ts fails closed; authorized catalog ranking, invitations, revisions and retention | Install adapter through experience-services.ts; verify conflicts and remote participants. Optional guest methods must remain absent in production |
| StoryLens | StoryLensService, lib/storylens.ts | No catalog annotation fixtures; protected original-media lab only | lib/api/storylens-service.ts fails closed; exact viewer/title/episode metadata, provenance, classification and expiry | Install via experience-services.ts; verify authorized editorial records, real licensed-player/fullscreen behavior and spoiler review |
| Public catalog | PublicTitle/CatalogTitle, lib/catalog/provider.ts and adapters.ts | Original editorial metadata/artwork in data/catalog.ts | Optional existing FLURZI_CATALOG_API_URL transport; no authenticated mock fallback | Supply approved catalog/artwork/rights. Default public artwork is illustrative editorial content, never a playback entitlement |
| Public contact, legal, pricing, future features | Public components / editorial data | Contact exercise only in explicit preview | No support delivery contract, approved policies, prices or scheduled-event/creator service | Contact shows unavailable in release. Define approved support workflow and supply legal/business content; future tools remain unavailable |

Visual Rooms/StoryMatch components no longer import development adapters. Adapter selection is centralized in lib/api/client.ts and lib/api/experience-services.ts. Keep their existing interfaces; replace unavailable implementations with approved implementations. No guessed URL is necessary in individual screens.

## Environments and release safeguards

NEXT_PUBLIC_* settings are compiled into browser assets. Rebuild when changing them; changing only the start-server environment cannot convert a preview artifact into a release.

For a release: set NEXT_PUBLIC_USE_MOCKS=0 (or unset), leave NEXT_PUBLIC_FLURZI_CHANNEL unset or set release, then npm run build. next.config.ts rejects a production build/start with mocks enabled unless the channel is explicitly preview. Release artifact promotion must originate from this release build, never from an optimized preview build. As release gates, run node scripts/readiness-release-audit.mjs and node scripts/readiness-browser-qa.mjs against the release artifact; these reject the audited test values and visible preview behavior. The browser harness starts its own server on port 3014 and closes it. Use --preview only after building the explicit preview variant. Inspect deployment environment and ignored .env.local settings before building. CI should explicitly set both values. Keep FLURZI_PLAYER_LAB unset. The player lab, its API and fixture URLs return 404 in production, including optimized preview builds.

For development: NEXT_PUBLIC_USE_MOCKS=1 with npm run dev. For a production-optimized local preview: NEXT_PUBLIC_USE_MOCKS=1 and NEXT_PUBLIC_FLURZI_CHANNEL=preview with npm run build. Label and isolate that artifact; never promote it as a customer release. Development services stay in memory, reset on reload and confer no paid membership or playback rights. Test credentials and test email links appear only in that mode. Same-device guests are voluntary entered responses, not authenticated remote viewers.

NEXT_PUBLIC_SITE_URL is the confirmed deployment origin. FLURZI_CATALOG_API_URL and optional FLURZI_CATALOG_API_TOKEN are server-only public-catalog settings. Do not put tokens or service credentials in NEXT_PUBLIC_* variables. No new secrets or service addresses are required by this milestone.

## Authentication, errors and writes

Implement the AuthenticationService interface using approved HttpOnly cookie sessions, secure transport, server-side authorization, CSRF protection and explicit session expiry. Do not store passwords, reset tokens or session credentials in browser storage. getCurrentSession must return the authorized user/account/session consistently, or null for a signed-out visitor. Implement selected-profile restoration server-side; the current provider retains selection through client navigation, not refresh. The backend engineer must define that restoration policy before launch.

Authentication fields are usable regardless of adapter selection. Forms validate locally, call their interfaces and map errors to consumer messages without exposing raw transport details. Authentication requests and all operations selected through the central service registry use a 20-second deadline. A timeout cannot undo an accepted write: adapters need abort/deadline handling and backend idempotency. Existing account, room and matching reads/writes have bounded wrappers; the central registry also bounds discovery/profile/onboarding operations. All adapters must bound requests and suppress obsolete callbacks. No frontend success substitutes for a service confirmation.

Membership purchases remain unavailable pending the approved provider flow. Never interpret a development viewing preference as a subscription. Keep existing account ownership checks, parental settings, entitlement checks and guards. UI visibility is not authorization.

## Streaming, recommendations and real-time services

Use the existing acquirePlayback flow. Every viewer, including each room participant, independently needs a valid profile/title/episode playback session, availability, region and entitlement. Return approved media sources and exact identities/expiry. Public catalog art, an invitation, a match and a shortlist confer no rights. Metadata-only titles never become playable.

Rooms require a fresh initial subscription snapshot, increasing revisions, clock measurement, reconnect reauthorization and documented host-disconnection policy. StoryMatch uses explicit request/response refresh; real collaboration needs authorized participants, optimistic-concurrency checks and retention policy. Ranking explanations must remain truthful; hard restrictions cannot be relaxed. No AI capability is claimed by the local matcher.

Contract references: [Backend API contracts](./BACKEND_API_CONTRACTS.md), [account boundaries](./PHASE_2E_BACKEND_BOUNDARIES.md), [Cinema Rooms](./CINEMA_ROOMS_BACKEND_CONTRACTS.md), [StoryMatch](./STORYMATCH_BACKEND_CONTRACTS.md), [StoryLens](./STORYLENS_BACKEND_CONTRACTS.md). Typed interfaces are authoritative where older prose differs.

## Acceptance before launch

Run the release and explicit preview checks separately. Verify real account/session restoration and expiry, cross-account/profile access denial, persistence, production billing/device records, email delivery, parental controls, playback rights and independently connected rooms/matches. Obtain approved legal/privacy/pricing/support content and rights for public catalog assets. Real provider workflows, native-device playback and physical phone keyboard behavior remain integration acceptance work. Safari/WebKit and Firefox require installed browser engines. See the correction report for the actual verification performed.

## StoryLens integration

StoryLens opens on existing title details and inside the single MediaPlayer used by WatchScreen and Cinema Rooms. No standalone route or second player is required. Install the viewer-authorized getContext adapter through storyLensServiceForViewer in lib/api/experience-services.ts. The bundle declares available categories, exact title/episode/profile identity, editorial provenance, expiry and classified timestamp records. CatalogService continues supplying existing credits and actual related title identities; RecommendationService homepage rails are not represented as cast filmographies.

Supply only approved metadata, rights-cleared portraits, reviewed cast/character relationships, accurate music/location credits and editorial classifications. Current-position scene selection is local, with start-inclusive/end-exclusive boundaries; seeking and scene changes reset reveals. Unclassified/future plot data remains hidden; eligible plot details require explicit reveal. Backend authorization, parental/region permissions and classification quality remain mandatory. The component does not recognize actors, analyze video, identify music or confer playback rights.

Requests are bounded at 20 seconds, cached only within the mounted viewer/media scope for up to five minutes/response expiry, and canceled/suppressed on changes. Opening the panel leaves play/pause, captions, audio, progress and room commands alone. Test real native fullscreen/PiP limitations and independent clients before launch. The protected original-media player lab exercises synthetic annotations only in development; production page/API/proxy exclusions and release asset scans must continue to pass. See the [StoryLens implementation report](./PHASE_2F3_IMPLEMENTATION_REPORT.md) and [typed backend contracts](./STORYLENS_BACKEND_CONTRACTS.md).

## DataSense integration

DataSense reuses title details, the existing MediaPlayer (including Cinema Rooms), account preferences and public /features#datasense discovery. The independent calculator accepts viewer-entered aggregate Mbps, minutes and MB/GB budgets in both release and explicit optimized preview. It needs no streaming backend and does not describe a catalog title. Ordinary catalog estimates remain unavailable until approved rates are supplied. No developer footage is available in optimized builds.

Implement optional PlaybackService.getDataPlanningMetadata and PlaybackMetadata.dataSense with exact authorized profile/title/episode/source/playback identity and expiry. MediaTransport.createDataSession may expose typed, attributed telemetry and genuine supported rendition selection; native transport currently exposes neither. Do not infer bytes from resolution labels, dropped frames or all page resources. Unknown remains unknown, complete empty observations are the only known zero, and duplicate IDs never count twice. Estimates and observed transfers are separately labeled and neither establishes provider charges.

ProfileService stores the existing playbackQuality preference; fresh merges preserve other settings. A saved preference does not apply a rendition or create adaptive switching. Budgets, dismissals and session counters remain local and temporary. DataSense and StoryLens share one open panel; neither personal panel broadcasts room playback intents. Quality adapters must preserve authorized identity/position and independent room timing. Production byte coverage, CORS/resource attribution, actual adaptive controls and physical browser verification remain integration work.

See [DataSense backend and transport contracts](./DATASENSE_BACKEND_CONTRACTS.md) and [Phase 2F.4 report](./PHASE_2F4_IMPLEMENTATION_REPORT.md). Keep the existing preview/release environment safeguard, protected lab exclusions and asset audits when implementing adapters.

Optimized builds disable browser/server/Turbopack source maps so private SSR maps do not embed historical conditional test literals. Development Turbopack maps remain enabled. This changes debugging artifacts only; retain the existing explicit preview-channel and developer-media guards. The expanded Phase 2F.4 release audit scans client and server outputs, including maps.

## Phase 2F.5 scope and authentication

The shared password visibility control now preserves the caret and selection across type changes without taking keyboard focus from its button. Focused optimized preview/release checks use raw keyboard entry for sign-in, signup and recovery/reset. The old intermittent no-text failure was not reproduced or assigned conclusively to a browser driver; physical/OS-keyboard acceptance remains required.

The existing public premiere showcase is verified, but scheduled premieres and Creator Lounges have no authoritative detailed specification in the repository. They remain pending scope confirmation, not completed screens awaiting only adapters. No event/creator fixtures, endpoints or speculative service contracts were added. See the [Phase 2F.5 report](./PHASE_2F5_IMPLEMENTATION_REPORT.md), [scope boundaries](./PHASE_2F5_BACKEND_CONTRACTS.md), [complete route inventory](./FRONTEND_ROUTE_INVENTORY.md) and [unavailable controls/content](./phase2f5/control-boundaries.md). Support delivery, approved payment flow and final legal/business content remain additional launch work.
