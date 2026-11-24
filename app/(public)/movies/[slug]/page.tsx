import { notFound } from "next/navigation";
import { getPublicTitles, staticTitleParams } from "@/lib/catalog/provider";
import { TitleDetails } from "@/components/public/TitleDetails";
export function generateStaticParams(){return staticTitleParams("Film")}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const t=(await getPublicTitles()).find(t=>t.slug===slug&&t.format==="Film");return{title:t?`${t.title} · Flurzi Cinema`:"Story not found · Flurzi Cinema"}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const titles=await getPublicTitles();const title=titles.find(t=>t.slug===slug&&t.format==="Film");if(!title)notFound();return <TitleDetails title={title} related={titles.filter(t=>t.id!==title.id&&t.format==="Film"&&t.genres.some(g=>title.genres.includes(g))).slice(0,3)}/>}
