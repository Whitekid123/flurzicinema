# Flurzi Cinema — Phase 2F.4

## Delivered frontend

DataSense integrates into movie and series details, the existing MediaPlayer used by WatchScreen and Cinema Rooms, account viewing preferences and public feature discovery. No additional route, player, analytics dashboard, streaming infrastructure or dependency was introduced.

The public independent calculator accepts an explicit viewer-entered combined audio/video bitrate, minutes and MB/GB allowance. It calculates encoded-media use, per-hour use, estimated viewing duration, remaining allowance and budget comparison. Invalid inputs receive feedback; budgets and assumptions can be cleared/reset. It works without a playback backend in release and explicit optimized preview. Inputs never claim to describe a catalog film or retrieve a mobile balance.

Title details offer DataSense before playback. Movies use supplied runtime; series require a concrete listed episode. The typed optional planning operation can supply approved rendition rates for comparisons. Each option shows estimated per-hour/full-title use and budget suitability. Missing bitrate remains unavailable and retryable while the independent estimator remains usable. None of the five fictional catalog records was assigned a bitrate.

The interface follows the existing neutral cinematic palette and Manrope, with a restrained transition, clear estimate/observation labels, a budget progress indicator, responsive comparisons, keyboard focus, 44px controls and safe-area padding.

## Components and calculations

New components/streaming/DataSense.tsx contains the independent calculator, title planner, profile preference editor, player panel and local connection hints. Locally imported datasense.css scopes the interface. types/datasense.ts defines exact identities, bitrate bounds, rendition information, planning metadata, playback metadata, transfer observations, telemetry, transport sessions, estimates and budget/state types.

lib/datasense.ts implements decimal conversions, bitrate/audio handling, range estimates, input bounds, budget comparisons, notifications, formatting, bounded planning reads and confirmed profile preference writes. lib/datasense-session.ts owns source-scoped active-play estimates, telemetry validation, deduplication and quality-selection lifecycle.

One MB is 1,000,000 bytes; one GB is 1,000,000,000 bytes. Estimated bytes equal aggregate bits per second × seconds / 8. Separate audio is added once for video-only rates; an aggregate rate already includes audio. Missing audio/rate stays unknown. Supplied ranges remain ranges rather than fabricated midpoints.

Budgets accept positive decimal inputs from 0.001 MB through 1,000 GB, with up to three decimal places. The educational calculator accepts up to 1,000 combined Mbps and seven days of viewing. Estimates avoid byte-level precision and distinguish encoded media from observed transfers and provider charges. Explanatory text covers buffering, retries, overhead, caching and changing bitrates.

## Player, telemetry and budget behavior

MediaTransport optionally exposes a typed DataSense session; PlaybackMetadata optionally binds data information to an exact profile/title/episode/playback-session/source identity and expiry. The native transport exposes no invented bitrate, transferred-byte total or manual rendition selection. Its unknown values remain unavailable rather than zero.

Session estimates integrate supplied rates over active playback time and playback speed. Pause, replay and seeking do not erase prior estimated spend. A background timing gap over 30 seconds invalidates the estimate instead of hiding unaccounted time. Remaining estimates use actual remaining media time and the current supplied rate.

Transport observations count only attributed media bytes. Stable event IDs are deduplicated within/across snapshots. Contradictory bytes, unsafe totals and ledger exhaustion invalidate totals rather than evicting IDs and double-counting. Complete empty observations can establish zero; missing/partial coverage stays distinct. Source, viewer, timestamps, ordered sequence, rate bounds and rendition identity are validated. Example telemetry is rejected outside an explicit protected exercise.

The player displays supplied rendition/rate, estimated hourly/session/remaining consumption, observed transfers when available, remaining viewing time, temporary budget and supported quality comparisons. Selection appears only when the active authorized transport supplies both capability and operation. Confirmation must identify the requested actual rendition. Current native playback does not implement adaptive streaming or quality switching.

Notifications distinguish estimated approaching/exceeding use from attributed transfer thresholds at 80%/100%. Viewers can dismiss, review or continue. Notices do not pause, seek or change quality. Dismissals are bounded local memory. The interface never guarantees a telecommunications cap.

Browser connection/save-data hints use feature detection and cleanup. A browser effective connection category is not described as mobile-network technology, proof of Wi-Fi, free access or an unmetered connection. No speed-test downloads, device monitoring or subscriber identifiers are used.

## Preferences and compatibility

DataSense reuses ProfilePreferences.playbackQuality and ProfileService: auto → Automatic preference, low → Data Saver, medium → Balanced, high → Highest available. Existing 4k values remain readable as an existing preference; no unsupported resolution is newly advertised. Save rereads the owned profile, merges fresh preferences and checks the confirmed identity/value. Cancel discards the local draft. Profile editing now also retains existing audio/caption and other preference fields.

Saving a preference does not claim to change the current rendition. Preview writes persist through client navigation and reset on refresh. Profile/source/session ownership and mounted guards suppress obsolete results; budgets, counts and dismissals are temporary and isolated. No persistent usage history or browser credential storage is added.

DataSense and StoryLens share one auxiliary-panel owner. Opening one closes the other, keeping video, controls and captions in their own area. Desktop uses a side panel; narrower screens place it below the video. Panels remain within the fullscreen player, scroll within bounds and restore focus on close/Escape. Player shortcuts ignore their controls.

Existing playback acquisition, entitlement/expiry checks, progress reporting, source cleanup, captions, native audio and room bridge are preserved. DataSense has no room-intent API and cannot broadcast a budget, network hint or quality preference. Cinema Rooms still independently authorizes each viewer. Metadata-only titles still create no video element.

## Preview, release and backend handoff

Ordinary preview and release have a useful public calculator. Approved production adapters are optional and fail closed when absent. No endpoint, actual provider balance, billing charge, catalog bitrate or usage history is invented.

Only the existing protected original-media lab imports the illustrative transport. Its rates, transfer buttons and example selections are explicitly identified; example selection leaves video quality unchanged. A separate native-unknown exercise uses the actual native transport. Existing server development/opt-in, proxy and API exclusions remain authoritative. Production-only source-map settings prevent private SSR maps from embedding historical conditional testing literals; development maps and the mock-channel guard are retained.

The backend engineer can implement optional PlaybackService.getDataPlanningMetadata and MediaTransport.createDataSession without reconstructing the UI. See [DataSense contracts](./DATASENSE_BACKEND_CONTRACTS.md) for authorization, attribution, audio/range semantics, quality selection, CORS, deadlines, privacy and retention. [Production handoff](./FRONTEND_PRODUCTION_HANDOFF.md) is updated.

## Validation

- npm run typecheck: PASS. The production build also completed its TypeScript step.
- npm run lint: PASS; zero errors or warnings.
- npm run build: PASS with default Turbopack in explicit optimized preview and release configurations; 53 static pages. Preview build ID: LTbf173gV_G4sP6UIXhNV. Final release build ID: vQ-WBf4DnPvJjLBuqJrtw.
- npm run test:unit -- --maxWorkers=1: PASS; 369 tests across eleven files, including 83 DataSense tests and all previous 286. Compilation and unit execution did not overlap. Units ran with the normal fail-closed service selection; preview behavior was checked separately in Chromium.
- Focused unit coverage includes decimal conversions, aggregate/separate audio, ranges, invalid/missing inputs, budget thresholds, unknown telemetry, duplicate/conflicting observations, bounded ledgers, source/profile/session identity, preference merges, stale reads, deadlines, unsupported selection, confirmed selection, expiry and single disposal.
- Focused Chromium verification: PASS in development, explicit optimized preview and release. 64 responsive observations at 1920, 1440, 1024, 768, 430, 390, 375, 360 and 320px, plus landscape; zero horizontal page overflow or page errors. DataSense controls were checked for 44px targets.
- Touch/keyboard checks exercised budget typing/focus, MB/GB, calculation updates, validation/reset, panel open/close/Escape/focus restoration, internal scrolling, one open player panel, continued playback, retained captions and StoryLens spoiler reveal/reset, notifications/dismiss/continue, reduced motion and fullscreen containment.
- The protected original-media lab verified example transfer deduplication and confirmed example selection without replacing the video or changing its position. An actual room Play intent was followed by no extra intents from DataSense actions. This is personal UI isolation, not production quality switching or independent remote-room verification.
- Normal optimized preview sign-in, viewing preference and Main profile selection passed without guard bypass. Movie unavailable estimates, 42/44-minute selected-episode runtimes, no fabricated video/rates, preference cancel/save/client-navigation persistence and separated Main/Kids preferences passed through the existing PIN flow.
- The independent calculator passed all nine widths in both optimized configurations. Release login accepted taps, email keyboard entry, password input events and visibility/focus changes at all nine widths; unavailable submission stayed accurate and no test-credential utility appeared.
- Protected lab, media/caption endpoint and private fixture URLs returned 404 in both optimized configurations. Client and server release asset scans found none of the audited credentials, synthetic StoryLens records or DataSense lab values.
- Source audit: PASS; 194 original source/data/test/config/log files unchanged outside twelve planned existing source/build integrations. Prior uncommitted StoryLens work, catalog, auth/session/guards, playback acquisition/progress/room logic, dependencies and shared test configuration were preserved.
- Owned port 3017 refused connections after teardown; the owned source snapshot and one-time mutation helpers were removed. No existing development server was stopped. Chromium log additions were retained separately only after original-prefix/hash checks preserved the existing root debug log.

Desktop/mobile player panels, public calculators, title planning and account preference captures were visually inspected. Panel captures reset the internal scroll position; public calculator captures show the actual feature section rather than stitching or editing screenshots. Account captures can include the retained viewport-fixed streaming navigation; the page remains scrollable.

Retained attempts record a harness expectation of “fits” for 90% use (correctly reported approaching), the short original clip ending during a longer continuity exercise, and the first full unit run. The harness now loops only that original test clip during continuity checks; assertion/shared test timeouts were not increased. Units caught duplicate expiry disposal, which was fixed with idempotent cleanup and covered by the passing suite. The first full unit process also inherited preview mock settings unsupported by its existing Node require path; the unchanged existing tests passed under normal service selection. No shared test infrastructure or previous test was changed.

The expanded artifact audit found historical test literals only in private SSR source maps. Optimized builds now disable source maps through the installed Next.js Turbopack setting; development maps and the existing mock-channel guard remain enabled/unchanged. Both optimized configurations were rebuilt and verified after this correction. Vitest retains its prior config-loader compatibility warning.

An execution-session interruption left incomplete generated build files; source integrity and all 194 protected-file hashes were verified, the incomplete records were retained, and the optimized checks were rerun. The original development process was absent after the interruption; the standard development server was restored on port 3000 after validation, using the existing project environment.

Additional retained harness attempts document the title planner’s hidden second calculator and existing account-navigation labels; selectors were scoped to the actual controls.

Raw-key password input in the focused app run produced keydown/keyup without text-input events, while a plain native-field probe accepted raw keys. Tap plus standard input events retained the exact password through visibility toggles and completed normal sign-in. The application authentication sources were preserved; raw-key password insertion in this environment remains an unresolved verification limitation, and physical keyboard behavior is not claimed.

[Validation](./phase2f4/validation.json) · [Development browser](./phase2f4/development-browser.json) · [Optimized preview](./phase2f4/preview-browser.json) · [Release browser](./phase2f4/release-browser.json) · [Unit results](./phase2f4/release-unit.log) · [Source/release audit](./phase2f4/source-release-audit.json) · [Teardown](./phase2f4/server-teardown.json) · [Password input trace](./phase2f4/preview-attempt-5.json) · [Native driver probe](./phase2f4/password-driver-probe.json) · [Interruption integrity](./phase2f4/interruption-integrity.json) · [Development server](./phase2f4/restored-development-server.json)

[Desktop player](./phase2f4/1440-player.png) · [Mobile player](./phase2f4/390-player.png) · [Mobile calculator](./phase2f4/release-390-calculator.png) · [Mobile preferences](./phase2f4/preview-390-preference.png)

Physical devices, operating-system keyboards, Safari/Firefox, real licensed adaptive media, production byte attribution, actual quality switching and independently connected Cinema Rooms viewers require separate verification. Illustrative lab totals are not measured consumption. The frontend cannot establish provider charges or enforce a network data cap.
