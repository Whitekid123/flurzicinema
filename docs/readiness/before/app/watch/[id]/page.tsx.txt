import type {Metadata} from "next";
import {Suspense} from "react";
import {WatchScreen} from "@/components/streaming/WatchScreen";
export const metadata:Metadata={title:"Watch — Flurzi Cinema",robots:{index:false,follow:false}};
export default async function WatchPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 return <Suspense fallback={<p role="status">Preparing player…</p>}><WatchScreen id={id}/></Suspense>;
}
