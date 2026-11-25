import type {WatchlistItem} from "../types/streaming";
import type {WatchlistService} from "./api/services";
export interface WatchlistSnapshot {items:WatchlistItem[]|null;loading:boolean;error:string;notice:string;pending:string[]}
const initial:WatchlistSnapshot={items:null,loading:true,error:"",notice:"",pending:[]};
// Invalidation only; no global account data or persistent client cache.
const changes=new Set<(profileId:string,source:object)=>void>();
export function createWatchlistController(service:WatchlistService,profileId:string){
 let snapshot=initial;let revision=0;let active=true;const listeners=new Set<()=>void>();const pending=new Set<string>();const source={};
 const publish=(patch:Partial<WatchlistSnapshot>)=>{snapshot={...snapshot,...patch};if(active)listeners.forEach(fn=>fn());};
 async function load(){
  const request=++revision;
  try{const items=await service.listWatchlist(profileId);if(request===revision&&active)publish({items:items.filter(i=>i.profileId===profileId),loading:false,error:""});}
  catch{if(request===revision&&active)publish({loading:false,error:"My List could not load. Please try again."});}
 }
 async function mutate(id:string,label:string,remove:boolean){
  if(!snapshot.items||snapshot.error||pending.has(id))return;
  ++revision;pending.add(id);publish({pending:[...pending],notice:""});
  try{
   if(remove){await service.removeFromWatchlist(profileId,id);if(active)publish({items:snapshot.items?.filter(i=>i.titleId!==id)||[]});}
   else{const item=await service.addToWatchlist(profileId,id);if(item.profileId!==profileId||item.titleId!==id)throw Error("Mismatched saved title");if(active)publish({items:[...(snapshot.items||[]).filter(i=>i.titleId!==id),item]});}
   if(active)publish({notice:label+(remove?" removed from My List.":" added to My List.")});
   changes.forEach(fn=>fn(profileId,source));
  }catch{if(active)publish({notice:"Could not update My List. Please try again."});}
  finally{pending.delete(id);if(active)publish({pending:[...pending]});}
 }
 const changed=(id:string,sender:object)=>{if(id===profileId&&sender!==source)void load();};
 return {
  getSnapshot:()=>snapshot,
  subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
  start(){active=true;changes.add(changed);void load();return()=>{active=false;++revision;changes.delete(changed);};},
  retry(){publish({loading:true,error:""});void load();},
  toggle(id:string,label:string){return mutate(id,label,Boolean(snapshot.items?.some(i=>i.titleId===id)));},
  remove(id:string,label="Saved title"){return mutate(id,label,true);},
 };
}
