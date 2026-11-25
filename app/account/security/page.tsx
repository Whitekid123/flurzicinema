import type {Metadata} from "next";
import {AccountSecurity} from "@/components/streaming/AccountSecurity";
export const metadata:Metadata={title:"Security — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountSecurity/>;}
