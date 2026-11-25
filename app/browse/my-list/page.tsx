import type {Metadata} from "next";
import {Suspense} from "react";
import {LibraryScreen} from "@/components/streaming/LibraryScreens";
import {CatalogSkeleton} from "@/components/streaming/DiscoveryUI";
export const metadata:Metadata={title:"My List — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={<CatalogSkeleton/>}><LibraryScreen history={false}/></Suspense>;}
