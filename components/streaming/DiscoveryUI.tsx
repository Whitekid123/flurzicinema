"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useState,useSyncExternalStore,type ReactNode} from "react";
import type {CatalogTitle} from "@/types/streaming";
import {streamingServices} from "@/lib/api/client";
import {createWatchlistController} from "@/lib/watchlist-controller";
import {MovieCard,type WatchlistControl} from "./ContentUI";

export function useResource<T>(load:()=>Promise<T>){
 const [state,setState]=useState<{data:T|null;loading:boolean;error:boolean}>({data:null,loading:true,error:false});
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{let cancelled=false;load().then(data=>{if(!cancelled)setState({data,loading:false,error:false});}).catch(()=>{if(!cancelled)setState({data:null,loading:false,error:true});});return()=>{cancelled=true;};},[load,attempt]);
 const retry=useCallback(()=>{setState({data:null,loading:true,error:false});setAttempt(i=>i+1);},[]);
 return {...state,retry};
}
export function useProfileWatchlist(profileId:string){
 const controller=useMemo(()=>createWatchlistController(streamingServices.watchlist,profileId),[profileId]);
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 useEffect(()=>controller.start(),[controller]);
 function control(title:CatalogTitle):WatchlistControl{
  return {saved:Boolean(state.items?.some(i=>i.titleId===title.id)),busy:state.pending.includes(title.id),disabled:state.loading||Boolean(state.error)||!state.items,toggle:()=>{void controller.toggle(title.id,title.title);}};
 }
 return {...state,control,retry:controller.retry,remove:controller.remove};
}
export function DiscoveryNotice({children,action}:{children:ReactNode;action?:()=>void}){
 return <div className="discovery-notice" role="status">{children}{action&&<button type="button" onClick={action}>Try again</button>}</div>;
}
export function WatchlistFeedback({watchlist}:{watchlist:ReturnType<typeof useProfileWatchlist>}){
 return <>{watchlist.error&&<DiscoveryNotice action={watchlist.retry}>{watchlist.error} Saved status is unavailable.</DiscoveryNotice>}{watchlist.notice&&<p className="discovery-feedback" role="status">{watchlist.notice}</p>}</>;
}
export function CatalogSkeleton({label="Loading titles"}:{label?:string}){
 return <div className="discovery-loading" role="status" aria-label={label}><span className="cinema-sr-only">{label}…</span><div className="discovery-skeleton-line"/><div className="discovery-skeleton-grid">{[1,2,3,4,5,6].map(i=><div key={i}/>)}</div></div>;
}
export function DiscoveryHeader({eyebrow,title,children,aside}:{eyebrow:string;title:string;children:ReactNode;aside?:ReactNode}){
 return <header className="discovery-heading"><div><p className="cinema-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></div>{aside}</header>;
}
export function TitleGrid({titles,watchlist,onInfo,portrait=false}:{titles:CatalogTitle[];watchlist:ReturnType<typeof useProfileWatchlist>;onInfo:(t:CatalogTitle)=>void;portrait?:boolean}){
 return <ul className={"discovery-grid"+(portrait?" is-portrait-grid":"")}>{titles.map(title=><li key={title.id}><MovieCard title={title} control={watchlist.control(title)} onInfo={onInfo} portrait={portrait}/>{title.mediaType==="series"&&<p className="discovery-series-count">{title.seasons.reduce((n,s)=>n+s.episodes.length,0)} listed episodes · {title.seasons.length} {title.seasons.length===1?"season":"seasons"}</p>}</li>)}</ul>;
}
export function PageNavigation({page,total,pageSize,href}:{page:number;total:number;pageSize:number;href:(page:number)=>string}){
 const pages=Math.max(1,Math.ceil(total/pageSize));if(pages===1&&page===1)return null;
 return <nav className="discovery-pagination" aria-label="Results pages">{page>1?<Link className="cinema-button" href={href(Math.min(pages,page-1))}>← Previous</Link>:<span/>}<span>{page>pages?"Page unavailable":"Page "+page+" of "+pages}</span>{page<pages?<Link className="cinema-button" href={href(page+1)}>Next →</Link>:<span/>}</nav>;
}
export function DiscoveryFooter(){return <footer className="cinema-footer"><span>flurzi cinema.</span><Link href="/browse">Back to Home ↗</Link><Link href="/browse/history">Viewing history ↗</Link></footer>;}
