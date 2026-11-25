import type {Metadata} from "next";
import {AccountDevices} from "@/components/streaming/AccountSecurity";
export const metadata:Metadata={title:"Devices — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountDevices/>;}
