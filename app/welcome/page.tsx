import type {Metadata} from "next";
import {Suspense} from "react";
import {WelcomeScreen} from "@/components/streaming/OnboardingScreens";
import {EntryLoading} from "@/components/streaming/EntryUI";
export const metadata: Metadata = { title: "Welcome — Flurzi Cinema", robots: { index: false, follow: false } };

export default function Page(){return <Suspense fallback={<div className="entry-app"><EntryLoading/></div>}><WelcomeScreen/></Suspense>;}
