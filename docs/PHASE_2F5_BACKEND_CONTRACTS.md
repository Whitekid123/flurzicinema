# Phase 2F.5 — confirmed boundaries and scope gate

This milestone introduces no new event or creator service contract. The supplied brief makes these modules conditional on authoritative project requirements and explicitly prohibits treating speculative marketing as approval. No such event/Creator Lounge specification was found in the repository.

## Confirmed existing experience

The public /premieres route reads approved public catalog metadata through getPublicTitles and renders the existing three explicitly fictional editorial concepts from data/catalog.ts. The concepts identify catalog slugs, not server event identities. Their dateLabel values are prose (“date to be announced”), not timestamps. They must never be parsed into countdowns, release gates, reservations or streaming authorization.

The existing Reminder component stores a local title marker under flurzi-local-reminders and synchronizes the browser UI through storage/custom events. It explicitly discloses that no email or notification is sent. This is public browser storage, not an account/profile preference; do not migrate it into notification delivery or infer consent without an approved workflow. No event registration/reminder API currently exists.

Public catalog title links reuse movie/series detail routes. Streaming still requires the existing guarded catalog, acquirePlayback, exact profile/title/episode authorization, entitlement and PlaybackService. A local marker, public artwork or elapsed date confers no playback rights.

Creator Premiere copy on /features describes an unannounced future concept. Existing CatalogService and StoryLens support supplied credits and verified relationships; they do not establish a Creator Lounge, verified creator account, creator-owned catalog, filmography service, creator event, moderation system or participation permission.

## Decisions required before defining new typed operations

Confirm which customer journeys are approved: premiere discovery/detail only; scheduled screenings; reminders; registration; collective viewing; creator discovery/profiles; editorial interviews; announcements; scheduled live events; audience participation. Identify public versus authenticated routes and the source of approved event/creator data. Define cancellation/postponement behavior, region/age/entitlement restrictions and whether supplied creator relationships are editorial credits or authenticated identities.

For approved scheduled events, the eventual adapter needs opaque event identity, actual catalog/episode association, explicit lifecycle, valid schedule instants, an IANA presentation zone, authoritative access/action permissions, expiry and supplied creator relationships. Viewing availability must remain service-authoritative when a countdown reaches zero. Reminder/registration writes need service-confirmed responses, authorization, idempotency, deadlines and truthful delivery semantics. Postponement needs an authoritative replacement schedule rather than a client guess.

For approved creator profiles/content, supply reviewed identity, professional information, rights-cleared portrait, approved biography, verified credit relationships and permissioned content/event associations. Missing information stays absent. Do not infer director/producer/ownership relationships from a generic credit or image.

If collective screening is approved, reuse RoomService; if viewing is approved, reuse PlaybackService and the existing MediaPlayer. Do not introduce another player or conferencing/moderation backend. Independently authorize every viewer. Live-stream transport, moderation, notification delivery and retention are backend responsibilities requiring separate approval and independent verification.

Any later approved service should use centralized adapter selection, existing cookie-session/profile ownership, bounded reads/writes, stale-result suppression, exact identities and safe ServiceError mappings. Release remains fail-closed. These are integration requirements, not invented endpoints or implemented typed operations.

## Present production limitations

No production event identities, dates, creator records, registrations, notification delivery or live-event rights were supplied. No test-only event/creator records were needed for the confirmed showcase, so none were inserted into preview or release. Preview authentication remains the existing explicit testing configuration (NEXT_PUBLIC_USE_MOCKS=1, NEXT_PUBLIC_FLURZI_CHANNEL=preview); release retains mocks disabled and protected development-media exclusions.

See [scope and investigation report](./PHASE_2F5_IMPLEMENTATION_REPORT.md), [route inventory](./FRONTEND_ROUTE_INVENTORY.md) and [production handoff](./FRONTEND_PRODUCTION_HANDOFF.md). New modules remain pending scope confirmation; they are not integration-ready screens awaiting only a backend adapter.
