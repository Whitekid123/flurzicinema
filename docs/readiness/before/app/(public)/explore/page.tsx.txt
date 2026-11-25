import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import { getPublicTitles } from "@/lib/catalog/provider";
import { PageIntro, Breadcrumbs, StoryShelf, DemoNotice, PublicInvitation } from "@/components/public/Primitives";
import { CatalogExplorer } from "@/components/public/CatalogExplorer";
export const metadata = { title: "Explore stories · Flurzi Cinema" };
export default async function Page() {
 const titles=await getPublicTitles();
 const collections=[...new Set(titles.map(t=>t.collection).filter(Boolean))].slice(0,2).map(name=>({name,copy:"A considered selection of stories.",title:titles.find(t=>t.collection===name)}));
 return <><div className="wrap"><Breadcrumbs items={[{label:"Explore"}]} /><PageIntro eyebrow="THE ART OF FINDING SOMETHING" title="Follow your curiosity." emphasis="Find your story." description="A world of stories, carefully framed. Begin with a feeling, take an unexpected turn, and discover something that stays." /><div className="public-collection-grid">{collections.filter(c=>c.title).map(c=><Link className="public-collection" href={`/explore?collection=${encodeURIComponent(c.name)}#catalog`} key={c.name}><Artwork src={c.title!.backdrop} alt={`Collection featuring ${c.title!.title}`} fill sizes="(max-width:650px) 90vw,60vw" /><span className="public-card-shade"/><div><p className="eyebrow">CURATED COLLECTION · DEMO</p><h3>{c.name}</h3><p>{c.copy}</p></div></Link>)}</div><nav className="public-genre-links" aria-label="Discover by genre">{[...new Set(titles.flatMap(t=>t.genres))].sort().map(g=><Link href={`/movies?genre=${encodeURIComponent(g)}#catalog`} key={g}>{g}</Link>)}</nav><DemoNotice /></div><StoryShelf eyebrow="IN THE SPOTLIGHT · EDITORIAL DEMO" title="Worth a closer look." titles={titles.filter(t=>t.featured).slice(0,3)} /><div className="wrap public-section-heading"><div><p className="eyebrow">YOUR NEXT DISCOVERY</p><h2>Explore every story.</h2></div></div><CatalogExplorer titles={titles} /><StoryShelf eyebrow="RECENTLY ADDED TO THE DEMO" title="A fresh perspective." titles={[...titles].sort((a,b)=>b.addedAt.localeCompare(a.addedAt)).slice(0,3)} /><PublicInvitation /></>;
}
