import type {Metadata} from "next";
import {Suspense} from "react";
import {CatalogScreen} from "@/components/streaming/CatalogScreens";
import {CatalogSkeleton} from "@/components/streaming/DiscoveryUI";
export const metadata:Metadata={title:"Search — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={<CatalogSkeleton/>}><CatalogScreen kind="search"/></Suspense>;}
