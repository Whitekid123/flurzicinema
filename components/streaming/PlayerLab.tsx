"use client";
import {useMemo,useState} from "react";
import type {PlaybackMetadata,ViewingProgress} from "@/types/streaming";
import type {PlaybackService} from "@/lib/api/services";
import {createDataSenseLabTransport} from "@/lib/development/datasense-fixture";
import {MediaPlayer} from "./MediaPlayer";
import {lensLabTitle,lensLabService} from "@/lib/development/storylens-fixture";
import type {StoryLensBinding} from "@/lib/storylens";
import type {RoomPlayback} from "@/lib/rooms";
// Loaded only behind server-side NODE_ENV + opt-in checks. No catalog/auth adapter is changed.
export function PlayerLab(){
 const dataLab=useMemo(()=>createDataSenseLabTransport(),[]);
 const [nativeData,setNativeData]=useState(false);
 const [roomTest,setRoomTest]=useState(false),[intents,setIntents]=useState(0);
 const [roomCommand,setRoomCommand]=useState<RoomPlayback&{revision:number;serverClockOffsetMs:number}>(()=>({titleId:"original-player-test",playing:false,positionSeconds:0,serverTimeMs:Date.now(),revision:0,serverClockOffsetMs:0}));
 const lensBinding=useMemo<StoryLensBinding>(()=>({service:lensLabService,identity:{titleId:"original-player-test",profileId:"lab-viewer"},viewerKey:"isolated-player-lab"}),[]);
 const [generation,setGeneration]=useState(0),[broken,setBroken]=useState(false),[failSave,setFailSave]=useState(false);
 const [saved,setSaved]=useState<ViewingProgress|null>(null),[completed,setCompleted]=useState(false);
 const service=useMemo<PlaybackService>(()=>({
  async getPlaybackMetadata(){throw new Error("The isolated lab has no catalog authorization.");},
  async reportProgress(progress){if(failSave)throw new Error("Deliberate lab save failure");const value={...progress,id:"lab-progress"};setSaved(value);return value;},
  async reportCompleted(){setCompleted(true);}
 }),[failSave]);
 const [expiresAt,setExpiresAt]=useState(()=>new Date(Date.now()+3600000).toISOString());
 function renew(){setExpiresAt(new Date(Date.now()+3600000).toISOString());setGeneration(value=>value+1);}
 const [resume,setResume]=useState<ViewingProgress|undefined>(undefined);
 const metadata=useMemo<PlaybackMetadata>(()=>({titleId:"original-player-test",profileId:"lab-viewer",playbackSessionId:"lab-only-"+generation,isLicensed:true,sourceType:"webm",manifestUrl:"/api/player-lab/"+(broken?"broken.webm":"original.webm"),expiresAt,dataSense:nativeData?undefined:{titleId:"original-player-test",profileId:"lab-viewer",playbackSessionId:"lab-only-"+generation,sourceId:"original-study-source",expiresAt,sourceBitrate:{kind:"aggregate",minBps:2e6,maxBps:2e6}},captions:[{language:"en",label:"English · original test captions",url:"/api/player-lab/captions.vtt"}],resumeProgress:resume}),[generation,broken,resume,expiresAt,nativeData]);
 return <><MediaPlayer transportOverride={nativeData?undefined:dataLab.transport} allowDataExamples={!nativeData} contextualTitle={lensLabTitle} storyLensTestBinding={lensBinding} roomControl={roomTest?{command:roomCommand,connected:true,canControl:true,onIntent:intent=>{setIntents(n=>n+1);setRoomCommand(previous=>({...previous,revision:previous.revision+1,serverTimeMs:Date.now(),positionSeconds:intent.positionSeconds,playing:intent.action==="play"?true:intent.action==="pause"?false:previous.playing}));}}:undefined} key={generation+"|"+broken+"|"+failSave+"|"+nativeData} metadata={metadata} title="Motion study" profileId="lab-viewer" service={service} backHref="/browse" backLabel="Leave development lab" onRetry={renew} development/><aside style={{background:"#15161b",color:"#eee",padding:24,fontFamily:"sans-serif",fontSize:14,overflowWrap:"anywhere"}}><button onClick={()=>setRoomTest(value=>!value)}>{roomTest?"Disable":"Enable"} isolated room-control test</button><p data-testid="lab-room-intents">Room intents: {intents}</p><button onClick={()=>setNativeData(value=>!value)}>{nativeData?"Use illustrative DataSense":"Use native unknown telemetry"}</button><button onClick={dataLab.addTransfer}>Add example 1 MB transfer</button><button onClick={dataLab.repeatTransfer}>Repeat example transfer event</button><p>DataSense uses illustrative rates and transfer events, not actual media measurements. Example selections do not change video quality.</p><strong>Development only · Original generated test media</strong><p>Independent from the fictional catalog. Progress is component memory and resets when this page is left.</p><button onClick={()=>{setResume(saved??undefined);renew();}}>Reload with saved progress</button>{" "}<button onClick={()=>setBroken(value=>!value)}>{broken?"Use valid source":"Test invalid source"}</button>{" "}<button onClick={()=>setFailSave(value=>!value)}>{failSave?"Restore progress service":"Test save failure"}</button><p data-testid="lab-progress">{saved?JSON.stringify(saved):"No progress reported"}</p><p data-testid="lab-completed">{completed?"Completion reported":"Not completed"}</p></aside></>;
}
