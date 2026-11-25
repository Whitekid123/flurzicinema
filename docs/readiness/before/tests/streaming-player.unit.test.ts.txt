import {describe,it,expect,vi} from "vitest";
import {acquirePlayback,validateMetadata,resumePosition,clampSeek,progressPayload,episodeContext,mediaState,mediaError,failureState,selectCaption,sourceUrl,watchHref} from "@/lib/playback";
import {canUseNative,nativeTransport,mediaCapabilities,nativeAudioChoices,selectNativeAudio} from "@/lib/media-transport";
import {createProgressReporter} from "@/lib/playback-progress";
import {createMockServices} from "@/lib/api/mocks/mockServices";
import type {PlaybackMetadata,ViewingProgress,Series} from "@/types/streaming";
import type {PlaybackService} from "@/lib/api/services";
const metadata:PlaybackMetadata={titleId:"movie",profileId:"viewer",playbackSessionId:"session",sourceType:"webm",manifestUrl:"https://media.example/test.webm",expiresAt:"2099-01-01",isLicensed:true,captions:[]};
const identity={titleId:"movie",profileId:"viewer"};
const progress:ViewingProgress={id:"p",...identity,positionSeconds:20,durationSeconds:100,completed:false,lastWatchedAt:"2026-01-01"};
describe("authorization and sources",()=>{
 it("accepts matching unexpired authorized identities",()=>expect(validateMetadata(metadata,"movie",undefined,"viewer")).toBe(metadata));
 it.each([{profileId:"other"},{titleId:"other"},{episodeId:"unexpected"},{isLicensed:false},{playbackSessionId:undefined},{expiresAt:"bad"},{expiresAt:"2020-01-01"},{manifestUrl:undefined},{manifestUrl:"javascript:alert(1)"},{sourceType:undefined}])("rejects invalid authorization %j",patch=>expect(()=>validateMetadata({...metadata,...patch},"movie",undefined,"viewer")).toThrow());
 it("rejects region restrictions",()=>expect(()=>validateMetadata({...metadata,restriction:"region"},"movie",undefined,"viewer")).toThrow());
 it("allows secure media and loopback development paths only",()=>{expect(sourceUrl("/api/media")).toBe(true);expect(sourceUrl("http://cdn.example/a")).toBe(false);expect(sourceUrl("http://127.0.0.1/a")).toBe(true);expect(sourceUrl("data:video/webm,123")).toBe(false);});
 it("never authorizes metadata-only fictional titles",async()=>{const services=createMockServices();const spy=vi.spyOn(services.playback,"getPlaybackMetadata");await expect(acquirePlayback(services,"mock-quiet-beyond",undefined,"viewer")).rejects.toMatchObject({state:"unavailable"});expect(spy).not.toHaveBeenCalled();});
 it.each([["SESSION_EXPIRED","session-expired"],["SUBSCRIPTION_REQUIRED","subscription-required"],["REGION_RESTRICTED","region-restricted"],["PLAYBACK_DENIED","denied"],["SERVICE_UNAVAILABLE","network-error"]])("maps %s", (code,state)=>expect(failureState({code,message:"safe"}).state).toBe(state));
});
describe("progress and episode identity",()=>{
 it("clamps seeks and invalid durations",()=>{expect(clampSeek(-5,100)).toBe(0);expect(clampSeek(200,100)).toBe(100);expect(clampSeek(5,Infinity)).toBe(0);});
 it("restores only the same viewer and media",()=>{expect(resumePosition(progress,identity,100)).toBe(20);expect(resumePosition(progress,{...identity,profileId:"other"},100)).toBe(0);expect(resumePosition({...progress,episodeId:"ep"},identity,100)).toBe(0);});
 it("does not resume completed or nearly finished media",()=>{expect(resumePosition({...progress,completed:true},identity,100)).toBe(0);expect(resumePosition({...progress,positionSeconds:98},identity,100)).toBe(0);expect(resumePosition({...progress,positionSeconds:NaN},identity,100)).toBe(0);});
 it("does not invent completion or report invalid duration",()=>{expect(progressPayload(identity,99,100)?.completed).toBe(false);expect(progressPayload(identity,100,100,true)?.completed).toBe(true);expect(progressPayload(identity,1,Infinity)).toBeNull();expect(progressPayload(identity,NaN,100)).toBeNull();});
 it("uses the supplied episode order and finds only a real next episode",async()=>{const title=await createMockServices().catalog.getTitle("mock-velvet-hours") as Series;const context=episodeContext(title,"mock-vh-s1e1");expect(context?.episode.title).toBe("An unopened letter");expect(context?.next?.episode.id).toBe("mock-vh-s1e2");expect(episodeContext(title,"mock-vh-s1e2")?.next).toBeNull();expect(()=>episodeContext(title,"invented")).toThrow();expect(watchHref(title.id,"a b")).toContain("episodeId=a%20b");});
 it("requires episode selection for series",async()=>{const title=await createMockServices().catalog.getTitle("mock-velvet-hours");expect(()=>episodeContext(title!)).toThrow();});
 it("rejects episode identity on a movie",async()=>{const title=await createMockServices().catalog.getTitle("mock-quiet-beyond");expect(()=>episodeContext(title!,"ep")).toThrow();});
 it("throttles time updates and sends genuine completion once",async()=>{
  let now=20000;const service={reportProgress:vi.fn(async value=>({...value,id:"p"})),reportCompleted:vi.fn(async()=>{})} as unknown as PlaybackService;
  const reporter=createProgressReporter(service,identity,"session",()=>{},()=>now);
  reporter.record(1,100);await Promise.resolve();reporter.record(2,100);expect(service.reportProgress).toHaveBeenCalledTimes(1);
  now+=15000;reporter.record(20,100);await Promise.resolve();reporter.record(100,100,true,true);await new Promise(resolve=>setTimeout(resolve,0));
  expect(service.reportCompleted).toHaveBeenCalledTimes(1);expect(service.reportProgress).toHaveBeenLastCalledWith(expect.objectContaining({...identity,playbackSessionId:"session",completed:true}));
  reporter.dispose();
 });
 it("reports temporary failure and can retry without fabricating success",async()=>{
  const failure=vi.fn();const service={reportProgress:vi.fn().mockRejectedValueOnce(Error()).mockResolvedValue({}),reportCompleted:vi.fn()} as unknown as PlaybackService;
  const reporter=createProgressReporter(service,identity,"session",failure);
  reporter.record(10,100,false,true);await new Promise(resolve=>setTimeout(resolve,0));expect(failure).toHaveBeenLastCalledWith(true);
  reporter.record(11,100,false,true);await new Promise(resolve=>setTimeout(resolve,0));expect(failure).toHaveBeenLastCalledWith(false);reporter.dispose();
 });
});
describe("native transport and event model",()=>{
 it.each([["playing",false,"playing"],["pause",true,"paused"],["waiting",false,"buffering"],["seeking",true,"seeking"],["seeked",true,"paused"],["ended",true,"ended"]])("maps %s", (event,paused,state)=>expect(mediaState(event as string,paused as boolean)).toBe(state));
 it("distinguishes unsupported and network failures",()=>{expect(mediaError(4)).toBe("unsupported");expect(mediaError(2)).toBe("network-error");expect(mediaError(3)).toBe("playback-error");});
 it("uses browser format support and rejects unintegrated DASH",()=>{const video={canPlayType:()=> "probably" as CanPlayTypeResult};expect(canUseNative(video,"webm")).toBe(true);expect(canUseNative(video,"dash")).toBe(false);expect(canUseNative({canPlayType:()=>""},"hls")).toBe(false);});
 it("cleans media resources on teardown",()=>{const video={canPlayType:()=>"probably",load:vi.fn(),pause:vi.fn(),removeAttribute:vi.fn(),src:""} as unknown as HTMLVideoElement;const cleanup=nativeTransport.attach(video,metadata);expect(video.src).toBe(metadata.manifestUrl);cleanup();expect(video.pause).toHaveBeenCalled();expect(video.removeAttribute).toHaveBeenCalledWith("src");expect(video.load).toHaveBeenCalledTimes(2);});
 it("rejects unsupported media before assigning a source",()=>{expect(()=>nativeTransport.attach({canPlayType:()=>""} as unknown as HTMLVideoElement,metadata)).toThrow();});
 it("detects capabilities without creating fake settings",()=>{expect(mediaCapabilities({} as HTMLVideoElement,{} as Document)).toEqual({fullscreen:false,pip:false,speed:false});});
 it("switches real caption tracks and supports off",()=>{const tracks=[{mode:"disabled"},{mode:"disabled"}] as TextTrack[];selectCaption(tracks,1);expect(tracks.map(t=>t.mode)).toEqual(["disabled","showing"]);selectCaption(tracks,-1);expect(tracks.map(t=>t.mode)).toEqual(["disabled","disabled"]);});
});

describe("native audio boundary",()=>{it("reads snapshots and selects only real browser audio tracks",()=>{const tracks=[{language:"en",label:"English",enabled:true},{language:"fr",label:"French",enabled:false}];const video={audioTracks:tracks} as unknown as HTMLVideoElement;const snapshot=nativeAudioChoices(video);expect(selectNativeAudio(video,1)).toBe(true);expect(tracks.map(track=>track.enabled)).toEqual([false,true]);expect(snapshot[0].enabled).toBe(true);expect(selectNativeAudio(video,5)).toBe(false);expect(selectNativeAudio({} as HTMLVideoElement,0)).toBe(false);});});

describe("progress races and access revocation",()=>{
 it("preserves ended completion when replay progress arrives during an in-flight write",async()=>{
  let finish!:(value:unknown)=>void;const first=new Promise(resolve=>{finish=resolve;});
  const service={reportProgress:vi.fn().mockImplementationOnce(()=>first).mockResolvedValue({}),reportCompleted:vi.fn().mockResolvedValue(undefined)} as unknown as PlaybackService;
  const reporter=createProgressReporter(service,identity,"session",()=>{});
  reporter.record(10,100,false,true);reporter.record(100,100,true,true);reporter.record(1,100,false,true);finish({});
  await new Promise(resolve=>setTimeout(resolve,0));
  expect(service.reportCompleted).toHaveBeenCalledTimes(1);
  expect(service.reportProgress).toHaveBeenNthCalledWith(2,expect.objectContaining({completed:true,positionSeconds:100}));
  expect(service.reportProgress).toHaveBeenLastCalledWith(expect.objectContaining({completed:false,positionSeconds:1}));reporter.dispose();
 });
 it("notifies access revocation so the player can halt rather than silently retry",async()=>{
  const denied=vi.fn();const service={reportProgress:vi.fn().mockRejectedValue({code:"SESSION_EXPIRED",message:"Expired"}),reportCompleted:vi.fn()} as unknown as PlaybackService;
  const reporter=createProgressReporter(service,identity,"session",()=>{},Date.now,denied);reporter.record(10,100,false,true);
  await new Promise(resolve=>setTimeout(resolve,0));expect(denied).toHaveBeenCalledWith(expect.objectContaining({code:"SESSION_EXPIRED"}));reporter.dispose();
 });
});
