# Flurzi Cinema — Phase 2C

## Completed routes
- /browse/movies: movie catalog, poster cards, genre/year filters, actual-field sorting and URL pagination.
- /browse/series: dedicated series collection with landscape artwork, synopsis and actual season/listed-episode counts.
- /browse/search: keyboard-submitted search, movie/series filters, clear query, genre suggestions, no-results and retry states.
- /browse/my-list: selected-profile library, movies/series groups, confirmed removal, missing-metadata handling and paging.
- /browse/history: service-backed history, accurate progress/date/episode presentation, pagination and honest empty/error states.
- /browse/title/[id]: immersive movie/series details, matching artwork, available metadata and credits, watchlist, season selection, listed episodes and related content.

The existing SessionProvider, RequireAuth, desktop/mobile navigation and selected-profile flow are retained. Public pages, account entry, profile onboarding and the /browse homepage were not rebuilt. Account management and the player remain separate milestones.

## Design and component reuse
Reviewed the Phase 2B dashboard capture before implementation. The new screens use its neutral cinematic palette, Manrope, restrained controls and media artwork. Movie browsing uses a poster-led grid, Series uses broad season-aware rows, Search uses landscape results and the library separates saved movies and series. Details use an immersive backdrop, a supporting poster, readable synopsis/metadata and a distinct episode section.

Reused MovieCard, SeriesCard, ContentRow, MetadataBadges, WatchlistButton, TitleQuickInfo, Artwork, Modal and BrowseState. Existing focus handling, dialog Escape/focus restoration, image-error fallbacks and reduced-motion behavior remain in use.

New files:
- components/streaming/CatalogScreens.tsx
- components/streaming/LibraryScreens.tsx
- components/streaming/TitleDetails.tsx
- components/streaming/DiscoveryUI.tsx
- lib/catalog-discovery.ts
- lib/title-details.ts
- lib/watchlist-controller.ts
- styles/streaming-discovery.css
- tests/streaming-discovery.unit.test.ts
- scripts/phase2c-preview-qa.mjs and phase2c-source-audit.mjs

Six existing route pages now render these components within the established guarded layout. New styles are scoped to the authenticated shell and imported after existing styles. No dependencies were added.

## Filters, search and pagination
URL state uses q, genre, year, sort, type and page. Submission uses client navigation, preserving the mock session. Filter chips remove individual criteria; Reset filters returns to the base route. Browser Back restores the prior URL and its controls.

Supported sorts: year-desc (Newest release), year-asc (Oldest release), title-asc (Title A–Z). These operate on actual release-year/title fields; there are no popularity scores or invented ratings. Unknown release years sort after known years.

Search uses an explicit form/Enter submission rather than automatic keystroke requests. Clear query retains other filters. Empty searches offer actual catalog genres and Movies/Series links. A genre link from the homepage opens the corresponding search state.

Each request asks for one server page of 24 titles. Mixed search uses CatalogService.search with existing PageRequest fields. Combined content-type search uses CatalogService.listTitles with search/mediaType/genre/year/sort/page. The backend adapter must implement these query semantics consistently. The UI never loads the entire catalog to filter it permanently in the browser.

Query values are normalized and bounded; unknown sort/type and invalid years/pages fall back safely. Out-of-range pages have an honest empty state and a route back to an available page. Search/filter loads use cancellation checks and keyed request state so old results cannot replace a newer query.

## Watchlists and profile isolation
The existing WatchlistService remains the source of saved state. A shared controller/hook handles confirmed add/remove responses, pressed/busy states, duplicate mutation prevention, errors and status messages. A profile-scoped invalidation signal refreshes other mounted controller instances; it stores no global account data.

Each route loads the active profile's list and filters returned records by profileId. Profile changes create fresh controllers; unmounted requests cannot update another profile. The retained homepage reloads its existing service-backed state on navigation. Cross-route consistency is included in the focused browser checks.

My List fetches only the current page of title metadata. Requests are deduplicated and bounded to eight concurrent lookups. A route-local resolver reuses confirmed metadata when titles are removed, avoiding a full refetch of remaining artwork/details. Failed lookups remain retryable. Mismatched title IDs are rejected rather than displaying unrelated title/artwork data.

A missing title remains a removable saved entry. A failed watchlist request is an error, never an empty library. The existing list contract returns all saved IDs; server-side paging of IDs would require a future contract extension for very large libraries.

## Detail behavior
Primary title loading is separate from optional related-content and account-access requests. Optional failures preserve usable title information and expose retry.

Movies display supplied runtime, year, genres, synopsis and matching poster/backdrop. Cast/crew and content ratings appear only when present. Series display actual seasons and listed episodes; selection is URL-backed with a safe first-season fallback. The current fixture has one season, so its selector is correctly disabled.

The two existing episode records are preserved: An unopened letter (42 minutes) and The other side (44 minutes). No additional episodes, descriptions, seasons or cast were invented. Missing episode artwork uses a numbered tile, not an unrelated image. The UI says listed episodes rather than claiming these records are the entire series.

Related items come from CatalogService.listRecommendations, are deduplicated and exclude the current title. The development adapter selects shared-genre titles and does not claim personalization, popularity or exclusivity.

Playback is unavailable in this milestone. No fake Play/Resume control or source is created. Availability text distinguishes metadata-only, unannounced, unavailable, expired/future records and the unimplemented player. Entitlement failure does not grant access. Production must authorize licensing, region and account access server-side when the player is implemented.

## History and development fixtures
CatalogService.getViewingHistory already exists, so no new service contract was introduced. The view resolves matching title metadata, episode names, watched dates, completion and progress. It handles missing metadata and service failure without inventing activity. Removal/dismissal is not offered because the contract does not support it.

The development history remains empty. The five fictional titles, IDs, artwork relationships, synopses, content types and metadata-only availability remain intact. Mock list/search adapters now implement filtering, sorting and pagination through the shared pure query logic. Mock related-title responses exclude the current title. Mock history validates session/profile ownership.

The opt-in development session and lists remain in memory and reset on refresh. Refresh returns through the existing auth/profile guards; it does not fabricate a persistent account or session. Production deep-link restoration after profile selection remains a backend/auth-flow dependency.

No API credentials were assumed or added. No metadata provider, production authentication, payments, streaming rights or playback backend was created.

## Validation
- npm run typecheck: PASS.
- npm run lint: PASS; no remaining errors or warnings.
- npm run build: PASS; final build XLN375jCbxH09Me71OWBc, all 45 static pages generated.
- npm run test:unit: PASS; 61 tests across four files, including 27 new Phase 2C tests and the previous 34.
- Source audit: PASS; all 38 protected source/configuration files match the pre-Phase-2C hashes, and no new detail/discovery CSS class names collide with existing styles.
- Production HTTP checks: all eight checked catalog, library and detail URLs returned 200. These HTTP checks alone do not assert authentication.
- Focused Chromium browser flow: PASS through normal demo sign-in, preference saving and profile selection, without bypassing guards.
- Responsive matrix: seven screens at 1920, 1440, 1024, 768, 390 and 320px, plus an initial desktop capture. All 43 recorded checks had zero horizontal page overflow and no clipped checked headings/filter labels/episode titles.
- Browser interactions: genre/year/sort filters, URL updates and filter reset, browser Back, keyboard search, mixed/type-specific results, empty query, no results, clearing, rapid query replacement, saved movie/series groups, removal synchronized with the homepage, Kids PIN/profile isolation, dialogs and focus restoration, out-of-range page recovery and refresh/session reset.
- Separate 390px mobile touch context: PASS for tap-based filters/search/details/save/remove, native selection, at least 44px checked control heights, reduced-motion transition suppression and no page overflow.
- No browser page errors were recorded in either browser context.
- Owned production preview servers were stopped after each attempt.
- The existing full Playwright suite/configuration and deferred navigation-timeout investigation were left unchanged. The results above come from the focused Phase 2C harness.

Browser review caught and corrected two implementation issues: filter selects needed explicit accessible names, and the filter/results siblings shared a React key, retaining duplicate form DOM during asynchronous updates. They now use distinct keys. The focused regression check verifies exactly one filter form before exercising the filters.

Desktop Movies/Series/series details, tablet Search, mobile My List/movie details and the 320px catalog/series details were visually inspected. Carousel positions are reset before captures so the saved views show the initial row position.

[Browser/HTTP evidence](./phase2c/observations.json) · [Source audit](./phase2c/source-audit.json) · [Movies](./phase2c/1440-movies.png) · [Series details](./phase2c/1440-series-detail.png) · [Mobile movie details](./phase2c/390-movie-detail.png) · [Mobile My List](./phase2c/390-my-list.png)

The requested viewport matrix and touch interaction checks used Chromium/emulated devices. Physical devices and other browser engines were not tested. Populated history and multi-season browser switching could not be exercised with the existing empty history and one-season fixture; the relevant data/selection logic has unit coverage. Optional-service failures and missing/mismatched metadata are covered at the unit/service-logic level rather than by injecting fabricated activity into the browser.

Vitest emitted the existing config-loader compatibility warning; all tests passed. No test-configuration or dependency changes were made for that warning.

## Backend dependencies and known limits
Persistent authorized catalog/search/history/watchlist adapters; stable server paging and sort semantics; cookie sessions and profile restoration; authoritative entitlement/licensing/region and maturity enforcement; real episode metadata and rights; playback authorization and the separate player.

The five-title fixture cannot demonstrate large real-world catalog breadth. The current series has only one season and two listed episodes. Real-account history is not populated. No fake popularity, membership, playback or persistent data is shown.

Recommended next milestone: implement the authorized video player and progress reporting against a confirmed licensed backend, with production service integration and profile restoration handled in coordination with the backend engineer.
