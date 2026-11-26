import {Artwork} from "./Artwork";

/** The complete official composition is deliberately never used as a nav icon. */
export function OfficialBrandArt() {
  return <figure className="official-brand-art">
    <Artwork src="/brand/flurzi-cinema-official.jpg" width={1254} height={1254}
      sizes="(max-width: 700px) 90vw, 520px"
      alt="Official Flurzi Cinema artwork: a metallic gold F wrapped in film, above the FLURZI CINEMA wordmark in a dark theatre."/>
    <figcaption>Flurzi Cinema. Every story deserves its moment.</figcaption>
  </figure>;
}
