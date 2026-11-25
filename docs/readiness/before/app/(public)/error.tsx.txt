"use client";
import Link from "next/link";
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="public-section wrap public-prose"><p className="eyebrow">A BRIEF INTERMISSION</p><h1>The stories couldn’t load.</h1><p>The catalog connection is temporarily unavailable. Try again in a moment.</p><div className="public-actions"><button className="button" onClick={reset}>Try again</button><Link className="button button-outline" href="/help">Visit the help center</Link></div></section>}
