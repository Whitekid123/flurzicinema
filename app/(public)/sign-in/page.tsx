import { EntryPage } from "@/components/public/EntryPage";
import { getPublicTitles } from "@/lib/catalog/provider";
export const metadata={title:"Sign in · Future integration · Flurzi Cinema"};
export default async function Page(){return <EntryPage signIn title={(await getPublicTitles())[0]}/>}
