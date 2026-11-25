import type {Metadata} from "next";
import {AccountPreferences} from "@/components/streaming/AccountScreens";
export const metadata:Metadata={title:"Viewing preferences — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountPreferences/>;}
