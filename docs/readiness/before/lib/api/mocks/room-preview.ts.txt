import type {AuthenticationService,CatalogService,ProfileService} from '@/lib/api/services';
import type {ViewerProfile} from '@/types/streaming';
import type {RoomEvent,RoomService,RoomSnapshot} from '@/lib/rooms';
import {allReady,canControl,isHost,roomFailure,roomIdentity,validRoomName} from '@/lib/rooms';

// Browser-session memory only, partitioned by authenticated session AND viewer.
const storesByAuth=new WeakMap<AuthenticationService,Map<string,Map<string,RoomSnapshot>>>();
export function createRoomPreview(auth:AuthenticationService,profiles:ProfileService,catalog:CatalogService,profile:ViewerProfile,sessionId:string):RoomService {
 const stores=storesByAuth.get(auth)||new Map<string,Map<string,RoomSnapshot>>();storesByAuth.set(auth,stores); const key=roomIdentity(profile,sessionId);const rooms=stores.get(key)||new Map<string,RoomSnapshot>();stores.set(key,rooms);
 const listeners=new Map<string,Set<(event:RoomEvent)=>void>>();const lastReaction=new Map<string,number>();
 async function authorize(){const session=await auth.getCurrentSession();if(!session||!session.session.isMock||session.session.id!==sessionId||session.account.id!==profile.accountId||Date.parse(session.session.expiresAt)<=Date.now())roomFailure('SESSION_EXPIRED');if(!(await profiles.listProfiles()).some(p=>p.id===profile.id&&p.accountId===profile.accountId))roomFailure('ACCESS_DENIED');}
 const copy=(room:RoomSnapshot)=>structuredClone(room);
 async function get(id:string,ended=false){await authorize();const room=rooms.get(id);if(!room)roomFailure('NOT_FOUND');if(!ended&&room.phase==='ended')roomFailure('ROOM_ENDED');return room;}
 function publish(room:RoomSnapshot){room.revision++;for(const listener of listeners.get(room.id)||[])listener({type:'snapshot',snapshot:copy(room)});return copy(room);}
 async function invitation(code:string){await authorize();const room=[...rooms.values()].find(r=>r.invitation?.code===code);if(!room)roomFailure('INVITATION_INVALID');if(room.phase==='ended')roomFailure('ROOM_ENDED');if(Date.parse(room.invitation!.expiresAt)<=Date.now())roomFailure('INVITATION_EXPIRED');return room;}
 return {
  configuration:async()=>{await authorize();return {available:true,isPreview:true,privacy:['invite-only'],controls:['host','everyone'],participantLimit:8};},
  list:async()=>{await authorize();return {current:[...rooms.values()].filter(r=>r.phase!=='ended'&&r.participants.some(p=>p.id===r.selfId&&p.presence!=='left')).map(copy)};},
  create:async input=>{await authorize();if(!validRoomName(input.name)||input.privacy!=='invite-only'||!['host','everyone'].includes(input.controls))roomFailure('VALIDATION');const title=await catalog.getTitle(input.media.titleId);if(!title||(title.mediaType==='series'?!title.seasons.some(s=>s.episodes.some(e=>e.id===input.media.episodeId)):!!input.media.episodeId))roomFailure('VALIDATION');
   const id='preview-'+crypto.randomUUID();const selfId=crypto.randomUUID();const room:RoomSnapshot={id,name:input.name.trim(),revision:1,phase:'lobby',media:{...input.media},viewerProfileId:profile.id,selfId,participants:[{id:selfId,profileId:profile.id,name:profile.name,avatarKey:profile.avatarKey,role:'host',presence:'joined',ready:false}],privacy:'invite-only',controls:input.controls,participantLimit:8,invitation:{code:crypto.randomUUID().replaceAll('-',''),expiresAt:new Date(Date.now()+3600000).toISOString()},playback:{...input.media,playing:false,positionSeconds:0,serverTimeMs:Date.now()},serverClockOffsetMs:0,isPreview:true};rooms.set(id,room);return copy(room);},
  resolveInvitation:async code=>copy(await invitation(code)),
  join:async code=>{const room=await invitation(code);const self=room.participants.find(p=>p.id===room.selfId)!;if(self.presence==='left'&&room.participantLimit&&room.participants.filter(p=>p.presence==='joined').length>=room.participantLimit)roomFailure('ROOM_FULL');self.presence='joined';return publish(room);},
  getSnapshot:async id=>copy(await get(id,true)),
  leave:async id=>{const room=await get(id);const self=room.participants.find(p=>p.id===room.selfId)!;self.presence='left';if(self.role==='host')room.phase='ended';publish(room);},
  setReady:async(id,ready)=>{const room=await get(id);if(room.phase!=='lobby')roomFailure('ACCESS_DENIED');const self=room.participants.find(p=>p.id===room.selfId&&p.presence==='joined');if(!self)roomFailure('ACCESS_DENIED');self.ready=ready;return publish(room);},
  start:async id=>{const room=await get(id);if(!isHost(room)||room.phase!=='lobby')roomFailure('ACCESS_DENIED');if(!allReady(room))roomFailure('NOT_READY');room.phase='viewing';return publish(room);},
  sendPlaybackIntent:async(id,intent)=>{const room=await get(id);if(!canControl(room))roomFailure('ACCESS_DENIED');if(!Number.isFinite(intent.positionSeconds)||intent.positionSeconds<0||!['play','pause','seek'].includes(intent.action))roomFailure('VALIDATION');room.playback={...room.media,playing:intent.action==='seek'?room.playback.playing:intent.action==='play',positionSeconds:intent.positionSeconds,serverTimeMs:Date.now()};return publish(room);},
  sendReaction:async(id,reaction)=>{const room=await get(id);if(room.phase!=='viewing'||!['applause','laughter','surprise','heart'].includes(reaction))roomFailure('ACCESS_DENIED');if(Date.now()-(lastReaction.get(id)||0)<1500)roomFailure('RATE_LIMITED');lastReaction.set(id,Date.now());for(const listener of listeners.get(id)||[])listener({type:'reaction',id:crypto.randomUUID(),roomId:id,participantId:room.selfId,reaction,revision:room.revision});},
  end:async id=>{const room=await get(id);if(!isHost(room))roomFailure('ACCESS_DENIED');room.phase='ended';room.playback.playing=false;return publish(room);},
  reconnect:async id=>copy(await get(id,true)),
  subscribe:(id,onEvent,onError)=>{let active=true;const set=listeners.get(id)||new Set();listeners.set(id,set);set.add(onEvent);void get(id,true).then(room=>{if(active)onEvent({type:'snapshot',snapshot:copy(room)});},error=>{if(active)onError(error);});return()=>{active=false;set.delete(onEvent);};}
 };
}
