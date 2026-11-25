// DEVELOPMENT MOCKS ONLY. In-memory fixtures, not authentication or parental security.
import { ServiceError, ErrorCodes } from "../errors";
import { emptyPage } from "../pagination";
import type { ServiceRegistry, AuthResult } from "../services";
import type { ViewerProfile, Subscription } from "@/types/streaming";
import { mockAccount, mockPlans, mockProfiles, mockTitles, mockUser } from "./mockData";
const delay=<T,>(value:T,ms=120):Promise<T>=>new Promise(resolve=>setTimeout(()=>resolve(structuredClone(value)),ms));
const invalid=(message:string)=>new ServiceError({code:ErrorCodes.VALIDATION,message});
export function createMockServices():ServiceRegistry{
 let signedIn=false;
 let user={...mockUser};
 let account={...mockAccount};
 let profiles:ViewerProfile[]=structuredClone(mockProfiles);
 let subscription:Subscription|null=null;
 let recoveryReady=false;
 let verificationUsed=false;
 let profileSerial=0;
 const pinGrants=new Set<string>();
 const requireSession=(verified=false)=>{
  if(!signedIn)throw new ServiceError({code:ErrorCodes.UNAUTHENTICATED,message:"Sign in to continue."});
  if(verified&&!user.emailVerified)throw new ServiceError({code:ErrorCodes.EMAIL_VERIFICATION_REQUIRED,message:"Verify your email before continuing."});
 };
 const result=():AuthResult=>({user:{...user},account:{...account},session:{id:"mock-session",userId:user.id,accountId:account.id,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString(),isMock:true}});
 const find=(id:string)=>{const profile=profiles.find(p=>p.id===id);if(!profile)throw new ServiceError({code:ErrorCodes.NOT_FOUND,message:"This profile is no longer available."});return profile;};
 const checkName=(name:string)=>{if(!name.trim()||name.trim().length>24)throw invalid("Use a profile name between 1 and 24 characters.");};
 const checkPin=(pin?:string)=>{if(pin&&pin!=="1234")throw invalid("Use 1234 for the development PIN demo. Custom PINs require the backend.");};
 return {
  auth:{
   async register(input){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))throw invalid("Enter a valid email address.");
    if(input.password.length<8||input.password.length>128)throw invalid("Use a password between 8 and 128 characters.");
    user={...mockUser,email:input.email.trim().toLowerCase(),displayName:input.displayName||"Viewer",emailVerified:false,roles:["viewer"]};
    account={...mockAccount,email:user.email,displayName:user.displayName,emailVerified:false,createdAt:new Date().toISOString()};
    signedIn=true;profiles=[];subscription=null;verificationUsed=false;pinGrants.clear();
    return delay(result());
   },
   async login(input){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))throw invalid("Enter a valid email address.");
    if(!input.password)throw invalid("Enter your password.");
    // Passwords are never retained or compared. This is explicitly a fixture login.
    signedIn=true;pinGrants.clear();
    return delay(result());
   },
   async logout(){signedIn=false;pinGrants.clear();return delay(undefined);},
   async getCurrentSession(){return delay(signedIn?result():null);},
   async verifyEmail(token){
    if(token!=="mock-verification"||verificationUsed||!signedIn)throw invalid("This verification link is invalid or has expired.");
    user.emailVerified=true;account.emailVerified=true;verificationUsed=true;return delay(undefined);
   },
   async resendVerificationEmail(){requireSession();verificationUsed=false;return delay(undefined);},
   async requestPasswordRecovery(input){if(!input.email.includes("@"))throw invalid("Enter a valid email address.");recoveryReady=true;return delay(undefined);},
   async resetPassword(input){
    if(input.token!=="mock-reset"||!recoveryReady)throw invalid("This reset link is invalid or has expired. Request a new link.");
    if(input.newPassword.length<8||input.newPassword.length>128)throw invalid("Use a password between 8 and 128 characters.");
    recoveryReady=false;signedIn=false;pinGrants.clear();return delay(undefined);
   },
   async getAccount(){return delay(signedIn?account:null);},
   async getOAuthProviders(){return delay([]);},
  },
  profiles:{
   async listProfiles(){requireSession(true);return delay(profiles);},
   async createProfile(input){
    requireSession(true);checkName(input.name);checkPin(input.pin);
    if(profiles.length>=5)throw invalid("This development account supports up to 5 demo profiles.");
    const profile:ViewerProfile={id:"mock-profile-created-"+(++profileSerial),accountId:account.id,name:input.name.trim(),avatarKey:input.avatarKey||"orbit",isKids:input.isKids??false,hasPin:Boolean(input.pin),preferences:{language:"en",autoplay:!input.isKids,playbackQuality:"auto",...(input.isKids?{maturityRating:"PG"}:{})},createdAt:new Date().toISOString()};
    profiles.push(profile);return delay(profile);
   },
   async updateProfile(id,input){
    requireSession(true);const profile=find(id);if(input.name!==undefined)checkName(input.name);checkPin(input.pin);
    const next:ViewerProfile={...profile,...(input.name!==undefined?{name:input.name.trim()}:{}),...(input.avatarKey!==undefined?{avatarKey:input.avatarKey}:{}),...(input.isKids!==undefined?{isKids:input.isKids}:{}),...(input.pin!==undefined?{hasPin:Boolean(input.pin)}:{}),preferences:{...profile.preferences,...input.preferences}};
    profiles=profiles.map(p=>p.id===id?next:p);pinGrants.delete(id);return delay(next);
   },
   async deleteProfile(id){requireSession(true);find(id);profiles=profiles.filter(p=>p.id!==id);pinGrants.delete(id);return delay(undefined);},
   async selectProfile(id){requireSession(true);const profile=find(id);if(profile.hasPin&&!pinGrants.has(id))throw invalid("Enter the demo profile PIN first.");pinGrants.delete(id);return delay(profile);},
   async verifyPin(id,pin){requireSession(true);const profile=find(id);const ok=profile.hasPin&&pin==="1234";if(ok)pinGrants.add(id);return delay(ok);},
  },
    catalog: {
      async listTitles(query) {
        const filtered = mockTitles.filter((t) => !query?.mediaType || t.mediaType === query.mediaType);
        return delay({ items: filtered, page: 1, pageSize: 24, total: filtered.length });
      },
      async getTitle(id) { return delay(mockTitles.find((t) => t.id === id || t.slug === id) ?? null); },
      async search(query) {
        const needle = query.toLowerCase();
        const items = mockTitles.filter((t) => t.title.toLowerCase().includes(needle));
        return delay({ items, page: 1, pageSize: 24, total: items.length });
      },
      async listGenres() { return delay([{ id: "g-mystery", name: "Mystery", slug: "mystery" }]); },
      async listRecommendations() { return delay(mockTitles.slice(0, 1)); },
      async getContinueWatching() { return delay([]); },
      async getViewingHistory() { return delay(emptyPage()); },
    },
    subscriptions:{
     async listPlans(){return delay(mockPlans);},
     async getSubscription(){requireSession(true);return delay(subscription);},
     async getEntitlement(){requireSession(true);return delay({accountId:account.id,canStream:false,canDownload:false,maxStreams:0,maxProfiles:5,planId:subscription?.planId,reason:"Development preview; no streaming entitlement is issued."});},
     async getBillingHistory(){return delay(emptyPage());},
     async changePlan(planId){requireSession(true);if(!mockPlans.some(p=>p.id===planId&&p.isActive))throw invalid("This plan is not available.");subscription={id:"mock-preference",accountId:account.id,planId,status:"none"};return delay(subscription);},
     async cancelSubscription(){requireSession(true);if(!subscription)throw invalid("No subscription preference is selected.");subscription={...subscription,status:"cancelled"};return delay(subscription);},
     async listDevices(){return delay([]);},
     async revokeDevice(){return delay(undefined);},
    },
    watchlist: {
      async listWatchlist() { return delay([]); },
      async addToWatchlist(profileId, titleId) { return delay({ id: `mock-wl-${titleId}`, titleId, profileId, addedAt: new Date().toISOString() }); },
      async removeFromWatchlist() { return delay(undefined); },
      async isInWatchlist() { return delay(false); },
    },
    playback: {
      async getPlaybackMetadata(titleId) {
        // Mock only — production must return a short-lived, server-authorised
        // manifest. Never fabricate a licensable source.
        return delay({ titleId, manifestUrl: undefined, captions: [], isLicensed: false });
      },
      async reportProgress(progress) { return delay({ ...progress, id: `mock-prog-${progress.titleId}` }); },
      async reportCompleted() { return delay(undefined); },
    },
    recommendations: {
      async listNotifications() { return delay(emptyPage()); },
      async markNotificationRead() { return delay(undefined); },
      async getHomeRails() { return delay([{ id: "rail-mock", title: "Mock rail (dev only)", items: mockTitles }]); },
    },
  };
}

export const mockServices = createMockServices();
