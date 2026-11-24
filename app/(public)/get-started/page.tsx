import { EntryPage } from "@/components/public/EntryPage";
import { getPublicTitles } from "@/lib/catalog/provider";
export const metadata={title:"Get Started · Public preview · Flurzi Cinema"};
export default async function Page(){return <EntryPage title={(await getPublicTitles())[0]}/>}
