import type { PublicTitle } from "@/types/public";
export interface SourcedCollection { id:string; label:string; kind:"trending"|"curated"; titleIds:string[]; source:string; measuredAt?:string; timeWindow?:"day"|"week" }
export function buildCatalogCollections(titles:PublicTitle[],curated:SourcedCollection[]=[]){
 const movieTitles=titles.filter(t=>t.format==="Film");
 const genreNames=[...new Set(["Action","Comedy","Romance","Drama","Science Fiction","Animation","Documentary",...titles.flatMap(t=>t.genres)])];
 return {
  popularMovies:movieTitles.filter(t=>t.popularity).sort((a,b)=>b.popularity!.value-a.popularity!.value),
  popularSeries:titles.filter(t=>t.format==="Series"&&t.popularity).sort((a,b)=>b.popularity!.value-a.popularity!.value),
  newReleases:movieTitles.filter(t=>t.releaseYear).sort((a,b)=>b.releaseYear-a.releaseYear),
  genres:genreNames.map(name=>({name,titles:titles.filter(t=>t.genres.includes(name))})),
  collections:curated.filter(c=>c.kind!=="trending"||!!(c.measuredAt&&c.timeWindow)).map(c=>({...c,titles:c.titleIds.map(id=>titles.find(t=>t.id===id)).filter((t):t is PublicTitle=>!!t)})),
 };
}
