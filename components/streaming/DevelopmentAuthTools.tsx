"use client";
import Link from 'next/link';
export function DevelopmentAuthTools({kind,busy,onFill,onVerification}:{kind:'fill'|'reset'|'verify';busy?:boolean;onFill?:(email:string,password:string)=>void;onVerification?:()=>void}){
 if(kind==='fill')return <button type="button" className="entry-text-button" disabled={busy} onClick={()=>onFill?.('demo@flurzi.example','preview-only')}>Fill test credentials</button>;
 return <Link className="entry-text-button" href={kind==='reset'?'/reset-password?token=mock-reset':'/verify-email?token=mock-verification'} onClick={onVerification}>{kind==='reset'?'Open test reset link':'Open test verification link'}</Link>;
}
