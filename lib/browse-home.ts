import type {CatalogTitle,Entitlement,ViewingProgress} from "../types/streaming";
import type {ServiceRegistry} from "./api/services";
export const titleHref=(title:CatalogTitle)=>"/browse/title/"+encodeURIComponent(title.id);
function licensedNow(availability:CatalogTitle["availability"]){
 if(availability.status!=="licensed")return false;
 const now=Date.now();
 if(availability.availableFrom&&(!Number.isFinite(Date.parse(availability.availableFrom))||Date.parse(availability.availableFrom)>now))return false;
 if(availability.availableUntil&&(!Number.isFinite(Date.parse(availability.availableUntil))||Date.parse(availability.availableUntil)<=now))return false;
 return true;
}
export function playbackAllowed(title:CatalogTitle,entitlement:Entitlement|null,progress?:ViewingProgress){
 if(!entitlement?.canStream||!title.isLicensedForPlayback||!licensedNow(title.availability))return false;
 if(title.mediaType==="series"){
  if(!progress?.episodeId)return false;
  const episode=title.seasons.flatMap(season=>season.episodes).find(item=>item.id===progress.episodeId);
  return Boolean(episode?.isLicensedForPlayback&&licensedNow(episode.availability));
 }
 return true;
}
export function progressDisplay(progress:ViewingProgress){
 const duration=progress.durationSeconds&&Number.isFinite(progress.durationSeconds)&&progress.durationSeconds>0?progress.durationSeconds:undefined;
 const position=Number.isFinite(progress.positionSeconds)?Math.max(0,progress.positionSeconds):0;
 return {percent:duration&&Number.isFinite(duration)&&duration>0?Math.min(100,position/duration*100):0,remaining:duration&&duration>position?Math.ceil((duration-position)/60):null};
}
export function episodeLabel(title:CatalogTitle,progress:ViewingProgress){
 if(title.mediaType!=="series"||!progress.episodeId)return null;
 for(const season of title.seasons){const ep=season.episodes.find(e=>e.id===progress.episodeId);if(ep)return "S"+season.number+" · E"+ep.episodeNumber+" — "+ep.title;}return null;
}
export function uniqueTitles(titles:CatalogTitle[]){return [...new Map(titles.map(t=>[t.id,t])).values()];}
export async function loadBrowseHome(services:ServiceRegistry,profileId:string){
 const results=await Promise.allSettled([services.catalog.listTitles({pageSize:24}),services.recommendations.getHomeRails(profileId),services.catalog.getContinueWatching(profileId),services.watchlist.listWatchlist(profileId),services.catalog.listGenres(),services.subscriptions.getEntitlement()] as const);
 const [catalog,rails,progress,list,genres,entitlement]=results;
 const saved=list.status==="fulfilled"?list.value.filter(i=>i.profileId===profileId):[];
 const watching=progress.status==="fulfilled"?progress.value.filter(p=>p.profileId===profileId&&!p.completed&&p.positionSeconds>0):[];
 let titles=uniqueTitles([...(catalog.status==="fulfilled"?catalog.value.items:[]),...(rails.status==="fulfilled"?rails.value.flatMap(r=>r.items):[])]);
 const missing=[...new Set([...saved,...watching].map(i=>i.titleId))].filter(id=>!titles.some(t=>t.id===id));
 const resolved=await Promise.allSettled(missing.map(id=>services.catalog.getTitle(id)));
 titles=uniqueTitles([...titles,...resolved.flatMap(r=>r.status==="fulfilled"&&r.value?[r.value]:[])]);
 return {titles,rails:rails.status==="fulfilled"?rails.value.filter(r=>r.items.length):[],progress:watching,saved,genres:genres.status==="fulfilled"?genres.value:[],entitlement:entitlement.status==="fulfilled"?entitlement.value:null,watchlistReady:list.status==="fulfilled",issues:[...resolved.some(r=>r.status==="rejected"||(r.status==="fulfilled"&&!r.value))?["some title information"]:[],...results.flatMap((r,i)=>r.status==="rejected"?[["catalog","collections","viewing progress","My List","genres","viewing access"][i]]:[])]};
}
export type BrowseHomeData=Awaited<ReturnType<typeof loadBrowseHome>>;
