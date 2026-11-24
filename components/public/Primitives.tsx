import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import { titleHref } from "@/data/catalog";
import type { PublicTitle } from "@/types/public";
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="public-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link>{items.map((item, i) => <span key={i}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
export function PageIntro({ eyebrow, title, emphasis, description }: { eyebrow: string; title: string; emphasis?: string; description: string }) {
  return <div className="public-intro" data-public-reveal><p className="eyebrow">{eyebrow}</p><h1>{title}{emphasis && <><br /><span className="muted-serif">{emphasis}</span></>}</h1><p className="public-lead">{description}</p></div>;
}
export function FilmMetadata({ title }: { title: PublicTitle }) {
  return <p className="public-meta">{title.releaseYear || "Year unannounced"}<span>·</span>{title.genre}<span>·</span>{title.seasons ? `${title.seasons.length} seasons` : title.runtime}</p>;
}
export function TitleCard({ title, landscape = false }: { title: PublicTitle; landscape?: boolean }) {
  return <article className={`public-title-card ${landscape ? "is-landscape" : ""}`}><Link className="public-card-art" href={titleHref(title)} aria-label={`Discover ${title.title}`}><Artwork src={title.poster} alt={`Artwork for ${title.title}`} fill sizes="(max-width:600px) 90vw,(max-width:1000px) 45vw,30vw" /><span className="public-card-shade" /><span className="public-card-label">{title.format === "Series" ? `${title.seasons?.length ?? "Unannounced"} SEASONS` : "FILM"} · {title.contentSource === "fictional-demo" ? "DEMO" : "CATALOG PREVIEW"}</span><span className="public-card-name" aria-hidden="true">{title.title}</span><span className="public-card-open" aria-hidden="true">Discover the story +</span></Link><div className="public-card-caption"><div><h3><Link href={titleHref(title)}>{title.title}</Link></h3><p>{title.releaseYear || "Year unannounced"} · {title.genres[0] || "Unclassified"} · {title.seasons ? `${title.seasons.reduce((n, s) => n + s.episodes.length, 0)} episodes` : title.runtime}</p></div></div></article>;
}
export function StoryShelf({ eyebrow, title, titles, href }: { eyebrow: string; title: string; titles: PublicTitle[]; href?: string }) {
  return <section className="public-section wrap"><div className="public-section-heading" data-public-reveal><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{href && <Link className="text-link" href={href}>Explore the collection</Link>}</div>{titles.length ? <div className="public-shelf">{titles.map(t => <TitleCard key={t.id} title={t} />)}</div> : <p className="public-empty">More stories will appear when the approved catalog is connected.</p>}</section>;
}
export function CinemaSpotlight({ title, eyebrow, heading }: { title: PublicTitle; eyebrow: string; heading?: string }) {
  return <section className="public-spotlight"><div className="public-spotlight-image" data-art-drift><Artwork src={title.backdrop} alt={`Artwork for ${title.title}`} fill sizes="100vw" priority /></div><div className="public-spotlight-shade" /><div className="public-spotlight-copy wrap" data-public-reveal><p className="eyebrow">{eyebrow}</p><h2>{heading || title.title}</h2><p>{title.synopsis}</p><FilmMetadata title={title} /><Link className="button" href={titleHref(title)}>Discover the story</Link><span className="public-small">{title.availability}</span></div></section>;
}
export function PublicInvitation() {
  return <section className="public-invitation wrap" data-public-reveal><p className="eyebrow">BEYOND WATCHING</p><h2>Make room for<br /><span className="muted-serif">your next story.</span></h2><p>A considered cinema experience, still taking shape.</p><Link className="button" href="/get-started">Explore what comes next</Link></section>;
}
export function DemoNotice() { return <p className="public-demo-notice">Public concept preview. Demonstration collections are editorial examples, not streaming charts. Playback availability is unannounced.</p>; }
