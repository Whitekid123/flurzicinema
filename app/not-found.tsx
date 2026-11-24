import Link from "next/link";
import { PublicShell } from "@/components/public/PublicShell";
import "@/styles/public.css";
export default function NotFound(){return <PublicShell><section className="public-section wrap public-prose"><p className="eyebrow">AN UNEXPECTED DETOUR</p><h1>This scene is missing.</h1><p>The page you’re looking for isn’t part of the public website.</p><div className="public-actions"><Link className="button" href="/explore">Explore the stories</Link><Link className="button button-outline" href="/">Return home</Link></div></section></PublicShell>}
