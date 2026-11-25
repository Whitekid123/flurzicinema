# Flurzi Cinema — Phase 2F.2

## Delivered routes and components

StoryMatch adds /browse/storymatch, /browse/storymatch/new, /browse/storymatch/session/[id] and /browse/storymatch/results inside the existing authenticated browse layout and selected-profile guard. StoryMatch is discoverable through the existing profile menu on desktop and mobile; the five bottom-navigation destinations remain unchanged.

The home introduces Just Me, Watching Together and Group Match with approved fictional artwork, an existing-session list, loading/empty/unavailable/retry states and service-backed invitation resolution/join boundaries. No active sessions, statistics or remote people are invented. The new-session screen explains the selected mode and explicitly labels the local exercise.

components/streaming/StoryMatch.tsx provides the scoped service owner, home/new/session/results screens, three-step PreferenceJourney, bounded resources/actions, confirmations and existing watchlist-controller integration. storymatch.css is imported only within StoryMatch and preserves the neutral palette, Manrope, existing artwork, focus styling and system/profile reduced motion. Existing Artwork, ProfileAvatar, MetadataBadges, WatchlistButton and native Modal are reused.

## Solo, Together and Group

Solo collects optional editorial moods, preferred genres, content type, viewing time and required boundaries. Viewers can select/deselect, skip mood, move Back/Continue, reset the draft, cancel and explicitly submit. Submissions do not alter profile preferences or read viewing history. A consent control explains use/sharing before submission.

Together requires two joined viewers. Group requires at least three. The preview begins with the actual selected-profile host only. Each additional same-device guest is explicitly named by the person entering their choices, labeled as an exercise record, and starts without preferences or votes. Each response is entered and submitted separately. No other profile's private preferences/history are accessed and no remote participation is claimed.

The session screen shows actual returned participants, joined/invited/left states and response completion. It waits for all joined viewers and the mode-specific count before matching. Hosts can remove local guests after confirmation, invalidating prior results; production guest-editing methods are unavailable. Explicit refresh retrieves state, not fabricated live activity.

Results provide actual artwork/metadata, supported explanations, a leading suggestion only when the ranking is unique, honest ties, alternatives, no-match recovery, My List actions, title details, refinement and another-match navigation. Group results identify genuinely shared entered genres or acknowledge there is no common genre. Exclusions are never relaxed to fill the screen.

Shortlists reference actual results. Votes are separately and explicitly entered for the named local viewer and never generated automatically. The host confirms a final story in a dialog; the interface does not claim unanimity or guarantee enjoyment. Removing a shortlisted candidate clears its votes. Explicit response changes invalidate results, votes, shortlist and decision.

## Matching logic

lib/storymatch.ts separates strict eligibility from preference ranking. Every joined viewer's selected type, avoided genres, runtime, release period and optional exact region/rating-label restrictions must pass before ranking. Missing genre/runtime/year/rating metadata cannot satisfy the corresponding active hard constraint.

Movies use supplied runtime. Series candidates identify a concrete supplied episode and use episode duration, never total-series duration. One best eligible episode is retained per series. A series with missing episodes/runtime may appear only with no strict time window and an explicit missing-data explanation; no episode is invented.

Moods are documented editorial relationships to supplied genres: intense/thriller, relaxing/discovery, moving/drama, adventure/adventure and mystery/mystery. Unsupported mappings are omitted. The UI explicitly distinguishes these associations from verified movie tone. No language question is offered because the current catalog has no usable language field; no rating controls are offered without supplied labels.

Ranking considers the least-served viewer first, then overall preference fit, with deterministic genre diversity only as an equal-fit tiebreaker. No match percentages, AI predictions, audience scores or popularity claims are fabricated. Explanations follow the actual matches, known runtime, shared fit, open choices or a possible compromise. A no-match state requires explicitly revised submissions.

Kids and configured maturity-restricted profiles are blocked by the development adapter until an authorized age-appropriate backend catalog exists. The UI also blocks results if restrictions become applicable. Existing profile/PIN/security enforcement is preserved, not replaced by client filtering.

## Services, privacy and lifecycle

The existing RecommendationService supports rails, not shared sessions, so StoryMatchService is a separate focused boundary. lib/api/storymatch-service.ts stays fail-closed. lib/api/mocks/storymatch-preview.ts is selected only with the existing explicit mock flag and authenticated mock session.

Preview memory is isolated by authentication adapter, session, account and profile. Responses are cloned, catalog identities are retained, expected revisions reject concurrent stale writes, and the controller suppresses obsolete requests/revisions after navigation. Ended is terminal. Matching sessions expire independently after one hour; authentication expiry also removes controls/results. Reads/actions use 20-second deadlines. Unknown service details are not printed.

No credentials, responses or fake persistent preferences are stored in localStorage. No history, external API or private profile taste is used for ranking. Catalog reads are bounded and do not silently treat an incomplete larger catalog as exhaustive. Production authorization, invitations, concurrency, retention and recommendation infrastructure remain backend work.

## Cinema Rooms handoff

A confirmed decision exposes an internal room-creation link containing the exact selected title and optional episode ID. The existing room form resolves that identity against CatalogService, checks episode ownership, preselects supported metadata and still requires the user's room name/settings and explicit create action. Bad/unavailable prefill has feedback and manual selection.

RoomService, lobby, player and guards are reused. No room or invitation is created automatically. Metadata-only choices may enter the existing labeled local lobby, never licensed playback. Every eventual participant still needs individual playback authorization. No player, streaming rights, commercial membership or second room-management system was added.

## Protected existing work

Only three existing files changed: StreamingShell.tsx for the profile-menu discovery link, Rooms.tsx for bounded catalog-validated preselection, and app/browse/rooms/create/page.tsx to pass query identities to that form. Original files are backed up under docs/rollback/pre-phase2f2.

The baseline/source audit verifies 171 other existing sources/tests/configuration files unchanged, including public pages/marketing demos, authentication/session/profile/account flows, catalog metadata/artwork/episodes, discovery/libraries/details, MediaPlayer, room service/controller/lobby behavior, dependency files and shared Playwright/Vitest configuration. Existing work and the user development server are preserved. No unrelated signature feature or backend infrastructure was implemented.

## Validation

- npm run typecheck: PASS. Final production build also passed TypeScript.
- npm run lint: PASS, zero warnings.
- npm run build: PASS with default Turbopack, 53 static pages generated. Final build ID: BVkuVBV_KLnyhU4tG4qja.
- npm run test:unit -- --maxWorkers=1: PASS, 235 tests across eight files, including all 58 StoryMatch tests and the prior 177. The initial single-worker attempt hit the unchanged account date-formatting initialization timeout while the build was active; the unchanged retry passed. No test timeout/configuration was modified. Vitest retains its existing config-loader compatibility warning.
- Focused unit coverage: preference validation, strict exclusions/type/rating/period, runtime boundaries and unknown metadata, exact episode selection, solo/two-viewer/group fairness, compromises, transparent explanations, ties/diversity, conflicting constraints/no matches, session ownership, stale requests/revisions, expiry, profile/auth isolation, explicit responses/votes/shortlists/decision, production fail-closed behavior and room identity handoff.
- Source audit: PASS, all 171 protected source/test/configuration files unchanged outside the three planned integration files.
- Owned production-preview HTTP checks: the four StoryMatch destinations returned 200. These statuses alone do not prove authentication. Normal demo sign-in, plan preference and selected-profile guards were separately exercised. The protected developer player page/media remained 404.
- Focused Chromium browser flow: PASS; 47 viewport/screen checks with zero horizontal overflow or checked heading/label/button clipping, and no recorded page errors. Home, creation, moods, evening preferences, boundaries, results and Group were checked at 1920, 1440, 1024, 768, 390 and 320px; final decision, no-match, group decision, separate 390px touch results and 844×390 landscape were also captured.
- Verified actual mode/session creation; mood selection/deselection, reset, Back, skip and consent; results; My List save and detail/navigation persistence; shortlisting, separate explicit votes, host confirmation, keyboard dialog trapping/Escape/focus restoration and mobile bounds.
- Verified Together waiting/completion/compromise and confirmed participant removal; Group conflicting hard restrictions/no-match, explicit refinement preserving another viewer’s exclusion, independent entered votes and final decision without unanimity claims.
- Verified movie selection through the existing confirmed RoomService flow and exact supplied episode/runtime preselection without automatic room creation; confirmed match end; profile-separated session lists and blocked Kids matching.
- Separate touch context used actual taps through a complete preference/results flow, system reduced motion and landscape.
- Owned preview teardown: port 3012 returned ECONNREFUSED after shutdown. No user development server was stopped. Shared Playwright/Vitest configuration and the deferred full Playwright investigation were unchanged.

Initial browser attempts are retained: [launch timeout](./phase2f2/attempt-1-launch.json) and [invitation feedback failure](./phase2f2/attempt-2-invitation.json). Chromium initially timed out before opening a page. The next run caught internal code-only errors receiving generic feedback; the mapper and regression assertions were corrected before rebuilding and rerunning. A later [voter selector check](./phase2f2/attempt-3-voter.json) led to an explicit accessible name for the wrapped vote dropdown. A subsequent [profile-switch harness failure](./phase2f2/attempt-4-profile-harness.json) came from resolving the link without invoking click; the harness was corrected without changing the profile implementation. Application assertion timeouts and shared test configuration were not changed.

Desktop home/results, mobile mood selection and confirmation, and 320px boundaries/results were visually inspected. Browser checks use Chromium with emulated viewports/touch; physical devices and Safari/Firefox were not tested. Production invitations, independently connected users, server concurrency, recommendation quality, parental catalog authorization and licensed room playback remain unverified without adapters. No live multi-user collaboration is claimed.

See [backend contracts](./STORYMATCH_BACKEND_CONTRACTS.md), [validation](./phase2f2/validation.json), [browser observations](./phase2f2/observations.json), [source audit](./phase2f2/source-audit.json) and [teardown](./phase2f2/server-teardown.json).

[Desktop home](./phase2f2/1440-home.png) · [Mobile moods](./phase2f2/390-mood.png) · [Desktop results](./phase2f2/1440-results.png) · [320px boundaries](./phase2f2/320-boundaries.png) · [390px confirmation](./phase2f2/390-decision-dialog.png)

## Known limitations

The fixture contains five fictional metadata-only titles; some choices produce few or no matches. Local responses/votes are same-device exercises, not persistent accounts or independently connected collaboration. Production invitations, authorized recommendations, concurrent transport, participant identities, retention and parental catalog enforcement require backend adapters.

The frontend has no production AI/recommendation engine, real-time server, payments, new player or new Cinema Rooms implementation. Physical devices and Safari/Firefox are outside the focused Chromium verification.

The original tracked debug.log was restored after retaining two Chromium startup DNS warnings in docs/phase2f2/chromium-startup.log. See docs/phase2f2/debug-log-preservation.json for the original hash and restoration check.
