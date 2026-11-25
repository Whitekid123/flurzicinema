import type {RoomService} from '@/lib/rooms';
import {roomFailure} from '@/lib/rooms';
// Replace this explicit fail-closed adapter with an approved cookie-session transport.
// No production mock fallback and no endpoint or socket URL is guessed here.
export const unavailableRoomService:RoomService={
 configuration:async()=>({available:false,isPreview:false,privacy:[],controls:[]}),
 list:async()=>roomFailure('SERVICE_UNAVAILABLE'),create:async()=>roomFailure('SERVICE_UNAVAILABLE'),resolveInvitation:async()=>roomFailure('SERVICE_UNAVAILABLE'),join:async()=>roomFailure('SERVICE_UNAVAILABLE'),getSnapshot:async()=>roomFailure('SERVICE_UNAVAILABLE'),leave:async()=>roomFailure('SERVICE_UNAVAILABLE'),setReady:async()=>roomFailure('SERVICE_UNAVAILABLE'),start:async()=>roomFailure('SERVICE_UNAVAILABLE'),sendPlaybackIntent:async()=>roomFailure('SERVICE_UNAVAILABLE'),sendReaction:async()=>roomFailure('SERVICE_UNAVAILABLE'),end:async()=>roomFailure('SERVICE_UNAVAILABLE'),reconnect:async()=>roomFailure('SERVICE_UNAVAILABLE'),subscribe:(_id,_event,error)=>{queueMicrotask(()=>error({code:'SERVICE_UNAVAILABLE',message:'Unavailable'}));return()=>{};}
};
