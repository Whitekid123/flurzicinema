import {queryCatalog} from "../../catalog-discovery";
// DEVELOPMENT MOCKS ONLY. In-memory fixtures, not authentication or parental security.
import { ServiceError, ErrorCodes } from "../errors";
import { emptyPage } from "../pagination";
import type { ServiceRegistry, AuthResult } from "../services";
import type { ViewerProfile, Subscription, WatchlistItem } from "@/types/streaming";
import { mockAccount, mockPlans, mockProfiles, mockTitles, mockUser } from "./mockData";
const delay=<T,>(value:T,ms=120):Promise<T>=>new Promise(resolve=>setTimeout(()=>resolve(structuredClone(value)),ms));
const invalid=(message:string)=>new ServiceError({code:ErrorCodes.VALIDATION,message});
export function createMockServices():ServiceRegistry{
 let signedIn=false;
 let watchlist:WatchlistItem[]=[];
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
    signedIn=true;watchlist=[];profiles=[];subscription=null;verificationUsed=false;pinGrants.clear();
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
      async listTitles(query){return delay(queryCatalog(mockTitles,query));},
      async getTitle(id){return delay(mockTitles.find(t=>t.id===id||t.slug===id)??null);},
      async search(query,page){return delay(queryCatalog(mockTitles,{...page,search:query}));},
      async listGenres() { return delay([...new Map(mockTitles.flatMap(t=>t.genres).map(g=>[g.id,g])).values()]); },
      async listRecommendations(titleId) { const source=mockTitles.find(t=>t.id===titleId);return delay(source?mockTitles.filter(t=>t.id!==source.id&&t.genres.some(g=>source.genres.some(s=>s.id===g.id))):[]); },
      async getContinueWatching(profileId) { requireSession(true);find(profileId);return delay([]); },
      async getViewingHistory(profileId,page) { requireSession(true);find(profileId);return delay(emptyPage(page?.pageSize||24)); },
    },
    subscriptions:{
     async listPlans(){return delay(mockPlans);},
     async getSubscription(){requireSession(true);return delay(subscription);},
     async getEntitlement(){requireSession(true);return delay({accountId:account.id,canStream:false,canDownload:false,maxStreams:0,maxProfiles:5,planId:subscription?.planId,reason:"Development preview; no streaming entitlement is issued."});},
     async getBillingHistory(){requireSession(true);return delay(emptyPage());},
     async changePlan(planId){requireSession(true);if(!mockPlans.some(p=>p.id===planId&&p.isActive))throw invalid("This plan is not available.");subscription={id:"mock-preference",accountId:account.id,planId,status:"none"};return delay(subscription);},
     async cancelSubscription(){requireSession(true);if(!subscription)throw invalid("No subscription preference is selected.");subscription={...subscription,status:"cancelled"};return delay(subscription);},
     async listDevices(){requireSession(true);return delay([]);},
     async revokeDevice(){requireSession(true);throw new ServiceError({code:ErrorCodes.NOT_FOUND,message:"No device exists in this development account."});},
    },
    watchlist: {
      async listWatchlist(profileId){requireSession(true);find(profileId);return delay(watchlist.filter(i=>i.profileId===profileId));},
      async addToWatchlist(profileId,titleId){requireSession(true);find(profileId);if(!mockTitles.some(t=>t.id===titleId))throw invalid("This title is not available.");let item=watchlist.find(i=>i.profileId===profileId&&i.titleId===titleId);if(!item){item={id:"mock-wl-"+profileId+"-"+titleId,titleId,profileId,addedAt:new Date().toISOString()};watchlist.push(item);}return delay(item);},
      async removeFromWatchlist(profileId,titleId){requireSession(true);find(profileId);watchlist=watchlist.filter(i=>i.profileId!==profileId||i.titleId!==titleId);return delay(undefined);},
      async isInWatchlist(profileId,titleId){requireSession(true);find(profileId);return delay(watchlist.some(i=>i.profileId===profileId&&i.titleId===titleId));},
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
      async getHomeRails(profileId) { requireSession(true);find(profileId);return delay([{id:"demo-films",title:"Movies to explore",items:mockTitles.filter(t=>t.mediaType==="movie")},{id:"demo-series",title:"Series spotlight",items:mockTitles.filter(t=>t.mediaType==="series")}]); },
    },
  };
}

export const mockServices = createMockServices();
