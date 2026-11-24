import type { Movie } from "./cinema";

export interface Credit { name: string; role: string }
export interface Episode { id: string; title: string; description: string; runtime: string; image: string }
export interface Season { number: number; description: string; episodes: Episode[] }
export interface PublicTitle extends Omit<Movie, "availability"> {
  availability: string;
  contentSource: "fictional-demo" | "backend" | "tmdb";
  externalMetadataId?: string;
  isLicensedForPlayback: boolean;
  trailerUrl?: string;
  rating?: { value: number; outOf: number; source: string; votes?: number };
  contentRating?: { label: string; region: string; source: string };
  popularity?: { value: number; source: string; measuredAt: string };
  slug: string;
  genres: string[];
  tagline: string;
  credits: Credit[];
  addedAt: string;
  discoveryRank: number;
  collection: string;
  seasons?: Season[];
  originalConcept: boolean;
}
export interface ArtworkReference { url: string; titleId: string; episodeId?: string; usageApproved: boolean; source: string; attribution?: string }
export interface CatalogSeason { number:number; description:string; episodes:(Omit<Episode,"image"> & { artwork?:ArtworkReference })[] }
export interface CatalogTitle {
  id: string; slug: string; externalMetadataId?: string;
  title: string; synopsis?: string; mediaType: "movie" | "series";
  poster?: ArtworkReference; backdrop?: ArtworkReference;
  releaseDate?: string; releaseYear?: number; genres: string[]; durationMinutes?: number;
  cast?: Credit[]; crew?: Credit[]; seasons?: CatalogSeason[];
  trailer?: { url: string; titleId: string; usageApproved: boolean };
  rating?: PublicTitle["rating"]; contentRating?: PublicTitle["contentRating"]; popularity?: PublicTitle["popularity"];
  availabilityStatus: "metadata-only" | "unannounced" | "licensed";
  isLicensedForPlayback: boolean; source: "backend" | "tmdb";
  addedAt?: string; collection?: string; featured?: boolean; editorialOrder?: number;
}
export interface CatalogQuery { search?: string; genre?: string; year?: number; format?: Movie["format"]; sort?: "curated" | "newest" | "oldest" | "title" | "added" }
export interface PublicCatalogProvider {
  list(query?: CatalogQuery): Promise<PublicTitle[]>;
  get(slug: string): Promise<PublicTitle | null>;
}
export interface PlanPreview {
  id: string; name: string; description: string;
  monthlyPrice: number | null; yearlyPrice: number | null;
  currency: string;
  capabilities: Record<string, string>;
}
