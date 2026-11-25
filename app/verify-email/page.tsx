import type {Metadata} from "next";
import {Suspense} from "react";
import {VerificationScreen} from "@/components/streaming/AuthScreens";
import {EntryLoading} from "@/components/streaming/EntryUI";
export const metadata: Metadata = { title: "Verify email — Flurzi Cinema", robots: { index: false, follow: false } };

export default function Page(){return <Suspense fallback={<div className="entry-app"><EntryLoading/></div>}><VerificationScreen/></Suspense>;}
