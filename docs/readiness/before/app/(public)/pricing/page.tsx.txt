import { Breadcrumbs, PageIntro } from "@/components/public/Primitives";
import { Pricing } from "@/components/public/Pricing";
export const metadata={title:"Pricing & membership · Flurzi Cinema"};
export default function Page(){return <><div className="wrap"><Breadcrumbs items={[{label:"Pricing & membership"}]}/><PageIntro eyebrow="A SEAT FOR THE STORIES YOU LOVE" title="Cinema, on" emphasis="your terms." description="A considered membership is part of the vision. Explore the proposed structure while pricing and viewing capabilities are being defined."/></div><Pricing/></>}
