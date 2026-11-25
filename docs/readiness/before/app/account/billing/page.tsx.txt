import type {Metadata} from "next";
import {AccountBilling} from "@/components/streaming/AccountBilling";
export const metadata:Metadata={title:"Membership & billing — Flurzi Cinema",robots:{index:false,follow:false}};
export default function Page(){return <AccountBilling/>;}
