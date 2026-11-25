"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Artwork } from "@/components/ui/Artwork";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";

import { HeroPointerTrail } from "./HeroPointerTrail";
import { heroArtwork } from "@/lib/heroArtwork";

export function CinemaHero({ onMovie }: { onMovie: (movie: Movie) => void }) {
  const movies = useMovieCatalog();
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const [group, setGroup] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [query, setQuery] = useState("");
  const first = useRef(true);
  const scenes=useMemo(()=>movies.flatMap(movie=>heroArtwork(movie).map(src=>({src,title:movie.title}))),[movies]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      if (!media.matches && !paused && !focused && !hovered && !document.hidden) {
        timer = setInterval(() => {
          const r = root.current?.getBoundingClientRect();
          if (r && r.bottom > 0 && r.top < innerHeight) setGroup(g => (g + 1) % movies.length);
        }, 4200);
      }
    };
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(timer); media.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, [paused, focused, hovered, movies.length]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-frame-inner", { clipPath: "inset(0% 0 0 0)", opacity: .6, scale: .92, yPercent: 8 }, { clipPath: "inset(0% 0 0 0)", opacity: 1, scale: 1, yPercent: 0, duration: .7, stagger: { amount: .3, from: "center" }, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, [group]);
  return <section ref={root} id="home" className="editorial-hero" aria-labelledby="cinema-title">
    <div className="editorial-masthead">
      <h1 id="cinema-title"><span className="hero-logotype" aria-hidden="true">flurzi<span>®</span></span><span className="hero-cinema-word" aria-hidden="true">cinema.</span><span className="sr-only">Flurzi Cinema — Movies and TV streaming.</span></h1>
      <div className="hero-statement"><p data-editorial-lines>Movies. Series.<br />Entertainment.<br />All in one place.</p><Link href="/explore" className="editorial-button"><span className="button-image"><Artwork src={movies[0].poster} alt="" fill sizes="48px" /></span><span data-editorial-hover>Find your next watch</span><span aria-hidden="true">↗</span></Link></div>
    </div>
    <div className={"hero-image-field " + (focused ? "is-searching" : "")}>
      <div className="hero-grid-label"><span>MOVIE & TV STREAMING · PLATFORM PREVIEW</span><span>DISCOVERY / 001</span></div>
      <div className="hero-frames" >
        {Array.from({length: 9}, (_, i) => {
          const movie = movies[(i + group) % movies.length];
          return <button key={i} className={"hero-frame hero-frame-" + i} aria-label={"Explore " + movie.title} onClick={() => onMovie(movie)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}>
            <span className="hero-frame-inner"><Artwork src={heroArtwork(movie)[(i + group) % heroArtwork(movie).length]} alt={movie.title} fill sizes="(max-width: 600px) 40vw, 24vw" loading={i < 6 ? "eager" : "lazy"} /><span className="frame-caption">{movie.title}<span>↗</span></span></span>
          </button>;
        })}
      </div>
      <HeroPointerTrail scenes={scenes} disabled={paused || focused || hovered} />
      <form className="hero-discovery-search" role="search" onSubmit={e => {e.preventDefault();router.push("/explore" + (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""));}}>
        <label className="sr-only" htmlFor="hero-discovery">Find a film or series</label>
        <input id="hero-discovery" placeholder="Search movies and TV series…" value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
        <button type="submit"><span data-editorial-hover>Explore</span><span aria-hidden="true">↗</span></button>
      </form>
      <div className="hero-field-bottom"><a href="#falling-title">SCROLL TO DISCOVER ↓</a><span>{movies.every(m=>m.availability.startsWith("Fictional")) ? "THE FLURZI CINEMA COLLECTION" : "THE FLURZI CINEMA COLLECTION"}</span><button className="field-pause" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused ? "Resume image sequence" : "Pause image sequence"}<span aria-hidden="true">{paused ? " ▷" : " Ⅱ"}</span></button></div>
    </div>
  </section>;
}
