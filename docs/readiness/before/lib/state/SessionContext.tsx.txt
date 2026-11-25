
"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from "react";
import type {AuthState,ViewerProfile} from "@/types/streaming";
import type {AuthenticationService,ProfileService,SubscriptionService} from "@/lib/api/services";
import {streamingServices,mockMode} from "@/lib/api/client";
import {sessionState,failedSession} from "@/lib/entry-flow";
interface SessionContextValue{
 auth:AuthState;profile:ViewerProfile|null;authService:AuthenticationService;profileService:ProfileService;subscriptionService:SubscriptionService;
 refresh:()=>Promise<void>;setProfile:(profile:ViewerProfile|null)=>void;signOut:()=>Promise<void>;
}
const SessionContext=createContext<SessionContextValue|null>(null);
// A root owner preserves the same session/profile across auth and profile routes.
// Retained scaffold layouts may nest this provider without creating a second store.
export function SessionProvider({children}:{children:React.ReactNode}){
 const parent=useContext(SessionContext);
 return parent?<>{children}</>:<SessionOwner>{children}</SessionOwner>;
}
function SessionOwner({children}:{children:React.ReactNode}){
 const [auth,setAuth]=useState<AuthState>({status:"authenticating",isMock:mockMode});
 const [profile,setProfileState]=useState<ViewerProfile|null>(null);
 const requestRef=useRef(0);
 const currentAccount=useRef<string|undefined>(undefined);
 const fetchSession=useCallback(async(requestId:number)=>{
  try{
   const result=await streamingServices.auth.getCurrentSession();
   if(requestId!==requestRef.current)return;
   const next=sessionState(result,mockMode);
   if(next.status!=="authenticated"||currentAccount.current!==next.account?.id)setProfileState(null);
   currentAccount.current=next.account?.id;setAuth(next);
  }catch(error){
   if(requestId!==requestRef.current)return;
   setProfileState(null);setAuth(failedSession(error,mockMode));
  }
 },[]);
 const refresh=useCallback(async()=>{
  const id=++requestRef.current;setAuth({status:"authenticating",isMock:mockMode});await fetchSession(id);
 },[fetchSession]);
 const invalidate=useCallback(()=>{requestRef.current++;},[]);
 useEffect(()=>{const id=++requestRef.current;void fetchSession(id);return invalidate;},[fetchSession,invalidate]);
 const signOut=useCallback(async()=>{
  ++requestRef.current;
  await streamingServices.auth.logout();currentAccount.current=undefined;setProfileState(null);setAuth({status:"unauthenticated",isMock:mockMode});
 },[]);
 const value=useMemo(()=>({auth,profile,authService:streamingServices.auth,profileService:streamingServices.profiles,subscriptionService:streamingServices.subscriptions,refresh,setProfile:setProfileState,signOut}),[auth,profile,refresh,signOut]);
 return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession(){const ctx=useContext(SessionContext);if(!ctx)throw new Error("useSession must be used inside <SessionProvider>");return ctx;}
export function useCurrentProfile(){return useSession().profile;}
