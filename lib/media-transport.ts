import type {DataSenseTransportSession} from "@/types/datasense";
import type {PlaybackMetadata} from "@/types/streaming";
import {PlaybackFailure,sourceUrl} from "./playback";
export interface MediaTransport {createDataSession?(video:HTMLVideoElement,metadata:PlaybackMetadata):DataSenseTransportSession;attach(video:HTMLVideoElement,metadata:PlaybackMetadata):()=>void;}
export function mediaCapabilities(video:HTMLVideoElement,doc:Document=document){return {fullscreen:Boolean(typeof video.requestFullscreen==="function"&&doc.fullscreenEnabled),pip:Boolean(doc.pictureInPictureEnabled&&typeof video.requestPictureInPicture==="function"),speed:"playbackRate" in video};}
export function canUseNative(video:Pick<HTMLVideoElement,"canPlayType">,type:PlaybackMetadata["sourceType"]){
 const mime=type==="hls"?"application/vnd.apple.mpegurl":type==="mp4"?"video/mp4":type==="webm"?"video/webm":"";
 return Boolean(mime&&video.canPlayType(mime));
}
// Future HLS/MSE or DASH/EME transports implement this same lifecycle boundary.
export const nativeTransport:MediaTransport={attach(video,metadata){
 if(!sourceUrl(metadata.manifestUrl))throw new PlaybackFailure("unavailable","No valid media source.");
 if(!canUseNative(video,metadata.sourceType))throw new PlaybackFailure("unsupported","This browser cannot play this video format. Try a supported browser or return to details.");
 video.src=metadata.manifestUrl!;video.load();
 return ()=>{video.pause();video.removeAttribute("src");video.load();};
}};

export interface NativeAudioChoice{language:string;label:string;enabled:boolean;}
type AudioVideo=HTMLVideoElement&{audioTracks?:{length:number;[index:number]:NativeAudioChoice}};
export function nativeAudioChoices(video:HTMLVideoElement):NativeAudioChoice[]{const tracks=(video as AudioVideo).audioTracks;return tracks?Array.from({length:tracks.length},(_,index)=>({language:tracks[index].language,label:tracks[index].label,enabled:tracks[index].enabled})):[];}
export function selectNativeAudio(video:HTMLVideoElement,index:number){const tracks=(video as AudioVideo).audioTracks;if(!tracks||index<0||index>=tracks.length)return false;try{for(let i=0;i<tracks.length;i++)tracks[i].enabled=i===index;return true;}catch{return false;}}
