"use client";
import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

/** Independent transforms, measured Flip geometry and short native-scroll scenes. */
export function useEditorialMotion(root: RefObject<HTMLElement | null>) {
 useEffect(() => {
  let alive = true;
  let width = window.innerWidth;
  let timer: ReturnType<typeof setTimeout>;
  let mm: ReturnType<typeof gsap.matchMedia>;
  let context: gsap.Context;
  function setup() {
   mm = gsap.matchMedia();
   context = gsap.context(() => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
     const splits: SplitText[] = [];
     root.current?.querySelectorAll<HTMLElement>("[data-editorial-lines]").forEach(element => {
      splits.push(SplitText.create(element, { type: "lines", mask: "lines", autoSplit: true, onSplit: self => gsap.from(self.lines, { yPercent: 105, stagger: .09, duration: .8, ease: "power3.inOut", scrollTrigger: { trigger: element, start: "top 94%", toggleActions: "play none none reverse" } }) }));
     });
     gsap.from(".hero-logotype", { yPercent: 25, opacity: 0, duration: 1, ease: "power4.out" });
     gsap.from(".hero-frame-inner", { clipPath: "inset(100% 0 0 0)", duration: .95, stagger: {amount: .4, from: "center"}, ease: "power3.inOut", delay: .15 });
     const cleanup: Array<()=>void> = [];
     root.current?.querySelectorAll<HTMLElement>("[data-editorial-hover]").forEach(element => {
      const split = SplitText.create(element, {type:"chars", smartWrap:true});
      splits.push(split);
      const tween = gsap.timeline({paused:true}).to(split.chars, {opacity:.12,duration:.1,stagger:{amount:.15}}).to(split.chars,{opacity:1,duration:.15,stagger:{amount:.15}},.2);
      const parent=element.closest("a,button")!;
      const enter=()=>tween.restart();
      const leave=()=>tween.reverse();
      parent.addEventListener("pointerenter",enter);parent.addEventListener("focus",enter);parent.addEventListener("pointerleave",leave);parent.addEventListener("blur",leave);
      cleanup.push(()=>{parent.removeEventListener("pointerenter",enter);parent.removeEventListener("focus",enter);parent.removeEventListener("pointerleave",leave);parent.removeEventListener("blur",leave);tween.kill();});
     });
     gsap.fromTo(".editorial-finale .finale-door",{rotationY:0},{rotationY:-115,transformOrigin:"0% 50%",ease:"none",scrollTrigger:{id:"cinema-footer-door",trigger:".finale-window",start:"top 88%",end:"top 46%",scrub:.18,invalidateOnRefresh:true}});
     gsap.fromTo(".finale-reveal-art img",{scale:1.2},{scale:1,ease:"none",scrollTrigger:{trigger:".finale-window",start:"top 88%",end:"top 46%",scrub:.18}});
     return ()=>{cleanup.forEach(fn=>fn());splits.forEach(split=>split.revert());};
    });
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
     const fallStage=root.current!.querySelector<HTMLElement>(".film-fall-stage")!;
     const falling=gsap.utils.toArray<HTMLElement>(".fall-card");
     const fall=gsap.timeline({scrollTrigger:{id:"cinema-falling-films",refreshPriority:20,trigger:fallStage,start:"top 64px",end:()=>"+="+Math.min(innerHeight*.62,620),pin:true,scrub:.2,invalidateOnRefresh:true,anticipatePin:1}});
     const land=(card:HTMLElement,i:number)=>fallStage.clientHeight*.82-card.offsetTop-card.offsetHeight-(i%2?16:0);
     falling.forEach((card,i)=>{
      const rotation=[-13,9,-5,14,-9][i%5];
      fall.fromTo(card,{y:-25,rotation:(i-2)*2,scale:.95},{y:()=>land(card,i),x:(i-2)*-13,rotation,scale:1,duration:.62,ease:"power2.in"},i*.055)
       .to(card,{y:()=>land(card,i)-24,rotation:rotation*.7,duration:.12,ease:"power2.out"},.62+i*.055)
       .to(card,{y:()=>land(card,i),rotation,duration:.15,ease:"power2.in"},.74+i*.055);
     });
     fall.to(".film-fall-stage h2",{y:-70,opacity:.14,duration:.5,ease:"none"},.15);
     const stage=root.current!.querySelector<HTMLElement>(".discovery-stage")!;
     const cards=gsap.utils.toArray<HTMLElement>(".mosaic-card");
     const starts=[{x:-150,y:-110,rotation:-12,scale:.62},{x:60,y:-180,rotation:9,scale:.68},{x:80,y:40,rotation:-8,scale:.8},{x:-220,y:140,rotation:13,scale:.7},{x:110,y:135,rotation:-12,scale:.75}];
     cards.forEach((card,i)=>gsap.set(card,starts[i%starts.length]));
     const scattered=cards.map(card=>Flip.getState(card));
     gsap.set(cards,{clearProps:"transform"});
     // Keep the grid in flow at both endpoints. Flip supplies measured transforms;
     // GSAP owns their complete reversible lifetime, avoiding absolute-layout cleanup jumps.
     const fits=cards.map((card,i)=>Flip.fit(card,scattered[i],{getVars:true,scale:true}) as gsap.TweenVars);
     const timeline=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{id:"cinema-discovery-mosaic",refreshPriority:10,trigger:stage,start:"top 64px",end:()=>"+="+Math.min(innerHeight*.75,720),pin:true,scrub:.25,invalidateOnRefresh:true,anticipatePin:1}});
     cards.forEach((card,i)=>timeline.fromTo(card,fits[i],{x:0,y:0,scaleX:1,scaleY:1,rotation:0,duration:1,ease:"none"},0));
     timeline.to(".discovery-title",{scale:.32,y:-90,transformOrigin:"0% 0%",duration:.65},0)
      .to(".discovery-intro",{opacity:0,y:-65,duration:.3},0)
      .to(".floating-label",{y:(i)=>i%2?-120:150,x:(i)=>i%2?180:-200,rotation:(i)=>i%2?18:-20,autoAlpha:0,stagger:.03,duration:.6},0)
      .from(".mosaic-browser-bar,.mosaic-browser-bottom",{opacity:0,duration:.3},.55)
      .from(".mosaic-caption",{opacity:0,duration:.25},.65)
      .from(".discovery-end",{opacity:0,y:30,duration:.3},.65);
     gsap.utils.toArray<HTMLElement>(".hero-frame").forEach((frame,i)=>gsap.to(frame,{y:(i%2?-1:1)*(45+i*7),rotation:(i%2?-1:1)*3,ease:"none",scrollTrigger:{trigger:".hero-image-field",start:"top 30%",end:"bottom top",scrub:.25}}));
     gsap.to(".spotlight-image img",{scale:1.08,yPercent:5,ease:"none",scrollTrigger:{trigger:".editorial-spotlight",start:"top bottom",end:"bottom top",scrub:.25}});
    });
   },root);
   ScrollTrigger.refresh();
   if(root.current) root.current.dataset.motionReady = "true";
  }
  document.fonts.ready.then(()=>{if(alive)setup();});
  const resize=()=>{if(Math.abs(window.innerWidth-width)<2)return;width=window.innerWidth;clearTimeout(timer);timer=setTimeout(()=>{mm?.revert();context?.revert();if(alive)setup();},220);};
  window.addEventListener("resize",resize);
  return ()=>{alive=false;clearTimeout(timer);window.removeEventListener("resize",resize);mm?.revert();context?.revert();};
 },[root]);
}
