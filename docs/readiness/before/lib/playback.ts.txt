import type {CatalogTitle,PlaybackMetadata,ViewingProgress} from "@/types/streaming";
import type {ServiceRegistry} from "@/lib/api/services";
import {playbackAllowed} from "@/lib/browse-home";
import {toServiceError} from "@/lib/api/errors";

export type PlayerState="idle"|"checking-access"|"loading-source"|"ready"|"buffering"|"playing"|"paused"|"seeking"|"ended"|"unavailable"|"unsupported"|"network-error"|"playback-error"|"session-expired"|"subscription-required"|"region-restricted"|"denied";
export class PlaybackFailure extends Error{constructor(public state:PlayerState,message:string){super(message);}}
export const watchHref=(id:string,episodeId?:string)=>"/watch/"+encodeURIComponent(id)+(episodeId?"?episodeId="+encodeURIComponent(episodeId):"");
export function episodeContext(title:CatalogTitle,episodeId?:string){
 if(title.mediaType==="movie"){if(episodeId)throw new PlaybackFailure("unavailable","This movie does not have episodes.");return null;}
 const ordered=[...title.seasons].sort((a,b)=>a.number-b.number).flatMap(season=>[...season.episodes].sort((a,b)=>a.episodeNumber-b.episodeNumber).map(episode=>({season,episode})));
 const index=ordered.findIndex(item=>item.episode.id===episodeId);
 if(index<0)throw new PlaybackFailure("unavailable","Choose a listed episode from the series details.");
 return {...ordered[index],next:ordered[index+1]??null};
}
export function sourceUrl(value?:string){if(!value)return false;try{const url=new URL(value,"https://flurzi.invalid");return url.protocol==="https:"||(url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname));}catch{return false;}}
export function validateMetadata(meta:PlaybackMetadata,titleId:string,episodeId:string|undefined,profileId:string,now=Date.now()){
 if(meta.titleId!==titleId||meta.episodeId!==episodeId||meta.profileId!==profileId)throw new PlaybackFailure("denied","Playback authorization does not match this viewer and title.");
 if(meta.restriction)throw new PlaybackFailure(meta.restriction==="region"?"region-restricted":"denied","This playback request is restricted.");
 if(!meta.isLicensed)throw new PlaybackFailure("denied","Playback was not authorized.");
 if(!meta.playbackSessionId||!meta.expiresAt||!Number.isFinite(Date.parse(meta.expiresAt))||Date.parse(meta.expiresAt)<=now)throw new PlaybackFailure("denied","Playback authorization has expired. Request access again.");
 if(!sourceUrl(meta.manifestUrl))throw new PlaybackFailure("unavailable","No valid playback source was provided.");
 if(!Array.isArray(meta.captions)||meta.captions.some(track=>!track.language||!sourceUrl(track.url)))throw new PlaybackFailure("unavailable","Invalid subtitle metadata was supplied.");
 if(!meta.sourceType)throw new PlaybackFailure("unsupported","The media format has not been supplied.");
 return meta;
}
export async function acquirePlayback(services:ServiceRegistry,id:string,episodeId:string|undefined,profileId:string,signal?:AbortSignal){
 const title=await services.catalog.getTitle(id);if(!title)throw new PlaybackFailure("unavailable","This title is not available.");
 const context=episodeContext(title,episodeId);
 // Metadata-only catalog titles never trigger a playback request.
 if(!title.isLicensedForPlayback||title.availability.status!=="licensed")throw new PlaybackFailure("unavailable","Streaming is not available for this title.");
 const entitlement=await services.subscriptions.getEntitlement();
 if(!entitlement.canStream)throw new PlaybackFailure("subscription-required","Your account does not currently have streaming access.");
 if(!playbackAllowed(title,entitlement,episodeId?{episodeId} as ViewingProgress:undefined))throw new PlaybackFailure("unavailable","This title or episode is not currently available for playback.");
 if(signal?.aborted)throw new DOMException("Cancelled","AbortError");
 const metadata=validateMetadata(await services.playback.getPlaybackMetadata(title.id,episodeId,{profileId,signal}),title.id,episodeId,profileId);
 return {title,context,metadata,entitlement};
}
export function failureState(error:unknown):{state:PlayerState;message:string}{
 if(error instanceof PlaybackFailure)return {state:error.state,message:error.message};
 const code=toServiceError(error).code;
 const state:PlayerState=code==="SESSION_EXPIRED"||code==="UNAUTHENTICATED"?"session-expired":code==="SUBSCRIPTION_REQUIRED"?"subscription-required":code==="REGION_RESTRICTED"?"region-restricted":code==="PLAYBACK_DENIED"||code==="ACCESS_DENIED"?"denied":code==="SERVICE_UNAVAILABLE"?"network-error":"playback-error";
 return {state,message:playerMessages[state]||"Playback could not start. Please try again."};
}
export const playerMessages:Partial<Record<PlayerState,string>>={
 "checking-access":"Checking viewing access…","loading-source":"Loading your video…","buffering":"Buffering…","seeking":"Seeking…","unavailable":"Playback is unavailable.","unsupported":"This format is not supported in this browser.","network-error":"The video connection was interrupted. Try again.","playback-error":"The video could not be played. Try again.","session-expired":"Your session has expired. Sign in again.","subscription-required":"Streaming access is required.","region-restricted":"This title is not available in your region.","denied":"Playback authorization was denied."
};
export function clampSeek(position:number,duration:number){return Number.isFinite(duration)&&duration>0?Math.max(0,Math.min(duration,Number.isFinite(position)?position:0)):0;}
export function resumePosition(progress:ViewingProgress|undefined,identity:{titleId:string;episodeId?:string;profileId:string},duration:number){
 if(!progress||progress.profileId!==identity.profileId||progress.titleId!==identity.titleId||progress.episodeId!==identity.episodeId||progress.completed||!Number.isFinite(progress.positionSeconds)||progress.positionSeconds<1||!Number.isFinite(duration)||duration<=0)return 0;
 return progress.positionSeconds>=duration-Math.min(10,duration*.05)?0:clampSeek(progress.positionSeconds,duration);
}
export function progressPayload(identity:{titleId:string;episodeId?:string;profileId:string},position:number,duration:number,completed=false):Omit<ViewingProgress,"id">|null{
 if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(position)||position<0)return null;
 return {...identity,positionSeconds:clampSeek(position,duration),durationSeconds:duration,completed,lastWatchedAt:new Date().toISOString()};
}
export function mediaState(event:string,paused:boolean):PlayerState{
 return ({loadedmetadata:"ready",canplay:paused?"ready":"playing",playing:"playing",pause:"paused",waiting:"buffering",stalled:"buffering",seeking:"seeking",seeked:paused?"paused":"playing",ended:"ended"} as Record<string,PlayerState>)[event]??"idle";
}
export function mediaError(code?:number):PlayerState{return code===2?"network-error":code===4?"unsupported":"playback-error";}
export function formatTime(value:number){const s=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;return(s>=3600?Math.floor(s/3600)+":":"")+String(Math.floor(s/60)%60).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
export function selectCaption(tracks:TextTrackList|TextTrack[],index:number){for(let i=0;i<tracks.length;i++)tracks[i].mode=i===index?"showing":"disabled";}
