import {notFound} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Development player lab",robots:{index:false,follow:false}};
export default async function PlayerLabPage(){
 if(process.env.NODE_ENV==="development"&&process.env.FLURZI_PLAYER_LAB==="1"){
  const {PlayerLab}=await import("@/components/streaming/PlayerLab");return <PlayerLab/>;
 }
 notFound();
}
