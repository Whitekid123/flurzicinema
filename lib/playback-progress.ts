import type {PlaybackService} from "./api/services";
import {toServiceError} from "./api/errors";
import {progressPayload} from "./playback";
export function createProgressReporter(service:PlaybackService,identity:{titleId:string;episodeId?:string;profileId:string},sessionId:string,onFailure:(failed:boolean)=>void,now=Date.now,onAccessFailure?:(error:unknown)=>void){
 let last=0,active=true,running=false;let terminal:ReturnType<typeof progressPayload>=null;let pending:ReturnType<typeof progressPayload>=null;let completionSent=false;
 async function drain(){if(running||(!terminal&&!pending))return;running=true;const payload=terminal??pending!;if(terminal)terminal=null;else pending=null;
  try{await service.reportProgress({...payload,playbackSessionId:sessionId});if(payload.completed&&!completionSent){await service.reportCompleted(identity.titleId,identity.episodeId,{profileId:identity.profileId,playbackSessionId:sessionId});completionSent=true;}if(active)onFailure(false);}
  catch(error){if(active){onFailure(true);if(["SESSION_EXPIRED","UNAUTHENTICATED","PLAYBACK_DENIED","ACCESS_DENIED","SUBSCRIPTION_REQUIRED","REGION_RESTRICTED"].includes(toServiceError(error).code))onAccessFailure?.(error);}}finally{running=false;if(terminal||pending)void drain();}
 }
 return {record(position:number,duration:number,completed=false,force=false){const payload=progressPayload(identity,position,duration,completed);if(!payload||(!force&&now()-last<15000))return;last=now();if(completed){terminal=payload;pending=null;}else pending=payload;void drain();},
 dispose(){active=false;}};
}
