import type {CatalogTitle,MediaType,StreamingAvailability} from "../types/streaming";
import type {Page,PageRequest} from "./api/pagination";
import type {CatalogService} from "./api/services";

export const catalogSorts=[
 {value:"year-desc",label:"Newest release"},
 {value:"year-asc",label:"Oldest release"},
 {value:"title-asc",label:"Title A–Z"},
] as const;
export type CatalogSort=typeof catalogSorts[number]["value"];
export interface DiscoveryState {q:string;genre:string;sort:CatalogSort;year?:number;type?:MediaType;page:number}
const positivePage=(value:string|null)=>/^\d+$/.test(value||"")?Math.min(10000,Math.max(1,Number(value))):1;
export function readDiscoveryState(params:Pick<URLSearchParams,"get">):DiscoveryState{
 const year=params.get("year")||"";const sort=params.get("sort");const type=params.get("type");
 return {q:(params.get("q")||"").trim().slice(0,150),genre:(params.get("genre")||"").slice(0,80),sort:catalogSorts.some(s=>s.value===sort)?sort as CatalogSort:"year-desc",year:/^\d{4}$/.test(year)&&Number(year)>=1888&&Number(year)<=2100?Number(year):undefined,type:type==="movie"||type==="series"?type:undefined,page:positivePage(params.get("page"))};
}
export function discoveryHref(path:string,state:DiscoveryState){
 const params=new URLSearchParams();
 if(state.q)params.set("q",state.q);if(state.genre)params.set("genre",state.genre);
 if(state.sort!=="year-desc")params.set("sort",state.sort);
 if(state.year)params.set("year",String(state.year));if(state.type)params.set("type",state.type);
 if(state.page>1)params.set("page",String(state.page));
 return path+(params.size?"?"+params.toString():"");
}
export function discoveryRequest(state:DiscoveryState,mediaType?:MediaType):PageRequest & {mediaType?:MediaType}{
 return {page:state.page,pageSize:24,search:state.q||undefined,genre:state.genre||undefined,year:state.year,sort:state.sort,mediaType:mediaType||state.type};
}
// Pure fixture adapter logic. Production performs the same query at the server.
export function queryCatalog(titles:CatalogTitle[],query?:PageRequest & {mediaType?:MediaType}):Page<CatalogTitle>{
 const needle=query?.search?.trim().toLocaleLowerCase()||"";
 const items=titles.filter(t=>(!query?.mediaType||t.mediaType===query.mediaType)&&(!query?.genre||t.genres.some(g=>g.slug===query.genre))&&(!query?.year||t.releaseYear===query.year)&&(!needle||t.title.toLocaleLowerCase().includes(needle)||t.synopsis?.toLocaleLowerCase().includes(needle)));
 const name=(a:CatalogTitle,b:CatalogTitle)=>a.title.localeCompare(b.title,"en")||a.id.localeCompare(b.id);
 items.sort((a,b)=>query?.sort==="title-asc"?name(a,b):query?.sort==="year-asc"?(a.releaseYear??Infinity)-(b.releaseYear??Infinity)||name(a,b):(b.releaseYear??-Infinity)-(a.releaseYear??-Infinity)||name(a,b));
 const page=Math.max(1,Math.floor(query?.page||1));const pageSize=Math.min(100,Math.max(1,Math.floor(query?.pageSize||24)));
 return {items:items.slice((page-1)*pageSize,page*pageSize),page,pageSize,total:items.length};
}
export interface TitleResolution {id:string;title:CatalogTitle|null;failed:boolean}
export function createTitleResolver(catalog:CatalogService){
 // Route-local metadata reuse, never a cross-profile or persistent account store.
 const known=new Map<string,TitleResolution>();const pending=new Map<string,Promise<TitleResolution>>();
 async function read(id:string):Promise<TitleResolution>{
  if(known.has(id))return known.get(id)!;
  if(pending.has(id))return pending.get(id)!;
  const request=Promise.resolve().then(()=>catalog.getTitle(id)).then(title=>{
   const matches=!title||title.id===id||title.slug===id;
   const result={id,title:matches?title:null,failed:!matches};
   if(!result.failed)known.set(id,result);return result;
  }).catch(()=>({id,title:null,failed:true})).finally(()=>pending.delete(id));
  pending.set(id,request);return request;
 }
 return {async resolve(ids:string[]){
  const unique=[...new Set(ids)];const records:TitleResolution[]=[];
  for(let offset=0;offset<unique.length;offset+=8)records.push(...await Promise.all(unique.slice(offset,offset+8).map(read)));
  return records;
 }};
}
export async function resolveTitleRecords(ids:string[],catalog:CatalogService){return createTitleResolver(catalog).resolve(ids);}
export function availabilityCopy(availability:StreamingAvailability,isLicensed:boolean,isMock:boolean){
 if(isMock)return "Fictional preview title. Streaming is not available in this development preview.";
 if(availability.status==="unannounced")return "Streaming availability has not been announced.";
 if(availability.status==="unavailable")return "This title is currently unavailable for streaming.";
 if(!isLicensed||availability.status==="metadata-only")return "Available to explore. This title is not currently available for playback.";
 const now=Date.now();
 if(availability.availableFrom&&(!Number.isFinite(Date.parse(availability.availableFrom))||Date.parse(availability.availableFrom)>now))return "This title is not currently available for streaming.";
 if(availability.availableUntil&&(!Number.isFinite(Date.parse(availability.availableUntil))||Date.parse(availability.availableUntil)<=now))return "This title is not currently available for streaming.";
 return "Playback requires account access and an authorized player. The player is not available in this release.";
}
