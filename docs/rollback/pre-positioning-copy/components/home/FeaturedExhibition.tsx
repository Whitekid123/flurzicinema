"use client";
import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import { useMovieCatalog } from "@/lib/CinemaCatalog";
import type { Movie } from "@/types/cinema";
export function FeaturedExhibition({onMovie}:{onMovie:(movie:Movie)=>void}){
 const movies=useMovieCatalog();
 const genres=[...new Set(movies.flatMap(m=>m.genre.split(" / ")))].slice(0,3);
 return <section id="explore" className="discovery-composition" aria-labelledby="discovery-heading">
  <div className="discovery-stage">
   <div className="discovery-topline"><span>01 / DISCOVER</span><span>LESS SCROLLING. MORE FEELING.</span></div>
   <h2 id="discovery-heading" className="discovery-title"><span>Find your</span><span>next story.</span></h2>
   <p className="discovery-intro">Follow a feeling.<br/>See where it takes you.</p>
   <div className="floating-labels" aria-label="Explore genres">{genres.map((genre,i)=><Link className={"floating-label label-"+i} key={genre} href={"/explore?genre="+encodeURIComponent(genre)}>{genre}<span>↗</span></Link>)}</div>
   <div className="mosaic-interface">
    <div className="mosaic-browser-bar"><span className="browser-mark">f.</span><span>Your next obsession.</span><Link href="/explore">OPEN COLLECTION ↗</Link></div>
    <div className="mosaic-cards">{movies.map((movie,i)=><button className={"mosaic-card mosaic-card-"+i} key={movie.id} onClick={()=>onMovie(movie)} aria-label={"Discover "+movie.title}><span className="mosaic-image"><Artwork src={movie.backdrop} alt={movie.title} fill sizes="(max-width: 700px) 90vw, 35vw"/></span><span className="mosaic-caption"><strong>{movie.title}</strong><small>{movie.releaseYear} / {movie.genre}</small><span aria-hidden="true">↗</span></span></button>)}</div>
    <div className="mosaic-browser-bottom"><span>{String(movies.length).padStart(2,"0")} STORIES IN THIS PREVIEW</span><Link href="/explore">VIEW ALL ↗</Link></div>
   </div>
   <div className="discovery-end"><p>Different worlds.<br/>One place to find them.</p><Link className="editorial-link" href="/explore">Explore the collection <span>↗</span></Link></div>
  </div>
 </section>;
}
