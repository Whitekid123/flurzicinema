import {toServiceError} from "./api/errors";

import type { AuthResult, SubscriptionService } from "@/lib/api/services";
import type { AuthState, Entitlement, Subscription } from "@/types/streaming";
export function validEmail(value:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());}
export function passwordIssue(value:string){return value.length<8?"Use at least 8 characters.":value.length>128?"Use no more than 128 characters.":"";}
export function sessionState(result:AuthResult|null,isMock:boolean):AuthState{
 if(!result)return {status:"unauthenticated",isMock};
 if(Date.parse(result.session.expiresAt)<=Date.now())return {status:"session-expired",isMock};
 if(result.session.isMock&&!isMock)return {status:"access-denied",isMock:false};
 return {status:result.user.emailVerified&&result.account.emailVerified?"authenticated":"email-verification-required",...result,isMock:result.session.isMock};
}
export function canPreviewProfiles(isMock:boolean,subscription:Subscription|null,entitlement:Entitlement){
 return entitlement.canStream || Boolean(isMock&&subscription?.status==="none"&&subscription.planId);
}
export async function nextEntry(result:AuthResult,subscriptions:SubscriptionService,newAccount=false){
 if(!result.user.emailVerified||!result.account.emailVerified)return "/verify-email";
 if(newAccount)return "/welcome";
 const [subscription,entitlement]=await Promise.all([subscriptions.getSubscription(),subscriptions.getEntitlement()]);
 return canPreviewProfiles(result.session.isMock,subscription,entitlement)?"/profiles":"/subscribe";
}
export const avatarChoices=[
 {key:"orbit",label:"Orbit"},{key:"frame",label:"Frame"},{key:"echo",label:"Echo"},
 {key:"wave",label:"Wave"},{key:"eclipse",label:"Eclipse"},{key:"spark",label:"Spark"},
] as const;

export function failedSession(error:unknown,isMock:boolean):AuthState{
 const code=toServiceError(error).code;
 const status=code==="UNAUTHENTICATED"?"unauthenticated":code==="SESSION_EXPIRED"?"session-expired":code==="EMAIL_VERIFICATION_REQUIRED"?"email-verification-required":code==="SUBSCRIPTION_REQUIRED"?"subscription-required":"service-unavailable";
 return {status,isMock};
}
