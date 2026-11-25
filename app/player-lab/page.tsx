import {notFound} from "next/navigation";
import {PlayerLab} from "@/components/streaming/PlayerLab";
export const dynamic="force-dynamic";
export const metadata={title:"Development player lab",robots:{index:false,follow:false}};
export default function PlayerLabPage(){
 if(process.env.NODE_ENV!=="development"||process.env.FLURZI_PLAYER_LAB!=="1")notFound();
 return <PlayerLab/>;
}
