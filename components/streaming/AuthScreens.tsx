
"use client";
import {DevelopmentAuthTools} from "./DevelopmentAuthTools";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {useSession} from "@/lib/state/SessionContext";
import {mockMode} from "@/lib/api/client";
import {authenticationError} from '@/lib/api/customer-errors';
import {serviceDeadline} from '@/lib/api/deadline';
import {toServiceError} from "@/lib/api/errors";
import {nextEntry,passwordIssue,validEmail} from "@/lib/entry-flow";
import {AuthFrame,Field,PasswordField,Submit,PreviewNotice,Feedback} from "./EntryUI";

export function CredentialsScreen({signup=false}:{signup?:boolean}){
 const {auth,authService,subscriptionService,refresh}=useSession();
 const router=useRouter();
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [accepted,setAccepted]=useState(false);
 const [busy,setBusy]=useState(false);const [errors,setErrors]=useState<Record<string,string>>({});const [error,setError]=useState("");
 useEffect(()=>{
  if(busy)return;
  let active=true;
  if(auth.status==="authenticated"&&auth.user&&auth.account&&auth.session){
   void nextEntry({user:auth.user,account:auth.account,session:auth.session},subscriptionService).then(path=>{if(active)router.replace(path);}).catch(e=>{if(active)setError(authenticationError(e));});
  }else if(auth.status==="email-verification-required")router.replace("/verify-email");
  return()=>{active=false;};
 },[auth,subscriptionService,router,busy]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const invalid:Record<string,string>={};
  if(!validEmail(email))invalid.email="Enter a valid email address.";
  if(signup?Boolean(passwordIssue(password)):!password)invalid.password=signup?passwordIssue(password):"Enter your password.";
  if(signup&&!accepted)invalid.legal="Please accept the Terms and Privacy notice.";
  setErrors(invalid);setError("");
  if(Object.keys(invalid).length){document.getElementById(Object.keys(invalid)[0])?.focus();return;}
  setBusy(true);
  try{
   const result=await serviceDeadline(signup?authService.register({email:email.trim(),password}):authService.login({email:email.trim(),password}));
   setPassword("");await refresh();router.replace(await nextEntry(result,subscriptionService,signup));
  }catch(e){setError(authenticationError(e));setPassword("");}
  finally{setBusy(false);}
 }
 return <AuthFrame scene={signup?"train":"quiet"} title={signup?"Your cinema.\nYour kind of night.":"A good night.\nA great movie."}>
  <span className="entry-overline">YOUR FLURZI CINEMA ACCOUNT</span>
  <h1>{signup?<>Make yourself<br/>at home.</>:<>Welcome<br/>back.</>}</h1>
  <p className="entry-intro">{signup?"Create an account for your movies, series and personal viewing experience.":"Sign in to pick up your Flurzi Cinema experience."}</p>
  <PreviewNotice/>
  <form className="entry-form" noValidate onSubmit={submit} aria-busy={busy}>
   {error&&<Feedback error>{error}</Feedback>}
   <Field id="email" label="Email address" type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} disabled={busy} required maxLength={254}/>
   <PasswordField id="password" autoComplete={signup?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} error={errors.password} hint={signup?"At least 8 characters.":undefined} disabled={busy} required maxLength={128}/>
   {signup?<div><label className="entry-check"><input id="legal" type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} disabled={busy} aria-invalid={Boolean(errors.legal)} aria-describedby={errors.legal?"legal-error":undefined}/><span>I’ve read the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy notice</Link>.</span></label>{errors.legal&&<p className="entry-field-error" id="legal-error">{errors.legal}</p>}</div>:<div className="entry-form-tools">{process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&mockMode&&<DevelopmentAuthTools kind="fill" busy={busy} onFill={(email,password)=>{setEmail(email);setPassword(password);setErrors({});}}/>}<Link href="/forgot-password">Forgot password?</Link></div>}
   <Submit busy={busy}>{signup?"Create account":"Sign in"}</Submit>
  </form>
  <p className="entry-switch">{signup?"Already have an account?":"New to Flurzi Cinema?"} <Link href={signup?"/login":"/signup"}>{signup?"Sign in":"Create an account"}</Link></p>
 </AuthFrame>;
}

export function RecoveryScreen({reset=false}:{reset?:boolean}){
 const {authService,refresh}=useSession();const params=useSearchParams();const token=params.get("token")||"";
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);const [status,setStatus]=useState<"idle"|"done"|"invalid">("idle");
 const [errors,setErrors]=useState<Record<string,string>>({});const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  const issues:Record<string,string>={};
  if(reset){if(passwordIssue(password))issues.password=passwordIssue(password);if(confirm!==password)issues.confirm="The passwords don’t match.";}
  else if(!validEmail(email))issues.email="Enter a valid email address.";
  setErrors(issues);setError("");if(Object.keys(issues).length){document.getElementById(Object.keys(issues)[0])?.focus();return;}
  setBusy(true);
  try{
   if(reset){await serviceDeadline(authService.resetPassword({token,newPassword:password}));setPassword("");setConfirm("");await refresh();}
   else await serviceDeadline(authService.requestPasswordRecovery({email:email.trim()}));
   setStatus("done");
  }catch(err){const serviceError=toServiceError(err);if(reset&&serviceError.code==="VALIDATION"&&/link|token|expired/i.test(serviceError.message))setStatus("invalid");else setError(authenticationError(err));}
  finally{setBusy(false);}
 }
 const invalid=reset&&(!token||status==="invalid");
 const done=status==="done";
 return <AuthFrame scene="velvet" title={"Back to your\nnext movie night."}>
  <span className="entry-overline">ACCOUNT RECOVERY</span>
  <h1>{invalid?<>Let’s try<br/>a new link.</>:done?(reset?<>Password<br/>reset complete.</>:<>Request<br/>received.</>):reset?<>A fresh<br/>start.</>:<>Forgot your<br/>password?</>}</h1>
  <p className="entry-intro">{invalid?"This reset link is missing, invalid or has expired. Request a new one to continue.":done?(mockMode?(reset?"The reset interaction is complete. No password was stored or real account changed.":"No email was sent. You can use the test link below to explore the reset screen."):(reset?"You can now return to sign in.":"If an account matches this address, recovery instructions will be sent.")):reset?"Choose a new password for your Flurzi Cinema account.":"Enter your account email to request a password reset link."}</p>
  {!done&&!invalid&&<PreviewNotice/>}
  {invalid?<div className="entry-result"><Link className="entry-button" href="/forgot-password">Request a new link</Link></div>:done?<div className="entry-result"><Feedback>{mockMode?"Development demonstration only. No email delivery or security change has occurred.":reset?"Your reset request was completed.":"Check your inbox if an account exists."}</Feedback>{process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&!reset&&mockMode&&<DevelopmentAuthTools kind="reset"/>}<Link className={reset?"entry-button":"entry-text-button"} href="/login">Return to sign in</Link>{!reset&&<button type="button" className="entry-text-button" onClick={()=>{setStatus("idle");setErrors({});setError("");}}>Use a different email</button>}</div>:<form className="entry-form" noValidate onSubmit={submit} aria-busy={busy}>
   {error&&<Feedback error>{error}</Feedback>}
   {reset?<><PasswordField id="password" label="New password" autoComplete="new-password" hint="At least 8 characters." value={password} onChange={e=>setPassword(e.target.value)} error={errors.password} required disabled={busy} maxLength={128}/><PasswordField id="confirm" label="Confirm new password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} error={errors.confirm} required disabled={busy} maxLength={128}/></>:<Field id="email" label="Email address" type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} disabled={busy} required maxLength={254}/>}
   <Submit busy={busy}>{reset?"Save new password":"Request reset link"}</Submit>
  </form>}
  {!done&&<p className="entry-switch"><Link href="/login">Return to sign in</Link></p>}
 </AuthFrame>;
}

export function VerificationScreen(){
 const {auth,authService,subscriptionService,refresh,signOut}=useSession();const params=useSearchParams();const token=params.get("token")||"";
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [invalid,setInvalid]=useState(false);const [verified,setVerified]=useState(false);const [resent,setResent]=useState(false);
 const done=verified||(!token&&auth.status==="authenticated");
 async function returnToLogin(){if(busy)return;setBusy(true);setError("");try{if(auth.session)await signOut();router.replace("/login");}catch(e){setError(authenticationError(e));}finally{setBusy(false);}}
 async function verify(){if(busy)return;setBusy(true);setError("");try{await serviceDeadline(authService.verifyEmail(token));await refresh();setVerified(true);}catch(e){const issue=toServiceError(e);if(issue.code==="VALIDATION")setInvalid(true);setError(authenticationError(e));}finally{setBusy(false);}}
 async function resend(){if(busy)return;setBusy(true);setError("");try{await serviceDeadline(authService.resendVerificationEmail());setResent(true);}catch(e){setError(authenticationError(e));}finally{setBusy(false);}}
 async function proceed(){if(busy)return;setBusy(true);setError("");try{const result=await authService.getCurrentSession();if(!result){router.replace("/login");return;}router.replace(await nextEntry(result,subscriptionService,verified));}catch(e){setError(authenticationError(e));}finally{setBusy(false);}}
 return <AuthFrame scene="train" title={"Your seat\nis waiting."}><span className="entry-overline">EMAIL VERIFICATION</span>
  <div className="entry-envelope" aria-hidden="true">{done?"✓":invalid?"!":"@"}</div>
  <h1>{done?<>You’re<br/>verified.</>:invalid?<>This link<br/>needs a refresh.</>:token?<>Confirm<br/>your email.</>:<>One more<br/>small step.</>}</h1>
  <p className="entry-intro">{done?"Your next step is account setup and a profile that’s yours.":invalid?"The verification link is invalid or has expired. You can request a fresh one.":token?"Confirm your email address to continue setting up your Flurzi Cinema account.":"Open the verification link associated with your account to continue."}</p>
  <PreviewNotice/>
  <div className="entry-result">
   {error&&<Feedback error>{error}</Feedback>}
   {done?<button className="entry-button" onClick={proceed} disabled={busy} aria-busy={busy}>{busy?"Please wait…":"Continue"}</button>:<>{token&&!invalid&&<button className="entry-button" onClick={verify} disabled={busy} aria-busy={busy}>{busy?"Verifying…":"Verify email"}</button>}{resent&&<Feedback>{mockMode?"Test request received. No email was sent. Use the test verification link below.":"If eligible, a new verification email will be sent."}</Feedback>}{auth.status==="email-verification-required"&&<><button className="entry-button secondary" onClick={resend} disabled={busy}>{busy?"Please wait…":"Request a new verification link"}</button>{process.env.NEXT_PUBLIC_USE_MOCKS==="1"&&mockMode&&<DevelopmentAuthTools kind="verify" onVerification={()=>{setInvalid(false);setError("");}}/>}</>}</>}
  </div>
  <p className="entry-switch"><button type="button" className="entry-text-button" onClick={returnToLogin} disabled={busy}>Return to sign in</button></p>
 </AuthFrame>;
}
