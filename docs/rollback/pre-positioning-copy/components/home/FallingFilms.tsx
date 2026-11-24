"use client";
import Link from "next/link";
import {Artwork} from "@/components/ui/Artwork";
import {useMovieCatalog} from "@/lib/CinemaCatalog";
import type {Movie} from "@/types/cinema";
export function FallingFilms({onMovie}:{onMovie:(movie:Movie)=>void}){
 const movies=useMovieCatalog();
 return <section className="falling-films" aria-labelledby="falling-title">
  <div className="film-fall-stage">
   <div className="fall-top"><span>AN OPENING SCENE.</span><span>FOLLOW THE FRAMES ↓</span></div>
   <h2 id="falling-title">Let yourself<br/>fall into a story.</h2>
   <div className="fall-cards">{movies.map((movie,i)=><button key={movie.id} className={"fall-card fall-card-"+i} aria-label={"Open falling frame: "+movie.title} onClick={()=>onMovie(movie)}><span className="fall-card-image"><Artwork src={movie.poster} alt={movie.title} fill sizes="(max-width: 700px) 42vw, 18vw"/></span><span className="fall-card-caption"><strong>{movie.title}</strong><small>{movie.releaseYear} / {movie.format}</small></span><span className="fall-card-index">{String(i+1).padStart(2,"0")}</span></button>)}</div>
   <div className="fall-floor"><span>EVERY FRAME IS A WAY IN.</span><Link href="#explore">Find your next story ↗</Link></div>
  </div>
 </section>;
}
