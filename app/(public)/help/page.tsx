import { Breadcrumbs,PageIntro } from "@/components/public/Primitives";
import { HelpCenter } from "@/components/public/HelpCenter";
export const metadata={title:"Help center · Flurzi Cinema"};
export default function Page(){return <><div className="wrap"><Breadcrumbs items={[{label:"Help center"}]}/><PageIntro eyebrow="A LITTLE CLARITY" title="How can we" emphasis="help you?" description="Find your way around the public preview. These locally searchable articles explain the concept, the demos and what remains to come."/></div><HelpCenter/></>}
