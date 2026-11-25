"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {useSession} from "@/lib/state/SessionContext";
import {streamingServices} from "@/lib/api/client";
import {acquirePlayback,failureState,playerMessages,watchHref} from "@/lib/playback";
import type {PlayerState} from "@/lib/playback";
import {playbackAllowed} from "@/lib/browse-home";
import {MediaPlayer} from "./MediaPlayer";
import "./player.css";
export function WatchScreen({id}:{id:string}){
 const {profile,auth}=useSession();const query=useSearchParams();const episodeId=query.get("episodeId")||undefined;
 if(!profile)return null;
 return <ProfileWatch key={[profile.id,auth.session?.id,id,episodeId].join("|")} id={id} episodeId={episodeId} profileId={profile.id}/>;
}
function ProfileWatch({id,episodeId,profileId}:{id:string;episodeId?:string;profileId:string}){
 const {profile,auth}=useSession();const [attempt,setAttempt]=useState(0);
 const [result,setResult]=useState<Awaited<ReturnType<typeof acquirePlayback>>|null>(null);
 const [failure,setFailure]=useState<{state:PlayerState;message:string}|null>(null);
 useEffect(()=>{let active=true;const abort=new AbortController();const timeout=setTimeout(()=>{if(active){active=false;abort.abort();setFailure({state:"network-error",message:"Viewing access took too long to respond. Please try again."});}},30000);acquirePlayback(streamingServices,id,episodeId,profileId,abort.signal).then(data=>{if(active){if(!auth.session?.expiresAt||Date.parse(auth.session.expiresAt)<=Date.now())setFailure({state:"session-expired",message:"Your session has expired. Sign in again."});else setResult(data);}}).catch(error=>{if(active)setFailure(failureState(error));}).finally(()=>clearTimeout(timeout));return()=>{active=false;clearTimeout(timeout);abort.abort();};},[id,episodeId,profileId,attempt,auth.session?.expiresAt]);
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>;const check=()=>{const remaining=auth.session?.expiresAt?Date.parse(auth.session.expiresAt)-Date.now():0;if(!Number.isFinite(remaining)||remaining<=0){setResult(null);setFailure({state:"session-expired",message:"Your session has expired. Sign in again."});return;}timer=setTimeout(check,Math.min(remaining,2147483647));};timer=setTimeout(check,0);return()=>clearTimeout(timer);},[auth.session?.expiresAt]);
 const retry=()=>{setResult(null);setFailure(null);setAttempt(value=>value+1);};
 const details="/browse/title/"+encodeURIComponent(result?.title.id||id)+(result?.context?"?season="+encodeURIComponent(result.context.season.id)+"#title-episodes":"");
 if(!result)return <div className="player-unavailable" data-state={failure?.state||"checking-access"}><div><p>FLURZI CINEMA · PLAYER</p><h1>{failure?"This story isn’t available to play.":"Preparing your viewing experience."}</h1><p role={failure?"alert":"status"}>{failure?.message||playerMessages["checking-access"]}</p><nav><Link href={details}>Back to title details</Link>{failure&&<button onClick={retry}>Try again</button>}{failure?.state==="session-expired"&&<Link href="/login">Sign in</Link>}{failure?.state==="subscription-required"&&<Link href="/subscribe">Review viewing access</Link>}</nav></div></div>;
 const context=result.context;const next=context?.next;const canNext=next&&playbackAllowed(result.title,result.entitlement,{episodeId:next.episode.id} as Parameters<typeof playbackAllowed>[2]);
 return <MediaPlayer metadata={result.metadata} title={result.title.title} profileId={profileId} episodeLabel={context?"Season "+context.season.number+" · Episode "+context.episode.episodeNumber+" — "+context.episode.title:undefined} backHref={details} backLabel={context?"Back to episodes":"Back to details"} service={streamingServices.playback} reducedMotion={profile?.preferences.reducedMotion} preferredSubtitle={profile?.preferences.subtitleLanguage} onRetry={retry} next={canNext&&next?{title:next.episode.title,href:watchHref(result.title.id,next.episode.id)}:undefined}/>;
}
