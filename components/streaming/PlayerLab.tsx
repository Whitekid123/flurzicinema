"use client";
import {useMemo,useState} from "react";
import type {PlaybackMetadata,ViewingProgress} from "@/types/streaming";
import type {PlaybackService} from "@/lib/api/services";
import {MediaPlayer} from "./MediaPlayer";
// Loaded only behind server-side NODE_ENV + opt-in checks. No catalog/auth adapter is changed.
export function PlayerLab(){
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
 const metadata=useMemo<PlaybackMetadata>(()=>({titleId:"original-player-test",profileId:"lab-viewer",playbackSessionId:"lab-only-"+generation,isLicensed:true,sourceType:"webm",manifestUrl:"/api/player-lab/"+(broken?"broken.webm":"original.webm"),expiresAt,captions:[{language:"en",label:"English · original test captions",url:"/api/player-lab/captions.vtt"}],resumeProgress:resume}),[generation,broken,resume,expiresAt]);
 return <><MediaPlayer key={generation+"|"+broken+"|"+failSave} metadata={metadata} title="Motion study" profileId="lab-viewer" service={service} backHref="/browse" backLabel="Leave development lab" onRetry={renew} development/><aside style={{background:"#15161b",color:"#eee",padding:24,fontFamily:"sans-serif",fontSize:14,overflowWrap:"anywhere"}}><strong>Development only · Original generated test media</strong><p>Independent from the fictional catalog. Progress is component memory and resets when this page is left.</p><button onClick={()=>{setResume(saved??undefined);renew();}}>Reload with saved progress</button>{" "}<button onClick={()=>setBroken(value=>!value)}>{broken?"Use valid source":"Test invalid source"}</button>{" "}<button onClick={()=>setFailSave(value=>!value)}>{failSave?"Restore progress service":"Test save failure"}</button><p data-testid="lab-progress">{saved?JSON.stringify(saved):"No progress reported"}</p><p data-testid="lab-completed">{completed?"Completion reported":"Not completed"}</p></aside></>;
}
