
"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Brand} from "@/components/layout/Header";
import {useSession} from "@/lib/state/SessionContext";
import {ProfileAvatar} from "./EntryUI";
const links:[string,string][]=[["Home","/browse"],["Movies","/browse/movies"],["Series","/browse/series"],["Search","/browse/search"],["My List","/browse/my-list"],["Account","/account"]];
export function StreamingShell({children}:{children:React.ReactNode}){
 const pathname=usePathname();const {auth,profile}=useSession();
 return <div className="streaming-app entry-app viewer-streaming"><header className="header"><Link href="/browse" aria-label="Flurzi Cinema home"><Brand/></Link><nav className="desktop-nav" aria-label="Streaming navigation">{links.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href||(href!=="/browse"&&pathname.startsWith(href+"/"))?"page":undefined}>{label}</Link>)}</nav><Link className="streaming-profile" href="/profiles" aria-label={profile?"Switch profile: "+profile.name:"Choose profile"}>{profile&&<ProfileAvatar avatarKey={profile.avatarKey}/>}<span>{profile?.name||"Choose profile"}</span></Link></header><main id="main" style={{paddingTop:"88px"}}>{auth.isMock&&<p className="streaming-preview-note">Development preview · No real session, subscription or streaming access. The movie dashboard and player are outside this milestone.</p>}{children}</main></div>;
}
