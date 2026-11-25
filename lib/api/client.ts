
import {ServiceError,ErrorCodes} from "./errors";
import {serviceDeadline} from './deadline';
import type {ServiceRegistry} from "./services";
export const mockMode=process.env.NEXT_PUBLIC_USE_MOCKS==='1'&&(process.env.NODE_ENV!=='production'||process.env.NEXT_PUBLIC_FLURZI_CHANNEL==='preview');
// Fail closed until real cookie-session adapters are supplied. No production mock fallback.
export function unavailableServices():ServiceRegistry{
 const unavailable=async()=>{throw new ServiceError({code:ErrorCodes.SERVICE_UNAVAILABLE,message:"This service is currently unavailable. Please try again."});};
 return Object.fromEntries(["auth","profiles","catalog","subscriptions","watchlist","playback","recommendations"].map(name=>[name,new Proxy({},{get:()=>unavailable})])) as unknown as ServiceRegistry;
}
// This literal build-time branch prevents mock implementations entering release assets.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const selectedServices:ServiceRegistry=process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&mockMode?require("./mocks/mockServices").mockServices:unavailableServices();
// Preserve optional operations and method binding while bounding all registry requests.
export const streamingServices=Object.fromEntries(Object.entries(selectedServices).map(([name,service])=>[name,new Proxy(service,{get(target,key){const operation=Reflect.get(target,key);return typeof operation==='function'?(...args:unknown[])=>serviceDeadline(Promise.resolve().then(()=>operation.apply(target,args))):operation;}})])) as ServiceRegistry;
