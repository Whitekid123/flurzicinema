# Flurzi Cinema — Phase 2F.1

## Delivered frontend

Four authenticated routes live inside the existing RequireAuth, selected-profile guard and StreamingShell: /browse/rooms, /browse/rooms/create, /browse/rooms/join and /browse/rooms/[roomId]. The detail route composes lobby, viewing, disconnected/reconnecting and ended states. Desktop navigation includes Cinema Rooms; mobile retains five bottom destinations and exposes Rooms through the existing profile menu.

The home provides create/join actions, a service-backed current-room list, empty/loading/unavailable/retry states, optional invitation/history sections and catalog discovery. No public rooms, popularity metrics or live participants are fabricated.

Creation supports a trimmed 1–80-character name, debounced catalog search, actual title identities, supplied series episodes, supported invitation privacy and playback policy, active-profile host information, supplied capacity, validation, confirmed service creation and cancellation. Metadata-only titles can be selected for the explicitly labeled local lobby; no streaming rights are created. Series without supplied episodes cannot be created.

Joining validates input syntax, rejects external/media URLs, resolves through the service, shows returned host/room information and requires a second confirmed join. Invalid/expired/full/denied/ended/authentication and unavailable errors have safe messages. The existing guards do not support preserving return destinations, so viewers reopen an invitation after sign-in/profile selection; no new redirect storage was introduced.

## Lobby, social and viewing behavior

The lobby reuses existing artwork, ProfileAvatar, neutral cinematic styling and Manrope. It displays selected title metadata, host, real returned participants, presence/readiness, invitation copy/share with manual fallback, settings, ready/not-ready, host start and waiting states. All joined participants must be ready and connected. Missing optional capabilities remain unavailable.

The viewing composition reuses MediaPlayer, with room information, confirmed reactions, mute, a collapsible participant list, distraction-free mode, leave/end confirmation and connection feedback. Social content stays beside or below the video rather than covering subtitles or controls. The current metadata-only catalog shows a truthful playback-unavailable surface and creates no video element.

Host controls require a matching service-confirmed joined host. Optional host transfer/removal appears only when the adapter implements it and uses confirmation dialogs. The current preview adapter does not provide these capabilities. Host departure closes its preview room. Production host-disconnection/transfer policy remains server work.

All reads and actions have a 20-second deadline and safe feedback. Loading is bounded; late results are suppressed after component teardown. Room state remounts by viewer/session and room ID. Session expiry closes the room subscription and removes media. Existing SessionProvider refresh handles expired-session recovery.

## Synchronization boundary and player reuse

lib/rooms.ts defines RoomService, room/participant/media/playback/event models, permission/readiness rules, invitation syntax, safe errors, deadlines and the synchronization controller. lib/api/room-service.ts is the explicit fail-closed production adapter. lib/api/mocks/room-preview.ts provides isolated browser-memory simulations selected only by the existing explicit mock mode plus authenticated mock session.

The controller checks exact room/profile/media identity and monotonic revisions, suppresses stale/duplicate snapshots and duplicate reactions, prevents lifecycle regression, tracks disconnection and requires a fresh authorized reconnect snapshot. Playback uses a server-timed position anchor and measured clock offset. Changing media requires a new room/controller.

MediaPlayer adds a backward-compatible optional roomControl interface. Explicit local play/pause/seek actions submit intents and wait for authoritative state. Applying remote snapshots, drift correction and native media events never rebroadcast those intents. Room playback fixes speed at 1 while retaining personal volume, captions and audio controls. Autoplay policy can require a local Play gesture. Playback expiry/failure still fails closed.

Each participant independently acquires playback through the existing acquirePlayback authorization path; room state never contains a manifest. Reconnection remounts viewing to acquire access again. No second player, streaming source, developer footage, production entitlement, WebSocket server or backend endpoint was added.

## Development preview and limits

Development rooms have one actual selected-profile participant. No simulated peers or incoming remote activity are generated. Creation, invitation resolution/join in the same browser/profile, readiness, viewing-layout transition, local confirmed self reactions, connection-loss simulation, reconnect, leave and end are functional local interactions. Preview codes and rooms reset on reload and do not work across browsers or profiles. Storage is partitioned by authentication adapter, session, account and profile.

Production room services are not connected. Invitations, synchronization, persistent room state, real participants, role enforcement, moderation, independent-client playback and secure authorization require backend adapters. This milestone does not claim cross-device synchronized viewing. The original protected developer fixture remains separate and inaccessible in production.

## Existing functionality and source audit

Only two existing source files changed: StreamingShell.tsx for discovery/navigation and MediaPlayer.tsx for the optional room interface. Their original versions are backed up under docs/rollback/pre-phase2f1. The baseline/source audit verifies 149 other existing source/configuration files unchanged, including public pages/demo, authentication/session/guards, account/profile flows, catalog/detail/watch screens, fixture data, dependencies and Playwright/Vitest configuration. Existing uncommitted work was preserved; no user development server was stopped.

New UI lives in components/streaming/Rooms.tsx and rooms.css, imported only by the room routes. No dependencies, shared test infrastructure, public-site redesign or unrelated signature features were added.

## Validation

- npm run typecheck: PASS. The final build also passed its TypeScript step.
- npm run lint: PASS, zero warnings.
- npm run build: PASS with default Turbopack; 50 static pages generated. Build ID: hOvgRO82ed5SmYLaNHNZm.
- npm run test:unit: the default parallel run encountered the pre-existing account date/currency initialization timeouts. All new room tests passed in those attempts. npm run test:unit -- --maxWorkers=1: PASS, all 177 tests across seven files, including 38 room tests. No timeout or shared configuration was changed. Vitest retains its existing config-loader compatibility warning.
- Room unit coverage: permissions, readiness, lifecycle, host changes, room/profile/media identity, ordering, stale/duplicate events, reaction deduplication/rate limits, reconnect, invitation syntax/expiry, unknown codes, independent-auth/profile isolation, fail-closed production services, logout denial and bounded requests.
- Source audit: PASS, all 149 protected sources/configuration files match the initial baseline; only the two planned integration files changed.
- Owned production-preview HTTP checks: all four room routes return 200; these alone do not establish authentication. The developer lab page, real video/caption/broken-media API paths and private fixture asset return 404.
- Focused Chromium browser flow: PASS, 33 viewport/screen checks with zero horizontal overflow or checked heading/label/button clipping. Home, create, join, lobby and viewing were checked at 1920, 1440, 1024, 768, 390 and 320px; ended, separate 390px touch viewing and 844×390 landscape were also captured.
- Normal demo sign-in, plan preference and profile selection were used without guard bypass. Tested search/catalog selection, confirmed creation, current-room return, invitation resolve/join and invalid/external links, readiness/start gating, metadata-only playback denial, one actual participant, confirmed self reaction/mute, participant collapse, distraction-free mode, simulated connection loss/reconnect/access recheck, keyboard dialog trapping/Escape/focus restoration, mobile dialog bounds, confirmed end/leave and profile-separated invitations.
- Separate touch context exercised creation, readiness, viewing, reactions, reduced-motion styling, landscape and confirmed leave.
- No browser page errors were recorded. Owned preview teardown: port 3011 refused connections after shutdown. The user development server was not stopped.

The first browser attempt passed 18 responsive checks, then stopped on a harness locator matching both room feedback and the Next route announcer. That evidence is retained. The scoped selector and complete focused flow were rerun against the final production build. The existing full Playwright configuration and deferred investigation were left unchanged.

Desktop home and lobby, 320px creation/viewing and the mobile confirmation dialog were visually inspected. Browser checks use Chromium with emulated viewports/touch. Physical devices and Safari/Firefox were not tested. Real production participants, transport timing, host transfer/removal, moderation, licensed room playback and cross-device synchronization remain unverified without adapters. The optional player bridge was not browser-tested with licensed room media; the current catalog correctly creates no video. No fake production data or entitlements were inserted.

See [backend contracts](./CINEMA_ROOMS_BACKEND_CONTRACTS.md), [validation](./phase2f1/validation.json), [source audit](./phase2f1/source-audit.json), [browser observations](./phase2f1/observations.json), [first attempt](./phase2f1/attempt-1.json) and [teardown](./phase2f1/server-teardown.json).

[Desktop home](./phase2f1/1440-home.png) · [Desktop lobby](./phase2f1/1440-lobby.png) · [320px creation](./phase2f1/320-create.png) · [320px viewing](./phase2f1/320-viewing.png) · [390px confirmation](./phase2f1/390-leave-dialog.png)
