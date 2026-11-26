// Protected original-media lab only. These are explicit example values, not measurements.
import {nativeTransport,type MediaTransport} from '../media-transport';
import type {PlaybackTelemetry,MediaTransferObservation,DataSenseTransportSession} from '@/types/datasense';
export function createDataSenseLabTransport(){
 let current:{add:()=>void;duplicate:()=>void}|undefined;
 const transport:MediaTransport={...nativeTransport,createDataSession(_video,metadata){
  const identity=metadata.dataSense;if(!identity)throw new Error('Missing isolated data context');
  let sequence=0,active=true,currentId='example-a';const listeners=new Set<(snapshot:PlaybackTelemetry)=>void>();let recent:MediaTransferObservation|undefined;
  const snapshot=(transfers:MediaTransferObservation[]=[]):PlaybackTelemetry=>({...identity,sequence,atMs:Date.now(),kind:'example',currentRenditionId:currentId,renditions:[
   {id:'example-a',label:'Example A · illustrative',bitrate:{kind:'aggregate',minBps:2e6,maxBps:2e6}},
   {id:'example-b',label:'Example B · illustrative',bitrate:{kind:'aggregate',minBps:1e6,maxBps:1e6}}
  ],bitrate:{kind:'aggregate',minBps:currentId==='example-a'?2e6:1e6,maxBps:currentId==='example-a'?2e6:1e6},transferCoverage:'complete',transfers,canSelectRendition:true});
  const publish=(transfers:MediaTransferObservation[]=[])=>{if(!active)return;sequence++;listeners.forEach(listener=>listener(snapshot(transfers)));};
  const controls={add(){recent={id:'isolated-transfer-'+(sequence+1),bytes:1e6,resource:'media',atMs:Date.now()};publish([recent]);},duplicate(){if(recent)publish([recent]);}};current=controls;
  const session:DataSenseTransportSession={getSnapshot:()=>snapshot(),subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},async selectRendition(id,{signal}){if(signal.aborted||!active||!['example-a','example-b'].includes(id))throw new Error('Example unavailable');currentId=id;sequence++;return snapshot();},dispose(){active=false;listeners.clear();if(current===controls)current=undefined;}};
  return session;
 }};
 return {transport,addTransfer:()=>current?.add(),repeatTransfer:()=>current?.duplicate()};
}
