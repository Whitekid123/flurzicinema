import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import type { Movie } from "@/types/cinema";
export function EditorialSpotlight({movie,onMovie}:{movie:Movie;onMovie:(movie:Movie)=>void}){
 return <section id="series" className="editorial-spotlight" aria-labelledby="spotlight-heading">
  <div className="spotlight-copy"><p className="editorial-kicker">03 / IN THE SPOTLIGHT</p><h2 id="spotlight-heading" data-editorial-lines>Stories<br/>that stay<br/>with you.</h2><p>New worlds. Different perspectives.<br/>The feeling that follows you home.</p><button className="editorial-button inverse" onClick={()=>onMovie(movie)}><span data-editorial-hover>Discover {movie.title}</span><span>↗</span></button><span className="editorial-note">{movie.availability}</span></div>
  <div className="spotlight-image"><Artwork src={movie.backdrop} alt={movie.title} fill sizes="(max-width: 800px) 100vw, 50vw"/><span className="spotlight-number">01—</span><div className="spotlight-film"><strong>{movie.title}</strong><span>{movie.releaseYear} / {movie.genre} / {movie.format}</span></div><span className="spotlight-sticker">A DIFFERENT<br/>POINT OF VIEW ↗</span></div>
 </section>;
}
export function EditorialFinale({movie}:{movie:Movie}){
 return <section id="membership" className="editorial-finale">
  <div className="finale-top"><span className="editorial-kicker">MAKE ROOM FOR CINEMA.</span><Link href="/pricing" className="editorial-link">Membership preview ↗</Link></div>
  <h2 data-editorial-lines>Your next<br/>great story.</h2>
  <div className="finale-bottom"><p>Discover the films. Follow the feeling.<br/>Go beyond watching.</p><Link href="/explore" className="editorial-button"><span data-editorial-hover>Enter Flurzi Cinema</span><span>↗</span></Link><span className="editorial-note">Plans & availability to be announced.</span></div>
  <div className="finale-wordmark" aria-hidden="true">flurz<span className="finale-letter">i<span className="finale-window"><span className="finale-reveal-art"><Artwork src={movie.backdrop} alt="" fill sizes="(max-width:600px) 35vw, 20vw"/></span><span className="finale-door"><span>f.</span></span></span></span><span className="finale-reg">®</span></div>
 </section>;
}
