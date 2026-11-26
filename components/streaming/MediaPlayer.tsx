"use client";
import Link from "next/link";
import {BrandWordmark} from "@/components/ui/BrandWordmark";
import {useCallback,useEffect,useRef,useState} from "react";
import type {KeyboardEvent} from "react";
import type {PlaybackMetadata} from "@/types/streaming";
import type {PlaybackService} from "@/lib/api/services";
import {playbackPosition,type PlaybackIntent,type RoomPlayback} from '@/lib/rooms';
import {clampSeek,failureState,formatTime,mediaError,mediaState,playerMessages,resumePosition,selectCaption} from "@/lib/playback";
import type {PlayerState} from "@/lib/playback";
import {mediaCapabilities,nativeTransport,nativeAudioChoices,selectNativeAudio} from "@/lib/media-transport";
import {createProgressReporter} from "@/lib/playback-progress";
import "./player.css";
import {StoryLensEntry} from "./StoryLens";
import type {CatalogTitle} from "@/types/streaming";
import type {StoryLensBinding} from "@/lib/storylens";
import {DataSensePlayer} from "./DataSense";
import {createDataUsageSession} from "@/lib/datasense-session";
import type {DataSenseState} from "@/types/datasense";
import type {MediaTransport} from "@/lib/media-transport";

type AudioTrack={language:string;label:string;enabled:boolean};
interface Props{
 metadata:PlaybackMetadata;profileId:string;title:string;episodeLabel?:string;backHref:string;backLabel?:string;
 service:PlaybackService;reducedMotion?:boolean;preferredSubtitle?:string;onRetry:()=>void;
 next?:{title:string;href:string};development?:boolean;
 contextualTitle?:CatalogTitle;storyLensTestBinding?:StoryLensBinding;
 transportOverride?:MediaTransport;allowDataExamples?:boolean;
 roomControl?:{command:RoomPlayback&{revision:number;serverClockOffsetMs:number};canControl:boolean;connected:boolean;onIntent:(intent:PlaybackIntent)=>void};
}
function Icon({name}:{name:string}){
 const paths:Record<string,React.ReactNode>={
 play:<path d="m9 5 11 7-11 7z"/>,pause:<><path d="M8 5v14M16 5v14"/></>,
 back:<path d="m14 5-7 7 7 7M7 12h14"/>,replay:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,
 volume:<><path d="m11 5-6 5H2v4h3l6 5zM15 8q6 4 0 8M18 4q11 8 0 16"/></>,
 muted:<><path d="m11 5-6 5H2v4h3l6 5zM16 9l6 6M22 9l-6 6"/></>,
 full:<path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6"/>,
 exit:<path d="M9 3v6H3M15 3v6h6M21 15h-6v6M9 21v-6H3"/>,
 settings:<><path d="M3 6h5M12 6h9M3 12h10M17 12h4M3 18h3M10 18h11"/><circle cx="10" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></>,
 pip:<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 12h8v6h-8z"/></>,
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??<path d="m9 5 11 7-11 7z"/>}</svg>;
}
export function MediaPlayer({transportOverride,allowDataExamples=false,contextualTitle,storyLensTestBinding,metadata,profileId,title,episodeLabel,backHref,backLabel="Back to details",service,reducedMotion,preferredSubtitle,onRetry,next,development,roomControl}:Props){
 const [auxiliaryPanel,setAuxiliaryPanel]=useState<"storylens"|"datasense"|null>(null);
 const openLens=useCallback((value:boolean)=>setAuxiliaryPanel(value?"storylens":null),[]),openData=useCallback((value:boolean)=>setAuxiliaryPanel(value?"datasense":null),[]);
 const [dataState,setDataState]=useState<DataSenseState>({playedSeconds:0,coverage:"unavailable",canSelectRendition:false,example:false});
 const dataUsage=useRef<ReturnType<typeof createDataUsageSession>|null>(null);
 const [lensSeek,setLensSeek]=useState(0);
 const videoRef=useRef<HTMLVideoElement>(null);const shellRef=useRef<HTMLDivElement>(null);
 const [state,setState]=useState<PlayerState>("loading-source");const [message,setMessage]=useState("");
 const [time,setTime]=useState(0),[duration,setDuration]=useState(0),[volume,setVolume]=useState(1),[muted,setMuted]=useState(false);
 const [settings,setSettings]=useState(false),[visible,setVisible]=useState(true),[full,setFull]=useState(false),[pip,setPip]=useState(false);
 const [speed,setSpeed]=useState(1),[caption,setCaption]=useState(-1),[audio,setAudio]=useState<AudioTrack[]>([]),[audioIndex,setAudioIndex]=useState(0);
 const [capabilities,setCapabilities]=useState({fullscreen:false,pip:false,speed:false});
 const [saveFailed,setSaveFailed]=useState(false),[notice,setNotice]=useState("");
 const reporterRef=useRef<ReturnType<typeof createProgressReporter>|null>(null);
 const hideTimer=useRef<ReturnType<typeof setTimeout>|null>(null),focused=useRef(false),settingsRef=useRef(false),stateRef=useRef(state);
 const captionRef=useRef(-1),started=useRef(false),fatal=useRef(false);
 function reveal(){setVisible(true);if(hideTimer.current)clearTimeout(hideTimer.current);if(!matchMedia("(pointer: coarse)").matches&&stateRef.current==="playing"&&!settingsRef.current&&!focused.current)hideTimer.current=setTimeout(()=>setVisible(false),3000);}
 useEffect(()=>{stateRef.current=state;settingsRef.current=settings;},[state,settings]);
 useEffect(()=>{
  const video=videoRef.current;const shell=shellRef.current;if(!video)return;fatal.current=false;started.current=false;let active=true;let disposeTransport:(()=>void)|undefined;let loadingTimer:ReturnType<typeof setTimeout>|undefined;let expiryTimer:ReturnType<typeof setTimeout>|undefined;
  const report=createProgressReporter(service,{titleId:metadata.titleId,episodeId:metadata.episodeId,profileId},metadata.playbackSessionId!,failed=>{if(active)setSaveFailed(failed);},Date.now,error=>{const failure=failureState(error);fail(failure.state,failure.message);});reporterRef.current=report;
  function fail(nextState:PlayerState,text?:string){if(!active||fatal.current)return;fatal.current=true;dataUsage.current?.dispose();dataUsage.current=null;clearTimeout(loadingTimer);clearTimeout(expiryTimer);video!.pause();setState(nextState);setMessage(text||playerMessages[nextState]||"Playback failed.");}
  const events=["loadedmetadata","durationchange","canplay","playing","pause","waiting","stalled","seeking","seeked","ended","timeupdate","volumechange","ratechange","error"];
  function handle(event:Event){
   if(!active||fatal.current)return;
   if(metadata.expiresAt&&Date.parse(metadata.expiresAt)<=Date.now()){fail("denied","Playback authorization has expired. Request access again.");return;}
   const duration=video!.duration;
   if(Number.isFinite(duration)&&duration>0)setDuration(duration);
   if(event.type==="loadedmetadata"){
    const position=resumePosition(metadata.resumeProgress,{titleId:metadata.titleId,episodeId:metadata.episodeId,profileId},duration);
    if(position){video!.currentTime=position;setNotice("Resumed from "+formatTime(position)+".");}
    const tracks=nativeAudioChoices(video!);setAudio(tracks);setAudioIndex(Math.max(0,tracks.findIndex(track=>track.enabled)));
    const preferred=preferredSubtitle?metadata.captions.findIndex(track=>track.language===preferredSubtitle):-1;captionRef.current=preferred;setCaption(preferred);selectCaption(video!.textTracks,preferred);
   }
   if(event.type==="seeking")setLensSeek(n=>n+1);
   if(event.type==="timeupdate"){setTime(video!.currentTime);if(started.current)report.record(video!.currentTime,duration);return;}
   if(event.type==="volumechange"){setVolume(video!.volume);setMuted(video!.muted);return;}
   if(event.type==="ratechange"){setSpeed(video!.playbackRate);return;}
   if(event.type==="error"){fail(mediaError(video!.error?.code));return;}
   if(event.type==="durationchange")return;
   if(event.type==="playing"){started.current=true;clearTimeout(loadingTimer);loadingTimer=undefined;}
   if(event.type==="canplay"){clearTimeout(loadingTimer);loadingTimer=undefined;}
   if((event.type==="waiting"||event.type==="stalled")&&!loadingTimer)loadingTimer=setTimeout(()=>fail("network-error"),20000);
   if(event.type==="pause"||event.type==="seeked"||event.type==="ended"){if(video!.paused){clearTimeout(loadingTimer);loadingTimer=undefined;}if(started.current)report.record(video!.currentTime,duration,event.type==="ended",true);}
   setState(mediaState(event.type,video!.paused));setTime(video!.currentTime);
  }
  events.forEach(event=>video.addEventListener(event,handle));
  const fullscreen=()=>setFull(document.fullscreenElement===shell);
  const pipEnter=()=>setPip(true),pipLeave=()=>setPip(false);
  document.addEventListener("fullscreenchange",fullscreen);video.addEventListener("enterpictureinpicture",pipEnter);video.addEventListener("leavepictureinpicture",pipLeave);
  function expire(){const remaining=metadata.expiresAt?Date.parse(metadata.expiresAt)-Date.now():0;if(remaining<=0){fail("denied","Playback authorization has expired. Request access again.");return;}expiryTimer=setTimeout(expire,Math.min(remaining,2147483647));}
  const final=()=>{if(started.current&&!fatal.current)report.record(video.currentTime,video.duration,video.ended,true);};
  const visibility=()=>{if(metadata.expiresAt&&Date.parse(metadata.expiresAt)<=Date.now())fail("denied","Playback authorization has expired. Request access again.");else if(document.visibilityState==="hidden")final();};
  window.addEventListener("pagehide",final);document.addEventListener("visibilitychange",visibility);
  queueMicrotask(()=>{if(!active)return;setCapabilities(mediaCapabilities(video));try{const transport=transportOverride??nativeTransport;disposeTransport=transport.attach(video,metadata);
    let dataTransport;try{dataTransport=transport.createDataSession?.(video,metadata);}catch{}
    const usage=createDataUsageSession({identity:{titleId:metadata.titleId,episodeId:metadata.episodeId,profileId,playbackSessionId:metadata.playbackSessionId!,sourceId:metadata.dataSense?.sourceId??"unreported"},metadata:metadata.dataSense,transport:dataTransport,allowExamples:allowDataExamples,onChange:value=>{if(active)setDataState(value);}});dataUsage.current=usage;
    const sample=()=>usage.sample(!video.paused&&!video.seeking&&video.readyState>=3,video.playbackRate);const usageTimer=setInterval(sample,1000);["playing","pause","waiting","seeking","seeked","ended","ratechange"].forEach(event=>video.addEventListener(event,sample));
    const disposeMedia=disposeTransport;disposeTransport=()=>{clearInterval(usageTimer);["playing","pause","waiting","seeking","seeked","ended","ratechange"].forEach(event=>video.removeEventListener(event,sample));usage.dispose();dataUsage.current=null;disposeMedia?.();};expire();if(!fatal.current)loadingTimer=setTimeout(()=>fail("network-error"),20000);}catch(error){const failure=failureState(error);fail(failure.state,failure.message);}});
  return ()=>{final();active=false;report.dispose();reporterRef.current=null;events.forEach(event=>video.removeEventListener(event,handle));document.removeEventListener("fullscreenchange",fullscreen);video.removeEventListener("enterpictureinpicture",pipEnter);video.removeEventListener("leavepictureinpicture",pipLeave);window.removeEventListener("pagehide",final);document.removeEventListener("visibilitychange",visibility);clearTimeout(loadingTimer);clearTimeout(expiryTimer);if(hideTimer.current)clearTimeout(hideTimer.current);if(document.pictureInPictureElement===video)void document.exitPictureInPicture().catch(()=>{});if(document.fullscreenElement===shell)void document.exitFullscreen().catch(()=>{});disposeTransport?.();};
 },[metadata,profileId,service,preferredSubtitle,transportOverride,allowDataExamples]);
 useEffect(()=>{if(state!=="playing"||settings)return;const timer=setTimeout(()=>{if(!focused.current&&!matchMedia("(pointer: coarse)").matches)setVisible(false);},3000);return()=>clearTimeout(timer);},[state,settings]);
 // Only explicit user intents are sent. Applying a snapshot never broadcasts native events.
 const command=roomControl?.command;const roomConnected=roomControl?.connected;
 useEffect(()=>{
  const video=videoRef.current;if(!video||!command)return;
  let active=true;
  const apply=()=>{if(!active)return;if(fatal.current||!roomConnected||Date.parse(metadata.expiresAt||'')<=Date.now()||command.titleId!==metadata.titleId||command.episodeId!==metadata.episodeId){video.pause();return;}
   if(!Number.isFinite(video.duration)||video.duration<=0)return;
   const position=clampSeek(playbackPosition(command,Date.now()+command.serverClockOffsetMs),video.duration);
   if(Math.abs(video.currentTime-position)>.75)video.currentTime=position;
   video.playbackRate=1;
   if(command.playing)void video.play().catch(()=>{if(active)setNotice('The room is playing. Press Play to enable playback in this browser.');});else video.pause();
  };
  apply();video.addEventListener('loadedmetadata',apply);const drift=setInterval(apply,3000);
  return()=>{active=false;clearInterval(drift);video.removeEventListener('loadedmetadata',apply);};
 },[command,roomConnected,metadata.titleId,metadata.episodeId,metadata.expiresAt]);
 const error=["unavailable","unsupported","network-error","playback-error","session-expired","subscription-required","region-restricted","denied"].includes(state);
 const ready=!error&&duration>0;const playing=state==="playing"||state==="buffering"||state==="seeking";
 async function toggle(){const video=videoRef.current;if(!video||!ready)return;reveal();if(roomControl){if(!roomControl.connected)return;if(roomControl.command.playing&&video.paused){try{await video.play();setNotice('');}catch{setNotice('Press Play again to enable playback.');}return;}if(!roomControl.canControl){setNotice('Playback is controlled by the host.');return;}roomControl.onIntent({action:video.paused?'play':'pause',positionSeconds:video.ended?0:video.currentTime});return;}if(!video.paused){video.pause();return;}if(video.ended)video.currentTime=0;try{await video.play();setNotice("");}catch{setNotice("Playback did not start. Press Play to try again.");}}
 function seek(value:number){const video=videoRef.current;if(video&&ready){if(roomControl){if(roomControl.connected&&roomControl.canControl)roomControl.onIntent({action:'seek',positionSeconds:clampSeek(value,duration)});else setNotice('Playback is controlled by the host.');return;}video.currentTime=clampSeek(value,duration);setTime(video.currentTime);reveal();}}
 async function fullscreen(){const shell=shellRef.current;if(!shell)return;try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}catch{setNotice("Fullscreen is not available in this browser context.");}}
 async function picture(){const video=videoRef.current;if(!video)return;try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else await video.requestPictureInPicture();}catch{setNotice("Picture-in-Picture is not available for this video.");}}
 function shortcuts(event:KeyboardEvent<HTMLDivElement>){
  reveal();if((event.target as HTMLElement).closest("button,input,select,a,summary,.storylens,.data-sense,[role=dialog],[contenteditable=true]")||event.altKey||event.ctrlKey||event.metaKey)return;
  const key=event.key.toLowerCase();if([" ","k","arrowleft","arrowright","m","f"].includes(key))event.preventDefault();
  if(key===" "||key==="k")void toggle();if(key==="arrowleft")seek(time-10);if(key==="arrowright")seek(time+10);
  if(key==="m"&&videoRef.current)videoRef.current.muted=!videoRef.current.muted;if(key==="f"&&capabilities.fullscreen)void fullscreen();
 }
 return <div ref={shellRef} className="flurzi-player" data-reduced-motion={reducedMotion?"true":undefined} data-state={state} onKeyDown={shortcuts} onPointerMove={reveal} onPointerDown={reveal} onFocusCapture={event=>{focused.current=(event.target as HTMLElement).matches(":focus-visible");setVisible(true);}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget)){focused.current=false;if(visible)reveal();}}}>
  <header className="player-header"><Link href={backHref} aria-label={backLabel}><Icon name="back"/><span>{backLabel}</span></Link><Link href="/browse" className="player-brand" aria-label="Flurzi Cinema home"><BrandWordmark/></Link></header>
  <main className="player-main"><div className="player-intro"><div><p>{development?"ORIGINAL DEVELOPMENT CLIP":"NOW WATCHING"}</p><h1>{title}</h1>{episodeLabel&&<h2>{episodeLabel}</h2>}</div><span className="player-watch-label">FLURZI CINEMA</span></div>
  <div className="player-experience"><div className="player-canvas"><div className="player-stage" tabIndex={0} aria-label="Video player. Space or K to play or pause, arrow keys to seek, M to mute, F for fullscreen.">
   <video ref={videoRef} playsInline preload="metadata" crossOrigin="anonymous" aria-label={title} onClick={event=>{if((event.nativeEvent as PointerEvent).pointerType==="touch"){reveal();return;}void toggle();}}>
    {metadata.captions.filter(track=>track.url).map((track,index)=><track key={track.url} kind="subtitles" src={track.url} srcLang={track.language} label={track.label} onLoad={()=>{if(videoRef.current)selectCaption(videoRef.current.textTracks,captionRef.current);}} onError={()=>setNotice("A caption track could not load.")} data-track-index={index}/>)}
   </video>
   {["loading-source","buffering","seeking"].includes(state)&&<div className="player-loading" role="status"><span/>{playerMessages[state]}</div>}
   {error?<div className="player-error" role="alert"><p>PLAYBACK INTERRUPTED</p><h2>{state==="unsupported"?"A different playback format is needed.":"We couldn’t play this video."}</h2><p>{message}</p><button onClick={onRetry}>Request playback again</button><Link href={backHref}>{backLabel}</Link></div>:state==="ended"?<div className="player-ended"><p>YOU’VE REACHED THE END</p><h2>Stay for another story.</h2><button onClick={()=>void toggle()} aria-label="Watch again"><Icon name="replay"/>Replay</button>{next&&<Link href={next.href}>Next episode: {next.title}</Link>}</div>:["ready","paused"].includes(state)&&<button className="player-center-play" onClick={()=>void toggle()} aria-label={state==="ready"?"Start playback":"Continue playback"}><Icon name="play"/></button>}
  </div>
  <div className="player-controls" data-visible={visible||!playing||settings||error} inert={!(visible||!playing||settings||error)}>
   <div className="player-timeline"><span>{formatTime(time)}</span><input type="range" min="0" max={duration||1} step=".1" value={Math.min(time,duration||1)} disabled={!ready} aria-label="Playback position" aria-valuetext={formatTime(time)+" of "+formatTime(duration)} onChange={e=>seek(Number(e.target.value))}/><span>{formatTime(duration)}</span></div>
   <div className="player-control-row"><div className="player-primary-controls"><button disabled={!ready} onClick={()=>void toggle()} aria-label={state==="ended"?"Replay":playing?"Pause":"Play"}><Icon name={state==="ended"?"replay":playing?"pause":"play"}/></button><button disabled={!ready} onClick={()=>seek(time-10)} aria-label="Seek backward 10 seconds"><span className="player-skip">−10</span></button><button disabled={!ready} onClick={()=>seek(time+10)} aria-label="Seek forward 10 seconds"><span className="player-skip">+10</span></button><div className="player-volume"><button disabled={!ready} onClick={()=>{if(videoRef.current)videoRef.current.muted=!muted;}} aria-label={muted?"Unmute":"Mute"}><Icon name={muted||volume===0?"muted":"volume"}/></button><input aria-label="Volume" type="range" min="0" max="1" step=".05" value={muted?0:volume} disabled={!ready} onChange={e=>{if(videoRef.current){videoRef.current.volume=Number(e.target.value);videoRef.current.muted=false;}}}/></div></div>
   <div className="player-secondary-controls"><button onClick={()=>setSettings(!settings)} aria-label="Player settings" aria-expanded={settings} aria-controls="player-settings"><Icon name="settings"/></button>{capabilities.pip&&<button disabled={!ready} onClick={()=>void picture()} aria-label={pip?"Exit Picture-in-Picture":"Picture-in-Picture"}><Icon name="pip"/></button>}{capabilities.fullscreen&&<button onClick={()=>void fullscreen()} aria-label={full?"Exit fullscreen":"Fullscreen"}><Icon name={full?"exit":"full"}/></button>}</div></div>
   {settings&&<section id="player-settings" className="player-settings" aria-label="Playback settings"><div><h2>Playback settings</h2><button onClick={()=>setSettings(false)} aria-label="Close settings">✕</button></div>{capabilities.speed&&<label>Playback speed<select aria-label="Playback speed" value={speed} disabled={!ready||!!roomControl} onChange={e=>{if(videoRef.current)videoRef.current.playbackRate=Number(e.target.value);}}>{[.5,.75,1,1.25,1.5,2].map(rate=><option value={rate} key={rate}>{rate===1?"Normal":rate+"×"}</option>)}</select></label>}<label>Subtitles<select aria-label="Subtitles" value={caption} onChange={e=>{const value=Number(e.target.value);setCaption(value);captionRef.current=value;if(videoRef.current)selectCaption(videoRef.current.textTracks,value);}}><option value="-1">Off</option>{metadata.captions.map((track,index)=><option value={index} key={track.url}>{track.label}</option>)}</select></label>{audio.length>1&&<label>Audio language<select aria-label="Audio language" value={audioIndex} onChange={e=>{const index=Number(e.target.value);if(videoRef.current&&selectNativeAudio(videoRef.current,index))setAudioIndex(index);else setNotice("Audio selection is not available for this source.");}}>{audio.map((track,i)=><option value={i} key={i}>{track.label||track.language||"Track "+(i+1)}</option>)}</select></label>}<p>{metadata.captions.length?"Choose a subtitle language above.":"Subtitles are not available for this video."} {audio.length>1?"Choose an audio language above.":"Additional audio languages are not available for this video."} Video quality is managed by the source.</p></section>}
  </div><div className="player-feedback" aria-live="polite">{notice&&<p>{notice}</p>}{saveFailed&&<p>Progress could not be saved. We’ll retry on the next update. <button onClick={()=>reporterRef.current?.record(time,duration,state==="ended",true)}>Retry saving</button></p>}</div>
  </div><div className="player-utilities">{contextualTitle&&<StoryLensEntry controlledOpen={auxiliaryPanel==="storylens"} onOpenChange={openLens} title={contextualTitle} episodeId={metadata.episodeId} time={time} seekVersion={lensSeek} testBinding={storyLensTestBinding} disabled={error}/>}{!error&&<DataSensePlayer key={[profileId,metadata.titleId,metadata.episodeId,metadata.playbackSessionId,metadata.dataSense?.sourceId].join("|")} metadata={metadata} profileId={profileId} state={dataState} duration={duration} time={time} open={auxiliaryPanel==="datasense"} onOpenChange={openData} onSelectRendition={id=>dataUsage.current?.selectRendition(id)??Promise.reject(new Error("Quality unavailable"))}/>}</div></div></main><footer className="player-footer"><span>{development?"TEST MEDIA · SESSION MEMORY ONLY":"Your viewing experience"}</span><span>Space / K · play & pause &nbsp; ← → · seek &nbsp; M · mute</span></footer>
 </div>;
}
