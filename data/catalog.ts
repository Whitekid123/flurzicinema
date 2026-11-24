import { movies } from "./movies";
import type { Movie } from "@/types/cinema";
import type { PublicTitle, Season, CatalogQuery, PublicCatalogProvider, PlanPreview } from "@/types/public";

const episodeStories = [
  ["An unopened letter", "An unexpected delivery pulls a stranger into a story that has waited years to be told."],
  ["The other side", "A familiar place reveals an unfamiliar history, and two accounts refuse to agree."],
  ["A borrowed name", "Following a small clue means trusting someone who has every reason to stay silent."],
  ["What the light leaves", "A choice made long ago changes the meaning of everything that came before."],
  ["Somewhere to return", "The search reaches a turning point as an old connection comes into focus."],
  ["The last message", "Separate lives converge, but the answer asks more of them than they expected."],
];
function seasonsFor(movie: Movie): Season[] | undefined {
  if (movie.format !== "Series") return undefined;
  return [1, 2].map(number => ({
    number,
    description: number === 1 ? "A season of discoveries, uneasy alliances and messages after midnight." : "A second chapter explores the consequences of the first. Fictional episode outlines.",
    episodes: episodeStories.slice(0, movie.id === "velvet-hours" ? 3 : 4).map(([title, description], index) => ({
      id: `${movie.id}-s${number}e${index + 1}`, title: number === 2 ? `${title}: a new chapter` : title,
      description, runtime: `${42 + index * 3} min`, image: movie.backdrop,
    })),
  }));
}
export const catalog: PublicTitle[] = movies.map((movie, index) => ({
  ...movie, slug: movie.id, genres: movie.genre.split(" / "),
  tagline: ["Some journeys begin where the known world ends.", "Every return is a beginning.", "The city keeps its own secrets.", "Find the stories beneath the surface.", "Follow the light a little further."][index % 5],
  credits: [],
  contentSource: "fictional-demo", isLicensedForPlayback: false,
  addedAt: `2026-${String(11 - (index % 4)).padStart(2, "0")}-${String(24 - index).padStart(2, "0")}`,
  discoveryRank: index + 1,
  collection: movie.genre.includes("Mystery") ? "Beyond the ordinary" : movie.format === "Series" ? "After the city sleeps" : "Journeys home",
  seasons: seasonsFor(movie), originalConcept: index % 3 === 0,
}));
export const genres = [...new Set(catalog.flatMap(title => title.genres))].sort();
export const releaseYears = [...new Set(catalog.map(title => title.releaseYear))].sort((a, b) => b - a);
export function titleHref(title: Pick<PublicTitle, "slug" | "format">) { return `/${title.format === "Series" ? "series" : "movies"}/${title.slug}`; }
export function filterCatalog(query: CatalogQuery = {}) {
  const needle = query.search?.trim().toLowerCase();
  const results = catalog.filter(title => (!query.format || title.format === query.format) && (!query.genre || title.genres.includes(query.genre)) && (!query.year || title.releaseYear === query.year) && (!needle || `${title.title} ${title.synopsis} ${title.genre}`.toLowerCase().includes(needle)));
  return results.sort((a, b) => query.sort === "newest" ? b.releaseYear - a.releaseYear || a.title.localeCompare(b.title) : query.sort === "oldest" ? a.releaseYear - b.releaseYear : query.sort === "title" ? a.title.localeCompare(b.title) : query.sort === "added" ? b.addedAt.localeCompare(a.addedAt) : a.discoveryRank - b.discoveryRank);
}
export const demoCatalogProvider: PublicCatalogProvider = {
  async list(query) { return filterCatalog(query); },
  async get(slug) { return catalog.find(title => title.slug === slug) ?? null; },
};
export const plans: PlanPreview[] = [
  { id: "essential", name: "The individual seat", description: "A proposed starting point for a personal cinema ritual.", monthlyPrice: null, yearlyPrice: null, currency: "EUR", capabilities: { "Picture quality": "To be confirmed", "Supported devices": "To be confirmed", "Simultaneous streams": "To be confirmed", "Cinema Rooms": "Under consideration", "Offline viewing": "To be confirmed" } },
  { id: "together", name: "The shared experience", description: "An exploration of membership for watching together.", monthlyPrice: null, yearlyPrice: null, currency: "EUR", capabilities: { "Picture quality": "To be confirmed", "Supported devices": "To be confirmed", "Simultaneous streams": "To be confirmed", "Cinema Rooms": "Under consideration", "Offline viewing": "To be confirmed" } },
];
export const premieres = [
  { slug: "quiet-beyond", title: "An opening into the unknown", description: "A cartographer, an unmarked light, and a world on the edge of silence. A fictional opening-night concept.", dateLabel: "Opening night · date to be announced" },
  { slug: "velvet-hours", title: "After the city sleeps", description: "An imagined after-hours showcase of the fictional Velvet Hours series.", dateLabel: "After-hours showcase · date to be announced" },
  { slug: "last-train", title: "Take the long way home", description: "An editorial preview of a possible future premiere for The Last Train North.", dateLabel: "Weekend matinee · date to be announced" },
];
