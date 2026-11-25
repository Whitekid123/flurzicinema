import type {ViewerProfile} from '@/types/streaming';
import {ServiceError,toServiceError} from '@/lib/api/errors';

export type RoomMedia={titleId:string;episodeId?:string};
export type RoomRole='host'|'participant';
export type Presence='invited'|'joined'|'disconnected'|'reconnecting'|'left';
export type Reaction='applause'|'laughter'|'surprise'|'heart';
export type PlaybackIntent={action:'play'|'pause'|'seek';positionSeconds:number};
export interface RoomParticipant {id:string;profileId:string;name:string;avatarKey?:string;role:RoomRole;presence:Presence;ready:boolean;simulated?:boolean}
export interface RoomPlayback extends RoomMedia {playing:boolean;positionSeconds:number;serverTimeMs:number}
export interface RoomSnapshot {
 id:string;name:string;revision:number;phase:'lobby'|'viewing'|'ended';media:RoomMedia;
 viewerProfileId:string;selfId:string;participants:RoomParticipant[];privacy:'invite-only';controls:'host'|'everyone';
 participantLimit?:number;invitation?:{code:string;expiresAt:string};playback:RoomPlayback;serverClockOffsetMs:number;isPreview:boolean;
}
export type RoomEvent={type:'snapshot';snapshot:RoomSnapshot}|{type:'reaction';id:string;roomId:string;participantId:string;reaction:Reaction;revision:number}|{type:'connection';state:'disconnected'|'reconnecting'|'connected'};
export interface RoomConfiguration {available:boolean;isPreview:boolean;privacy:('invite-only')[];controls:('host'|'everyone')[];participantLimit?:number}
export interface CreateRoomInput {name:string;media:RoomMedia;privacy:'invite-only';controls:'host'|'everyone'}
export interface RoomService {
 configuration():Promise<RoomConfiguration>;
 list():Promise<{current:RoomSnapshot[];invitations?:RoomSnapshot[];history?:RoomSnapshot[]}>;
 create(input:CreateRoomInput):Promise<RoomSnapshot>;
 resolveInvitation(code:string):Promise<RoomSnapshot>;
 join(code:string):Promise<RoomSnapshot>;
 getSnapshot(id:string):Promise<RoomSnapshot>;
 leave(id:string):Promise<void>;
 setReady(id:string,ready:boolean):Promise<RoomSnapshot>;
 start(id:string):Promise<RoomSnapshot>;
 sendPlaybackIntent(id:string,intent:PlaybackIntent):Promise<RoomSnapshot>;
 sendReaction(id:string,reaction:Reaction):Promise<void>;
 end(id:string):Promise<RoomSnapshot>;
 reconnect(id:string):Promise<RoomSnapshot>;
 subscribe(id:string,onEvent:(event:RoomEvent)=>void,onError:(error:unknown)=>void):()=>void;
 removeParticipant?(id:string,participantId:string):Promise<RoomSnapshot>;
 transferHost?(id:string,participantId:string):Promise<RoomSnapshot>;
}
export function roomFailure(code:string):never {throw new ServiceError({code,message:'Room request failed.'});}
export function roomError(error:unknown){const code=toServiceError(error).code;return ({
 INVITATION_INVALID:'This invitation is invalid. Check the link or code.',INVITATION_EXPIRED:'This invitation has expired. Ask the host for a new one.',ROOM_FULL:'This room is full.',ROOM_ENDED:'This room has ended.',ACCESS_DENIED:'You do not have permission for this room.',UNAUTHENTICATED:'Sign in again to continue.',SESSION_EXPIRED:'Your session has expired. Sign in again.',SUBSCRIPTION_REQUIRED:'Your own streaming access is required. An invitation does not include a membership.',REGION_RESTRICTED:'This title is not available in your region.',NOT_FOUND:'This room is unavailable.',RATE_LIMITED:'A little too fast. Wait a moment before trying again.',NOT_READY:'Everyone who has joined must be ready before starting.',SERVICE_UNAVAILABLE:'Cinema Rooms is currently unavailable. Please try again later.',VALIDATION:'Check the room name, invitation and selected title.',SYNC_UNAVAILABLE:'The room connection was interrupted. Reconnect to get the latest state.'
 } as Record<string,string>)[code]||'The room request could not be completed. Please try again.';}
// Syntax only. Authenticity, expiry and permissions are always checked by the service.
export function invitationCode(input:string,origin:string):string {
 let code=input.trim();
 if(code.includes('/')||code.includes(':')){try{const url=new URL(code,origin);if(url.origin!==origin||url.pathname!=='/browse/rooms/join'||url.hash)roomFailure('INVITATION_INVALID');code=url.searchParams.get('code')||'';}catch{roomFailure('INVITATION_INVALID');}}
 if(!/^[A-Za-z0-9_-]{6,128}$/.test(code))roomFailure('INVITATION_INVALID');return code;
}
export function validRoomName(name:string){return name.trim().length>=1&&name.trim().length<=80;}
export function selfParticipant(room:RoomSnapshot){return room.participants.find(p=>p.id===room.selfId&&p.profileId===room.viewerProfileId&&p.presence!=='left');}
export function isHost(room:RoomSnapshot){const self=selfParticipant(room);return self?.role==='host'&&self.presence==='joined';}
export function canControl(room:RoomSnapshot){return room.phase==='viewing'&&selfParticipant(room)?.presence==='joined'&&(isHost(room)||room.controls==='everyone');}
export function allReady(room:RoomSnapshot){const joined=room.participants.filter(p=>p.presence!=='left'&&p.presence!=='invited');return joined.length>0&&joined.every(p=>p.presence==='joined'&&p.ready);}
export function sameMedia(a:RoomMedia,b:RoomMedia){return a.titleId===b.titleId&&a.episodeId===b.episodeId;}
export function validSnapshot(room:RoomSnapshot,profileId:string,roomId?:string){
 if(room.viewerProfileId!==profileId||(roomId&&room.id!==roomId)||!Number.isSafeInteger(room.revision)||room.revision<0||!sameMedia(room.media,room.playback)||!Number.isFinite(room.playback.positionSeconds)||room.playback.positionSeconds<0||!Number.isFinite(room.playback.serverTimeMs)||!Number.isFinite(room.serverClockOffsetMs)||!room.media.titleId||!['lobby','viewing','ended'].includes(room.phase)||!['host','everyone'].includes(room.controls)||new Set(room.participants.map(p=>p.id)).size!==room.participants.length||!room.participants.some(p=>p.id===room.selfId&&p.profileId===profileId)||room.participants.filter(p=>p.role==='host'&&p.presence!=='left').length>1)roomFailure('ACCESS_DENIED');
 return room;
}
export function acceptSnapshot(previous:RoomSnapshot|undefined,next:RoomSnapshot,profileId:string){
 validSnapshot(next,profileId,previous?.id);
 if(previous&&(next.revision<=previous.revision||previous.phase==='ended'||!sameMedia(previous.media,next.media)||(previous.phase==='viewing'&&next.phase==='lobby')))return previous;
 return next;
}
export function playbackPosition(playback:RoomPlayback,serverNowMs:number){return playback.positionSeconds+(playback.playing?Math.max(0,serverNowMs-playback.serverTimeMs)/1000:0);}
export function createRoomController(profileId:string,roomId:string){
 let current:RoomSnapshot|undefined;let connected=false;const reactions=new Set<string>();
 return {snapshot:()=>current,connected:()=>connected,disconnect:()=>{connected=false;},
  receive(event:RoomEvent){if(event.type==='connection'){if(event.state!=='connected')connected=false;return false;}
   if(event.type==='snapshot'){validSnapshot(event.snapshot,profileId,roomId);const next=acceptSnapshot(current,event.snapshot,profileId);const changed=next!==current;current=next;if(changed)connected=true;return changed;}
   if(!connected||!current||event.roomId!==roomId||event.revision!==current.revision||reactions.has(event.id)||!current.participants.some(p=>p.id===event.participantId&&p.presence==='joined')||!['applause','laughter','surprise','heart'].includes(event.reaction))return false;
   reactions.add(event.id);if(reactions.size>128)reactions.delete(reactions.values().next().value!);return true;
  },
  resync(snapshot:RoomSnapshot){validSnapshot(snapshot,profileId,roomId);if(current&&snapshot.revision<current.revision)roomFailure('SYNC_UNAVAILABLE');current=acceptSnapshot(current,snapshot,profileId);connected=true;return current;}
 };
}
export function roomIdentity(profile:ViewerProfile,sessionId:string){return sessionId+'|'+profile.accountId+'|'+profile.id;}
export async function roomDeadline<T>(promise:Promise<T>,ms=20000):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new ServiceError({code:'SYNC_UNAVAILABLE',message:'Room request timed out.'})),ms);})]);}finally{clearTimeout(timer);}}
