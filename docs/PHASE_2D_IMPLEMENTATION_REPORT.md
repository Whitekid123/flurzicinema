# Flurzi Cinema — Phase 2D

## Scope and preservation
The placeholder at /watch/[id] is replaced by an immersive native-media player. The ID continues to identify the catalog title; the existing ?episodeId= query identifies a specific series episode. Series without a valid listed episode return to selection rather than guessing an episode.

The public website, authentication, onboarding, dashboard, discovery, libraries and navigation were preserved. Title details received conditional movie/episode links and a factual movie playback-availability link. Metadata-only titles still have no Play/Resume action. No catalog title, rights, entitlement or viewing activity was invented.

Affected original files are backed up in docs/rollback/pre-phase2d. The source audit covers 26 protected files, including shared session/guards, dashboard/catalog/library UI, public home components and package/test configuration. The audit reports no changes. Global CSS and dependencies were not changed.

## Components and technology
- components/streaming/MediaPlayer.tsx and player.css: real media controls, events, overlays, settings, responsive presentation and resource lifecycle.
- components/streaming/WatchScreen.tsx: selected-profile and session-bound authorization loading, episode context, errors, retry and return navigation.
- lib/playback.ts: identity, access/source validation, state mapping, episode ordering, progress and resume calculations.
- lib/media-transport.ts: native transport and capability detection; attach returns a teardown function.
- lib/playback-progress.ts: throttled, serialized progress writes and genuine completion reporting.
- components/streaming/PlayerLab.tsx: isolated development fixture using the same MediaPlayer.
- proxy.ts: a pre-render 404 boundary matched only to developer/fixture paths.
- app/player-lab/page.tsx and app/api/player-lab/[asset]/route.ts: server-gated development page and range-capable fixture endpoint.
- scripts/generate-player-fixture.mjs: original canvas animation and synthesized tone generation.
- tests/streaming-player.unit.test.ts: focused player logic tests.
- scripts/phase2d-browser-qa.mjs, phase2d-dev-server.mjs and phase2d-source-audit.mjs: focused verification.

Native HTMLVideoElement is the smallest suitable choice while the backend format is undecided. MP4/WebM and browser-native HLS are accepted only when canPlayType reports support. Non-native HLS and DASH produce an explicit unsupported state. No competing player dependencies were installed.

Reviewed [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement), [hls.js](https://github.com/video-dev/hls.js) and [Shaka Player](https://github.com/shaka-project/shaka-player). Hls.js provides an MSE HLS path; Shaka supports adaptive DASH/HLS and EME integration. Neither is integrated. A future transport must attach to the same video element, expose real track/rendition capabilities and release its resources on teardown.

DRM, license-server requests, encrypted media configuration, adaptive bitrate selection and CDN delivery are not implemented. No production format or DRM provider has been assumed.

## Controls and presentation
Play, pause, replay, 10-second backward/forward seek, an interactive position range, elapsed/total time, loading/buffering feedback, volume, mute and fullscreen operate on the real media element. Picture-in-Picture appears only when detected. Fullscreen/PiP request failures give feedback.

Settings provide actual playback-rate changes and supplied caption tracks with Off. Native audio language selection appears only if the browser exposes multiple actual audio tracks. Backend audio/quality labels alone do not create cosmetic controls. Manual adaptive quality selection is not implemented by the native transport.

The player uses the existing Manrope family and neutral black/white palette, a widescreen media surface, restrained translucent controls, matching title/episode copy and return navigation. No background sound autoplays. No subsequent episode autoplays.

Controls reveal on pointer, touch and keyboard activity, remain visible while paused, focused, in settings or in an error, and can hide after playing inactivity. Hidden controls are inert. Focus indicators and native labeled range/select controls are included. Space/K toggles playback, arrows seek, M mutes and F toggles fullscreen when supported. Shortcuts defer to focused controls, editable content and modified keys. System and selected-profile reduced motion suppress transitions and spinner rotation.

## State and lifecycle
Access checks, source loading, ready, playing, paused, seeking, buffering, ended, unavailable, unsupported, network/decode failures, expired session, missing subscription, regional restriction and denied authorization have finite recovery states. Access acquisition has a 30-second retry deadline; initial load/buffering has a 20-second network timeout. No source is attached when access/source validation fails.

The current metadata-only catalog is rejected before obtaining playback metadata. Entitlement failure never grants access. Production metadata must match the resolved title, exact episode and selected profile, contain a playback session ID, valid future expiry, an approved source URL and an explicit source type.

Profile/title/episode/session changes remount the player and cancel stale acquisition results. Component teardown removes listeners and timers, pauses and unloads the source, tears down the transport and exits owned fullscreen/PiP where feasible. Authorization expiry stops playback, including an expiry recheck on media/visibility events. Session expiry and access failures returned while reporting progress also stop the player.

## Progress and resume
Meaningful playback uses real media position and finite positive duration. Periodic writes are limited to once per 15 seconds; pause, seek completion, ended, page hide and navigation attempt a final update. Requests are serialized and intermediate pending samples coalesce. A separately retained terminal update prevents immediate replay from dropping completion while an earlier write is in flight. Final delivery is best effort, not a persistence guarantee.

Writes carry profile/title/episode identity and playbackSessionId. Genuine ended events mark completion and call reportCompleted. Save failures are visible, retryable and do not imply successful persistence; authorization failures halt playback.

Resume is accepted only for the exact profile and media identity, within finite actual duration, uncompleted and before the near-end threshold. No browser session/token storage was introduced. Backend resumeProgress is the authoritative entry point. The lab demonstrates only component-memory progress; the catalog mocks and history remain unchanged and empty.

Episode context includes actual series, season, episode number/title and a return link to the season's episode list. Next Episode is offered only for a supplied subsequent episode whose catalog availability is currently licensed. Navigating to it performs a fresh playback request. The existing one-season, two-episode fixture remains unchanged.

## Backend contract additions
Existing methods remain; additions are optional at the TypeScript boundary for compatibility with unavailable/mock adapters, but the production player fails closed without its required fields.

PlaybackService.getPlaybackMetadata(titleId, episodeId?, context?) now accepts context { profileId, signal? }. Production adapters must forward selected profile identity and honor cancellation where possible.

PlaybackMetadata adds profileId, playbackSessionId, sourceType (mp4/webm/hls/dash), restriction (region/denied) and optional resumeProgress. Existing manifestUrl, expiresAt, captions and isLicensed remain. The active player requires matching profile identity, playbackSessionId, future expiry, valid source type/URL and isLicensed=true. Invalid subtitle metadata is rejected.

ViewingProgress accepts optional playbackSessionId on authorized writes. reportCompleted accepts optional { profileId, playbackSessionId } context. The player supplies both. The backend must verify ownership, licensed title/episode and authoritative completion; client completion is a claim to validate.

Safe service error codes SESSION_EXPIRED/UNAUTHENTICATED, SUBSCRIPTION_REQUIRED, REGION_RESTRICTED, PLAYBACK_DENIED/ACCESS_DENIED and SERVICE_UNAVAILABLE map to meaningful UI. Adapters must not return signed URLs in error text or logs. Browser source/caption URLs need correct content types, supported codecs, HTTPS, CORS/range behavior and suitable authorization lifetime.

The backend remains responsible for account session, profile ownership, subscription, region, maturity, title/episode rights, stream limits, short-lived playback session and progress persistence. Frontend checks are UX safeguards. No authorization server, credentials, fake signed URL or localStorage entitlement was created.

## Development fixture
The 20-second original Motion study WebM contains a moving circle, timer, original text and a quiet synthesized tone; its two English VTT cues describe that clip only. No commercial footage, film art, translation or external music is used. Ownership/provenance is documented in scripts/fixtures/player/README.md.

The development page and asset endpoint require NODE_ENV=development and FLURZI_PLAYER_LAB=1 on the server. The proxy rejects production requests before page streaming with HTTP 404 even if the flag is set; page and API checks remain in place. The clip is outside public/, is not attached to any fictional catalog title and does not modify authentication, entitlement or mock playback services.

To run locally: set FLURZI_PLAYER_LAB=1 for a development server and visit /player-lab. Regenerate the fixture with node scripts/generate-player-fixture.mjs through the project's RTK command wrapper. The QA helper uses an isolated preview workspace to preserve the user's existing development server. For an isolated local lab, run rtk proxy node scripts/phase2d-dev-server.mjs and visit http://127.0.0.1:3007/player-lab; stop that command when finished.

## Verification

- npm run typecheck: PASS.
- npm run lint: PASS; zero errors or warnings.
- npm run build: PASS using the default Turbopack builder; all 45 static pages generated. Final build ID: cgqK8_tqGiU0BrHY6nvVb.
- npm run test:unit: PASS; 104 tests across five files, including 43 player tests and all previous 61. Coverage includes access/source failures, exact identity, progress/resume/seek calculations, completion retained across an in-flight replay race, access revocation, profile isolation, episodes/next selection, captions, native audio snapshots/selection, feature detection, unsupported media and teardown.
- Source audit: PASS; all 26 protected sources/configuration files retain their pre-Phase-2D hashes.
- Focused Chromium development-media harness: PASS. Real playback advances from the native initial position; Play/Pause, skip buttons/range, volume/mute, speed, actual VTT cues/on/off, fullscreen enter/exit, Picture-in-Picture enter/exit, scoped shortcuts, native button Space activation, progress writes/resume, genuine ended/completion, replay, invalid-source recovery, save-failure feedback and system reduced motion were exercised.
- Responsive captures at 1920, 1440, 1024, 768, 390 and 320px: zero horizontal overflow and no checked control/position-range clipping.
- Separate 390px Chromium touch context: PASS for Play/Pause, touching the video to reveal controls without pausing, settings and caption selection. An 844×390 landscape viewport had no horizontal overflow.
- Production HTTP/browser harness: PASS. The lab page, all three fixture API paths and the private scripts asset URL return HTTP 404 even with FLURZI_PLAYER_LAB=1. Three checked watch/detail destinations return 200; those status codes alone do not assert authentication.
- Normal production-preview demo sign-in, preview-plan preference and Main profile selection reached Browse without bypassing guards. Movie details → playback availability → unavailable watch state → details worked; the metadata-only title never created a video element.
- No browser page errors were recorded in the final media or production browser contexts.
- Owned preview servers were stopped. The generated preview workspace was removed; the existing user development server was retained.
- The pre-existing full Playwright suite/configuration and its deferred navigation-timeout investigation were left unchanged.

Desktop, 320px and unsupported-source captures were visually inspected. Browser checks used Chromium and emulated touch/viewport contexts; physical devices and Safari/Firefox were not tested. Headless playback is muted by the browser runner: volume/mute properties were verified on the real media element, not through physical audio output.

The approximately 20-second recording has an actual duration of 19.955492s and a first media timestamp of 3.576s. A standalone native-element probe reproduced the browser clamping an earlier seek to that timestamp, without player code. The control harness therefore uses valid interior positions and verifies advancement relative to the actual initial position.

Verification corrected two implementation issues: settings selects needed explicit accessible names, and the stage's aspect ratio/minimum height caused 56px overflow at 320px until its width was explicitly constrained. The production check also found Next's streamed not-found response returning HTTP 200, with no lab UI. The narrowly matched proxy now rejects developer URLs before streaming with a hard 404. Page/API checks remain as a second layer.

Early development-preview attempts encountered startup/hydration/hot-reload timeouts. Media checks run in an isolated development preview; authentication and route exclusion are checked separately against the production build. The isolated helper copies ignore rules and uses its own working directory to keep generated output outside source scanning. No shared test infrastructure was changed.

An early sandboxed Turbopack build stalled; the final default build passed outside that process sandbox. Vitest retained its existing config-loader compatibility warning; all tests passed and no dependency or configuration change was made to suppress it.

[Media/browser observations](./phase2d/observations.json) · [Production checks](./phase2d/production-http.json) · [Source audit](./phase2d/source-audit.json) · [Native fixture probe](./phase2d/fixture-probe.json) · [Desktop](./phase2d/1440-player.png) · [320px](./phase2d/320-player.png) · [Unsupported source](./phase2d/unsupported.png) · [Metadata-only title](./phase2d/metadata-only.png)

## Capability status and remaining work

1. Implemented and unit verified: source/identity validation, failure mappings, seek/resume/progress calculations, episode identity/next selection, caption mode selection, capability detection and native teardown. The media controls and the production metadata-only denial described above were also browser verified.
2. Implemented but not browser verified against production: native multi-audio switching, browser-native HLS, production authorization expiry/denial, populated series playback and backend progress persistence. Physical devices and Safari/Firefox have not been tested.
3. Integration ready: authorized metadata acquisition, selected-profile/session identity, service errors, resumeProgress, progress/completion writes, licensed movie/episode actions and next-episode reauthorization.
4. Not implemented: production backend, adaptive MSE transport/manual rendition switching, DRM/EME license integration, video hosting/CDN/transcoding, persistent auth/history, automatic next episode and commercial playback authorization.

iOS may retain OS-managed volume/fullscreen behavior. PiP and fullscreen vary with browser policy and user activation. Native HLS capability and codec support vary by engine. The current catalog cannot demonstrate licensed film playback; the original lab is deliberately separate. This delivery does not claim production streaming integration.
