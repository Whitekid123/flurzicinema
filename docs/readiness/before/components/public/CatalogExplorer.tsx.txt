"use client";
import { useSyncExternalStore, useState } from "react";
import type { CatalogQuery, PublicTitle } from "@/types/public";
import { TitleCard } from "./Primitives";
import { useSavedStories } from "@/lib/useSavedStories";
type Filters = { q: string; genre: string; year: string; sort: string; format: string; saved: boolean; collection:string };
const initial = (search: string): Filters => {
  const p = new URLSearchParams(search);
  return { q: p.get("q") || "", genre: p.get("genre") || "", year: p.get("year") || "", sort: p.get("sort") || "curated", format: p.get("format") || "", saved: p.get("saved") === "1", collection:p.get("collection")||"" };
};
function subscribe(listener:()=>void){window.addEventListener("popstate",listener);window.addEventListener("flurzi:filters",listener);return()=>{window.removeEventListener("popstate",listener);window.removeEventListener("flurzi:filters",listener)}}
export function CatalogExplorer({ titles, format }: { titles: PublicTitle[]; format?: "Film" | "Series" }) {
  const search = useSyncExternalStore(subscribe,()=>location.search,()=>"");
  const filters = initial(search);
  const loaded = true;
  const [limit, setLimit] = useState(3);
  const [mode, setMode] = useState("grid");
  const { saved } = useSavedStories();
  const update = (next: Partial<Filters>) => {
    const value = { ...filters, ...next }; setLimit(3);
    const params = new URLSearchParams();
    for (const [key, item] of Object.entries(value)) if (item && item !== "curated") params.set(key, item === true ? "1" : String(item));
    history.replaceState(history.state, "", `${location.pathname}${params.size ? `?${params}` : ""}#catalog`);
    window.dispatchEvent(new Event("flurzi:filters"));
  };
  const available = titles.filter(t => !format || t.format === format);
  const genres = [...new Set(available.flatMap(t => t.genres))].sort();
  const years = [...new Set(available.map(t => t.releaseYear).filter(Boolean))].sort((a,b) => b-a);
  const results = available.filter(t => (!filters.q || `${t.title} ${t.synopsis} ${t.genre}`.toLowerCase().includes(filters.q.toLowerCase().trim())) && (!filters.genre || t.genres.includes(filters.genre)) && (!filters.year || t.releaseYear === Number(filters.year)) && (!filters.format || t.format === filters.format) && (!filters.saved || saved.includes(t.id)) && (!filters.collection || t.collection === filters.collection)).sort((a,b) => {
    const sort = filters.sort as CatalogQuery["sort"];
    return sort === "title" ? a.title.localeCompare(b.title) : sort === "newest" ? b.releaseYear-a.releaseYear : sort === "oldest" ? a.releaseYear-b.releaseYear : sort === "added" ? b.addedAt.localeCompare(a.addedAt) : a.discoveryRank-b.discoveryRank;
  });
  return <section id="catalog" className="public-catalog wrap" aria-label="Browse catalog">
    <div className="public-filters"><label className="public-field">Search titles<input type="search" value={filters.q} onChange={e => update({ q: e.target.value })} placeholder="A title, a genre, a feeling…" /></label><label className="public-field">Genre<select aria-label="Genre" value={filters.genre} onChange={e => update({ genre:e.target.value })}><option value="">All genres</option>{genres.map(g => <option key={g}>{g}</option>)}</select></label><label className="public-field">Release year<select aria-label="Release year" value={filters.year} onChange={e => update({ year:e.target.value })}><option value="">All years</option>{years.map(y => <option key={y}>{y}</option>)}</select></label><label className="public-field">Sort by<select aria-label="Sort by" value={filters.sort} onChange={e => update({sort:e.target.value})}><option value="curated">Editorial selection</option><option value="newest">Newest release year</option><option value="oldest">Oldest release year</option><option value="title">Title A–Z</option><option value="added">Recently added to demo</option></select></label></div>
    <div className="public-result-bar"><p role="status">{loaded ? `${results.length} ${results.length === 1 ? "story" : "stories"} found` : "Preparing the catalog…"}</p><div>{!format && <label className="public-field">Format<select aria-label="Format" value={filters.format} onChange={e=>update({format:e.target.value})}><option value="">All formats</option><option value="Film">Movies</option><option value="Series">Series</option></select></label>}<button className="public-chip" aria-pressed={filters.saved} onClick={()=>update({saved:!filters.saved})}>Saved stories</button><button className="public-chip" aria-pressed={mode==="list"} onClick={()=>setMode(mode==="grid"?"list":"grid")}>{mode==="grid"?"List view":"Grid view"}</button><button className="public-text-button" onClick={()=>update({q:"",genre:"",year:"",sort:"curated",format:"",saved:false,collection:String()})}>Reset filters</button></div></div>
    {results.length ? <><div className={`public-catalog-grid ${mode==="list"?"is-list":""}`}>{results.slice(0,limit).map(t=><TitleCard key={t.id} title={t} />)}</div>{limit<results.length && <div className="public-load"><button className="button button-outline" onClick={()=>setLimit(limit+3)}>Show more stories</button><p className="public-small">Showing {Math.min(limit,results.length)} of {results.length}</p></div>}</> : <div className="public-empty"><h3>No stories match this combination.</h3><p>Try another genre, a different year or a shorter search.</p><button className="public-text-button" onClick={()=>update({q:"",genre:"",year:"",format:"",saved:false,collection:String()})}>Clear the search</button></div>}
  </section>;
}
