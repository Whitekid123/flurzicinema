import type {Metadata} from "next";
import {Suspense} from "react";
import {TitleDetails} from "@/components/streaming/TitleDetails";
import {CatalogSkeleton} from "@/components/streaming/DiscoveryUI";
export const metadata:Metadata={title:"Title Details — Flurzi Cinema",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Suspense fallback={<CatalogSkeleton/>}><TitleDetails id={id}/></Suspense>;}
