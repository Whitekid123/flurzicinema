# Public catalog integration and source review

Reviewed 24 November 2026. This is a technical integration record, not approval to use third-party content.

## Active content

The running site uses the existing five fictional Flurzi concepts and the artwork created for each corresponding title. Provenance is recorded in [public/images/README.md](../public/images/README.md). It does not fetch TMDB, copy real promotional posters, invent real cast information or claim any title is licensed for playback. Additional drafted titles that reused another title's image were removed before delivery. Series episode outlines are explicitly fictional, and their images are labeled as series concept artwork rather than episode stills. No real audience rankings or ratings are manufactured.

No approved TMDB account access, commercial agreement or third-party artwork authorization was provided. Keeping the matched demo catalog is the requested fallback until those are secured. This project remains local; no public deployment was performed.

## Official TMDB research

TMDB's [FAQ](https://developer.themoviedb.org/docs/faq) distinguishes noncommercial developer access from commercial projects. Commercial metadata/image usage requires the appropriate agreement; a free developer key is not commercial authorization. The FAQ also states that TMDB does not own the images/data it supplies. Its API cannot establish Flurzi's streaming rights.

For an activated TMDB integration, use an approved, unmodified TMDB logo in a less prominent position than Flurzi's brand and include attribution in About/Credits. The required notice is: “This product uses the TMDB API but is not endorsed or certified by TMDB.” The current About page describes TMDB as an evaluated source, not an active integration. Add the official approved logo and required notice when the source is activated under approved terms. [Official attribution and logos](https://www.themoviedb.org/about/logos-attribution).

| Purpose | Official endpoint / documentation |
| --- | --- |
| Popular films | [`GET /3/movie/popular`](https://developer.themoviedb.org/reference/movie-popular-list) |
| Trending films | [`GET /3/trending/movie/{day\|week}`](https://developer.themoviedb.org/reference/trending-movies) |
| Popular series | [`GET /3/tv/popular`](https://developer.themoviedb.org/reference/tv-series-popular-list) |
| Movie details | [`GET /3/movie/{id}`](https://developer.themoviedb.org/reference/movie-details) |
| Series details | [`GET /3/tv/{id}`](https://developer.themoviedb.org/reference/tv-series-details) |
| Seasons and episodes | [`GET /3/tv/{id}/season/{number}`](https://developer.themoviedb.org/reference/tv-season-details) |
| Cast and crew | [`GET /3/movie/{id}/credits`](https://developer.themoviedb.org/reference/movie-credits), equivalent TV credits supplied by the backend |
| Trailers/video metadata | [`GET /3/movie/{id}/videos`](https://developer.themoviedb.org/reference/movie-videos) |
| Search | [`GET /3/search/movie`](https://developer.themoviedb.org/reference/search-movie), equivalent TV search |
| Genre names | [`GET /3/genre/movie/list`](https://developer.themoviedb.org/reference/genre-movie-list), equivalent TV genres |
| Discovery filters | [`GET /3/discover/movie`](https://developer.themoviedb.org/reference/discover-movie) |
| Image configuration | [`GET /3/configuration`](https://developer.themoviedb.org/reference/configuration-details) |

An image URL combines the configuration's secure base URL, one supported size and the path returned for that same record. Sizes must come from configuration; the documented examples include poster w342/w500/w780 and backdrop w780/w1280. The adapter accepts configuration lists and refuses unsupported sizes or invalid paths. [Image basics](https://developer.themoviedb.org/docs/image-basics).

Popularity and daily/weekly trending are distinct source metrics, neither a Flurzi streaming chart nor playback availability. The collection builder only ranks popularity where source data exists, and requires a source, observation time and window for trending collections. [Popularity and trending](https://developer.themoviedb.org/docs/popularity-and-trending).

TMDB supports server-side Bearer read-token authentication. There is no need to expose credentials to public clients. [Application authentication](https://developer.themoviedb.org/docs/authentication-application). Trailer metadata (including an `official` flag) is not itself a Flurzi usage approval: the adapter does not automatically turn video records into playable trailers.

## Models and adapters

- `types/public.ts`: source-neutral `CatalogTitle`, per-title `ArtworkReference`, credits, season/episode records, ratings with identified sources, optional trailers, availability, and a separate view model `PublicTitle`.
- `lib/catalog/adapters.ts`: pure TMDB-to-normalized and normalized-to-view adapters. Title IDs attach images and trailers to the same record. Missing/unapproved/mismatched media stays absent. Cast and genres come from the source record. Playback rights default to false for TMDB metadata.
- `lib/catalog/provider.ts`: server-only, replaceable data-access boundary. Without configuration it uses the five matched fixtures. With configuration it requests the backend and validates the response; failures show the public error state rather than silently substituting fabricated content.
- `lib/catalog/collections.ts`: data-derived genres (including empty genre categories), release-year ordering, source-backed popularity, and supplied curated/trending collections. No fictional ranking is inferred from editorial order.
- `lib/CinemaCatalog.tsx`: the existing homepage receives normalized records through one context, with a five-title cinematic selection. Its hero, poster collection, Vault and feature imagery all consume that context. The full catalog is not capped.
- `components/ui/Artwork.tsx`: shared responsive image handling and a neutral missing-image state. Never substitutes another film's picture.
- Existing `data/movies.ts` is the unchanged five-title demo fixture, not the future API contract. `data/catalog.ts` adds explicitly fictional frontend details and configurable provisional plans.

## Backend contract

Set `FLURZI_CATALOG_API_URL` and optionally `FLURZI_CATALOG_API_TOKEN` on the server **before building**, then rebuild/restart. See `.env.example`. Never prefix the credential with `NEXT_PUBLIC_`. URLs must be HTTPS, except loopback for local integration tests. `GET {base}/titles` currently returns a bounded public snapshot:

```ts
{ titles: CatalogTitle[] }
```

The backend supplies stable IDs, route-safe unique slugs, media type, source-attributed metadata and explicitly approved artwork references. `ArtworkReference.titleId` must equal the enclosing title ID and `usageApproved` must be true before the image is displayed. An empty/missing image gets a title-preserving fallback. Production episode artwork also requires the same series title ID, the matching episode ID and explicit usage approval. Collection names, featured flags and editorial order are supplied by the normalized catalog. Runtime, date, age classification, ratings, credits and seasons remain optional; the UI reports unavailable information instead of inventing it.

Use `isLicensedForPlayback` together with `availabilityStatus` for catalog disclosure. These fields **do not enforce playback entitlement**. The public frontend supplies no player. The future playback service must authorize each user, title, territory and time window and return secure media access independently. Metadata-only records never become watchable because they appear in search.

The next service iteration should supply:

1. Paged film/series listing and search/discovery queries with counts, stable sort keys and pagination tokens. The current small snapshot filters and progressively reveals records locally.
2. Details by slug/ID, credits, series seasons and episodes with correct still-art relationships.
3. Curated collections and source-backed popular/trending collections with source, time window and observed date. Do not infer rankings from editorial position.
4. Approved poster/backdrop/still URLs, source attribution and image-usage approval tied to the title. Add the deployment's CSP and image host policy for the chosen provider.
5. Approved trailer URLs and usage flags, keeping video metadata separate from authorization.
6. Territory-aware availability and separate authenticated access/entitlement services outside this frontend phase.

Authentication, billing, entitlement enforcement, streaming, contact delivery, notification scheduling and a production movie database are not implemented here. Contact inquiries are previewed in memory only; watchlists and reminders are browser-local.

## Final homepage content decision

The user confirmed during the final redesign that an API key could not be obtained and requested adding it later. The current homepage therefore uses the existing matched original fictional artwork and retains the server-only provider unchanged. No paid metadata provider is represented as active.
