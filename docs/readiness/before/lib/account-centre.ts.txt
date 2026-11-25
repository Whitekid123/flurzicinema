import type {Account,Subscription,ViewerProfile,ProfilePreferences,DeviceInfo} from "@/types/streaming";
import type {ProfileService} from "@/lib/api/services";
import {ServiceError,toServiceError} from "@/lib/api/errors";

export const accountLinks=[["Overview","/account"],["Account details","/account/details"],["Membership & billing","/account/billing"],["Security","/account/security"],["Devices","/account/devices"],["Viewing preferences","/account/preferences"]] as const;
export function accountNavActive(path:string,href:string){return path===href;}
export function accountError(error:unknown){
 const code=toServiceError(error).code;
 if(code==="SESSION_EXPIRED"||code==="UNAUTHENTICATED")return {message:"Your session has ended. Sign in again to continue.",signIn:true};
 if(code==="ACCESS_DENIED"||code==="PLAYBACK_DENIED")return {message:"This account action is not authorized.",signIn:false};
 if(code==="SUBSCRIPTION_REQUIRED")return {message:"This action requires an eligible membership.",signIn:false};
 if(code==="SERVICE_UNAVAILABLE")return {message:"This service is unavailable right now. Please try again later.",signIn:false};
 return {message:"We couldn’t complete this request. Please try again.",signIn:false};
}
export function ownedAccount(account:Account|null,id:string){if(!account||account.id!==id)throw new ServiceError({code:"ACCESS_DENIED",message:"Account identity mismatch."});return account;}
export function ownedSubscription(subscription:Subscription|null,id:string){if(subscription&&subscription.accountId!==id)throw new ServiceError({code:"ACCESS_DENIED",message:"Subscription identity mismatch."});return subscription;}
export function membershipStatus(subscription:Subscription|null,isMock:boolean){
 if(isMock)return {label:"No active membership",description:subscription?.planId?"A development plan preference is selected. No payment or streaming access.":"Development preview. No payment or streaming access."};
 if(!subscription||subscription.status==="none")return {label:"No active membership",description:"There is no active membership on this account."};
 const labels={active:"Active membership",trialing:"Trial membership","past-due":"Payment needs attention",cancelled:"Membership cancelled",paused:"Membership paused"};
 return {label:labels[subscription.status],description:subscription.cancelAtPeriodEnd?"Cancellation is scheduled for the end of the supplied membership period.":"Membership status supplied by your account service."};
}
export function canCancelMembership(subscription:Subscription|null,isMock:boolean){return !isMock&&Boolean(subscription&&!subscription.cancelAtPeriodEnd&&["active","trialing","past-due","paused"].includes(subscription.status));}
export function accountDate(value?:string){if(!value)return "Not supplied";const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat("en",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(date):"Not supplied";}
export function invoiceHref(value?:string){try{if(!value)return undefined;const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password?url.href:undefined;}catch{return undefined;}}
export function billingAmount(amount:number,currency:string){try{return Number.isSafeInteger(amount)&&amount>=0&&/^[A-Z]{3}$/.test(currency)?new Intl.NumberFormat("en",{style:"currency",currency}).format(amount/(10**(new Intl.NumberFormat("en",{style:"currency",currency}).resolvedOptions().maximumFractionDigits||0))):"Amount unavailable";}catch{return "Amount unavailable";}}
export function devicesForDisplay(devices:DeviceInfo[]){const unique=new Map<string,DeviceInfo>();for(const device of devices){if(!device.id)continue;const previous=unique.get(device.id);unique.set(device.id,previous?{...previous,isCurrent:previous.isCurrent||device.isCurrent}:{...device});}return [...unique.values()];}
export function canRevokeDevice(device:DeviceInfo,isMock:boolean){return !isMock&&Boolean(device.id)&&device.isCurrent===false;}
export function validateDisplayName(value:string){return value.trim().length>0&&value.trim().length<=80?"":"Use a display name between 1 and 80 characters.";}
export function languagePreference(value:string){return value===""||value==="off"||/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(value);}
export async function saveLanguagePreferences(service:ProfileService,accountId:string,profile:ViewerProfile,input:Pick<ProfilePreferences,"audioLanguage"|"subtitleLanguage">){
 if(profile.accountId!==accountId)throw new ServiceError({code:"ACCESS_DENIED",message:"Profile identity mismatch."});
 if(!languagePreference(input.audioLanguage||"")||input.audioLanguage==="off"||!languagePreference(input.subtitleLanguage||""))throw new ServiceError({code:"VALIDATION",message:"Invalid language preference."});
 const updated=await deadline(service.updateProfile(profile.id,{preferences:{...profile.preferences,...input}}));
 if(updated.id!==profile.id||updated.accountId!==accountId)throw new ServiceError({code:"ACCESS_DENIED",message:"Profile identity mismatch."});
 return updated;
}
export async function deadline<T>(request:Promise<T>,ms=20000):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([request,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new ServiceError({code:"SERVICE_UNAVAILABLE",message:"Request timed out."})),ms);})]);}finally{clearTimeout(timer);}
}
