# Cinema Rooms — backend contracts

The typed source of truth is lib/rooms.ts: RoomService, RoomSnapshot, RoomParticipant, RoomPlayback and RoomEvent. The production adapter in lib/api/room-service.ts fails closed. Replace it with an approved cookie-session transport. No endpoint, socket server or streaming service is invented by this milestone.

## Identity and individual playback authorization

Authenticate every room read, mutation, invitation, subscription and reconnect using the existing cookie session. Resolve the selected profile server-side and enforce account ownership, room membership, role, region, parental permissions and entitlement. Frontend visibility is not authorization. Every snapshot is viewer-scoped and carries viewerProfileId and selfId; mismatches fail closed.

Room state carries catalog identities, never manifests or credentials. Each viewer independently uses the existing acquirePlayback flow: catalog and availability, entitlement, PlaybackService metadata, exact profile/title/episode identity and expiry validation. An invitation does not grant playback rights. The existing metadata-only catalog never yields a video element.

## Models

RoomSnapshot contains id, trimmed name (1–80 characters), monotonic nonnegative integer revision, phase (lobby/viewing/ended), immutable media (titleId and optional episodeId), viewerProfileId, selfId, participants, privacy (invite-only), controls (host/everyone), optional participantLimit and invitation (code/expiresAt), authoritative playback, serverClockOffsetMs and isPreview.

RoomParticipant contains id, profileId, supplied name/avatarKey, role (host/participant), presence (invited/joined/disconnected/reconnecting/left), ready and optional simulated marker. Only joined members may control playback; host identity must be service-confirmed. Readiness excludes invited/left records and requires all remaining members to be joined and ready. Disconnected/reconnecting members block starting. Never invent presence or infer participants from browser state.

RoomConfiguration supplies availability, preview flag, supported privacy/control values and actual participant limit. Room lists may include invitations and history only when supported.

## Operations

| Method | Input | Required semantics |
| --- | --- | --- |
| configuration | Current viewer | Explicit capabilities and limits |
| list | Current viewer | Current rooms; optional invitations/history |
| create | Name, real catalog media, privacy, controls | Validate catalog/episode and capabilities; authorize host; return lobby snapshot |
| resolveInvitation | Opaque code | Validate audience/expiry/revocation; return safe viewer-scoped snapshot without implicit membership |
| join | Resolved code | Atomically recheck invitation, room state, capacity and access; confirm membership |
| getSnapshot | Room ID | Full authorized snapshot |
| setReady | Room ID, boolean | Validate joined membership and lobby phase; return snapshot |
| start | Room ID | Enforce host/readiness/lifecycle and access policy; return viewing snapshot |
| sendPlaybackIntent | Room ID; play/pause/seek; positionSeconds | Enforce actual control policy and valid media range; return authoritative snapshot |
| sendReaction | Room ID and allowed reaction | Validate membership, moderation and rate limit; publish confirmed event |
| leave | Room ID | Confirm departure; apply host transfer/closure policy |
| end | Room ID | Host authorization; terminal snapshot |
| reconnect | Room ID | Reauthenticate and return fresh full snapshot |
| subscribe | Room ID, event/error callbacks | Authorized transport; unsubscribe closes listeners and suppresses late callbacks |
| optional removeParticipant | Room ID, participant ID | Host permission, moderation, confirmed snapshot |
| optional transferHost | Room ID, joined participant ID | Atomic role change, confirmed snapshot |

Optional host transfer/removal is exposed only when implemented by the adapter. The development adapter provides neither. Settings are read-only after creation because no update-settings operation is defined.

## Invitations and guards

Generate high-entropy production codes server-side and bind them to room, audience, expiry, revocation and permitted use count. Room closure invalidates invitations. Resolution must not disclose private room details before authorization; joining always rechecks atomically. Client-created production codes are never accepted.

The frontend accepts only code syntax or a same-origin /browse/rooms/join?code=… link. This is syntax validation, not authorization. External/media URLs are rejected and never reach video sources. Existing RequireAuth and profile guards remain unchanged. They do not currently preserve return destinations; viewers reopen the invitation after completing sign-in/profile selection. No new redirect/token storage system was introduced.

## Transport, ordering and timing

Provide authorized WebSocket, SSE plus requests, or another approved transport. Deliver a full initial subscription snapshot so fetch-to-subscribe changes cannot be lost. Mutation responses and events share one strictly increasing room revision. Full snapshots may skip revision numbers; older/duplicate revisions are ignored. Viewing cannot regress to lobby; ended is terminal. Changing media requires a new room/controller and new playback authorization.

Playback includes exact media identity, playing, positionSeconds and serverTimeMs at that anchor. Measure serverClockOffsetMs (server time minus client time) with bounded round-trip clock estimation in the adapter. Never assume remote clocks match. The controller projects playing position from the anchor and nonnegative elapsed server time; paused position stays fixed. The current player corrects drift over 750ms every three seconds. Validate those tolerances with a real service before launch.

The existing MediaPlayer receives an optional roomControl command and emits only explicit user play/pause/seek intents. Remote application, native media events and drift correction never send intents, preventing feedback loops. Playback rate remains 1 in room mode. Volume, subtitles and native audio remain personal. Browser autoplay failure requires a local Play gesture; it does not mean the room paused.

## Reconnection and lifecycle

Connection loss disables mutations and removes/pauses media. A transport connected event triggers a fresh snapshot, not immediate playback. Reconnect rejects snapshots older than the known revision, rechecks playback access, and never replays queued intents. Session expiry closes the subscription and removes media. Profile/session changes remount isolated room state and suppress old results.

Frontend requests have a 20-second deadline. Backend writes need idempotency keys and server deadlines because a client timeout cannot roll back a completed write. The adapter should abort requests/subscriptions on viewer change, bound incoming event size and prevent late callbacks. Define host-disconnection grace periods and explicit transfer/closure policy before production; publish authoritative presence, role and terminal changes.

## Reactions and moderation

Allowed reactions: applause, laughter, surprise, heart. Confirmed events contain unique event id, roomId, participantId, reaction and current revision. Reject invalid enums and unknown/unjoined/removed senders. The frontend suppresses duplicates, retains at most 128 seen IDs and shows one brief reaction at a time. Muting hides overlays and reduced motion removes animation.

Apply server per-viewer/per-room rate limits, request/payload limits, membership checks and moderation. The local preview's 1.5-second interval is only a demonstration. No chat, voice or video calls are introduced.

## Errors

Use existing ServiceError shapes. Mapped codes: INVITATION_INVALID, INVITATION_EXPIRED, ROOM_FULL, ROOM_ENDED, ACCESS_DENIED, UNAUTHENTICATED, SESSION_EXPIRED, SUBSCRIPTION_REQUIRED, REGION_RESTRICTED, NOT_FOUND, RATE_LIMITED, NOT_READY, VALIDATION, SERVICE_UNAVAILABLE, SYNC_UNAVAILABLE. Unknown errors use generic feedback; raw service messages/details are never displayed. Individual playback keeps existing failure mappings.

## Development limitations

The explicitly labeled preview uses browser memory partitioned by adapter/auth identity, session, account and profile. Reload clears rooms; codes resolve only in that browser/profile. One real selected-profile participant is present. No phantom participants/reactions, catalog mutation, commercial membership or playback rights are added. Host departure closes the local room.

No developer footage is added to rooms. The existing protected development player fixture remains separate and production-inaccessible. Production cross-device synchronization, invitation authorization, populated participants, host transfer, moderation and persistent room state require real services and independent-client verification.
