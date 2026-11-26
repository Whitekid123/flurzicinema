import type {PlaybackDataMetadata,DataPlaybackIdentity,PlaybackTelemetry,DataSenseState,DataSenseTransportSession,MediaBitrateRange} from '@/types/datasense';
import {aggregateBitrate,estimateUsage,validDataIdentity,sameDataIdentity,validBitrate,validRenditions} from './datasense';
import {serviceDeadline} from './api/deadline';
import {ServiceError} from './api/errors';
export function samePlaybackData(a:DataPlaybackIdentity,b:DataPlaybackIdentity){return validDataIdentity(a)&&sameDataIdentity(a,b)&&[a.playbackSessionId,a.sourceId].every(id=>typeof id==="string"&&id.trim().length>0&&id.length<=160)&&a.playbackSessionId===b.playbackSessionId&&a.sourceId===b.sourceId;}
export function validPlaybackData(value:PlaybackDataMetadata|undefined,identity:DataPlaybackIdentity,now=Date.now()):value is PlaybackDataMetadata{
 return !!value&&samePlaybackData(value,identity)&&typeof value.sourceId==='string'&&value.sourceId.length>0&&value.sourceId.length<=120&&Number.isFinite(Date.parse(value.expiresAt))&&Date.parse(value.expiresAt)>now&&(value.sourceBitrate===undefined||validBitrate(value.sourceBitrate));
}
export function validateTelemetry(v:PlaybackTelemetry,identity:DataPlaybackIdentity,allowExamples=false,now=Date.now()){
 if(!v||!samePlaybackData(v,identity)||!Number.isSafeInteger(v.sequence)||v.sequence<0||!Number.isFinite(v.atMs)||v.atMs<=0||v.atMs>now+30000||!['observed','example'].includes(v.kind)||(v.kind==='example'&&!allowExamples)||!validRenditions(v.renditions)||typeof v.canSelectRendition!=='boolean'||!['complete','partial','unavailable'].includes(v.transferCoverage)||(v.bitrate!==undefined&&!validBitrate(v.bitrate))||(v.buffering!==undefined&&typeof v.buffering!=='boolean'))throw new ServiceError({code:'DATA_INVALID',message:'Playback information could not be verified.'});
 if(v.transferCoverage==='complete'&&!Array.isArray(v.transfers))throw new ServiceError({code:'DATA_INVALID',message:'Complete transfer coverage requires explicit observations.'});
 if(v.currentRenditionId!==undefined&&!v.renditions.some(r=>r.id===v.currentRenditionId))throw new ServiceError({code:'DATA_INVALID',message:'Unknown rendition.'});
 if(v.transfers!==undefined&&(!Array.isArray(v.transfers)||v.transfers.length>500||v.transfers.some(t=>!t||typeof t.id!=='string'||!t.id.trim()||t.id.length>160||t.resource!=='media'||!Number.isSafeInteger(t.bytes)||t.bytes<0||!Number.isFinite(t.atMs)||t.atMs<=0||t.atMs>v.atMs)))throw new ServiceError({code:'DATA_INVALID',message:'Transfer information could not be verified.'});
 return v;
}
export function createDataUsageSession(input:{
 identity:DataPlaybackIdentity;metadata?:PlaybackDataMetadata;transport?:DataSenseTransportSession;
 onChange:(state:DataSenseState)=>void;allowExamples?:boolean;now?:()=>number;seenLimit?:number;
}){
 const {identity,transport,onChange}=input,now=input.now??Date.now;let active=true,sequence=-1,lastTelemetryAt=0;
 let rate:MediaBitrateRange|undefined=validPlaybackData(input.metadata,identity,now())?input.metadata!.sourceBitrate:undefined;
 let expired=false,transportDisposed=false;
 let telemetry:PlaybackTelemetry|undefined,unsubscribe:(()=>void)|undefined;let lastAt=now(),playing=false,speed=1,played=0,minBytes=0,maxBytes=0,estimateInvalid=false;
 let transferred=0,hasTransfers=false,transferInvalid=false,coverage:DataSenseState['coverage']='unavailable',error:string|undefined,pending=false;
 const seen=new Map<string,number>(),requests=new Set<AbortController>();
 function closeTransport(){if(transportDisposed)return;transportDisposed=true;unsubscribe?.();transport?.dispose();}
 function state():DataSenseState{if(!active)return {playedSeconds:0,coverage:"unavailable",canSelectRendition:false,example:false};return {playedSeconds:played,estimated:!estimateInvalid&&(played>0||aggregateBitrate(rate))?{minBytes,maxBytes}:undefined,observedBytes:!transferInvalid&&coverage!=='unavailable'&&(hasTransfers||coverage==='complete')?transferred:undefined,coverage:transferInvalid?'unavailable':coverage,telemetry,bitrate:rate,canSelectRendition:active&&!expired&&!!telemetry?.canSelectRendition&&!!transport?.selectRendition,error,example:telemetry?.kind==='example'};}
 function emit(){if(active)onChange(state());}
 function advance(at=now()){
  if(!expired&&input.metadata&&Date.parse(input.metadata.expiresAt)<=at){expired=true;rate=undefined;telemetry=undefined;coverage='unavailable';estimateInvalid=true;error='Playback data information has expired.';requests.forEach(r=>r.abort());closeTransport();}
  const elapsed=(at-lastAt)/1000;lastAt=at;
  if(playing&&elapsed>0){
   if(elapsed>30){estimateInvalid=true;return;}
   const seconds=elapsed*speed;played+=seconds;const estimated=estimateUsage(rate,seconds);
   if(!estimated)estimateInvalid=true;else{minBytes+=estimated.minBytes;maxBytes+=estimated.maxBytes;}
  }
 }
 function ingest(value:PlaybackTelemetry){
  if(!active)return;
  if(expired||!validPlaybackData(input.metadata,identity,now()))throw new ServiceError({code:"DATA_INVALID",message:"Playback data is unavailable."});
  const v=validateTelemetry(value,identity,input.allowExamples,now());
  if(telemetry&&telemetry.kind!==v.kind)throw new ServiceError({code:"DATA_INVALID",message:"Telemetry accuracy changed."});
  if(v.sequence<=sequence||v.atMs<lastTelemetryAt)return;
  advance();if(expired)return;sequence=v.sequence;lastTelemetryAt=v.atMs;
  const supplied=structuredClone(v);
  for(const t of supplied.transfers??[]){
   if(seen.has(t.id)){if(seen.get(t.id)!==t.bytes){transferInvalid=true;error='Transfer totals could not be verified.';}continue;}
   if(seen.size>=(input.seenLimit??16384)){transferInvalid=true;error='Transfer totals are no longer complete for this session.';break;}
   seen.set(t.id,t.bytes);transferred+=t.bytes;hasTransfers=true;if(!Number.isSafeInteger(transferred))transferInvalid=true;
  }
  telemetry=supplied;coverage=supplied.transferCoverage;
  rate=supplied.bitrate??supplied.renditions.find(r=>r.id===supplied.currentRenditionId)?.bitrate??input.metadata?.sourceBitrate;
  emit();
 }
 function fail(){if(active){error='Live playback information is unavailable.';telemetry=undefined;coverage='unavailable';rate=validPlaybackData(input.metadata,identity,now())?input.metadata?.sourceBitrate:undefined;emit();}}
 if(transport&&validPlaybackData(input.metadata,identity,now())){
  try{ingest(transport.getSnapshot());if(!expired&&!transportDisposed)unsubscribe=transport.subscribe(value=>{try{ingest(value);}catch{fail();}},fail);}catch{fail();}
 }
 emit();
 return {
  getSnapshot:state,
  sample(isPlaying:boolean,playbackRate=1){if(!active)return;advance();playing=isPlaying;speed=Number.isFinite(playbackRate)&&playbackRate>0&&playbackRate<=4?playbackRate:1;emit();},
  ingest,
  async selectRendition(id:string){
   if(!active||!validPlaybackData(input.metadata,identity,now())||pending||!state().canSelectRendition||!telemetry?.renditions.some(r=>r.id===id))throw new ServiceError({code:'SERVICE_UNAVAILABLE',message:'Quality selection is unavailable.'});
   const abort=new AbortController();requests.add(abort);pending=true;
   try{
    const result=await serviceDeadline(transport!.selectRendition!(id,{signal:abort.signal}));
    if(!active)throw new ServiceError({code:'ACCESS_DENIED',message:'Playback session changed.'});
    validateTelemetry(result,identity,input.allowExamples,now());
    if(result.sequence<sequence||(result.sequence===sequence&&telemetry?.currentRenditionId!==id)||result.currentRenditionId!==id)throw new ServiceError({code:'DATA_INVALID',message:'Quality selection was not confirmed.'});
    ingest(result);
   }catch(e){abort.abort();throw e;}finally{requests.delete(abort);pending=false;}
  },
  dispose(){if(!active)return;active=false;playing=false;requests.forEach(r=>r.abort());requests.clear();closeTransport();seen.clear();telemetry=undefined;rate=undefined;}
 };
}
