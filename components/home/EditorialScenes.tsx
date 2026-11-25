import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import type { Movie } from "@/types/cinema";
export function EditorialSpotlight({movie,onMovie}:{movie:Movie;onMovie:(movie:Movie)=>void}){
 return <section id="series" className="editorial-spotlight" aria-labelledby="spotlight-heading">
  <div className="spotlight-copy"><p className="editorial-kicker">03 / IN THE SPOTLIGHT</p><h2 id="spotlight-heading" data-editorial-lines>{movie.format === "Series" ? "Series" : "Movies"}<br/>worth<br/>watching.</h2><p>{movie.format === "Series" ? "Explore the series collection." : "Find a movie for tonight."}<br/>See the synopsis and title details.</p><button className="editorial-button inverse" onClick={()=>onMovie(movie)}><span data-editorial-hover>Discover {movie.title}</span><span>↗</span></button><span className="editorial-note">{movie.availability}</span></div>
  <div className="spotlight-image"><Artwork src={movie.backdrop} alt={movie.title} fill sizes="(max-width: 800px) 100vw, 50vw"/><span className="spotlight-number">01—</span><div className="spotlight-film"><strong>{movie.title}</strong><span>{movie.releaseYear} / {movie.genre} / {movie.format}</span></div><span className="spotlight-sticker">EXPLORE THE<br/>FEATURED TITLE ↗</span></div>
 </section>;
}
export function EditorialFinale({movie}:{movie:Movie}){
 return <section id="membership" className="editorial-finale">
  <div className="finale-top"><span className="editorial-kicker">EXPLORE FLURZI CINEMA.</span><Link href="/pricing" className="editorial-link">Membership preview ↗</Link></div>
  <h2 data-editorial-lines>Your next<br/>movie night.</h2>
  <div className="finale-bottom"><p>Browse movies. Discover TV series.<br/>Find your next favorite watch.</p><Link href="/explore" className="editorial-button"><span data-editorial-hover>Explore the catalog</span><span>↗</span></Link><span className="editorial-note">Plans & availability to be announced.</span></div>
  <div className="finale-wordmark" aria-hidden="true">flurz<span className="finale-letter">i<span className="finale-window"><span className="finale-reveal-art"><Artwork src={movie.backdrop} alt="" fill sizes="(max-width:600px) 35vw, 20vw"/></span><span className="finale-door"><span>f.</span></span></span></span><span className="finale-reg">®</span></div>
 </section>;
}
