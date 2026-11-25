import type {ViewerProfile} from '@/types/streaming';
import {mockMode,streamingServices} from './client';
import {createRoomPreview} from './mocks/room-preview';
import {createStoryMatchPreview} from './mocks/storymatch-preview';
import {unavailableRoomService} from './room-service';
import {unavailableStoryMatchService} from './storymatch-service';
// Install approved production adapters here. Components never select fixture implementations.
export function roomServiceForViewer(profile:ViewerProfile,sessionId:string,isDevelopmentSession:boolean){
 return mockMode&&isDevelopmentSession?createRoomPreview(streamingServices.auth,streamingServices.profiles,streamingServices.catalog,profile,sessionId):unavailableRoomService;
}
export function storyMatchServiceForViewer(profile:ViewerProfile,sessionId:string,isDevelopmentSession:boolean){
 return mockMode&&isDevelopmentSession?createStoryMatchPreview(streamingServices.auth,streamingServices.profiles,streamingServices.catalog,profile,sessionId):unavailableStoryMatchService;
}
