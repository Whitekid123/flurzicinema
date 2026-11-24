import { notFound } from "next/navigation";
import { getPublicTitles, staticTitleParams } from "@/lib/catalog/provider";
import { TitleDetails } from "@/components/public/TitleDetails";
export function generateStaticParams(){return staticTitleParams("Series")}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const t=(await getPublicTitles()).find(t=>t.slug===slug&&t.format==="Series");return{title:t?`${t.title} · Flurzi Cinema`:"Series not found · Flurzi Cinema"}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const titles=await getPublicTitles();const title=titles.find(t=>t.slug===slug&&t.format==="Series");if(!title)notFound();const others=titles.filter(t=>t.id!==title.id&&t.format==="Series");return <TitleDetails title={title} related={others.length?others.slice(0,3):titles.filter(t=>t.format==="Film"&&t.genres.some(g=>title.genres.includes(g))).slice(0,3)}/>}
