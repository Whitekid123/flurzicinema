import type {Metadata} from "next";
import {AccountDetails} from "@/components/streaming/AccountScreens";
export const metadata:Metadata={title:"Account details — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountDetails/>;}
