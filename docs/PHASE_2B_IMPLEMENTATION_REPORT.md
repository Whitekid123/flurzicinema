# Flurzi Cinema — Phase 2B

## Delivered scope
/browse now contains the authenticated streaming homepage. StreamingShell supplies the same navigation across retained browse, watch and account routes. The existing SessionProvider, profile selection and RequireAuth guards are retained.

Public-site components, artwork, motion and copy were preserved. Phase 2A screens were not redesigned. Existing package, Playwright configuration and unrelated uncommitted changes were retained. Original touched sources are backed up in docs/rollback/pre-phase2b.

Movies, Series, Search, My List, History, full title details, Account and Player destinations remain their existing scaffold pages, as required by this milestone. Navigation reaches these routes; this report does not claim those screens are finished.

## Interface
A neutral black/white, Manrope interface lets the existing title artwork supply color. Desktop uses a compact sticky header; tablet/mobile use five bottom destinations and a separate profile disclosure. Current routes have accessible active states. The profile disclosure supports keyboard access, Escape, focus leaving the control and outside clicks, with switch/manage profile, account, history and sign-out actions.

The full-width spotlight has manually selected featured titles, forward/reverse controls, metadata, synopsis, availability, information and watchlist actions. Selection uses a brief opacity transition. There is no autoplay, sound, scroll pinning, wheel interception or continuous media loading.

Landscape content rows have native touch scrolling, scroll snapping, keyboard-accessible card links and desktop previous/next controls with disabled boundary states. Cards provide matching artwork, metadata, quick information and watchlist buttons. Hover changes brightness without enlarging cards. My List uses portrait cards. All actions are available on touch and keyboard.

The shared native-dialog component supplies focus trapping, Escape/backdrop dismissal and focus restoration for title quick information. Existing Artwork supplies optimized local images and an error fallback. Only the active hero image loads eagerly; row artwork remains lazy. Loading skeletons, empty states, partial-service notices and retry states are included.

Responsive rules address 1920, 1440, 1024, 768, 390 and 320px. Both system reduced motion and the selected profile's reduced-motion preference disable app transitions; row arrow scrolling also respects them. Visual verification is reported separately below.

## Components and logic
- StreamingShell.tsx: desktop/mobile navigation and ProfileMenu.
- BrowseHome.tsx: profile-keyed loading, confirmed watchlist mutations, collections and discovery.
- FeaturedHero.tsx: FeaturedHero and TitleQuickInfo.
- ContentUI.tsx: MetadataBadges, WatchlistButton, ContentRow, MovieCard/SeriesCard, ContinueWatchingCard, BrowseSkeleton and BrowseState.
- lib/browse-home.ts: service aggregation, title deduplication, progress/episode presentation and conservative playback-action gating.
- styles/streaming-browse.css: app-scoped styles, imported after existing styles.
- tests/streaming-browse.unit.test.ts: focused service and display-logic coverage.
- scripts/phase2b-preview-qa.mjs: owned production-preview HTTP/browser check.

## Data and interactions
The homepage calls CatalogService.listTitles/listGenres/getContinueWatching/getTitle, RecommendationService.getHomeRails, WatchlistService.list/add/remove and SubscriptionService.getEntitlement through the existing registry. Components depend on streaming-domain types, not an external metadata provider.

Independent requests settle separately: failure of an optional service retains available content and presents retry feedback. Missing saved/progress title metadata is resolved by ID. Returned watchlist and progress records are filtered to the active profile. Profile changes remount page state and discard prior async results. Catalog movie/series rows provide a factual fallback when curated rails are unavailable.

Saving/removing a title updates every homepage instance after service confirmation. Controls prevent duplicate in-flight mutations, expose pressed/busy states and announce success/failure. Loading failures disable watchlist controls rather than treating an unknown list as empty.

Continue Watching consumes actual service progress, resolves season/episode names, clamps progress and handles missing duration. No watch history is invented. There is no dismiss control because the existing contracts do not support removal. Resume is shown only with entitlement, a currently licensed title and, for series, a matching licensed episode. Invalid or expired availability dates fail closed. The backend and player must still authorize playback.

Genre links carry real genre slugs to the existing Search route. Movies/Series links and full-title links retain the established route architecture. Those destinations remain outside this milestone; quick information is usable directly on the homepage.

## Development fixtures
The opt-in NEXT_PUBLIC_USE_MOCKS=1 flow still starts signed out and requires normal demo sign-in/onboarding/profile selection. No guard bypass was added.

The streaming mock catalog now adapts all five existing fictional public titles into CatalogTitle models, preserving matching artwork and canonical synopses. Existing mock IDs remain stable. Availability is metadata-only; the previous misleading licensed availability fixture was corrected. No title is licensed for playback.

Development home rails are honestly labeled Movies to explore and Series spotlight. There are no invented trending rankings, popularity statistics, exclusivity or personalized recommendations. Continue Watching begins empty.

Watchlists are now in-memory, profile-specific, idempotent and validated against existing profiles/titles. Responses are cloned. They survive client navigation and reset on refresh; they are not persistent backend storage. The existing fixed-PIN/kids limitations remain. An unrated-catalog notice appears for kids profiles; secure maturity filtering is not implemented.

No API key, provider subscription, active membership, payment, real session or playback source is fabricated. Production services continue failing closed until adapters are supplied.

## Research
Read the public pages at [Netflix](https://www.netflix.com/), [Prime Video](https://www.primevideo.com/), [Disney+](https://www.disneyplus.com/) and [Apple TV](https://tv.apple.com/). These were public/unauthenticated retrievals, not access to subscribers' homepages. Apple artwork retrieval contained placeholders.

Official [Prime Video redesign description](https://www.aboutamazon.com/news/entertainment/prime-video-updated-steaming-experience) informed content-type navigation, a hero rotator and clarity about access. The [Disney+ update description](https://www.disneyplus.com/explore/articles/disney-plus-app-redesign-new-features) informed profile prominence, discovery hierarchy and cinematic rows. These are pattern references; competitor assets, copy and branding were not reused. No logged-in visual inspection is claimed.

## Validation
- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run build: PASS; final build 16ediNneuu3esXkz3SU-A, all 45 static pages generated.
- npm run test:unit: PASS; 34 tests across three files, including 15 focused Phase 2B cases and all prior 19 tests.
- Owned production server: started successfully; all eight checked browse/profile/account URLs returned HTTP 200. HTTP status checks alone do not assert authentication; normal client sign-in/profile flow was separately exercised.
- Focused Chromium browser harness: PASS. Normal demo login, preference saving and Main profile selection reached /browse without bypassing the guards.
- 1920, 1440, 1024, 768, 390 and 320px: no horizontal page overflow and no hero heading/action clipping. Desktop/mobile navigation switched at the intended breakpoints.
- Interactions: featured forward/reverse; save/remove and synchronized My List; information dialog/Escape; keyboard activation, trapped focus and focus restoration; profile disclosure/Escape; profile switching with the existing Kids PIN flow; profile-specific empty/saved watchlists and persistence when returning to Main; active Movies navigation; sign out.
- Input/motion: native horizontal mouse-wheel scrolling, a 390px mobile touch context with a Chromium touch swipe, and system reduced-motion animation suppression.
- No browser page errors were recorded. Owned preview servers were stopped after each check.
- The pre-existing Playwright suite/configuration and its deferred timeout investigation were left unchanged. These results come from the separate focused harness, not that full suite.

Screenshot review initially found a collision with the public homepage's cinema-hero CSS class: desktop hero text/actions were clipped. The app spotlight now uses independent streaming-spotlight selectors. The final screenshots and clipping checks verify the correction. Compact card-control specificity was also corrected. Public CSS was not modified.

The six captures are saved under docs/phase2b. Desktop (1440px) and mobile (390px/320px) captures were visually inspected. The browser checks use desktop Chromium and an emulated touch context; physical devices and other browser engines were not tested.

[Browser/HTTP observations](./phase2b/observations.json) · [Desktop capture](./phase2b/1440-browse.png) · [Mobile capture](./phase2b/390-browse.png)

Vitest emitted the existing config-loader compatibility warning; tests passed. No dependency or test-configuration changes were made for it.

## Backend dependencies and next milestone
Persistent cookie-session authentication; authorized profile-scoped watchlists/history; licensed regional catalog and image delivery; authoritative home rails and entitlements; secure maturity filtering; playback authorization and a finished player remain backend/product dependencies. Existing frontend contracts were not replaced.

Recommended next milestone: finish Movies, Series, Search, My List and title-detail screens using these reusable components and services, then build the authorized playback experience in its own milestone.
