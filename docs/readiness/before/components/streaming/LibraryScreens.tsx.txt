"use client";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useCallback,useMemo,useState} from "react";
import type {CatalogTitle} from "@/types/streaming";
import {streamingServices} from "@/lib/api/client";
import {createTitleResolver,readDiscoveryState,resolveTitleRecords} from "@/lib/catalog-discovery";
import {episodeLabel,progressDisplay,titleHref} from "@/lib/browse-home";
import {useSession} from "@/lib/state/SessionContext";
import {Artwork} from "@/components/ui/Artwork";
import {BrowseState} from "./ContentUI";
import {TitleQuickInfo} from "./FeaturedHero";
import {CatalogSkeleton,DiscoveryFooter,DiscoveryHeader,DiscoveryNotice,PageNavigation,TitleGrid,useProfileWatchlist,useResource,WatchlistFeedback} from "./DiscoveryUI";

export function LibraryScreen({history=false}:{history?:boolean}){
 const {profile}=useSession();
 return profile?<ProfileLibrary key={profile.id+"-"+history} profileId={profile.id} history={history}/>:<CatalogSkeleton/>;
}
function ProfileLibrary({profileId,history}:{profileId:string;history:boolean}){
 const {profile,auth}=useSession();const params=useSearchParams();const page=readDiscoveryState(params).page;
 const watchlist=useProfileWatchlist(profileId);
 const resolver=useMemo(()=>createTitleResolver(streamingServices.catalog),[]);
 const [info,setInfo]=useState<CatalogTitle|null>(null);
 return <div className="discovery-page discovery-library"><DiscoveryHeader eyebrow={"SAVED & WATCHED · "+profile?.name} title={history?"Viewing history.":"My List."} aside={<Link className="discovery-header-link" href={history?"/browse/my-list":"/browse/history"}>{history?"My List":"Viewing history"} ↗</Link>}>{history?"Revisit the movies and episodes recorded for this profile.":"Movies and series you want to come back to, together in one place."}</DiscoveryHeader>
 <div className="discovery-library-tabs"><Link href="/browse/my-list" aria-current={!history?"page":undefined}>My List</Link><Link href="/browse/history" aria-current={history?"page":undefined}>History</Link><span>{profile?.name}&apos;s library</span></div>
 {!history&&<WatchlistFeedback watchlist={watchlist}/>}
 {history?<HistoryEntries key={page} page={page} profileId={profileId} onInfo={setInfo}/>:watchlist.loading?<CatalogSkeleton label="Loading My List"/>:watchlist.error||!watchlist.items?<BrowseState title="My List could not load." action={<button className="cinema-button" onClick={watchlist.retry}>Try again</button>}>Your saved titles are unavailable right now. Please try again.</BrowseState>:watchlist.items.length===0?<BrowseState title="Your next good watch starts here." action={<Link className="cinema-button is-primary" href="/browse/movies">Explore movies ↗</Link>}>Add a movie or series to My List. Your picks are saved to this profile{auth.isMock?" for this demo session":""}.</BrowseState>:<SavedEntries key={page} page={page} watchlist={watchlist} resolver={resolver} onInfo={setInfo}/>}
 <DiscoveryFooter/>{info&&<TitleQuickInfo title={info} entitlement={null} control={watchlist.control(info)} onClose={()=>setInfo(null)} isMock={auth.isMock}/>}</div>;
}
function SavedEntries({page,watchlist,onInfo,resolver}:{page:number;watchlist:ReturnType<typeof useProfileWatchlist>;onInfo:(t:CatalogTitle)=>void;resolver:ReturnType<typeof createTitleResolver>}){
 const items=[...(watchlist.items||[])].sort((a,b)=>b.addedAt.localeCompare(a.addedAt));
 const ids=JSON.stringify(items.slice((page-1)*24,page*24).map(i=>i.titleId));
 const load=useCallback(()=>resolver.resolve(JSON.parse(ids) as string[]),[ids,resolver]);
 const resource=useResource(load);
 if(resource.loading)return <CatalogSkeleton label="Loading saved title information"/>;
 if(resource.error||!resource.data)return <BrowseState title="Title information could not load." action={<button className="cinema-button" onClick={resource.retry}>Try again</button>}>Your saved titles have been kept.</BrowseState>;
 const current=resource.data.filter(item=>(JSON.parse(ids) as string[]).includes(item.id));
 const titles=current.flatMap(item=>item.title?[item.title]:[]);
 const missing=current.filter(item=>!item.title);
 return <section aria-label="Saved content"><div className="discovery-results-heading"><h2>Saved for later</h2><p>{items.length} saved {items.length===1?"title":"titles"}</p></div>{missing.some(i=>i.failed)&&<DiscoveryNotice action={resource.retry}>Some title information could not load. Your list has been kept.</DiscoveryNotice>}
 {titles.filter(t=>t.mediaType==="movie").length>0&&<div className="discovery-library-group"><h3>Movies</h3><TitleGrid titles={titles.filter(t=>t.mediaType==="movie")} watchlist={watchlist} onInfo={onInfo} portrait/></div>}
 {titles.filter(t=>t.mediaType==="series").length>0&&<div className="discovery-library-group"><h3>Series</h3><TitleGrid titles={titles.filter(t=>t.mediaType==="series")} watchlist={watchlist} onInfo={onInfo}/></div>}
 {missing.map(item=><article className="discovery-missing" key={item.id}><div><h3>{item.failed?"Title information unavailable":"Title no longer in the catalog"}</h3><p>This saved entry is still in your list. You can remove it or try again later.</p></div><button className="cinema-button" type="button" disabled={watchlist.pending.includes(item.id)} onClick={()=>void watchlist.remove(item.id)}>{watchlist.pending.includes(item.id)?"Removing…":"Remove from My List"}</button></article>)}
 {!resource.data.length&&<BrowseState title="No titles on this page." action={<Link className="cinema-button" href="/browse/my-list">Return to My List</Link>}>Your saved titles may be on another page.</BrowseState>}
 <PageNavigation page={page} pageSize={24} total={items.length} href={n=>"/browse/my-list"+(n>1?"?page="+n:"")}/></section>;
}
function HistoryEntries({profileId,page,onInfo}:{profileId:string;page:number;onInfo:(t:CatalogTitle)=>void}){
 const load=useCallback(async()=>{
  const result=await streamingServices.catalog.getViewingHistory(profileId,{page,pageSize:24});
  const items=result.items.filter(p=>p.profileId===profileId);
  const titles=await resolveTitleRecords(items.map(p=>p.titleId),streamingServices.catalog);
  return {page:result,items,titles};
 },[profileId,page]);
 const resource=useResource(load);
 if(resource.loading)return <CatalogSkeleton label="Loading viewing history"/>;
 if(resource.error||!resource.data)return <BrowseState title="History could not load." action={<button className="cinema-button" onClick={resource.retry}>Try again</button>}>Your viewing history is unavailable right now. Please try again.</BrowseState>;
 const {items,titles,page:result}=resource.data;
 return <section aria-label="Viewing history">{!items.length?<BrowseState title={page>1?"No history on this page.":"Nothing watched yet."} action={<Link className="cinema-button is-primary" href={page>1?"/browse/history":"/browse"}>{page>1?"Return to History":"Explore your cinema ↗"}</Link>}>Movies and episodes will appear here when the viewing service records activity for this profile.</BrowseState>:<><div className="discovery-results-heading"><h2>Previously watched</h2><p>{result.total} recorded {result.total===1?"entry":"entries"}</p></div>{titles.some(t=>t.failed)&&<DiscoveryNotice action={resource.retry}>Some title information could not load.</DiscoveryNotice>}<ol className="discovery-history-list">{items.map(progress=>{
 const title=titles.find(t=>t.id===progress.titleId)?.title;const display=progressDisplay(progress);const date=Date.parse(progress.lastWatchedAt);
 return <li key={progress.id}>{title?<><Link className="discovery-history-art" href={titleHref(title)}><Artwork src={title.artwork.backdropUrl||title.artwork.posterUrl||""} alt={title.title} fill sizes="(max-width:600px) 36vw, 220px"/></Link><div><Link href={titleHref(title)}><h3>{title.title}</h3></Link><p>{episodeLabel(title,progress)|| (title.mediaType==="movie"?"Movie":"Series")}</p><progress value={display.percent} max="100" aria-label={title.title+" recorded viewing progress"}/><p>{progress.completed?"Completed":display.remaining!==null?display.remaining+" min remaining":"In progress"}{Number.isFinite(date)?" · "+new Date(date).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):""}</p></div><button className="cinema-button" onClick={()=>onInfo(title)}>Information</button></>:<div><h3>Watched title unavailable</h3><p>This viewing record remains in your history. Its title information is unavailable.</p></div>}</li>;
 })}</ol></>}
 <PageNavigation page={page} pageSize={result.pageSize} total={result.total} href={n=>"/browse/history"+(n>1?"?page="+n:"")}/></section>;
}
