import type {ViewerProfile} from '@/types/streaming';
import type {ProfileService,PlaybackService} from './api/services';
import {ServiceError} from './api/errors';
import {serviceDeadline} from './api/deadline';
import type {BitrateBounds,DataIdentity,DataPlanningMetadata,DataUsageEstimate,DataUsagePreference,MediaBitrateRange,RenditionInformation} from '@/types/datasense';
export type {DataUsageEstimate,DataUsagePreference,MediaBitrateRange} from '@/types/datasense';
export const dataPreferenceLabels:Record<DataUsagePreference,string>={auto:'Automatic preference',low:'Data Saver',medium:'Balanced',high:'Highest available'};
export const validDataPreference=(v:unknown):v is DataUsagePreference=>typeof v==='string'&&Object.hasOwn(dataPreferenceLabels,v);
export const finitePositive=(v:unknown,max=Number.MAX_SAFE_INTEGER):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>0&&v<=max;
export function validBitrate(range:MediaBitrateRange|undefined):range is MediaBitrateRange{
 function bounds(v:BitrateBounds|undefined,zero=false){return !!v&&typeof v.minBps==='number'&&Number.isFinite(v.minBps)&&(zero?v.minBps>=0:v.minBps>=1)&&(zero?(typeof v.maxBps==='number'&&Number.isFinite(v.maxBps)&&v.maxBps>=0&&v.maxBps<=1e9):finitePositive(v.maxBps,1e9))&&v.minBps<=v.maxBps;}
 return !!range&&bounds(range)&&(range.kind==='aggregate'||(range.kind==='video'&&bounds(range.audio,true)))&&aggregateBitrateUnchecked(range).maxBps<=1e9;
}
function aggregateBitrateUnchecked(r:MediaBitrateRange):BitrateBounds{return r.kind==='aggregate'?r:{minBps:r.minBps+r.audio.minBps,maxBps:r.maxBps+r.audio.maxBps};}
export function aggregateBitrate(range:MediaBitrateRange|undefined):BitrateBounds|undefined{return validBitrate(range)?aggregateBitrateUnchecked(range):undefined;}
export function estimateUsage(range:MediaBitrateRange|undefined,seconds:number):DataUsageEstimate|undefined{
 const r=aggregateBitrate(range);if(!r||!Number.isFinite(seconds)||seconds<0||seconds>604800)return;
 const value={minBytes:r.minBps*seconds/8,maxBytes:r.maxBps*seconds/8};return Number.isFinite(value.maxBytes)?value:undefined;
}
export function addEstimates(a:DataUsageEstimate,b:DataUsageEstimate):DataUsageEstimate{return {minBytes:a.minBytes+b.minBytes,maxBytes:a.maxBytes+b.maxBytes};}
export function budgetBytes(input:string,unit:'MB'|'GB'):number|undefined {
 if(!['MB','GB'].includes(unit)||!/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(input.trim()))return;
 const bytes=Number(input)*(unit==='MB'?1e6:1e9);return finitePositive(bytes,1e12)&&bytes>=1000?bytes:undefined;
}
export function userNumber(input:string,max:number):number|undefined{
 if(!/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(input.trim()))return;
 const n=Number(input);return finitePositive(n,max)?n:undefined;
}
export function formatData(bytes:number|undefined):string{
 if(bytes===undefined||!Number.isFinite(bytes)||bytes<0)return 'Unavailable';
 if(bytes===0)return '0 MB';
 if(bytes<100000)return 'Less than 0.1 MB';
 const divisor=bytes>=1e9?1e9:1e6;return (Math.round(bytes/divisor*10)/10).toFixed(1).replace(/\.0$/,'')+(divisor===1e9?' GB':' MB');
}
export function formatUsage(value:DataUsageEstimate|undefined){if(!value)return 'Unavailable';return value.minBytes===value.maxBytes?formatData(value.maxBytes):formatData(value.minBytes)+' – '+formatData(value.maxBytes);}
export function formatViewingTime(seconds:number|undefined){
 if(seconds===undefined||!Number.isFinite(seconds)||seconds<0)return 'Unavailable';
 if(seconds<60)return 'Less than a minute';const minutes=Math.floor(seconds/60);return minutes>=60?Math.floor(minutes/60)+'h '+(minutes%60)+'m':minutes+' min';
}
export function viewingTimeForBudget(bytes:number,range:MediaBitrateRange|undefined):{minSeconds:number;maxSeconds:number}|undefined{
 const r=aggregateBitrate(range);return r&&finitePositive(bytes,1e12)?{minSeconds:bytes*8/r.maxBps,maxSeconds:bytes*8/r.minBps}:undefined;
}
export function compareBudget(bytes:number,estimate:DataUsageEstimate|undefined){
 if(!finitePositive(bytes,1e12)||!estimate||![estimate.minBytes,estimate.maxBytes].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0)||estimate.minBytes>estimate.maxBytes)return;
 return {status:estimate.minBytes>bytes?'exceeded':estimate.maxBytes>bytes?'may-exceed':estimate.maxBytes>=bytes*.8?'approaching':'within',
  minRemainingBytes:Math.max(0,bytes-estimate.maxBytes),maxRemainingBytes:Math.max(0,bytes-estimate.minBytes),overByBytes:Math.max(0,estimate.maxBytes-bytes)};
}
export function notificationForBudget(bytes:number|undefined,estimated:DataUsageEstimate|undefined,observed:number|undefined,example=false){
 if(!finitePositive(bytes,1e12))return;
 if(observed!==undefined&&observed>=bytes)return {key:'transfer-exceeded',text:(example?'Example transfer total':'Observed media transfers')+' reached your budget.'};
 if(observed!==undefined&&observed>=bytes*.8)return {key:'transfer-approaching',text:(example?'Example transfer total is':'Observed media transfers are')+' approaching your budget.'};
 const comparison=compareBudget(bytes,estimated);if(!comparison||comparison.status==='within')return;
 return {key:'estimate-'+comparison.status,text:comparison.status==='exceeded'?'Estimated session use exceeds your budget.':comparison.status==='may-exceed'?'Estimated session use may exceed your budget.':'Estimated session use is approaching your budget.'};
}
export function validDataIdentity(v:DataIdentity){return !!v&&[v.titleId,v.profileId,...(v.episodeId!==undefined?[v.episodeId]:[])].every(id=>typeof id==="string"&&id.trim().length>0&&id.length<=160);}
export function sameDataIdentity(a:DataIdentity,b:DataIdentity){return a.titleId===b.titleId&&a.episodeId===b.episodeId&&a.profileId===b.profileId;}
export function validRenditions(values:RenditionInformation[]):boolean{
 return Array.isArray(values)&&values.length<=30&&new Set(values.map(v=>v?.id)).size===values.length&&values.every(v=>v&&typeof v.id==='string'&&v.id.trim().length>0&&v.id.length<=120&&typeof v.label==='string'&&v.label.trim().length>0&&v.label.length<=100&&(v.bitrate===undefined||validBitrate(v.bitrate)));
}
export function validatePlanning(value:DataPlanningMetadata,identity:DataIdentity,now=Date.now()){
 if(!value||!validDataIdentity(value)||!sameDataIdentity(value,identity)||!Number.isFinite(Date.parse(value.expiresAt))||Date.parse(value.expiresAt)<=now||!validRenditions(value.renditions)||(value.durationSeconds!==undefined&&!finitePositive(value.durationSeconds,604800)))throw new ServiceError({code:'DATA_INVALID',message:'Data estimates could not be verified.'});
 return value;
}
export function createPlanningReader(service:PlaybackService,identity:DataIdentity){
 let disposed=false;let generation=0;let cached:DataPlanningMetadata|undefined;let at=0;const abort=new AbortController();
 return {
  async read(force=false){if(disposed)throw new ServiceError({code:'ACCESS_DENIED',message:'Viewing context changed.'});
   if(!force&&cached&&Date.now()-at<300000&&Date.parse(cached.expiresAt)>Date.now())return cached;
   if(!service.getDataPlanningMetadata)throw new ServiceError({code:'SERVICE_UNAVAILABLE',message:'Title estimates are unavailable.'});
   const current=++generation;const result=await serviceDeadline(Promise.resolve().then(()=>service.getDataPlanningMetadata!({...identity,signal:abort.signal}))).catch(error=>{abort.abort();throw error;});
   if(disposed||current!==generation)throw new ServiceError({code:'ACCESS_DENIED',message:'Viewing context changed.'});
   cached=validatePlanning(result,identity);at=Date.now();return cached;
  },
  dispose(){disposed=true;generation++;cached=undefined;abort.abort();}
 };
}
export async function saveDataPreference(service:ProfileService,profile:ViewerProfile,value:unknown):Promise<ViewerProfile>{
 if(!validDataPreference(value))throw new ServiceError({code:'VALIDATION',message:'Choose a data-use preference.'});
 const profiles=await serviceDeadline(service.listProfiles());const fresh=profiles.find(p=>p.id===profile.id&&p.accountId===profile.accountId);
 if(!fresh)throw new ServiceError({code:'ACCESS_DENIED',message:'Viewing profile unavailable.'});
 const updated=await serviceDeadline(service.updateProfile(profile.id,{preferences:{...fresh.preferences,playbackQuality:value}}));
 if(updated.id!==profile.id||updated.accountId!==profile.accountId||updated.preferences.playbackQuality!==value)throw new ServiceError({code:'DATA_INVALID',message:'Preference could not be confirmed.'});
 return updated;
}
export function dataSenseError(error:unknown){
 const code=error&&typeof error==='object'&&'code'in error?String(error.code):'';
 if(code==='TIMEOUT')return 'The request took too long. Please try again.';
 if(code==='SESSION_EXPIRED'||code==='UNAUTHENTICATED')return 'Sign in again to use your viewing profile.';
 if(code==='DATA_INVALID')return 'This information could not be verified.';
 return 'This option is currently unavailable. Please try again.';
}
