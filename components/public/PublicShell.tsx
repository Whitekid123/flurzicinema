"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
gsap.registerPlugin(ScrollTrigger);
function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-public-reveal]").forEach(el => gsap.from(el, { y: 26, autoAlpha: 0, duration: 0.75, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 96%", toggleActions: "play none none reverse" } }));
      });
      mm.add("(min-width:1024px) and (prefers-reduced-motion:no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-art-drift]").forEach(el => gsap.fromTo(el, { yPercent: -3 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.25 } }));
      });
    }, root);
    let mounted=true;
    document.fonts.ready.then(()=>{if(mounted)ScrollTrigger.refresh()});
    return () => { mounted=false; mm.revert(); ctx.revert(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
export function PublicShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="public-site"><Header /><main id="main"><Motion key={path}>{children}</Motion></main><Footer /></div>;
}
