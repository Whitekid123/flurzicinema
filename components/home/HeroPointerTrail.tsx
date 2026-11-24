"use client";
import {useEffect,useRef} from "react";
import {gsap} from "gsap";
type Scene={src:string;title:string};
export function HeroPointerTrail({scenes,disabled}:{scenes:Scene[];disabled:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const host=root.current;
  const field=host?.closest<HTMLElement>(".hero-image-field");
  if(!host||!field||!scenes.length||disabled)return;
  const mm=gsap.matchMedia();
  mm.add("(min-width:1024px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)",()=>{
   const cards=[...host.querySelectorAll<HTMLElement>(".pointer-film")];
   const timelines=new Map<HTMLElement,gsap.core.Timeline>();
   let index=0,lastX=-1000,lastY=-1000,lastTime=0;
   const move=(event:PointerEvent)=>{
    if(event.pointerType!=="mouse"||document.hidden||(event.target as HTMLElement).closest("form,.hero-field-bottom"))return;
    const bounds=field.getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
    if(Math.hypot(x-lastX,y-lastY)<64 || performance.now()-lastTime<85)return;
    lastX=x;lastY=y;lastTime=performance.now();
    const card=cards[index%cards.length],scene=scenes[index%scenes.length];
    const image=card.querySelector<HTMLImageElement>("img")!;
    image.src=scene.src;card.querySelector("span")!.textContent=scene.title;
    const px=Math.min(bounds.width-card.offsetWidth-12,Math.max(12,Math.round(x/32)*32-card.offsetWidth/2));
    const py=Math.min(bounds.height-card.offsetHeight-44,Math.max(28,Math.round(y/32)*32-card.offsetHeight/2));
    timelines.get(card)?.kill();
    const tl=gsap.timeline().fromTo(card,{x:px,y:py+20,scale:.5,rotation:index%2?8:-8,autoAlpha:0},{y:py,scale:1,rotation:index%2?3:-3,autoAlpha:1,duration:.35,ease:"back.out(1.6)"}).to(card,{y:py+35,scale:.92,autoAlpha:0,duration:.45,ease:"power2.in"},1.05);
    timelines.set(card,tl);
    index++;host.dataset.reveals=String(index);
   };
   const clear=()=>{timelines.forEach(t=>t.kill());gsap.set(cards,{autoAlpha:0});lastX=-1000;lastY=-1000;};
   field.addEventListener("pointermove",move,{passive:true});
   field.addEventListener("pointerleave",clear);
   document.addEventListener("visibilitychange",clear);
   return()=>{field.removeEventListener("pointermove",move);field.removeEventListener("pointerleave",clear);document.removeEventListener("visibilitychange",clear);timelines.forEach(t=>t.kill());gsap.set(cards,{clearProps:"all"});};
  });
  return()=>mm.revert();
 },[scenes,disabled]);
 return <div ref={root} className="hero-pointer-trail" aria-hidden="true" data-reveals="0">
  {Array.from({length:6},(_,i)=><div className="pointer-film" key={i}>
   {/* Imperative source swaps use already optimized local WebP assets. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={scenes[i%scenes.length]?.src} alt="" width="220" height="140" loading="lazy"/>
   <span/>
  </div>)}
 </div>;
}
