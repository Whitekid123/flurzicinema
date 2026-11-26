# DataSense — backend and transport contracts

The typed contracts are in types/datasense.ts; calculation and validation live in lib/datasense.ts and lib/datasense-session.ts. DataSense reuses PlaybackService, PlaybackMetadata, ProfileService and MediaTransport. No new endpoint, monitoring service, adaptive streaming dependency or telecommunications integration is introduced.

## Authorized planning and playback identity

PlaybackService may implement getDataPlanningMetadata({ titleId, episodeId?, profileId, signal }). Authenticate with the approved cookie session, resolve the selected profile server-side, enforce ownership, maturity, region and catalog access, and return the exact requested identity. A planning response is not playback authorization. Each viewer must still complete acquirePlayback.

DataPlanningMetadata contains a future expiresAt, optional positive durationSeconds (at most seven days), and at most 30 uniquely identified, labeled renditions. Series estimates identify a concrete supplied episode. Duration must describe that episode, never an entire series. Catalog runtime remains useful when rates are absent. Missing rates stay unavailable; the existing fictional catalog receives no bitrate fixtures.

PlaybackMetadata.dataSense optionally adds playbackSessionId and sourceId to the exact profile/title/episode identity, expiry and optional sourceBitrate. Bind sourceId to the actual authorized manifest/source and never reuse it across incompatible sources. The data metadata cannot extend playback authorization. Production adapters currently omit these optional capabilities.

## Bitrates, estimates and units

MediaBitrateRange has minBps/maxBps in bits per second. kind aggregate already includes audio. kind video requires explicit audio bounds, added once; 0/0 explicitly means silent audio. Missing audio is unknown. Bounds must be finite, ordered and aggregate to no more than 1,000,000,000 bps. Do not derive bitrate from a resolution label, dropped frames or unrelated network traffic.

Estimated bytes = aggregate bps × seconds / 8. Decimal MB = 1,000,000 bytes and GB = 1,000,000,000 bytes. Both range endpoints are calculated; no midpoint or savings percentage is invented. Runtime is bounded to seven days. Estimates exclude unknown buffering, retransmission, protocol overhead, caching and future adaptive changes. They are neither measured transfer totals nor provider charges.

The session estimate integrates supplied bitrate over active playback time and playback speed. Pauses and seeks do not manufacture consumption or erase prior estimated spend. A timing gap over 30 seconds makes the session estimate unavailable rather than silently treating the gap as zero. Remaining-viewing estimates use the current supplied rate and actual remaining media duration, with no promise about future adaptive choices.

## Optional transport telemetry

MediaTransport.createDataSession(video, metadata) may return a DataSenseTransportSession with getSnapshot, subscribe, optional selectRendition and dispose. Native transport intentionally supplies none: HTMLVideoElement does not establish exact encoded bitrate or transferred bytes.

Every PlaybackTelemetry snapshot carries the exact source/playback/profile/title/episode identity, monotonically increasing nonnegative sequence, client-normalized epoch atMs, accuracy kind observed, renditions, optional currentRenditionId/bitrate/buffering, transferCoverage and canSelectRendition. Normalize remote timing in the adapter; future timestamps beyond 30 seconds are rejected. Accuracy cannot change during a session. The example kind is rejected unless an explicit protected development exercise enables it.

Transfer observations contain a stable unique id, nonnegative safe-integer bytes, resource media and timestamp at or before the snapshot. Attribute bytes only to this exact media session. Complete coverage requires an explicit observations array; an empty complete array is a known zero. Missing coverage is unknown. Partial coverage is labeled. Repeated observations are deduplicated within and across snapshots. Conflicting bytes for an ID, unsafe totals or the bounded 16,384-ID ledger being exhausted invalidate the total; IDs are not evicted and recounted. Each snapshot accepts at most 500 observations. Define whether bytes represent response payload or wire traffic, how cache hits and retries are counted, and the coverage start; never claim provider billing accuracy.

Resource Timing is not currently used. An implementation would need exact media-resource attribution, cross-origin Timing-Allow-Origin permissions and explicit handling of inaccessible/zero/cache observations. Do not count artwork, advertising, application requests or the entire device.

Subscriptions must be scoped, bounded and cleaned up. Closing the source, changing viewer/session or expiry aborts pending selection, removes listeners and disposes transport telemetry. Old/duplicate sequence values are ignored; mismatched or invalid responses fail closed. No late callback may restore old viewer state. No DataSense payload goes through RoomService.

## Quality selection and saved preferences

Current rendition, saved preference and capability are separate. Only expose selectRendition when the active authorized transport truly supports the listed IDs. Selection has an AbortSignal and a 20-second frontend deadline and must confirm the exact requested rendition with a current snapshot. Preserve media identity, position, captions, personal audio, progress and Cinema Rooms synchronization. An adapter must not emit room play/pause/seek intents during local quality changes. Define server deadlines/idempotency where writes can outlive a client timeout.

Adaptive streaming, available renditions and seamless switching require an approved production transport. No such implementation is claimed. Arbitrary PlaybackMetadata.qualities strings do not constitute validated rendition capability.

Existing ProfilePreferences.playbackQuality maps auto → Automatic preference, low → Data Saver, medium → Balanced and high → Highest available. A previously stored 4k value remains an existing preference, not a newly advertised capability. ProfileService rereads and merges fresh preferences, updates the selected owned profile, validates confirmation and preserves language/audio/captions/motion and other fields. Backend writes must enforce authorization and atomic merging/concurrency. Saving a preference does not alter current playback or guarantee a cap.

## Budget, privacy and notifications

Budgets are viewer-entered, positive finite decimal values from 0.001 MB through 1,000 GB, with up to three decimal places. The independent calculator accepts explicit combined Mbps and minutes; it never describes a catalog movie or measures network traffic. It works in release and explicit optimized preview without streaming adapters.

Budgets, dismissals and calculation counters are component/session memory. They reset on unmount or viewer/source isolation. No localStorage, credentials, SIM balance, subscriber identifier, location, speed-test download, device-wide monitoring or persistent usage history is added. Persistent history and retention/deletion require a separately approved backend.

Notifications use 80% approaching and 100% reached transfer thresholds, or explicitly labeled estimated range comparisons. Dismiss/review/continue are personal controls. They never automatically pause, switch quality or promise a provider-enforced hard cap. Browser saveData/effectiveType are optional local hints, not network technology, connection ownership or proof of free/unmetered access.

## Failures and integration requirements

Missing optional metadata/telemetry/quality control remains unavailable. Planning reads cache only in a mounted viewer/media owner for up to five minutes and no longer than expiry; reads and writes have 20-second deadlines and stale-result suppression. DATA_INVALID, VALIDATION, TIMEOUT, ACCESS_DENIED, UNAUTHENTICATED and SESSION_EXPIRED map to safe feedback; raw messages/details are not rendered. Authentication and playback guards remain authoritative.

Implement approved cookie-session planning transport, licensed source metadata, accurate rendition rates/durations, transport-specific byte attribution, source expiry and actual quality controls. Verify CORS, retries, cache semantics, concurrency, real adaptive sources, independent Cinema Rooms viewers and physical browsers before launch.

The development original-media lab alone supplies explicitly illustrative rates, example transfer buttons and an example selection that does not change video quality. The native unknown-telemetry exercise is separate. These fixtures remain behind the existing development/opt-in boundary and must be absent from optimized preview/release assets. Ordinary catalog rates, provider charges, data history and production measurements are never fabricated.
