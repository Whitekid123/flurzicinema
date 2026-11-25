"use client";
import {useEffect,type RefObject} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function useFeatureJourney(root:RefObject<HTMLElement|null>,journey:RefObject<ScrollTrigger|null>,onProgress:(index:number)=>void){
 useEffect(()=>{
  const mm=gsap.matchMedia();
  const ctx=gsap.context(()=>{
   mm.add("(min-width:1024px) and (prefers-reduced-motion:no-preference)",()=>{
    const stage=root.current!.querySelector<HTMLElement>(".feature-journey-stage")!;
    const track=stage.querySelector<HTMLElement>(".feature-journey-track")!;
    stage.classList.add("feature-scroll-active");
    const tween=gsap.timeline({scrollTrigger:{id:"feature-journey",trigger:stage,start:"top 80px",end:()=>"+="+Math.min(innerHeight*.95,950),pin:true,scrub:.3,invalidateOnRefresh:true,anticipatePin:1,onUpdate:self=>onProgress(Math.round(self.progress*3))}});
    // Readable pauses between continuous moves, without snapping browser scroll.
    tween.to(track,{"--feature-travel":"0px",duration:.12});
    for(let i=1;i<=3;i++){
      tween.to(track,{"--feature-travel":()=>-stage.clientWidth*i+"px",duration:.16,ease:"power3.inOut"});
      tween.to(track,{"--feature-travel":()=>-stage.clientWidth*i+"px",duration:i===3?.12:.18,ease:"none"});
    }
    journey.current=tween.scrollTrigger!;
    return()=>{journey.current=null;stage.classList.remove("feature-scroll-active");};
   });
  },root);
  let alive=true;document.fonts.ready.then(()=>{if(alive)ScrollTrigger.refresh();});
  return()=>{alive=false;mm.revert();ctx.revert();};
 },[root,journey,onProgress]);
}
