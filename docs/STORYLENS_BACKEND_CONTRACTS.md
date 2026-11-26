# StoryLens — backend contracts

The typed source is lib/storylens.ts. StoryLensService is a separate, narrow read interface: existing CatalogService supplies basic credits and related titles; RecommendationService supplies homepage rails and has no scene or person-credit operation. No existing interface was repurposed to imply actor identification or verified filmographies.

## Operation and identity

getContext({ titleId, episodeId?, profileId, signal? }): Promise<StoryLensContext> returns capabilities and a complete, bounded contextual bundle. A series title request without episodeId is title-level only. An episode request must identify an actual episode owned by that series. Movie requests cannot specify episodes.

Install the approved service through storyLensServiceForViewer in lib/api/experience-services.ts. The current lib/api/storylens-service.ts rejects with SERVICE_UNAVAILABLE in release and preview. No production endpoint, scraper, AI service or success fixture exists. The visual component never selects a development metadata adapter.

Authenticate every request using the approved cookie session. Resolve the selected profile server-side; enforce ownership, region, maturity, parental/PIN policy and metadata permissions. Supplied profileId is a claim to verify. Do not expose private viewing information, other profiles, unauthorized credits or restricted related titles. Metadata does not grant playback rights. Each viewer still obtains an independent PlaybackService authorization.

The response repeats exact titleId, optional episodeId and profileId. Identity mismatches reject the entire bundle. TitleDetails and actual player catalog data independently verify title/episode ownership before rendering contextual information. Session/profile/media changes isolate the owner and discard pending responses.

## Bundle schema

StoryLensContext contains identity, version (nonempty bounded revision/cache version), expiresAt (future ISO timestamp), availability (available/unavailable), capabilities (unique subset of cast, insights, music, locations, related), records and annotations.

Unavailable bundles contain no records or annotations. Partial capability support is normal; do not include empty categories to suggest unsupported functionality. The interface omits categories without displayable records, existing catalog credits or supplied catalog relationships. Overview remains available from already supplied catalog year/runtime/genres.

Each LensRecord has:

| Field | Semantics |
| --- | --- |
| id | Unique across title-level and annotation records in this bundle |
| category | cast / insights / music / locations / related; declared in capabilities |
| heading | Approved short title, actor name, track name or place name |
| text | Optional approved plain text, including biography, insight or context |
| personId | Optional stable person/credit relationship, also used to deduplicate catalog credits |
| character / role | Optional supplied character name and exact credit role; crew is never inferred to mean director |
| portraitUrl | Optional approved HTTPS portrait of this exact person |
| artist | Optional supplied artist/composer credit |
| externalUrl | Optional approved HTTPS reference; never an audio/video playback source |
| relatedTitleIds | Optional unique existing catalog identities; at most 12 per record |
| spoiler | Required explicit classification and optional reveal threshold |
| source | Required editorial/provider provenance |

Source contains label, reviewedAt (valid ISO date) and optional approved HTTPS reference. Backend ingestion must verify provenance, licensing, accuracy, portrait consent/rights and permitted external destinations. The browser validates structure and schemes; it cannot independently verify a fact or that a provider is approved. Do not label generated guesses as verified editorial metadata.

Plain text is rendered as text, never HTML. URLs reject non-HTTPS schemes, relative paths, credentials and excessive length. References open in a separate tab with noopener/noreferrer. Image errors use a neutral missing-image state; no unrelated actor photograph is substituted. No soundtrack preview/playback is provided.

Maximums: 200 title-level records, 500 annotations, 30 records per annotation, 2,000 combined records, 12 related IDs per record, 4,000 text characters, 200 heading/source-label characters and 120 record/scene ID characters. Adapters must bound response bytes before parsing and return a complete bundle within these limits. Reject oversized/incomplete responses; do not truncate scene coverage silently. Larger catalogs of annotations require an approved paged/windowed contract extension.

## Scene format and timing

SceneAnnotation contains id, startSeconds, endSeconds and records. IDs are unique within annotations. Times are finite nonnegative seconds in the exact media timeline; start is inclusive, end exclusive, and end must be greater than start. Supply actual editorial segments, never inferred boundaries. Overlapping segments are supported and their currently active records are combined.

The player supplies actual currentTime. The component selects current segments locally from the fetched bundle. Pause freezes media time; seeking/replay selects the segment at the new time, never a historical maximum. A seeking event increments a personal discontinuity counter. A segment change or seek remounts reveal state. Episode navigation obtains a fresh exact identity and bundle. Title details have no playback timestamp and never activate scenes.

A single bounded request loads a bundle while the panel opens. There are no time-update network requests or polling. Successful responses are cached only in that mounted viewer/media owner's memory for at most five minutes and no longer than expiresAt. Close aborts unfinished work; reopening can reuse a still-valid successful bundle. Explicit retry clears the cache. Expiry removes enriched data and requires retry. No storage or cross-profile cache exists.

Requests have the established 20-second deadline and AbortSignal; disposal suppresses late results even if an adapter ignores abort. Adapters should honor abort, session expiry, cache revocation, server deadlines and response size limits. Use short expiry for frequently revised or sensitive data; there is no push invalidation transport in this milestone.

## Spoilers

Every record requires spoiler.classification: safe, plot or unknown. Optional revealAtSeconds is finite/nonnegative and refers only to this exact episode/title timeline.

- safe records may appear at title level, or only inside their active annotation interval.
- plot records remain hidden unless playback time is at or beyond an explicitly supplied revealAtSeconds. Eligible records initially show only a generic spoiler warning and an explicit reveal button, hiding the heading as well as the body.
- unknown records, missing classifications, plot records without thresholds and future thresholds are suppressed. Malformed classifications reject the bundle.
- Title details cannot reveal plot-classified records because they have no playback position.
- Backward seeks clear explicit reveals; the current position determines eligibility again. Closing/reopening, scene changes and media/profile changes also clear reveals.

Never place future episodes or entire-season revelations into an earlier episode's bundle. A safe classification is an editorial guarantee to validate server-side, not a prediction made by this interface. Basic public catalog credits remain catalog credits; biographies and plot-sensitive character descriptions must use classified StoryLens records. No blanket spoiler-free claim is made for unclassified source material.

## Related catalog discovery

Related title IDs must be approved catalog relationships, including verified cast/director filmographies when supplied. The frontend resolves exact IDs through CatalogService.getTitle and rejects mismatches/missing titles. General discovery reuses CatalogService.listRecommendations(titleId, profileId); it is labeled related content, never actor filmography or AI personalization.

RecommendationService.getHomeRails remains unchanged because it does not provide per-person or title-level contextual metadata. Do not fabricate that relationship from homepage rails. Existing watchlist controls remain profile-scoped and service-confirmed.

Explore title opens a confirmation dialog. Navigation occurs only through the explicit title-details link; cancel/Escape restores focus. It does not start another title automatically. Back returns through existing browser history; playback requires fresh authorization and backend resume behavior. No persistent return-token mechanism is added.

## Player and Cinema Rooms

MediaPlayer is the single player. Optional contextualTitle and isolated lab binding add the personal panel; actual time and seeking events provide context. No StoryLens callback invokes play, pause, seek, progress, room intents or room state writes.

Desktop uses a collapsible adjacent panel. Mobile stacks information below the video and controls with an independently scrollable, safe-area-aware region. It does not cover the video or captions. The panel remains a descendant of the fullscreen player; browser-native video fullscreen/Picture-in-Picture may show video alone. Playback is not interrupted to force an overlay into unsupported native contexts.

Opening/closing preserves the video element, source, subtitle/audio choice and progress reporter. Playback failure/expiry removes the StoryLens entry with the authorized player state. The room bridge remains authoritative; panel state and spoiler choices are personal and are never broadcast. Reconnect/session/profile changes retain existing player cleanup and independent reauthorization.

## Errors and required backend work

Use existing ServiceError shape and safe codes: SERVICE_UNAVAILABLE, NOT_FOUND, ACCESS_DENIED, UNAUTHENTICATED, SESSION_EXPIRED, PROFILE_RESTRICTION_UNAVAILABLE, RATE_LIMITED, METADATA_INVALID and TIMEOUT. Raw provider/transport messages, URLs and details are not rendered. Missing metadata is distinct from a successful invented answer. Known catalog information remains available when optional contextual metadata fails; session expiry removes the panel.

Required production work: authorized cookie-session transport, exact episode mapping, approved editorial/provider ingestion and rights, classification review, person/character relationships, scoped catalog recommendations, metadata expiry/invalidation, parental/region enforcement and real licensed-player verification. The five existing fictional catalog records remain unchanged and have no scene/cast fixtures added.

The protected development player lab alone supplies synthetic interface-test metadata for the original generated motion study. It does not add movie facts, production entitlements or room participants. Its page/API/proxy production exclusion remains mandatory; release assets are separately scanned for those test strings.
