import type {CatalogTitle} from '@/types/streaming';
import {ServiceError} from './api/errors';
import {serviceDeadline} from './api/deadline';

export type LensCategory='cast'|'insights'|'music'|'locations'|'related';
export interface LensIdentity {titleId:string;episodeId?:string;profileId:string}
export interface LensProvenance {label:string;reference?:string;reviewedAt:string}
export interface LensSpoiler {classification:'safe'|'plot'|'unknown';revealAtSeconds?:number}
export interface LensRecord {
 id:string;category:LensCategory;heading:string;text?:string;
 personId?:string;character?:string;role?:string;portraitUrl?:string;
 artist?:string;externalUrl?:string;relatedTitleIds?:string[];
 spoiler:LensSpoiler;source:LensProvenance;
}
export interface SceneAnnotation {id:string;startSeconds:number;endSeconds:number;records:LensRecord[]}
export interface StoryLensContext extends LensIdentity {
 version:string;expiresAt:string;availability:'available'|'unavailable';
 capabilities:LensCategory[];records:LensRecord[];annotations:SceneAnnotation[];
}
export interface StoryLensService {getContext(input:LensIdentity&{signal?:AbortSignal}):Promise<StoryLensContext>}
export interface StoryLensBinding {service:StoryLensService;identity:LensIdentity;viewerKey:string}
const categories:LensCategory[]=['cast','insights','music','locations','related'];
const validText=(v:unknown,max=4000):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
export function approvedLensUrl(value:unknown):string|undefined {
 if(typeof value!=='string'||value.length>2000)return;
 try{const url=new URL(value);if(url.protocol==='https:'&&!url.username&&!url.password)return url.href;}catch{}
}
function invalid():never{throw new ServiceError({code:'METADATA_INVALID',message:'Context information could not be verified.'});}
export function validateLensContext(value:StoryLensContext,identity:LensIdentity,now=Date.now()):StoryLensContext {
 if(!value||value.titleId!==identity.titleId||value.episodeId!==identity.episodeId||value.profileId!==identity.profileId)invalid();
 if(!validText(value.version,100)||!Number.isFinite(Date.parse(value.expiresAt))||Date.parse(value.expiresAt)<=now)invalid();
 if(!['available','unavailable'].includes(value.availability)||!Array.isArray(value.capabilities)||value.capabilities.some(c=>!categories.includes(c))||new Set(value.capabilities).size!==value.capabilities.length)invalid();
 if(!Array.isArray(value.records)||value.records.length>200||!Array.isArray(value.annotations)||value.annotations.length>500)invalid();
 const ids=new Set<string>();
 function record(r:LensRecord){
  if(!r||!validText(r.id,120)||ids.has(r.id)||!value.capabilities.includes(r.category)||!validText(r.heading,200))invalid();ids.add(r.id);
  if(r.text!==undefined&&!validText(r.text))invalid();
  for(const key of ['personId','character','role','artist'] as const)if(r[key]!==undefined&&!validText(r[key],200))invalid();
  if(!r.source||!validText(r.source.label,200)||!Number.isFinite(Date.parse(r.source.reviewedAt)))invalid();
  if(r.source.reference!==undefined&&!approvedLensUrl(r.source.reference))invalid();
  for(const key of ['portraitUrl','externalUrl'] as const)if(r[key]!==undefined&&!approvedLensUrl(r[key]))invalid();
  if(!r.spoiler||!['safe','plot','unknown'].includes(r.spoiler.classification))invalid();
  if(r.spoiler.revealAtSeconds!==undefined&&!finite(r.spoiler.revealAtSeconds))invalid();
  if(r.relatedTitleIds!==undefined&&(!Array.isArray(r.relatedTitleIds)||r.relatedTitleIds.length>12||r.relatedTitleIds.some(id=>!validText(id,120))||new Set(r.relatedTitleIds).size!==r.relatedTitleIds.length))invalid();
 }
 value.records.forEach(record);
 const sceneIds=new Set<string>();let count=value.records.length;
 for(const a of value.annotations){
  if(!a||!validText(a.id,120)||sceneIds.has(a.id)||!finite(a.startSeconds)||!finite(a.endSeconds)||a.endSeconds<=a.startSeconds||!Array.isArray(a.records)||a.records.length>30)invalid();
  sceneIds.add(a.id);count+=a.records.length;if(count>2000)invalid();a.records.forEach(record);
 }
 if(value.availability==='unavailable'&&(value.records.length||value.annotations.length))invalid();
 return value;
}
export function validLensMedia(title:CatalogTitle,identity:LensIdentity){
 return title.id===identity.titleId&&(title.mediaType==='movie'?!identity.episodeId:!identity.episodeId||title.seasons.some(s=>s.episodes.some(e=>e.id===identity.episodeId)));
}
export function activeLensScenes(context:StoryLensContext,time?:number){
 return finite(time)?context.annotations.filter(a=>time>=a.startSeconds&&time<a.endSeconds):[];
}
export function lensVisibility(record:LensRecord,time?:number):'visible'|'reveal'|'hidden' {
 if(record.spoiler.classification==='safe')return 'visible';
 if(record.spoiler.classification==='plot'&&finite(time)&&finite(record.spoiler.revealAtSeconds)&&record.spoiler.revealAtSeconds<=time)return 'reveal';
 return 'hidden';
}
export function lensError(error:unknown){
 const code=error&&typeof error==='object'&&'code'in error?String(error.code):'';
 if(code==='SESSION_EXPIRED'||code==='UNAUTHENTICATED')return 'Your session has expired. Sign in again to explore this story.';
 if(code==='ACCESS_DENIED'||code==='PROFILE_RESTRICTION_UNAVAILABLE')return 'Context information is not available for this viewing profile.';
 if(code==='TIMEOUT')return 'StoryLens took too long to respond. Please try again.';
 if(code==='METADATA_INVALID')return 'This context information could not be verified.';
 return 'StoryLens information is currently unavailable for this story.';
}
// A reader belongs to one mounted viewer/media scope, never to a global cache.
// Dispose aborts the transport and invalidates even adapters that ignore cancellation.
export function createLensReader(service:StoryLensService,identity:LensIdentity,now=Date.now){
 let generation=0;let disposed=false;let cached:StoryLensContext|undefined;let cachedAt=0;
 let controller:AbortController|undefined;let pending:Promise<StoryLensContext>|undefined;
 return {
  read():Promise<StoryLensContext>{
   if(disposed)return Promise.reject(new ServiceError({code:'ACCESS_DENIED',message:'Viewing context changed.'}));
   if(cached&&now()-cachedAt<300000&&Date.parse(cached.expiresAt)>now())return Promise.resolve(cached);
   if(pending)return pending;
   const current=++generation;controller=new AbortController();
   pending=serviceDeadline(Promise.resolve().then(()=>service.getContext({...identity,signal:controller!.signal}))).then(value=>{
    if(disposed||current!==generation)throw new ServiceError({code:'ACCESS_DENIED',message:'Viewing context changed.'});
    cached=validateLensContext(value,identity,now());cachedAt=now();return cached;
   }).catch(error=>{controller?.abort();throw error;}).finally(()=>{if(current===generation)pending=undefined;});
   return pending;
  },
  dispose(){disposed=true;generation++;controller?.abort();cached=undefined;pending=undefined;}
 };
}
