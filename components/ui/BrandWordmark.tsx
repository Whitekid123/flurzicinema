import Image from "next/image";

/** The supplied film-strip F forms the first letter; never prepend it to FLURZI. */
export function BrandWordmark({className="",compact=false}:{className?:string;compact?:boolean}) {
  return <span className={"flurzi-wordmark "+(compact?"is-compact ":"")+className} role="img" aria-label="Flurzi Cinema">
    <Image className="flurzi-symbol" src="/brand/flurzi-f-symbol.webp" alt="" width={176} height={192} loading="eager" unoptimized />
    {!compact && <span className="flurzi-name" aria-hidden="true"><strong>LURZI</strong><span>CINEMA</span></span>}
  </span>;
}
