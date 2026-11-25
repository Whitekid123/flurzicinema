"use client";
import Link from "next/link";
import {usePathname,useRouter,useSearchParams} from "next/navigation";
import {useCallback,useMemo,useState,type FormEvent} from "react";
import type {CatalogTitle,Genre,Series} from "@/types/streaming";
import {streamingServices} from "@/lib/api/client";
import {catalogSorts,discoveryHref,discoveryRequest,readDiscoveryState,type DiscoveryState} from "@/lib/catalog-discovery";
import {titleHref} from "@/lib/browse-home";
import {useSession} from "@/lib/state/SessionContext";
import {BrowseState,MetadataBadges,SeriesCard,WatchlistButton} from "./ContentUI";
import {TitleQuickInfo} from "./FeaturedHero";
import {CatalogSkeleton,DiscoveryFooter,DiscoveryHeader,DiscoveryNotice,PageNavigation,TitleGrid,useProfileWatchlist,useResource,WatchlistFeedback} from "./DiscoveryUI";

export function CatalogScreen({kind}:{kind:"movie"|"series"|"search"}){
 const {profile}=useSession();
 return profile?<ProfileCatalog key={profile.id+"-"+kind} profileId={profile.id} kind={kind}/>:<CatalogSkeleton/>;
}
function ProfileCatalog({profileId,kind}:{profileId:string;kind:"movie"|"series"|"search"}){
 const params=useSearchParams();const query=params.toString();const state=useMemo(()=>readDiscoveryState(new URLSearchParams(query)),[query]);
 const path=usePathname();const watchlist=useProfileWatchlist(profileId);
 const loadGenres=useCallback(()=>streamingServices.catalog.listGenres(),[]);const genres=useResource(loadGenres);
 const {profile,auth}=useSession();const isSearch=kind==="search";
 const hasSearch=Boolean(state.q||state.genre||state.year||state.type||state.page>1);
 const title=isSearch?"Find your next watch.":kind==="movie"?"Movies.":"Series.";
 return <div className={"discovery-page discovery-"+kind}><DiscoveryHeader eyebrow={isSearch?"SEARCH THE CATALOG":kind==="movie"?"THE MOVIE COLLECTION":"TELEVISION, EPISODE BY EPISODE"} title={title} aside={!isSearch&&<Link className="discovery-header-link" href="/browse/search">Search the catalog ↗</Link>}>{isSearch?"A title, a genre, a different world. Start here.":kind==="movie"?"From first frames to final credits. Explore the movie collection.":"Find a series to settle into. Explore seasons and the episodes listed in the catalog."}</DiscoveryHeader>
 {profile?.isKids&&auth.isMock&&<DiscoveryNotice>Age restrictions are not enforced in this preview. Playback is unavailable.</DiscoveryNotice>}
 <CatalogFilters key={"filters:"+query} path={path} kind={kind} state={state} genres={genres.data||[]} loading={genres.loading}/>
 {genres.error&&<DiscoveryNotice action={genres.retry}>Genres could not load. You can still search or browse available titles.</DiscoveryNotice>}
 <ActiveFilters path={path} state={state} genres={genres.data||[]} search={isSearch}/>
 <WatchlistFeedback watchlist={watchlist}/>
 {isSearch&&!hasSearch?<section className="discovery-search-start"><span aria-hidden="true">⌕</span><h2>What are you in the mood for?</h2><p>Search by title or choose a genre from the catalog.</p><div className="discovery-suggestions">{(genres.data||[]).map(genre=><Link key={genre.id} href={discoveryHref(path,{...state,genre:genre.slug,page:1})}>{genre.name} ↗</Link>)}</div><div className="discovery-search-routes"><Link href="/browse/movies">Explore movies →</Link><Link href="/browse/series">Explore series →</Link></div></section>:<QueryResults key={"results:"+query} kind={kind} state={state} path={path} watchlist={watchlist}/>}
 <DiscoveryFooter/></div>;
}
function CatalogFilters({path,kind,state,genres,loading}:{path:string;kind:"movie"|"series"|"search";state:DiscoveryState;genres:Genre[];loading:boolean}){
 const router=useRouter();
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const data=new FormData(event.currentTarget);const params=new URLSearchParams();
  for(const key of ["q","genre","sort","year","type"]){const value=data.get(key);if(typeof value==="string"&&value.trim())params.set(key,value.trim());}
  router.push(discoveryHref(path,readDiscoveryState(params)),{scroll:false});
 }
 return <form className="discovery-filters" onSubmit={submit} aria-label={kind==="search"?"Search catalog":"Filter catalog"}>{kind==="search"&&<div className="discovery-query"><label htmlFor="catalog-query">Search movies and series</label><div><input id="catalog-query" name="q" type="search" maxLength={150} defaultValue={state.q} placeholder="Search by title…" autoComplete="off"/>{state.q&&<button type="button" aria-label="Clear search query" onClick={()=>router.push(discoveryHref(path,{...state,q:"",page:1}),{scroll:false})}>×</button>}</div></div>}<div className="discovery-filter-fields"><label>Genre<select aria-label="Genre" name="genre" defaultValue={state.genre} disabled={loading}><option value="">All genres</option>{state.genre&&!genres.some(g=>g.slug===state.genre)&&<option value={state.genre}>{state.genre}</option>}{genres.map(genre=><option key={genre.id} value={genre.slug}>{genre.name}</option>)}</select></label>{kind==="search"&&<label>Content type<select aria-label="Content type" name="type" defaultValue={state.type||""}><option value="">Movies & series</option><option value="movie">Movies</option><option value="series">Series</option></select></label>}<label>Release year<input type="number" name="year" min="1888" max="2100" step="1" placeholder="Any year" defaultValue={state.year||""}/></label><label>Sort by<select aria-label="Sort by" name="sort" defaultValue={state.sort}>{catalogSorts.map(sort=><option key={sort.value} value={sort.value}>{sort.label}</option>)}</select></label><button className="cinema-button is-primary" type="submit">{kind==="search"?"Search":"Apply filters"}</button></div></form>;
}
function ActiveFilters({path,state,genres,search}:{path:string;state:DiscoveryState;genres:Genre[];search:boolean}){
 const active:[string,string,Partial<DiscoveryState>][]=[];
 if(state.q)active.push(["query","“"+state.q+"”",{q:""}]);if(state.genre)active.push(["genre",genres.find(g=>g.slug===state.genre)?.name||state.genre,{genre:""}]);if(state.year)active.push(["year",String(state.year),{year:undefined}]);if(search&&state.type)active.push(["type",state.type==="movie"?"Movies":"Series",{type:undefined}]);
 return <div className="discovery-active-filters" aria-label="Active filters">{active.map(([key,label,patch])=><Link key={key} href={discoveryHref(path,{...state,...patch,page:1})} aria-label={"Remove "+key+" filter: "+label}>{label} <span aria-hidden="true">×</span></Link>)}{(active.length>0||state.sort!=="year-desc"||state.page>1)&&<Link className="discovery-reset" href={path}>Reset filters</Link>}</div>;
}
function QueryResults({kind,state,path,watchlist}:{kind:"movie"|"series"|"search";state:DiscoveryState;path:string;watchlist:ReturnType<typeof useProfileWatchlist>}){
 const {auth}=useSession();const [info,setInfo]=useState<CatalogTitle|null>(null);
 const load=useCallback(async()=>{
  const query=discoveryRequest(state,kind==="search"?undefined:kind);
  // listTitles supports combined search/mediaType filters; search handles mixed results.
  return kind==="search"&&!query.mediaType?streamingServices.catalog.search(state.q,query):streamingServices.catalog.listTitles(query);
 },[kind,state]);
 const resource=useResource(load);
 if(resource.loading)return <CatalogSkeleton label={kind==="search"?"Searching catalog":"Loading catalog"}/>;
 if(resource.error||!resource.data)return <BrowseState title="The catalog could not load." action={<button className="cinema-button" onClick={resource.retry}>Try again</button>}>Please try again. Your filters have been kept.</BrowseState>;
 const page=resource.data;const titles=page.items.filter(t=>kind==="search"||t.mediaType===kind);
 return <section className="discovery-results" aria-label="Catalog results"><div className="discovery-results-heading"><h2>{kind==="search"?"Search results":kind==="movie"?"Explore movies":"Explore series"}</h2><p role="status">{page.total} {page.total===1?"title":"titles"}{state.q?" matching “"+state.q+"”":""}</p></div>{!titles.length?<BrowseState title={state.page>1?"No titles on this page.":"No titles found."} action={<Link className="cinema-button" href={path}>Reset filters</Link>}>Try another title, genre or release year.</BrowseState>:kind==="series"?<ul className="discovery-series-list">{titles.filter((t):t is Series=>t.mediaType==="series").map(title=><li className="discovery-series-row" key={title.id}><SeriesCard title={title} control={watchlist.control(title)} onInfo={setInfo}/><div><p className="cinema-eyebrow">INSIDE THE SERIES</p><p className="discovery-series-synopsis">{title.synopsis}</p><MetadataBadges title={title}/><div className="discovery-season-overview">{title.seasons.map(season=><p key={season.id}>Season {season.number}<span>{season.episodes.length} listed {season.episodes.length===1?"episode":"episodes"}</span></p>)}</div><div className="discovery-series-actions"><Link className="cinema-button is-primary" href={titleHref(title)}>Explore episodes ↗</Link><WatchlistButton title={title} control={watchlist.control(title)}/></div></div></li>)}</ul>:<TitleGrid titles={titles} watchlist={watchlist} onInfo={setInfo} portrait={kind==="movie"}/>}<PageNavigation page={state.page} pageSize={page.pageSize} total={page.total} href={page=>discoveryHref(path,{...state,page})}/>{info&&<TitleQuickInfo title={info} entitlement={null} control={watchlist.control(info)} onClose={()=>setInfo(null)} isMock={auth.isMock}/>}</section>;
}
