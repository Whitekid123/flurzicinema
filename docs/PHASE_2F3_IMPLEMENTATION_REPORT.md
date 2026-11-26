# Flurzi Cinema — Phase 2F.3

## Delivered experience

StoryLens is integrated into existing movie/series title details and the single MediaPlayer used by WatchScreen and Cinema Rooms. Public home/features discovery links lead into the guarded catalog. No standalone feature route, replacement player, chat, facial recognition or soundtrack identification was added.

The panel uses the cinematic neutral palette, Manrope, a restrained transition, a compact category navigator and editorial information hierarchy. At desktop player widths it sits beside the video; at narrower widths it expands below the video and controls. It has bounded scrolling, safe-area padding, 44px controls, keyboard focus on opening, Escape/close and focus restoration. It remains inside the fullscreen player. Opening/closing does not pause, seek or replace the video or its captions.

Available categories are In This Scene, Cast & Characters, Film Insights, Music & Soundtrack, Locations and Related Content. Categories appear only when supported by displayable supplied metadata or actual catalog relationships. Overview uses supplied catalog facts. Missing enriched metadata has accurate unavailable/retry feedback while existing catalog information remains usable.

## Components and contracts

New components/streaming/StoryLens.tsx and locally imported storylens.css implement the panel, category selection, classified record cards, portrait fallbacks, source links and intentional related-title navigation. Existing Artwork, Modal, WatchlistButton and profile-scoped watchlist controller are reused.

lib/storylens.ts defines StoryLensService, exact viewer/media identities, contextual bundles, capabilities, provenance, per-record spoiler classification, time annotations, validation, current-segment selection, safe errors and a bounded reader. lib/api/storylens-service.ts fails closed; centralized lib/api/experience-services.ts selects that adapter. Both release and ordinary preview have no invented contextual records.

Existing CatalogService basic cast/crew and title recommendations are reused. No crew record is guessed to be a director. Verified person relationships may supply related catalog IDs, resolved against exact catalog identities. The existing RecommendationService provides homepage rails, so it was preserved rather than incorrectly representing those rails as actor filmography.

Related exploration first asks for confirmation; cancel/Escape restores focus, while the explicit title-details link intentionally leaves the current view. My List remains a confirmed selected-profile service action. Back uses existing history and fresh player authorization/resume behavior rather than a new token/return storage system.

## Timing, spoilers and lifecycle

A bounded bundle is fetched on opening, never on media time updates. Current playback time selects supplied start-inclusive/end-exclusive annotations. Pause, replay and seeks use actual media time; no watched-position high-water mark reveals future context. A seek or segment change resets explicit reveals. Episode/profile/session changes isolate state and suppress obsolete responses.

Safe records display only within their applicable scope. Plot records require a supplied reached threshold and an explicit reveal; the warning hides the heading and body. Future thresholds, unknown classifications and plot data without thresholds remain hidden. Title details have no playback timestamp and cannot reveal plot-classified data. Backend editorial classification quality remains necessary; the interface does not infer safety.

Successful responses are cached only in the mounted viewer/media owner, for up to five minutes and no longer than supplied expiry. Closing aborts unfinished reads, retry invalidates cache, and expired contextual data is removed. Requests have a 20-second deadline; disposed/stale/profile-mismatched results are rejected. Links, IDs, counts, timestamps, provenance and media/profile identity are validated. Raw errors are not displayed.

## Player and room preservation

MediaPlayer receives optional catalog context, exposes actual currentTime and increments a local seek counter. Player shortcuts ignore focus within StoryLens. A nested confirmation handles its own Escape dismissal without closing the surrounding panel. No contextual action invokes room playback intents.

The existing transport, playback acquisition/expiry checks, progress reporter, source cleanup, controls, captions, native audio, speed restrictions in rooms and authoritative room bridge are retained. WatchScreen and Rooms pass their already authorized catalog title to that same component. Metadata-only catalog titles still do not create video elements.

The protected original motion-study lab alone exercises synthetic cast, music, locations, classified records and two real test-timeline segments. It also counts local room-bridge intents without inventing other participants. The page imports its client fixture only inside the existing development/opt-in condition. Proxy/API production exclusions remain intact. No film facts or annotations were inserted into the five fictional catalog titles.

## Validation

- npm run typecheck: PASS, including the final fixture correction.
- npm run lint: PASS, zero errors/warnings. Targeted lint also passed after the test-only provenance-copy correction.
- npm run build: PASS with default Turbopack in both configurations; 53 static pages. Optimized preview ID: 1_QOimRLsu-1pF6tC86kc. Final release ID: WvDE2rygfsqJyicusT9fi, with mocks disabled.
- npm run test:unit -- --maxWorkers=1: PASS, 286 tests across ten files, including 42 new StoryLens tests and all prior 244. Validation was run without overlapping the unit suite with compilation.
- Focused tests cover exact metadata/media/profile identity, provenance/URL/count validation, episode ownership, time boundaries, forward/backward seeking, missing annotations, unknown/future spoiler suppression, reveal eligibility, stale responses, disposal, cache expiry, deadlines and fail-closed services.
- Focused Chromium browser checks: PASS in explicit development, optimized preview and release configurations. Final runs contain 37 responsive observations: 19 development media/catalog observations, nine optimized-preview title observations and nine release authentication observations. All requested widths were exercised: 1920, 1440, 1024, 768, 430, 390, 375, 360 and 320px. No horizontal page overflow or page errors were recorded.
- Actual tap/keyboard checks exercised open/close/focus restoration, categories, 44px target dimensions, scene changes and seeks, keyboard spoiler reveal/reset, future/unclassified suppression, retained caption selection, playback continuing with the panel open, reduced motion, landscape and fullscreen containment.
- The original-media room bridge confirmed an actual Play intent, then no additional intents from StoryLens opening/category/closing actions. This verifies personal UI isolation, not production synchronization or remote participants.
- Normal preview sign-in, viewing preference and profile selection reached title details without guard bypass. Related-title confirmation, dialog Tab/Shift+Tab trapping, Escape/focus restoration, intentional navigation and Back passed.
- Release login fields remained enabled and accepted taps/typing/password visibility changes at all nine widths. Unavailable submission and the existing unavailable-account guard behaved accurately. No test-credential utility appeared.
- Protected player page, video/caption endpoint and private fixture URL returned 404 in both optimized configurations. Release asset audit found no audited test annotations, synthetic biographies/person identifiers, test credentials or codes.
- Source audit: PASS; 189 original sources/data/tests/configuration files unchanged outside nine planned existing source integrations. Catalog data, session/guards, playback acquisition/transport/progress, original tests, dependencies and shared Playwright/Vitest configuration are unchanged. Final diff whitespace check passed.
- Owned port 3016 refused connections after teardown; the isolated development snapshot and one-time mutation helpers were removed. No user development server was stopped. Two appended audio warnings from owned Chromium runs were retained separately after exact prefix/hash checks restored the original debug log.

Desktop/mobile media panels and title captures were visually inspected. Full-page captures include viewport-fixed navigation; this does not indicate an extra overlay added by StoryLens. Final catalog captures reset page scroll before capture.

Retained attempts document the existing-server lock, a harness serialization mistake, the original clip landing a requested two-second seek at its early playable frame, Escape after a focused spoiler disappeared, a guard-expectation mismatch and a 58-second development cold compile. The early test position now uses five seconds inside the supplied opening segment, with unchanged seek precision and separate exact-boundary unit coverage. Escape handling was corrected in the panel. Release tests assert the existing unavailable-account guard. Development routes are compiled before interaction; application assertion/shared test timeouts were not increased.

Lint caught an impure render-time clock check; expiration checks now run in the opening interaction and existing expiry effect. The initial unit attempt caught shared provenance in the isolated test-data factory; independent record copies corrected contamination, and the complete suite passed. Existing tests were not relaxed. Vitest retains its prior config-loader compatibility warning.

[Validation](./phase2f3/validation.json) · [Unit results](./phase2f3/unit-tests.log) · [Final media/catalog browser evidence](./phase2f3/development-final-browser.json) · [Optimized preview](./phase2f3/preview-browser.json) · [Release browser](./phase2f3/release-browser.json) · [Source/release audit](./phase2f3/source-release-audit.json) · [Teardown/cleanup](./phase2f3/owned-snapshot-cleanup.json) · [Debug log preservation](./phase2f3/debug-log-preservation.json)

[Desktop viewing panel](./phase2f3/1440-player-panel.png) · [Mobile viewing panel](./phase2f3/390-player-panel.png) · [320px viewing panel](./phase2f3/320-player-panel.png) · [Mobile title context](./phase2f3/development-390-title-panel.png)

## Backend dependencies and limits

Supply approved cookie-session metadata transport, viewer/episode authorization, reviewed editorial/provider provenance, licensed portraits, verified people/characters/music/locations and spoiler classifications through the documented contract. The browser cannot independently establish factual truth or source approval.

Native video fullscreen/PiP may show video alone. Physical devices, operating-system keyboards, Safari/Firefox and real licensed production media require independent verification. Scene-aware production metadata and real remote room playback cannot be demonstrated without approved adapters. No production AI service, external scraping, DataSense, Creator Lounges, subscription or entitlement was introduced.

[Backend contracts](./STORYLENS_BACKEND_CONTRACTS.md) · [Production handoff](./FRONTEND_PRODUCTION_HANDOFF.md)
