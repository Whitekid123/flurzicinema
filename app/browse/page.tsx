import type {Metadata} from "next";
import {BrowseHome} from "@/components/streaming/BrowseHome";
export const metadata:Metadata={title:"Browse — Flurzi Cinema",robots:{index:false,follow:false}};
export default function BrowseHomePage(){return <BrowseHome/>;}
