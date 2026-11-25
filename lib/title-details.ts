import type {ServiceRegistry} from "./api/services";
import type {Series} from "../types/streaming";
import {uniqueTitles} from "./browse-home";
export function selectedSeason(series:Series,id:string|null){return series.seasons.find(s=>s.id===id)||series.seasons[0]||null;}
export async function loadTitleDetails(services:ServiceRegistry,id:string){
 const title=await services.catalog.getTitle(id);
 if(!title)return null;
 const [related,entitlement]=await Promise.allSettled([services.catalog.listRecommendations(title.id),services.subscriptions.getEntitlement()]);
 return {title,related:related.status==="fulfilled"?uniqueTitles(related.value).filter(t=>t.id!==title.id):[],entitlement:entitlement.status==="fulfilled"?entitlement.value:null,issues:[...(related.status==="rejected"?["related titles"]:[]),...(entitlement.status==="rejected"?["account viewing access"]:[])]};
}
