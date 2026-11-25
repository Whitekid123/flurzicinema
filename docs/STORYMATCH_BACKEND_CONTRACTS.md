# StoryMatch — backend contracts

The source of truth is lib/storymatch.ts. The existing RecommendationService provides homepage rails, not collaborative preference sessions. StoryMatchService is a narrow separate contract; lib/api/storymatch-service.ts fails closed until an approved cookie-session adapter exists. No AI service, endpoint or real-time server is invented.

## Session and preference models

MatchingSession: opaque ID, name, mode (solo/together/group), monotonic revision, viewerProfileId, selfId, phase (collecting/results/decided/ended), participants, expiresAt, isPreview, shortlist, optional candidates, decision and invitation.

MatchingParticipant: ID, authorized profile identity when applicable, supplied name/avatar, role, presence (invited/joined/left), explicit preferences and optional vote. Preview same-device guests are entered exercise records, not authenticated profiles or remote viewers.

ViewerMatchPreferences: mood and preferred-genre arrays plus MatchConstraint. Constraints specify allowed content types, excluded genres, runtime window, release period and optional exact region-specific allowed rating labels. Unsupported, duplicate and contradictory values are rejected.

MatchCandidate: stable identity, actual catalog metadata, optional episode identity/label/runtime, compatibility per participant and typed MatchExplanation records. MatchDecision records candidateId, chosenBy and chosenAt.

## Required operations

| Method | Inputs | Required semantics |
| --- | --- | --- |
| capabilities | Authorized viewer | Availability, modes, genres/moods, limit, optional ratings, restrictions |
| list | Authorized viewer | Only accessible sessions |
| create | Mode/name | Actual authenticated host; server ID, revision and expiry |
| get | Session ID | Fresh viewer-scoped snapshot |
| submitPreferences | Session/participant IDs, preferences, expected revision | Own response; validate; invalidate old results, shortlist, votes and decision |
| generateResults | Session ID, expected revision | Host; all joined responses and required participant count; strict eligibility |
| shortlist | Current candidate, selected flag, expected revision | Host; removing a candidate clears its votes |
| vote | Participant, shortlisted candidate, expected revision | Explicit authorized participant choice |
| finalize | Shortlisted candidate, expected revision | Host-confirmed current eligible selection |
| leave | Session ID | Confirm departure and apply host policy |
| end | Session ID, expected revision | Host; terminal snapshot |
| resolveInvitation | Opaque code | Validate permission, audience, expiry and revocation before revealing safe data |
| join | Resolved code | Atomically recheck authorization, capacity and expiry; confirm membership |
| preview-only addLocalParticipant | Name, expected revision | Entered guest; no automatic response/vote |
| preview-only removeLocalParticipant | Guest ID, expected revision | Remove response/vote and invalidate results |

Solo requires one joined viewer, Together two, Group at least three. Every joined participant explicitly submits a response, including an open/default response. Invited/left records do not count. Refresh reads state rather than silently regenerating results.

## Authorization, privacy and invitations

Authenticate every read/write/invitation/join. Resolve the selected profile server-side; enforce account/profile ownership, membership, expiry and host permissions. Production response/vote writes must target the authenticated participant regardless of supplied IDs. Local guest-editing methods must not exist on a production adapter.

Drafts remain component-local; cancel discards them. Explicit submission states what is shared. No private viewing history, stored taste, another profile's preferences, sensitive-trait inference or localStorage credentials/preferences are used. Shared-device guests are not private accounts. Scope responses to authorized viewers and disclose only consented data.

Production invitations must be high-entropy, server-generated, expiring, audience-bound, revocable and capacity-limited. Resolve without leaking private information before checks; join rechecks atomically and requires confirmation. The frontend validates opaque syntax only. The preview deliberately cannot create or resolve remote invitations. Existing guards do not preserve return destinations; reopen an invitation after sign-in/profile selection.

## Strict eligibility and missing metadata

Preferred genres and editorial moods are soft. Selected type, exclusions, time, release period and rating labels are hard constraints. Every candidate must satisfy every joined viewer's hard restrictions before ranking. Majority preference, diversity or compromise cannot relax them.

Unknown genres cannot satisfy an active exclusion. Unknown runtime/year/rating cannot satisfy its strict constraint. Unrated titles cannot pass required rating labels. Do not equate rating systems or regions. The current fixture has no content-language fields or ratings, so unsupported questions are not shown. Production capabilities may supply supported rating labels.

Independently enforce kids/PIN, maturity, region and content policies in the backend catalog. The preview blocks kids or configured maturity-restricted profiles because it cannot provide an authorized age-appropriate catalog. It does not weaken profile settings.

Runtime windows: under 60; 60 inclusive to 90 exclusive; 90 through 120 inclusive; over 120; any length. Movies use supplied durationMinutes. Series use a concrete supplied episode's runtimeMinutes, never total-series duration, and return that identity/label. A series with no episodes appears only without a strict time window and with an explicit missing-runtime explanation; no episode is invented.

## Inputs, ranking and explanations

Preview matching uses CatalogService and submitted responses only. No history, watchlist ranking, external API or profile taste is consulted. Catalog reads stop at ten pages of 100 and fail if the catalog is still incomplete. Production should calculate against an authorized server catalog and document scope.

Editorial mappings: intense → thriller; relaxing → discovery; moving → drama; adventure → adventure; mystery → mystery. These are inferred genre connections, not verified film tone. Offer only mappings present in the catalog. Surprise me leaves mood open. Unsupported comedy/fun mappings are omitted.

After eligibility, individual internal fit equals the fraction of selected genres present plus one when a selected mood genre matches. A viewer leaving both open has fit 1. Rank by minimum individual fit first, then total fit, considering the least-served viewer before a majority. These deterministic weights are not scientific probabilities and are never displayed as match percentages. Genre novelty and stable IDs break equal-fit ties only. Keep one concrete best eligible episode per title.

Explain actual matching genres, editorial mood inference, known runtime fit and open choices. Shared-fit explanations require positive fit for everyone; otherwise identify a possible compromise that does not connect with every soft preference. Equal top ranks mean no unique winner. No candidates means no match; only explicit revised submissions may change boundaries. No fabricated ratings, popularity, enjoyment prediction or AI capability is allowed. Production algorithms must provide truthful, auditable, versioned explanations and enforce all hard constraints.

## Votes, decisions and concurrent updates

Shortlists reference current candidates. Each joined participant explicitly chooses one shortlisted candidate. Guest addition, preference submission and generation never create votes. Same-device voting names the person entering it and does not claim remote participation.

The host confirms the final selection in a dialog. This is a host decision, not an election or claim of unanimity. Actual submitted names are shown. Everyone's hard restrictions already apply. Explicit preference resubmission clears the previous results, votes and decision. Define production host transfer/departure and participant-removal policies. Preview host departure/end closes the exercise.

All snapshots/mutations share one increasing revision. Writes atomically check expected revision and reject stale input with CONFLICT. Do not overwrite concurrent individual responses through unvalidated last-writer-wins behavior. The frontend rejects older revisions, suppresses obsolete reads on navigation/profile changes and keeps ended terminal.

Current transport is request/response plus explicit refresh. A future push transport must authenticate subscriptions, scope snapshots, close on expiry, provide fresh reconnect state and suppress late callbacks. No live remote collaboration is claimed.

## Expiry, recovery and retention

Matching expiry is separate from account-session expiry; both remove matching controls/results. Preview sessions expire after an hour and reset on reload. Partition memory by authentication adapter, session, account and profile. Production retention/deletion rules must be explicit and server-enforced. Frontend requests have a 20-second deadline; backend cancellation/deadlines and idempotency are needed because a timeout cannot undo an accepted write.

## Cinema Rooms integration

The final decision links internally to /browse/rooms/create with encoded titleId and optional episodeId. It never creates a room or sends invitations. The existing form resolves the title, verifies episode ownership, preselects supplied metadata and requires room name/settings and explicit creation. Invalid/unavailable prefill shows feedback and manual catalog selection.

Reuse RoomService, guards, lobby and player. Every eventual room participant independently obtains an authorized playback session. A match, shortlist, vote or decision is not an entitlement. No new room system, player, footage, subscription or playback rights are introduced.

## Errors and limits

Use ServiceError shapes. Codes: VALIDATION, SERVICE_UNAVAILABLE, ACCESS_DENIED, UNAUTHENTICATED, SESSION_EXPIRED, MATCH_EXPIRED, MATCH_ENDED, NOT_FOUND, INCOMPLETE_PREFERENCES, PARTICIPANTS_REQUIRED, CONFLICT, INVITATION_INVALID, INVITATION_EXPIRED, DECISION_UNAVAILABLE, PROFILE_RESTRICTION_UNAVAILABLE and TIMEOUT. Raw service details are not rendered.

The five fictional metadata-only catalog records remain unchanged. Broader runtime/rating/conflict scenarios use test-only data. Guests, responses and votes are voluntary same-device exercises, not persistent profiles or verified remote collaboration. Production recommendations, invitation authorization, concurrent writes, retention and independently connected participants require adapters and separate verification.
