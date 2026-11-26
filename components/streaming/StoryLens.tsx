"use client";
import Link from 'next/link';
import {useCallback,useEffect,useId,useMemo,useRef,useState} from 'react';
import type {CatalogTitle} from '@/types/streaming';
import {useSession} from '@/lib/state/SessionContext';
import {storyLensServiceForViewer} from '@/lib/api/experience-services';
import {streamingServices} from '@/lib/api/client';
import {serviceDeadline} from '@/lib/api/deadline';
import {activeLensScenes,createLensReader,lensError,lensVisibility,validLensMedia,type LensCategory,type LensRecord,type StoryLensBinding,type StoryLensContext} from '@/lib/storylens';
import {Artwork} from '@/components/ui/Artwork';
import {Modal} from '@/components/ui/Modal';
import {WatchlistButton} from './ContentUI';
import {useProfileWatchlist} from './DiscoveryUI';
import './storylens.css';

const labels:Record<LensCategory,string>={cast:'Cast & characters',insights:'Film insights',music:'Music & soundtrack',locations:'Locations',related:'Related content'};
export function StoryLensEntry({title,episodeId,time,seekVersion=0,testBinding,disabled=false,controlledOpen,onOpenChange}:{title:CatalogTitle;episodeId?:string;time?:number;seekVersion?:number;testBinding?:StoryLensBinding;disabled?:boolean;controlledOpen?:boolean;onOpenChange?:(value:boolean)=>void}){
 const {profile,auth}=useSession();
 const binding=useMemo<StoryLensBinding|undefined>(()=>testBinding??(profile&&auth.session?{
  service:storyLensServiceForViewer(),identity:{titleId:title.id,episodeId,profileId:profile.id},
  viewerKey:[auth.session.id,profile.accountId,profile.id].join('|')
 }:undefined),[testBinding,profile,auth.session,title.id,episodeId]);
 if(!binding||disabled)return null;
 return <LensOwner key={[binding.viewerKey,auth.session?.expiresAt,title.id,episodeId].join('|')} title={title} binding={binding} time={time} seekVersion={seekVersion} expiresAt={auth.session?.expiresAt} controlledOpen={controlledOpen} onOpenChange={onOpenChange}/>;
}
function LensOwner({title,binding,time,seekVersion,expiresAt,controlledOpen,onOpenChange}:{title:CatalogTitle;binding:StoryLensBinding;time?:number;seekVersion:number;expiresAt?:string;controlledOpen?:boolean;onOpenChange?:(value:boolean)=>void}){
 const [expired,setExpired]=useState(false);
 const [localOpen,setLocalOpen]=useState(false),[attempt,setAttempt]=useState(0);
 const open=controlledOpen??localOpen;const setOpen=useCallback((value:boolean)=>{if(onOpenChange)onOpenChange(value);else setLocalOpen(value);},[onOpenChange]);
 const [resource,setResource]=useState<{data?:StoryLensContext;error?:unknown;loading:boolean}>({loading:true});
 const cache=useRef<{data:StoryLensContext;at:number}|null>(null);
 const [related,setRelated]=useState<CatalogTitle[]>([]);
 const launch=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);const panelId=useId();
 useEffect(()=>{
  if(!open||expired||!validLensMedia(title,binding.identity))return;let active=true;const reader=createLensReader(binding.service,binding.identity);
  const saved=cache.current;
  const promise=saved&&Date.now()-saved.at<300000&&Date.parse(saved.data.expiresAt)>Date.now()?Promise.resolve(saved.data):reader.read();
  promise.then(data=>{if(active){cache.current={data,at:Date.now()};setResource({loading:false,data});}},error=>{if(active)setResource({loading:false,error});});
  // Recommendations are existing catalog relationships, not inferred filmographies.
  serviceDeadline(streamingServices.catalog.listRecommendations(title.id,binding.identity.profileId)).then(items=>{
   if(active)setRelated(items.filter((item,index)=>item.id!==title.id&&items.findIndex(t=>t.id===item.id)===index).slice(0,6));
  }).catch(()=>{});
  return()=>{active=false;reader.dispose();};
 },[open,expired,attempt,binding.service,binding.identity,title]);
 useEffect(()=>{if(!open)return;heading.current?.focus();
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!event.defaultPrevented&&!document.querySelector("dialog[open]")){setOpen(false);launch.current?.focus();}};
  document.addEventListener("keydown",escape);return()=>document.removeEventListener("keydown",escape);
 },[open,setOpen]);
 useEffect(()=>{
  if(!resource.data||!open)return;
  const expiry=setTimeout(()=>{cache.current=null;setResource({loading:false,error:{code:'METADATA_INVALID'}});},Math.min(Math.max(0,Date.parse(resource.data.expiresAt)-Date.now()),2147483647));
  return()=>clearTimeout(expiry);
 },[resource.data,open]);
 useEffect(()=>{if(!expiresAt)return;const timer=setTimeout(()=>{cache.current=null;setExpired(true);},Math.min(Math.max(0,Date.parse(expiresAt)-Date.now()),2147483647));return()=>clearTimeout(timer);},[expiresAt]);
 const currentData=resource.data;
 function close(){setOpen(false);launch.current?.focus();}
 function retry(){cache.current=null;setResource({loading:true});setAttempt(n=>n+1);}
 if(expired)return <p className="lens-notice" role="status">Your session has expired. <Link href="/login">Sign in again</Link> to explore this story.</p>;
 return <section className="storylens" data-open={open} aria-label="StoryLens" onKeyDown={e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!(e.target as HTMLElement).closest('dialog')){e.stopPropagation();close();}}}>
 <button ref={launch} className="lens-launch" aria-expanded={open} aria-controls={panelId} onClick={()=>{if(!open&&resource.data&&Date.parse(resource.data.expiresAt)<=Date.now())setResource({loading:true});setOpen(!open);}}><span aria-hidden="true">◎</span> StoryLens <span className="lens-launch-note">Look a little closer</span></button>
 {open&&<aside id={panelId} className="lens-panel" aria-label="StoryLens information"><header className="lens-header"><div><p>BEYOND THE FRAME</p><h2 ref={heading} tabIndex={-1}>StoryLens<span>.</span></h2></div><button aria-label="Close StoryLens" onClick={close}>×</button></header><p className="lens-title">{title.title}{binding.identity.episodeId&&title.mediaType==='series'?' · '+title.seasons.flatMap(s=>s.episodes).find(e=>e.id===binding.identity.episodeId)?.title:''}</p>
 <div className="lens-scroll">
 {resource.loading&&<div className="lens-loading" role="status"><span/>Finding the details behind this story…</div>}
 {Boolean(resource.error)&&<div className="lens-notice"><p role="status">{lensError(resource.error)}</p><button onClick={retry}>Try again</button></div>}
 {!validLensMedia(title,binding.identity)?<p>Context information does not match this title.</p>:<LensContent key={[currentData?.version,(currentData?activeLensScenes(currentData,time):[]).map(a=>a.id).join(','),seekVersion].join('|')} title={title} context={currentData} time={time} related={related} profileId={binding.identity.profileId}/>}
 <p className="lens-footnote">Only supplied information appears here. Future and unclassified plot details stay hidden.</p>
 </div></aside>}</section>;
}
function LensContent({title,context,time,related,profileId}:{title:CatalogTitle;context?:StoryLensContext;time?:number;related:CatalogTitle[];profileId:string}){
 const scenes=context?activeLensScenes(context,time):[];
 const visible=(records:LensRecord[])=>records.filter(r=>lensVisibility(r,time)!=='hidden');
 const records=visible(context?.records??[]),sceneRecords=visible(scenes.flatMap(s=>s.records));
 const categories=(Object.keys(labels) as LensCategory[]).filter(category=>records.some(r=>r.category===category)||(category==='cast'&&title.cast.length>0)||(category==='related'&&related.length>0));
 const [selected,setSelected]=useState<string>(sceneRecords.length?'scene':'about');
 const active=selected==='scene'&&sceneRecords.length?'scene':categories.includes(selected as LensCategory)?selected:'about';
 return <>
 <nav className="lens-categories" aria-label="StoryLens categories"><button aria-pressed={active==="about"} onClick={()=>setSelected("about")}>Overview</button>{sceneRecords.length>0&&<button aria-pressed={active==='scene'} onClick={()=>setSelected('scene')}>In this scene</button>}{categories.map(category=><button key={category} aria-pressed={active===category} onClick={()=>setSelected(category)}>{labels[category]}</button>)}{!categories.length&&!sceneRecords.length&&<span>About this story</span>}</nav>
 <div className="lens-section" aria-label={active==='scene'?'In this scene':labels[active as LensCategory]??'About this story'}>
 <p className="lens-section-label">{active==='scene'?'AT THIS MOMENT':labels[active as LensCategory]?.toUpperCase()??'FROM THE CATALOG'}</p>
 {active==='scene'?sceneRecords.map(record=><LensCard key={record.id} record={record} time={time} profileId={profileId}/>):<>
 {records.filter(r=>r.category===active).map(record=><LensCard key={record.id} record={record} time={time} profileId={profileId}/>)}
 {active==='cast'&&title.cast.filter(p=>!records.some(r=>r.personId===p.id)).map(person=><article className="lens-person" key={person.id}><div className="lens-portrait" aria-hidden="true">{person.name.slice(0,1)}</div><div><h3>{person.name}</h3>{person.character&&<p>{person.character}</p>}<small>{person.role==='cast'?'Cast':'Crew'} · Catalog credit</small></div></article>)}
 {active==='related'&&related.map(item=><RelatedCatalog key={item.id} title={item} profileId={profileId}/>)}
 {active==='about'&&<><h3>The story, in focus.</h3><p>Explore the available categories for credits and creative details. Scene information appears only where supplied.</p><dl className="lens-facts">{title.releaseYear&&<div><dt>Released</dt><dd>{title.releaseYear}</dd></div>}{title.mediaType==='movie'&&title.durationMinutes&&<div><dt>Runtime</dt><dd>{title.durationMinutes} minutes</dd></div>}{title.genres.length>0&&<div><dt>Genres</dt><dd>{title.genres.map(g=>g.name).join(' / ')}</dd></div>}</dl></>}
 </>}
 </div>{context&&!context.annotations.length&&time!==undefined&&<p className="lens-footnote">Scene notes are not available. Explore this title’s supplied information instead.</p>}
 </>;
}
function LensCard({record,time,profileId}:{record:LensRecord;time?:number;profileId:string}){
 const [revealed,setRevealed]=useState(false);const visibility=lensVisibility(record,time);
 if(visibility==='hidden')return null;
 if(visibility==='reveal'&&!revealed)return <article className="lens-spoiler"><p>Plot detail · spoiler warning</p><button onClick={()=>setRevealed(true)}>Reveal this detail</button></article>;
 return <article className="lens-card">
 {record.category==='cast'?<div className="lens-person"><div className="lens-portrait">{record.portraitUrl?<Artwork src={record.portraitUrl} alt={record.heading} fill sizes="72px"/>:<span aria-hidden="true">{record.heading.slice(0,1)}</span>}</div><div><h3>{record.heading}</h3>{record.character&&<p>{record.character}</p>}{record.role&&<small>{record.role}</small>}</div></div>:<h3>{record.heading}</h3>}
 {record.text&&<p>{record.text}</p>}{record.artist&&<p>{record.artist}</p>}
 {record.externalUrl&&<a href={record.externalUrl} target="_blank" rel="noopener noreferrer">Open approved reference ↗</a>}
 <small className="lens-source">{record.source.reference?<a href={record.source.reference} target="_blank" rel="noopener noreferrer">{record.source.label} ↗</a>:record.source.label}</small>
 {record.relatedTitleIds?.map(id=><RelatedReference key={id} id={id} profileId={profileId}/>)}
 </article>;
}
function RelatedReference({id,profileId}:{id:string;profileId:string}){
 const [title,setTitle]=useState<CatalogTitle|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;serviceDeadline(streamingServices.catalog.getTitle(id)).then(value=>{if(active){if(value?.id===id)setTitle(value);else setFailed(true);}},()=>{if(active)setFailed(true);});return()=>{active=false;};},[id,attempt]);
 return title?<RelatedCatalog title={title} profileId={profileId}/>:failed?<p>Related title unavailable. <button onClick={()=>{setFailed(false);setAttempt(n=>n+1);}}>Try again</button></p>:<p role="status">Loading related title…</p>;
}
function RelatedCatalog({title,profileId}:{title:CatalogTitle;profileId:string}){
 const [confirm,setConfirm]=useState(false);const watchlist=useProfileWatchlist(profileId);
 return <article className="lens-related"><div className="lens-related-art"><Artwork src={title.artwork.backdropUrl??title.artwork.posterUrl??''} alt="" fill sizes="300px"/></div><h3>{title.title}</h3><div className="lens-related-actions"><button onClick={()=>setConfirm(true)}>Explore title</button><WatchlistButton title={title} control={watchlist.control(title)}/></div>{watchlist.error&&<p role="status">Your list could not be updated. Please try again.</p>}
 {confirm&&<Modal title="Explore another story?" onClose={()=>setConfirm(false)}><div className="lens-navigation"><p>KEEP EXPLORING</p><h2>Explore {title.title}?</h2><p>This opens title details. If you’re watching, you’ll leave the current player. Use Back to return and request playback again.</p><button onClick={()=>setConfirm(false)}>Stay here</button><Link className="cinema-button" href={'/browse/title/'+encodeURIComponent(title.id)}>Go to title details</Link></div></Modal>}</article>;
}
