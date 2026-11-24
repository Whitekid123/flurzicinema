import "server-only";
import { catalog, filterCatalog } from "@/data/catalog";
import { toPublicTitle } from "./adapters";
import type { CatalogTitle, PublicTitle } from "@/types/public";
function validTitle(value: unknown): value is CatalogTitle {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<CatalogTitle>;
  const creditsValid=[t.cast,t.crew].every(list=>list===undefined || (Array.isArray(list)&&list.every(c=>c&&typeof c.name==="string"&&typeof c.role==="string")));
  const seasonsValid=t.seasons===undefined || (Array.isArray(t.seasons)&&t.seasons.every(s=>s&&typeof s.number==="number"&&typeof s.description==="string"&&Array.isArray(s.episodes)&&s.episodes.every(e=>e&&typeof e.id==="string"&&typeof e.title==="string"&&typeof e.description==="string"&&typeof e.runtime==="string")));
  return typeof t.id === "string" && /^[a-zA-Z0-9:_-]{1,150}$/.test(t.id) && typeof t.title === "string" && typeof t.slug === "string" && /^[a-z0-9-]+$/.test(t.slug) && (t.mediaType === "movie" || t.mediaType === "series") && (t.source === "backend" || t.source === "tmdb") && Array.isArray(t.genres) && t.genres.every(g => typeof g === "string") && typeof t.isLicensedForPlayback === "boolean" && creditsValid && seasonsValid;
}
/** Server-side only: credentials and catalog origin never enter the browser bundle. */
export async function getPublicTitles(): Promise<PublicTitle[]> {
  const origin = process.env.FLURZI_CATALOG_API_URL;
  if (!origin) return filterCatalog();
  const url = new URL("titles", origin.endsWith("/") ? origin : `${origin}/`);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Catalog endpoint must use HTTPS.");
  const response = await fetch(url, { headers: process.env.FLURZI_CATALOG_API_TOKEN ? { Authorization: `Bearer ${process.env.FLURZI_CATALOG_API_TOKEN}` } : {}, signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!response.ok) throw new Error("The catalog is temporarily unavailable.");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("titles" in data) || !Array.isArray(data.titles) || !data.titles.every(validTitle)) throw new Error("The catalog response could not be read.");
  if(new Set(data.titles.map(t=>t.id)).size!==data.titles.length || new Set(data.titles.map(t=>t.slug)).size!==data.titles.length)throw new Error("The catalog contains conflicting title identifiers.");
  return data.titles.map(toPublicTitle);
}
export async function getPublicTitle(slug: string) { return (await getPublicTitles()).find(t => t.slug === slug); }
export function staticTitleParams(format: "Film" | "Series") { return process.env.FLURZI_CATALOG_API_URL ? [] : catalog.filter(t => t.format === format).map(t => ({ slug: t.slug })); }
