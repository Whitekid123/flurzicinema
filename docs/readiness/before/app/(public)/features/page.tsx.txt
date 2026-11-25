import { getPublicTitles } from "@/lib/catalog/provider";
import { Breadcrumbs, PageIntro } from "@/components/public/Primitives";
import { FeatureShowcase } from "@/components/public/FeatureShowcase";
export const metadata={title:"The Flurzi experience · Flurzi Cinema"};
export default async function Page(){return <><div className="wrap"><Breadcrumbs items={[{label:"Features"}]}/><PageIntro eyebrow="MORE THAN A SCREEN" title="Made for the way" emphasis="stories move you." description="Thoughtful ideas for discovering, understanding and sharing cinema. Explore working local demonstrations of an experience still being designed."/></div><FeatureShowcase titles={await getPublicTitles()}/></>}
