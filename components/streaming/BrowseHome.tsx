"use client";
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {useSession} from "@/lib/state/SessionContext";
import {streamingServices} from "@/lib/api/client";
import {loadBrowseHome,type BrowseHomeData} from "@/lib/browse-home";
import type {CatalogTitle} from "@/types/streaming";
import {FeaturedHero,TitleQuickInfo} from "./FeaturedHero";
import {BrowseSkeleton,BrowseState,ContentRow,ContinueWatchingCard,MovieCard,SeriesCard,type WatchlistControl} from "./ContentUI";
export function BrowseHome(){const {profile}=useSession();return profile?<ProfileHome key={profile.id} profileId={profile.id}/>:<BrowseSkeleton/>;}
function ProfileHome({profileId}:{profileId:string}){
 const {auth,profile}=useSession();const [data,setData]=useState<BrowseHomeData|null>(null),[attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true),[info,setInfo]=useState<CatalogTitle|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState<string[]>([]);const active=useRef(true);const pending=useRef(new Set<string>());
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>{let cancelled=false;loadBrowseHome(streamingServices,profileId).then(result=>{if(!cancelled){setData(result);setLoading(false);}}).catch(()=>{if(!cancelled){setMessage("Your cinema could not load. Please try again.");setLoading(false);}});return()=>{cancelled=true;};},[profileId,attempt]);
 const retry=()=>{setLoading(true);setMessage("");setAttempt(v=>v+1);};
 const toggle=useCallback(async(title:CatalogTitle)=>{
  if(!data?.watchlistReady||pending.current.has(title.id))return;
  pending.current.add(title.id);setBusy([...pending.current]);setMessage("");
  const saved=data.saved.some(i=>i.titleId===title.id);
  try{if(saved){await streamingServices.watchlist.removeFromWatchlist(profileId,title.id);if(active.current)setData(current=>current?{...current,saved:current.saved.filter(i=>i.titleId!==title.id)}:current);}
   else{const item=await streamingServices.watchlist.addToWatchlist(profileId,title.id);if(active.current)setData(current=>current?{...current,saved:[...current.saved.filter(i=>i.titleId!==title.id),item]}:current);}
   if(active.current)setMessage(title.title+(saved?" removed from ":" added to ")+profile?.name+"'s list.");
  }catch{if(active.current)setMessage("Could not update My List. Please try again.");}
  finally{pending.current.delete(title.id);if(active.current)setBusy([...pending.current]);}
 },[data,profile,profileId]);
 const control=(t:CatalogTitle):WatchlistControl=>({saved:Boolean(data?.saved.some(i=>i.titleId===t.id)),busy:busy.includes(t.id),disabled:!data?.watchlistReady,toggle:()=>void toggle(t)});
 if(loading)return <BrowseSkeleton/>;
 if(!data||(!data.titles.length&&data.issues.includes("catalog")))return <BrowseState title="Your cinema is taking a moment." action={<button className="cinema-button" onClick={retry}>Try again</button>}>{message||"We could not reach the catalog. Please try again."}</BrowseState>;
 const featured=data.titles.filter(t=>t.featured).slice(0,4);
 const rails=data.rails.length?data.rails:[{id:"catalog-movies",title:"Explore movies",items:data.titles.filter(t=>t.mediaType==="movie")},{id:"catalog-series",title:"Explore series",items:data.titles.filter(t=>t.mediaType==="series")}].filter(r=>r.items.length);
 const savedTitles=data.saved.flatMap(item=>{const t=data.titles.find(t=>t.id===item.titleId);return t?[t]:[];});
 return <div className="cinema-home">{message&&<p className="cinema-toast" role="status">{message}</p>}{data.issues.length>0&&<div className="cinema-service-notice" role="status">Could not load {data.issues.join(", ")}. <button type="button" onClick={retry}>Try again</button></div>}{featured.length>0&&<FeaturedHero titles={featured} entitlement={data.entitlement} control={control} onInfo={setInfo}/>}<div className="cinema-home-body"><div className="cinema-welcome"><div><p className="cinema-eyebrow">YOUR CINEMA</p><h2>{profile?.name}, find your next watch.</h2></div><Link href="/browse/search">Search movies & series <span aria-hidden="true">↗</span></Link></div>{profile?.isKids&&<p className="cinema-service-notice">Kids profile preview. This demo catalog is unrated; secure maturity filtering requires the catalog backend.</p>}
 {data.progress.some(p=>data.titles.some(t=>t.id===p.titleId))&&<ContentRow title="Continue Watching" subtitle={"Pick up where "+profile?.name+" left off."}>{data.progress.flatMap(p=>{const t=data.titles.find(t=>t.id===p.titleId);return t?[<li key={p.id}><ContinueWatchingCard title={t} progress={p} entitlement={data.entitlement} onInfo={setInfo}/></li>]:[];})}</ContentRow>}
 {!data.titles.length&&<BrowseState title="The catalog is quiet for now.">Movies and series will appear here when they are available.</BrowseState>}
 {rails.map(rail=><ContentRow key={rail.id} title={rail.title} subtitle={auth.isMock?"Explore the collection. Check title availability before watching.":undefined} href={rail.items.every(t=>t.mediaType==="movie")?"/browse/movies":rail.items.every(t=>t.mediaType==="series")?"/browse/series":undefined}>{rail.items.map(t=><li key={t.id}>{t.mediaType==="series"?<SeriesCard title={t} control={control(t)} onInfo={setInfo}/>:<MovieCard title={t} control={control(t)} onInfo={setInfo}/>}</li>)}</ContentRow>)}
 <section className="cinema-discover" aria-label="Explore the catalog"><div><p className="cinema-eyebrow">FOLLOW YOUR MOOD</p><h2>A different world.<br/>A few clicks away.</h2></div><div className="cinema-genre-links">{data.genres.map(g=><Link key={g.id} href={"/browse/search?genre="+encodeURIComponent(g.slug)}>{g.name}<span aria-hidden="true">↗</span></Link>)}<Link href="/browse/movies">All movies <span aria-hidden="true">↗</span></Link><Link href="/browse/series">All series <span aria-hidden="true">↗</span></Link></div></section>
 {savedTitles.length>0?<ContentRow title="My List" subtitle={"Saved for "+profile?.name+"."} href="/browse/my-list">{savedTitles.map(t=><li key={t.id}><MovieCard title={t} control={control(t)} onInfo={setInfo} portrait/></li>)}</ContentRow>:data.watchlistReady&&data.saved.length===0&&<section className="cinema-list-empty"><span aria-hidden="true">+</span><div><h2>A good watch, saved for later.</h2><p>Add a movie or series to My List. Your picks stay with this profile{auth.isMock?" during this session":""}.</p></div><a href="#main">Explore the spotlight ↑</a></section>}
 {!data.progress.length&&!data.issues.includes("viewing progress")&&<p className="cinema-progress-empty">Your Continue Watching row will appear once you start watching.</p>}<footer className="cinema-footer"><span>flurzi cinema.</span><Link href="/help">Help center ↗</Link><Link href="/">Public website ↗</Link></footer></div>{info&&<TitleQuickInfo title={info} entitlement={data.entitlement} control={control(info)} onClose={()=>setInfo(null)} isMock={auth.isMock}/>}</div>;
}
