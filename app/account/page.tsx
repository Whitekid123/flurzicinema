import type {Metadata} from "next";
import {AccountOverview} from "@/components/streaming/AccountScreens";
export const metadata:Metadata={title:"Account — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountOverview/>;}
