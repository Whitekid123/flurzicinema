export interface DataIdentity {titleId:string;episodeId?:string;profileId:string}
export interface DataPlaybackIdentity extends DataIdentity {playbackSessionId:string;sourceId:string}
export interface BitrateBounds {minBps:number;maxBps:number}
export type MediaBitrateRange=BitrateBounds&({kind:'aggregate'}|{kind:'video';audio:BitrateBounds});
export interface RenditionInformation {id:string;label:string;bitrate?:MediaBitrateRange}
export interface DataPlanningMetadata extends DataIdentity {
 expiresAt:string;durationSeconds?:number;renditions:RenditionInformation[];
}
export interface PlaybackDataMetadata extends DataPlaybackIdentity {
 expiresAt:string;sourceBitrate?:MediaBitrateRange;
}
export interface MediaTransferObservation {id:string;bytes:number;resource:'media';atMs:number}
export interface PlaybackTelemetry extends DataPlaybackIdentity {
 sequence:number;atMs:number;kind:'observed'|'example';
 currentRenditionId?:string;renditions:RenditionInformation[];
 bitrate?:MediaBitrateRange;buffering?:boolean;
 transferCoverage:'complete'|'partial'|'unavailable';transfers?:MediaTransferObservation[];
 canSelectRendition:boolean;
}
export interface DataSenseTransportSession {
 getSnapshot():PlaybackTelemetry;
 subscribe(listener:(value:PlaybackTelemetry)=>void,onError:(error:unknown)=>void):()=>void;
 selectRendition?(id:string,context:{signal:AbortSignal}):Promise<PlaybackTelemetry>;
 dispose():void;
}
export interface DataUsageEstimate {minBytes:number;maxBytes:number}
export interface DataBudget {bytes:number}
export type DataUsagePreference='auto'|'low'|'medium'|'high';
export interface DataSenseState {
 playedSeconds:number;estimated?:DataUsageEstimate;observedBytes?:number;
 coverage:'complete'|'partial'|'unavailable';telemetry?:PlaybackTelemetry;
 bitrate?:MediaBitrateRange;canSelectRendition:boolean;error?:string;example:boolean;
}
