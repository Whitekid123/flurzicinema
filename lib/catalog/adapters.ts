import type { CatalogTitle, PublicTitle, ArtworkReference } from "@/types/public";
export function approvedImage(image: ArtworkReference | undefined, titleId: string): string | undefined {
  if (!image?.usageApproved || image.titleId !== titleId) return undefined;
  return image.url.startsWith("/") && !image.url.startsWith("//") || /^https:\/\//.test(image.url) ? image.url : undefined;
}
export function toPublicTitle(title: CatalogTitle): PublicTitle {
  const trailer = title.trailer;
  const trailerUrl = trailer?.usageApproved && trailer.titleId === title.id && /^https:\/\//.test(trailer.url) ? trailer.url : undefined;
  return {
    id: title.id, slug: title.slug, title: title.title, synopsis: title.synopsis || "Synopsis has not been supplied.",
    format: title.mediaType === "series" ? "Series" : "Film", genre: title.genres.join(" / ") || "Unclassified", genres: title.genres,
    releaseYear: title.releaseYear || Number(title.releaseDate?.slice(0, 4)) || 0,
    runtime: title.durationMinutes ? `${title.durationMinutes} min` : "Runtime unannounced",
    poster: approvedImage(title.poster, title.id) || "", backdrop: approvedImage(title.backdrop, title.id) || "",
    accentColor: "#F1AE64", featured: title.featured ?? false, tagline: "Discover the story.",
    availability: title.isLicensedForPlayback && title.availabilityStatus === "licensed" ? "Catalog rights confirmed · access checked separately" : "Currently unavailable to watch",
    credits: [...(title.crew || []), ...(title.cast || [])], seasons: title.seasons?.map(season=>({...season,episodes:season.episodes.map(episode=>({...episode,image:episode.artwork?.episodeId===episode.id ? approvedImage(episode.artwork,title.id)||"" : ""}))})),
    addedAt: title.addedAt || "", discoveryRank: title.editorialOrder ?? 0, collection: title.collection || "", originalConcept: false,
    contentSource: title.source, externalMetadataId: title.externalMetadataId, isLicensedForPlayback: title.isLicensedForPlayback && title.availabilityStatus === "licensed",
    trailerUrl, rating: title.rating, contentRating: title.contentRating, popularity: title.popularity,
  };
}
export interface TmdbDetail {
  id: number; title?: string; name?: string; overview?: string;
  release_date?: string; first_air_date?: string; runtime?: number;
  genres?: { id: number; name: string }[]; poster_path?: string | null; backdrop_path?: string | null;
  vote_average?: number; vote_count?: number; popularity?: number;
  credits?: { cast?: { name: string; character?: string }[]; crew?: { name: string; job?: string }[] };
}
export function tmdbImageUrl(path: string | null | undefined, base: string, size: string, allowedSizes: string[]): string | undefined {
  if (!path || !/^\/[A-Za-z0-9._-]+$/.test(path) || !allowedSizes.includes(size) || !base.startsWith("https://image.tmdb.org/")) return undefined;
  return `${base}${size}${path}`;
}
/** Pure mapping only. A TMDB record never grants artwork or playback rights. */
export function adaptTmdbDetail(detail: TmdbDetail, mediaType: "movie" | "series", images: { secureBaseUrl: string; posterSizes: string[]; backdropSizes: string[] }, rights: { artworkApproved: boolean; verifiedAt: string }): CatalogTitle {
  const id = `tmdb-${mediaType}-${detail.id}`;
  const image = (path: string | null | undefined, size: string, sizes: string[]) => {
    const url = tmdbImageUrl(path, images.secureBaseUrl, size, sizes);
    return url ? { url, titleId: id, source: "TMDB", usageApproved: rights.artworkApproved } : undefined;
  };
  return {
    id, slug: id, externalMetadataId: `tmdb:${mediaType}:${detail.id}`,
    title: detail.title || detail.name || "Untitled metadata record", synopsis: detail.overview,
    mediaType, releaseDate: detail.release_date || detail.first_air_date, durationMinutes: detail.runtime,
    genres: detail.genres?.map(genre => genre.name) || [],
    poster: image(detail.poster_path, "w500", images.posterSizes), backdrop: image(detail.backdrop_path, "w1280", images.backdropSizes),
    cast: detail.credits?.cast?.map(person => ({ name: person.name, role: person.character || "Cast" })),
    crew: detail.credits?.crew?.map(person => ({ name: person.name, role: person.job || "Crew" })),
    rating: detail.vote_average !== undefined && (detail.vote_count || 0) > 0 ? { value: detail.vote_average, outOf: 10, votes: detail.vote_count, source: "TMDB user ratings" } : undefined,
    popularity: detail.popularity !== undefined ? { value: detail.popularity, source: "TMDB", measuredAt: rights.verifiedAt } : undefined,
    availabilityStatus: "metadata-only", isLicensedForPlayback: false, source: "tmdb",
  };
}
