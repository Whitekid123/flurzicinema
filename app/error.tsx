"use client";
import Link from "next/link";
import { PublicShell } from "@/components/public/PublicShell";
import "@/styles/public.css";
export default function ErrorPage({reset}:{reset:()=>void}){return <PublicShell><section className="public-section wrap public-prose"><p className="eyebrow">A BRIEF INTERMISSION</p><h1>The stories couldn’t load.</h1><p>The catalog connection is temporarily unavailable.</p><div className="public-actions"><button className="button" onClick={reset}>Try again</button><Link className="button button-outline" href="/help">Visit Help</Link></div></section></PublicShell>}
