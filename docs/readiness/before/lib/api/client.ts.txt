
import {ServiceError,ErrorCodes} from "./errors";
import {mockServices} from "./mocks/mockServices";
import type {ServiceRegistry} from "./services";
export const mockMode=process.env.NEXT_PUBLIC_USE_MOCKS==="1";
// Fail closed until real cookie-session adapters are supplied. No production mock fallback.
export function unavailableServices():ServiceRegistry{
 const unavailable=async()=>{throw new ServiceError({code:ErrorCodes.SERVICE_UNAVAILABLE,message:"Account services are not connected yet. Please try again when Flurzi Cinema launches."});};
 return Object.fromEntries(["auth","profiles","catalog","subscriptions","watchlist","playback","recommendations"].map(name=>[name,new Proxy({},{get:()=>unavailable})])) as unknown as ServiceRegistry;
}
export const streamingServices=mockMode?mockServices:unavailableServices();
