
"use client";
import Link from "next/link";
import {useCallback,useEffect,useState,type FormEvent,type ReactNode} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {useSession} from "@/lib/state/SessionContext";
import {canPreviewProfiles,avatarChoices} from "@/lib/entry-flow";
import {toServiceError} from "@/lib/api/errors";
import type {ViewerProfile,ProfilePreferences} from "@/types/streaming";
import {Modal} from "@/components/ui/Modal";
import {ViewerFrame,EntryLoading,Feedback,ProfileAvatar,LockIcon,Field,PasswordField,Submit} from "./EntryUI";
import {SignOutButton} from "./OnboardingScreens";

function ProfileSetupGate({children}:{children:ReactNode}){
 const {auth,subscriptionService}=useSession();const router=useRouter();const [ready,setReady]=useState(false);const [error,setError]=useState("");const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let current=true;
  Promise.all([subscriptionService.getSubscription(),subscriptionService.getEntitlement()]).then(([subscription,entitlement])=>{if(!current)return;if(canPreviewProfiles(auth.isMock,subscription,entitlement))setReady(true);else router.replace("/subscribe");}).catch(e=>{if(current)setError(toServiceError(e).message);});
  return()=>{current=false;};
 },[auth.isMock,subscriptionService,router,attempt]);
 if(error)return <div className="entry-gate"><Feedback error>{error}</Feedback><button className="entry-button" onClick={()=>{setError("");setAttempt(a=>a+1);}}>Try again</button></div>;
 return ready?<>{children}</>:<EntryLoading message="Checking your account setup…"/>;
}
function useProfiles(){
 const {profileService,subscriptionService}=useSession();
 const [items,setItems]=useState<ViewerProfile[]>([]);const [limit,setLimit]=useState(0);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [revision,setRevision]=useState(0);
 const reload=useCallback(()=>{setLoading(true);setError("");setRevision(n=>n+1);},[]);
 useEffect(()=>{
  let current=true;
  Promise.all([profileService.listProfiles(),subscriptionService.getEntitlement()]).then(([list,entitlement])=>{if(current){setItems(list);setLimit(entitlement.maxProfiles);setLoading(false);}}).catch(e=>{if(current){setError(toServiceError(e).message);setLoading(false);}});
  return()=>{current=false;};
 },[profileService,subscriptionService,revision]);
 return {items,limit,loading,error,reload};
}
export function ProfilesScreen({mode="choose"}:{mode?:"choose"|"new"|"manage"}){
 return <ViewerFrame action={<SignOutButton/>}><ProfileSetupGate>{mode==="new"?<ProfileEditor/>:<ProfileList manage={mode==="manage"}/>}</ProfileSetupGate></ViewerFrame>;
}
function ProfileList({manage}:{manage:boolean}){
 const {profileService,setProfile,profile:currentProfile,auth}=useSession();const router=useRouter();const params=useSearchParams();
 const {items,limit,loading,error:loadError,reload}=useProfiles();
 const [busy,setBusy]=useState("");const [error,setError]=useState("");const [pinProfile,setPinProfile]=useState<ViewerProfile|null>(null);const [pin,setPin]=useState("");const [pinError,setPinError]=useState("");const [message,setMessage]=useState("");
 const editId=manage?params.get("id"):null;const editing=items.find(p=>p.id===editId);
 const closePin=()=>{if(!busy){setPinProfile(null);setPin("");setPinError("");}};
 async function choose(profile:ViewerProfile){
  if(busy)return;
  if(profile.hasPin){setPinProfile(profile);setPin("");setPinError("");return;}
  setBusy(profile.id);setError("");try{setProfile(await profileService.selectProfile(profile.id));router.push("/browse");}catch(e){setError(toServiceError(e).message);}finally{setBusy("");}
 }
 async function unlock(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!pinProfile||busy)return;
  if(!/^\d{4}$/.test(pin)){setPinError("Enter a four-digit PIN.");document.getElementById("profile-unlock-pin")?.focus();return;}
  setBusy(pinProfile.id);setPinError("");
  try{
   if(!profileService.verifyPin){setPinError("Profile PIN verification is not available. Please try again later.");return;}
   const ok=await profileService.verifyPin(pinProfile.id,pin);
   setPin("");
   if(!ok){setPinError(process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&auth.isMock?"Incorrect test PIN. Use 1234 in this preview.":"Incorrect PIN. Please try again.");return;}
   setProfile(await profileService.selectProfile(pinProfile.id));router.push("/browse");
  }catch(e){setPinError(toServiceError(e).message);}finally{setBusy("");}
 }
 if(loading)return <EntryLoading message="Getting your profiles…"/>;
 if(loadError)return <div className="entry-gate"><Feedback error>{loadError}</Feedback><button className="entry-button" onClick={reload}>Try again</button></div>;
 if(editing)return <ProfileEditor key={editing.id} profile={editing} onSaved={()=>{setMessage("Profile saved.");router.replace("/profiles/manage");reload();}} onDeleted={()=>{if(currentProfile?.id===editing.id)setProfile(null);setMessage("Profile removed.");router.replace("/profiles/manage");reload();}}/>;
 if(editId&&!editing)return <div className="entry-gate"><Feedback error>This profile is no longer available.</Feedback><Link className="entry-button" href="/profiles/manage">Back to profiles</Link></div>;
 return <section className="profile-picker"><div className="entry-section-heading"><span className="entry-overline">YOUR FLURZI CINEMA</span><h1>{manage?"A little more you.":"Who’s watching?"}</h1><p>{manage?"Choose a profile to edit its name, avatar and viewing preferences.":"Choose a profile. Make the movie night yours."}</p></div>{message&&<Feedback>{message}</Feedback>}{error&&<Feedback error>{error}</Feedback>}
  <div className="profile-grid">{items.map(profile=><button type="button" className="profile-tile" key={profile.id} disabled={Boolean(busy)} onClick={()=>manage?router.push("/profiles/manage?id="+encodeURIComponent(profile.id)):void choose(profile)} aria-label={(manage?"Edit ":"Choose ")+profile.name} aria-busy={busy===profile.id}><span className="profile-art"><ProfileAvatar avatarKey={profile.avatarKey}/>{manage&&<span className="profile-edit-mark" aria-hidden="true">✎</span>}</span><strong>{profile.name}</strong><span className="profile-labels">{profile.isKids&&<span>Kids</span>}{profile.hasPin&&<span><LockIcon/>PIN</span>}{busy===profile.id&&<span>Opening…</span>}</span></button>)}
  {items.length<limit&&<Link href="/profiles/new" className="profile-tile profile-add"><span className="profile-art"><span aria-hidden="true">+</span></span><strong>Add profile</strong><span className="profile-labels">Make it yours</span></Link>}</div>
  {!items.length&&<p className="entry-hint">Start with a profile for yourself. You can add others later.</p>}
  <div className="profile-picker-actions"><Link href={manage?"/profiles":"/profiles/manage"} className="entry-button secondary">{manage?"Done":"Manage profiles"}</Link>{items.length>=limit&&<p className="entry-hint">{process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&auth.isMock?"Profile limit reached.":"Your account’s profile limit has been reached."}</p>}</div>
  {auth.isMock&&<p className="profile-demo-note">Development preview. Profiles and preferences last for this page session. PIN and kids settings demonstrate the interface; they do not enforce parental protection.</p>}
  {pinProfile&&<Modal title={"Open "+pinProfile.name} onClose={closePin}><div className="entry-pin-dialog"><ProfileAvatar avatarKey={pinProfile.avatarKey}/><span className="entry-overline">PROFILE PIN</span><h2>Hi, {pinProfile.name}.</h2><p>Enter this profile’s PIN to continue.</p>{auth.isMock&&<p className="entry-hint">Demo PIN: 1234. This is not a secure parental control.</p>}<form className="entry-form" onSubmit={unlock} noValidate><PasswordField id="profile-unlock-pin" label="Profile PIN" autoComplete="off" inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value)} error={pinError} disabled={Boolean(busy)}/><Submit busy={Boolean(busy)}>Open profile</Submit><button className="entry-text-button" type="button" onClick={closePin} disabled={Boolean(busy)}>Choose another profile</button></form></div></Modal>}
 </section>;
}
function ProfileEditor({profile,onSaved,onDeleted}:{profile?:ViewerProfile;onSaved?:()=>void;onDeleted?:()=>void}){
 const {profileService,profile:activeProfile,setProfile,auth}=useSession();const router=useRouter();
 const [name,setName]=useState(profile?.name||"");const [avatar,setAvatar]=useState(profile?.avatarKey||"orbit");const [kids,setKids]=useState(profile?.isKids||false);
 const [pin,setPin]=useState("");const [removePin,setRemovePin]=useState(false);
 const [language,setLanguage]=useState(profile?.preferences.language||"en");
 const [quality,setQuality]=useState<ProfilePreferences["playbackQuality"]>(profile?.preferences.playbackQuality||"auto");
 const [autoplay,setAutoplay]=useState(profile?.preferences.autoplay??true);const [reducedMotion,setReducedMotion]=useState(profile?.preferences.reducedMotion??false);
 const [maturity,setMaturity]=useState(profile?.preferences.maturityRating||"");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [errors,setErrors]=useState<Record<string,string>>({});const [deleting,setDeleting]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  const issues:Record<string,string>={};if(!name.trim()||name.trim().length>24)issues["profile-name"]="Use a name between 1 and 24 characters.";
  if(pin&&!/^\d{4}$/.test(pin))issues["profile-pin"]="Use a four-digit PIN.";
  else if(process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&auth.isMock&&pin&&pin!=="1234")issues["profile-pin"]="Use test PIN 1234 in this preview. Custom PINs are unavailable.";
  setErrors(issues);setError("");if(Object.keys(issues).length){document.getElementById(Object.keys(issues)[0])?.focus();return;}
  setBusy(true);try{
   if(profile){
    const updated=await profileService.updateProfile(profile.id,{name:name.trim(),avatarKey:avatar,isKids:kids,pin:removePin?"":pin||undefined,preferences:{...profile.preferences,language,playbackQuality:quality,autoplay,reducedMotion,maturityRating:maturity}});
    setPin("");if(activeProfile?.id===updated.id)setProfile(updated);onSaved?.();
   }else{await profileService.createProfile({name:name.trim(),avatarKey:avatar,isKids:kids,pin:pin||undefined});setPin("");router.push("/profiles");}
  }catch(e){setError(toServiceError(e).message);}finally{setBusy(false);}
 }
 async function remove(){
  if(!profile||busy)return;setBusy(true);setError("");try{await profileService.deleteProfile(profile.id);onDeleted?.();}catch(e){setError(toServiceError(e).message);setDeleting(false);}finally{setBusy(false);}
 }
 return <section className="profile-editor"><div className="entry-section-heading"><span className="entry-overline">{profile?"MANAGE PROFILE":"A PROFILE THAT’S YOURS"}</span><h1>{profile?"Make it your own.":"A face. A name. You."}</h1><p>{profile?"Fine-tune this viewer’s preferences.":"Choose an avatar and a name for your viewing profile."}</p></div>
 <form className="profile-editor-form" noValidate onSubmit={submit} aria-busy={busy}><div className="profile-preview"><ProfileAvatar avatarKey={avatar}/><strong>{name.trim()||"Your profile"}</strong><span>{kids?"Kids profile":"Viewer profile"}</span><p>One profile.<br/>Your kind of cinema.</p></div><div className="profile-editor-fields">
 {error&&<Feedback error>{error}</Feedback>}
 <Field id="profile-name" label="Profile name" autoComplete="off" placeholder="What should we call you?" maxLength={24} value={name} onChange={e=>setName(e.target.value)} error={errors["profile-name"]} disabled={busy} required/>
 <fieldset className="avatar-picker"><legend>Choose an avatar</legend><div>{avatarChoices.map(choice=><label key={choice.key}><input type="radio" name="avatar" value={choice.key} checked={(avatar==="amber"?"orbit":avatar==="teal"?"wave":avatar)===choice.key} onChange={()=>setAvatar(choice.key)} disabled={busy}/><ProfileAvatar avatarKey={choice.key}/><span className="sr-only">{choice.label}</span></label>)}</div></fieldset>
 <div className="profile-control-group"><label className="entry-check"><input type="checkbox" checked={kids} onChange={e=>{setKids(e.target.checked);if(e.target.checked)setMaturity("PG");}} disabled={busy}/><span><strong>Kids profile</strong><small>A separate space for a younger viewer.</small></span></label>{auth.isMock&&<p className="entry-hint">Same-device setting only. Parental protection is unavailable in this preview.</p>}</div>
 {profile&&<fieldset className="profile-preferences"><legend>Viewing preferences</legend><div className="entry-select-grid"><label>Language preference<select value={language} onChange={e=>setLanguage(e.target.value)} disabled={busy}>{!["en","fr","es"].includes(language)&&<option value={language}>{language}</option>}<option value="en">English</option><option value="fr">French</option><option value="es">Spanish</option></select></label><label>Playback preference<select value={quality} onChange={e=>setQuality(e.target.value as ProfilePreferences["playbackQuality"])} disabled={busy}><option value="auto">Automatic preference</option><option value="low">Data Saver</option><option value="medium">Balanced</option><option value="high">Highest available</option>{quality==="4k"&&<option value="4k">Existing quality preference</option>}</select></label></div><label className="entry-select-label">Maturity preference<select value={maturity} onChange={e=>setMaturity(e.target.value)} disabled={busy}>{!["","G","PG","PG-13","R"].includes(maturity)&&<option value={maturity}>{maturity}</option>}<option value="">Not set</option><option value="G">G</option><option value="PG">PG</option>{!kids&&<><option value="PG-13">PG-13</option><option value="R">R</option></>}</select></label>{auth.isMock&&<p className="entry-hint">These settings do not enforce age restrictions in this preview.</p>}<label className="entry-check"><input type="checkbox" checked={autoplay} onChange={e=>setAutoplay(e.target.checked)} disabled={busy}/><span>Autoplay preference</span></label><label className="entry-check"><input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)} disabled={busy}/><span>Reduce motion preference</span></label><p className="entry-hint">Available audio, captions and picture quality depend on each title and device.</p></fieldset>}
 <div className="profile-control-group"><PasswordField id="profile-pin" label={profile?.hasPin?"Change profile PIN":"Profile PIN (optional)"} autoComplete="off" inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value)} error={errors["profile-pin"]} disabled={busy||removePin} hint={process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&auth.isMock?"Use 1234 for the demo lock. The PIN is not stored; this is not secure parental protection.":profile?.hasPin?"Leave blank to keep the current PIN.":"Use four digits."}/>{profile?.hasPin&&<label className="entry-check"><input type="checkbox" checked={removePin} onChange={e=>{setRemovePin(e.target.checked);setPin("");}} disabled={busy}/><span>Remove profile PIN</span></label>}</div>
 <div className="profile-editor-actions"><Submit busy={busy}>{profile?"Save changes":"Create profile"}</Submit><Link href={profile?"/profiles/manage":"/profiles"} className="entry-button secondary" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();}}>Cancel</Link></div>
 {profile&&<button type="button" className="profile-delete-button" onClick={()=>setDeleting(true)} disabled={busy}>Delete profile</button>}
 </div></form>
 {deleting&&profile&&<Modal title="Delete profile" onClose={()=>{if(!busy)setDeleting(false);}}><div className="entry-delete-dialog"><span className="entry-overline">MANAGE PROFILE</span><h2>Remove {profile.name}?</h2><p>This will remove the profile from this account. Keep it if you’re not ready to delete it.</p><button type="button" className="entry-button" onClick={remove} disabled={busy}>{busy?"Removing…":"Delete profile"}</button><button type="button" className="entry-button secondary" onClick={()=>setDeleting(false)} disabled={busy}>Keep profile</button></div></Modal>}
 </section>;
}
