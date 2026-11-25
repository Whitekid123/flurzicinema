
"use client";
// Frontend UX gate only. Production APIs must enforce their own session and entitlement.
import Link from "next/link";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "@/lib/state/SessionContext";
import {ViewerFrame,EntryLoading} from "./EntryUI";
export function RequireAuth({children,requireProfile=false}:{children:React.ReactNode;requireProfile?:boolean}){
 const {auth,profile,refresh}=useSession();const router=useRouter();
 useEffect(()=>{
  if(auth.status==="unauthenticated"||auth.status==="session-expired")router.replace("/login");
  else if(auth.status==="email-verification-required")router.replace("/verify-email");
  else if(auth.status==="subscription-required")router.replace("/subscribe");
  else if(auth.status==="onboarding-incomplete")router.replace("/welcome");
  else if(auth.status==="authenticated"&&requireProfile&&!profile)router.replace("/profiles");
 },[auth.status,profile,requireProfile,router]);
 if(auth.status==="service-unavailable"||auth.status==="access-denied")return <ViewerFrame><div className="entry-gate"><span className="entry-overline">FLURZI CINEMA ACCOUNTS</span><h1>We can’t connect<br/>right now.</h1><p>We’re unable to access your account right now. Please try again.</p><button className="entry-button" onClick={()=>void refresh()}>Try again</button><Link className="entry-text-button" href="/login">Return to sign in</Link></div></ViewerFrame>;
 if(auth.status!=="authenticated"||(requireProfile&&!profile))return <ViewerFrame><EntryLoading message={auth.status==="authenticating"?"Checking your session…":"Opening your next step…"}/></ViewerFrame>;
 return <>{children}</>;
}
