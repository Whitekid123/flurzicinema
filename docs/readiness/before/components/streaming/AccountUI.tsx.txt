"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useState,type ReactNode,type DependencyList} from "react";
import {useSession} from "@/lib/state/SessionContext";
import {accountLinks,accountNavActive,accountError,deadline} from "@/lib/account-centre";
import {Modal} from "@/components/ui/Modal";
import {EntryLoading,Feedback} from "./EntryUI";
import "./account.css";

export function AccountShell({children}:{children:ReactNode}){
 const path=usePathname();const {auth,profile}=useSession();
 return <div className="account-centre"><div className="account-masthead"><Link href="/browse" className="account-back">← Back to cinema</Link><span>YOUR FLURZI CINEMA</span></div><div className="account-layout"><aside className="account-sidebar"><p className="account-wordmark">Your account<span>.</span></p><nav aria-label="Account navigation">{accountLinks.map(([label,href],i)=><Link key={href} href={href} aria-current={accountNavActive(path,href)?"page":undefined}><span className="account-nav-number" aria-hidden="true">0{i+1}</span>{label}<span aria-hidden="true">↗</span></Link>)}</nav><p className="account-sidebar-note">A space for your account.<br/>A profile for your kind of cinema.</p></aside><div className="account-content" key={auth.account?.id+"|"+profile?.id+"|"+path}>{children}</div></div><footer className="account-footer"><span>Flurzi Cinema · Account centre</span><Link href="/help">Need a hand? Visit Help ↗</Link></footer></div>;
}
export function AccountHeading({eyebrow,title,children}:{eyebrow:string;title:string;children:ReactNode}){return <header className="account-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{children}</p></header>;}
export function SettingsSection({title,description,children,mark}:{title:string;description?:string;children:ReactNode;mark?:string}){return <section className="account-section"><div className="account-section-heading">{mark&&<span className="account-section-mark" aria-hidden="true">{mark}</span>}<div><h2>{title}</h2>{description&&<p>{description}</p>}</div></div>{children}</section>;}
export function AccountDetailRow({label,value,children}:{label:string;value:ReactNode;children?:ReactNode}){return <div className="account-detail-row"><div><span>{label}</span><div className="account-detail-value">{value}</div></div>{children}</div>;}
export function Unavailable({title,children}:{title:string;children:ReactNode}){return <div className="account-unavailable"><span aria-hidden="true">○</span><div><h3>{title}</h3><p>{children}</p></div></div>;}
export function AccountFailure({error,retry}:{error:unknown;retry:()=>void}){const {refresh}=useSession();const state=accountError(error);return <div className="account-failure"><Feedback error>{state.message}</Feedback>{state.signIn?<button className="entry-button secondary" onClick={()=>void refresh()}>Check session & sign in</button>:<button className="entry-button secondary" onClick={retry}>Try again</button>}</div>;}
export function ResourceView<T>({resource,children}:{resource:Resource<T>;children:(value:T)=>ReactNode}){if(resource.loading)return <EntryLoading message="Getting your account information…"/>;if(resource.error)return <AccountFailure error={resource.error} retry={resource.retry}/>;if(resource.data===undefined)return null;return <>{children(resource.data)}</>;}
export type Resource<T>={data:T|undefined;loading:boolean;error:unknown;retry:()=>void;replace:(data:T)=>void};
export function useAccountResource<T>(load:()=>Promise<T>,deps:DependencyList):Resource<T>{
 const [state,setState]=useState<{data?:T;loading:boolean;error?:unknown}>({loading:true});const [revision,setRevision]=useState(0);
 useEffect(()=>{let current=true;deadline(Promise.resolve().then(load)).then(data=>{if(current)setState({data,loading:false});},error=>{if(current)setState({error,loading:false});});return()=>{current=false;};
 // Callers supply service identity and every query input; inline loaders are intentional.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[...deps,revision]);
 return {...state,data:state.data,error:state.error,retry:()=>{setState({loading:true});setRevision(n=>n+1);},replace:data=>setState({data,loading:false})};
}
export function ConfirmationDialog({title,description,confirm,onConfirm,onClose,busy,error}:{title:string;description:string;confirm:string;onConfirm:()=>void;onClose:()=>void;busy:boolean;error?:unknown}){
 return <Modal title={title} onClose={()=>{if(!busy)onClose();}}><div className="account-confirm"><span className="entry-overline">YOUR ACCOUNT</span><h2>{title}</h2><p>{description}</p>{Boolean(error)&&<Feedback error>{accountError(error).message}</Feedback>}<div className="account-actions"><button type="button" className="entry-button" disabled={busy} onClick={onConfirm}>{busy?"Please wait…":confirm}</button><button type="button" className="entry-button secondary" disabled={busy} onClick={onClose}>Keep things as they are</button></div></div></Modal>;
}
export function AccountSignOut(){
 const {signOut,auth}=useSession();const router=useRouter();const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<unknown>();
 return <><button type="button" className="entry-button secondary" onClick={()=>{setError(undefined);setOpen(true);}}>Sign out of this session</button>{open&&<ConfirmationDialog title="Ready to sign out?" description={auth.isMock?"You’ll leave this development session. No other devices are affected.":"You’ll sign out of this browser session. Other devices are not affected."} confirm="Sign out" onClose={()=>setOpen(false)} busy={busy} error={error} onConfirm={async()=>{if(busy)return;setBusy(true);try{await deadline(signOut());router.replace("/login");}catch(e){setError(e);setBusy(false);}}}/>}</>;
}
