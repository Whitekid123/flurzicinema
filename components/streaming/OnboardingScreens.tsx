
"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {Artwork} from "@/components/ui/Artwork";
import {useSession} from "@/lib/state/SessionContext";
import {toServiceError} from "@/lib/api/errors";
import {canPreviewProfiles,nextEntry} from "@/lib/entry-flow";
import type {SubscriptionPlan} from "@/types/streaming";
import {ViewerFrame,EntryLoading,Feedback} from "./EntryUI";
import {RequireAuth} from "./RequireAuth";

export function SignOutButton(){
 const {signOut}=useSession();const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function leave(){setBusy(true);setError("");try{await signOut();router.replace("/login");}catch(e){setError(toServiceError(e).message);}finally{setBusy(false);}}
 return <span className="entry-signout"><button type="button" className="entry-text-button" onClick={leave} disabled={busy}>{busy?"Signing out…":"Sign out"}</button>{error&&<span role="alert">{error}</span>}</span>;
}

export function WelcomeScreen(){
 const {auth,authService,subscriptionService}=useSession();const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function proceed(){
  setBusy(true);setError("");try{const result=await authService.getCurrentSession();if(!result){router.replace("/login");return;}router.push(await nextEntry(result,subscriptionService));}catch(e){setError(toServiceError(e).message);}finally{setBusy(false);}
 }
 return <RequireAuth><ViewerFrame action={<SignOutButton/>}><section className="welcome-stage"><div className="welcome-copy"><span className="entry-overline">WELCOME TO FLURZI CINEMA</span><h1>Make yourself<br/>at home.</h1><p>Movies to discover. Series to get into.<br/>A viewing experience that starts with you.</p><div className="welcome-steps"><div><span>Choose your plan</span><p>Explore the viewing options.</p></div><div><span>Create your profile</span><p>Make room for your preferences.</p></div></div>{error&&<Feedback error>{error}</Feedback>}<button className="entry-button" onClick={proceed} disabled={busy}>{busy?"Please wait…":"Continue setup"}</button><p className="entry-hint">{auth.isMock?"Development preview. No subscription or payment is created.":"Complete setup to see your next available step."}</p></div><div className="welcome-films" aria-label="Original fictional film artwork"><div className="welcome-film welcome-film-back"><Artwork src="/images/last-train.webp" alt="Original artwork for The Last Train North" fill sizes="(max-width: 767px) 45vw, 25vw"/></div><div className="welcome-film welcome-film-front"><Artwork src="/images/quiet-beyond.webp" alt="Original artwork for The Quiet Beyond" fill sizes="(max-width: 767px) 50vw, 28vw"/></div><span className="welcome-film-note">THE FLURZI CINEMA PREVIEW COLLECTION</span></div></section></ViewerFrame></RequireAuth>;
}

function SubscriptionContent(){
 const {auth,subscriptionService}=useSession();
 const [plans,setPlans]=useState<SubscriptionPlan[]>([]);const [selected,setSelected]=useState("");const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [saved,setSaved]=useState(false);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let current=true;
  Promise.all([subscriptionService.listPlans(),subscriptionService.getSubscription()]).then(([available,subscription])=>{
   if(!current)return;
   setPlans(available.filter(p=>p.isActive));setSelected(subscription?.planId||"");setSaved(false);setError("");setLoading(false);
  }).catch(e=>{if(current){setError(toServiceError(e).message);setLoading(false);}});
  return()=>{current=false;};
 },[subscriptionService,attempt]);
 async function choose(){
  if(!selected||busy)return;setBusy(true);setError("");
  try{const updated=await subscriptionService.changePlan(selected);const entitlement=await subscriptionService.getEntitlement();setSaved(true);if(!canPreviewProfiles(auth.isMock,updated,entitlement))setError("Your subscription is not active. Activation must be confirmed by account services before you can continue.");}catch(e){setError(toServiceError(e).message);}finally{setBusy(false);}
 }
 return <ViewerFrame action={<SignOutButton/>}><section className="subscribe-stage"><div className="entry-section-heading"><span className="entry-overline">YOUR VIEWING EXPERIENCE</span><h1>Your cinema.<br/>Your choice.</h1><p>{auth.isMock?"Compare the proposed viewing options. Save a preference to continue the demo.":"Choose an available plan to continue setting up your account."}</p></div>
 {auth.isMock&&<p className="subscription-disclosure">Plan preview · Prices and final capabilities are unannounced. No payment is taken and no streaming entitlement is issued.</p>}
 {loading?<EntryLoading message="Loading viewing options…"/>:plans.length?<fieldset className="entry-plan-grid"><legend className="sr-only">Choose a viewing plan</legend>{plans.map(plan=><label key={plan.id} className={"entry-plan "+(selected===plan.id?"selected":"")}><input type="radio" name="plan" value={plan.id} checked={selected===plan.id} onChange={()=>{setSelected(plan.id);setSaved(false);setError("");}} disabled={busy}/><span className="entry-plan-top"><span>{plan.name.replace(/\s*\(mock\)/g,"")}</span><span className="entry-radio-mark" aria-hidden="true"/></span><strong>{auth.isMock||plan.monthlyPriceMinor===undefined||!plan.currency?"Pricing to be announced":new Intl.NumberFormat(undefined,{style:"currency",currency:plan.currency}).format(plan.monthlyPriceMinor/100)}<small>{!auth.isMock&&plan.monthlyPriceMinor!==undefined&&plan.currency?"per month":"Final details to follow"}</small></strong><span className="entry-plan-rule"/>{Object.entries(plan.capabilities).map(([label,value])=><span className="entry-plan-capability" key={label}><span>{label}</span><b>{value.replace(/\s*\(mock\)/g,"")}{auth.isMock?" · preview":""}</b></span>)}<span className="entry-plan-bottom">{selected===plan.id?"Selected":"Select this option"}</span></label>)}</fieldset>:!error&&<Feedback>There are no plans to choose from yet. Please check back when viewing options are announced.</Feedback>}
 {error&&<Feedback error>{error}</Feedback>}
 {saved&&!error?<div className="subscription-next"><Feedback>{auth.isMock?"Your demo preference is saved for this session. You have not purchased a membership or gained playback access.":"Your viewing option has been confirmed by account services."}</Feedback><Link className="entry-button" href="/profiles">Continue to profiles</Link></div>:<div className="subscription-actions"><button className="entry-button" disabled={busy||loading||!selected} onClick={choose} aria-busy={busy}>{busy?"Saving…":auth.isMock?"Save preview preference":"Continue with this plan"}</button>{error&&<button className="entry-text-button" onClick={()=>{setLoading(true);setError("");setAttempt(n=>n+1);}}>Reload viewing options</button>}<Link href="/welcome" className="entry-text-button">Back to setup</Link></div>}
 <p className="entry-hint subscription-note">Questions about the preview? <Link href="/help">Visit the help center.</Link></p></section></ViewerFrame>;
}
export function SubscribeScreen(){return <RequireAuth><SubscriptionContent/></RequireAuth>;}
