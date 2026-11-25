import type {Metadata} from "next";
import {Suspense} from "react";
import {ProfilesScreen} from "@/components/streaming/ProfileScreens";
import {EntryLoading} from "@/components/streaming/EntryUI";
export const metadata: Metadata = { title: "New profile — Flurzi Cinema", robots: { index: false, follow: false } };

export default function Page(){return <Suspense fallback={<div className="entry-app"><EntryLoading/></div>}><ProfilesScreen mode="new"/></Suspense>;}
