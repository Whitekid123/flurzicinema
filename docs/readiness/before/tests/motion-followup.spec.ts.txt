import {test,expect,type Page} from "@playwright/test";
async function ready(page:Page){await page.goto("/");await page.waitForSelector(".editorial-home[data-motion-ready=true]");await page.waitForTimeout(1100);}
async function scroll(page:Page,y:number){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(600);}
test("full hero branding and varied pointer-revealed scenes, with pause and reduced-motion controls",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);await expect(page.locator(".hero-cinema-word")).toBeVisible();await expect(page.locator(".hero-cinema-word")).toHaveText("cinema.");
 const field=await page.locator(".hero-image-field").evaluate(e=>e.getBoundingClientRect().top+scrollY);await scroll(page,field-180);
 for(let i=0;i<8;i++){await page.mouse.move(100+i*145,400+(i%2)*70);await page.waitForTimeout(110);}
 expect(Number(await page.locator(".hero-pointer-trail").getAttribute("data-reveals"))).toBeGreaterThan(5);
 const images=await page.locator(".pointer-film img").evaluateAll(els=>els.map(e=>(e as HTMLImageElement).src));expect(new Set(images).size).toBeGreaterThan(3);expect(images.some(src=>src.includes("/hero/"))).toBe(true);
 await page.getByRole("button",{name:"Pause image sequence",exact:true}).click();const count=await page.locator(".hero-pointer-trail").getAttribute("data-reveals");for(let i=0;i<4;i++)await page.mouse.move(200+i*150,430);await expect(page.locator(".hero-pointer-trail")).toHaveAttribute("data-reveals",count!);
 await page.emulateMedia({reducedMotion:"reduce"});await expect(page.locator(".hero-pointer-trail")).toBeHidden();
});
test("five boxed films fall, land and return to the exact earlier arrangement",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);await expect(page.locator(".fall-card")).toHaveCount(5);
 const start=await page.locator(".film-fall-stage").evaluate(e=>e.getBoundingClientRect().top+scrollY-64);
 const sample=()=>page.locator(".fall-card").evaluateAll(els=>els.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
 await scroll(page,start);const before=await sample();await scroll(page,start+310);const middle=await sample();expect(middle[0].y-before[0].y).toBeGreaterThan(40);
 await scroll(page,start+620);const landed=await sample();expect(landed[0].y-before[0].y).toBeGreaterThan(150);await scroll(page,start+310);const reverse=await sample();reverse.forEach((x,i)=>{expect(Math.abs(x.x-middle[i].x)).toBeLessThan(3);expect(Math.abs(x.y-middle[i].y)).toBeLessThan(3);});
 await page.emulateMedia({reducedMotion:"reduce"});await page.getByRole("button",{name:"Open falling frame: The Last Train North"}).click();await expect(page.getByRole("dialog",{name:"The Last Train North"})).toBeVisible();
});
test("scroll progresses Rooms, StoryMatch, StoryLens and DataSense, then reverses smoothly",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);
 const stage=page.locator(".feature-journey-stage");const start=await stage.evaluate(e=>e.getBoundingClientRect().top+scrollY-80);const distance=await stage.evaluate(e=>e.parentElement!.offsetHeight-(e as HTMLElement).offsetHeight);
 expect(distance).toBeGreaterThan(0);expect(distance).toBeLessThanOrEqual(950);
 const labels=["Cinema Rooms","StoryMatch","StoryLens","DataSense"];const matrices:string[]=[];
 for(let i=0;i<4;i++){await scroll(page,start+distance*i/3);await expect(page.getByRole("tab",{name:labels[i],exact:true})).toHaveAttribute("aria-selected","true");matrices.push(await page.locator(".feature-journey-track").evaluate(e=>getComputedStyle(e).transform));const panel=page.getByRole("tabpanel",{name:labels[i],exact:true});expect((await panel.boundingBox())!.x).toBeGreaterThan(-10);expect((await panel.boundingBox())!.x).toBeLessThan(100);}
 expect(new Set(matrices).size).toBe(4);await scroll(page,start+distance/3);await expect(page.getByRole("tab",{name:"StoryMatch",exact:true})).toHaveAttribute("aria-selected","true");expect(await page.locator(".feature-journey-track").evaluate(e=>getComputedStyle(e).transform)).toBe(matrices[1]);
});
test("the enlarged image door opens on downward scroll and closes on reverse",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);
 const door=page.locator(".finale-door");const top=await page.locator(".finale-window").evaluate(e=>e.getBoundingClientRect().top+scrollY);expect((await page.locator(".finale-window").boundingBox())!.width).toBeGreaterThan(150);
 await scroll(page,top-900);const closed=await door.evaluate(e=>getComputedStyle(e).transform);await scroll(page,top-450);const open=await door.evaluate(e=>getComputedStyle(e).transform);expect(open).not.toBe(closed);expect(open).toContain("matrix3d");await scroll(page,top-900);await expect.poll(()=>door.evaluate(e=>getComputedStyle(e).transform)).toBe(closed);
});
test("phone and reduced-motion content stays readable with no pins or pointer reveals",async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);await expect(page.locator(".pin-spacer")).toHaveCount(0);await expect(page.locator(".hero-pointer-trail")).toBeHidden();await page.getByRole("tab",{name:"StoryMatch",exact:true}).click();await expect(page.getByRole("button",{name:"Explore your match: The Quiet Beyond"})).toBeVisible();await page.emulateMedia({reducedMotion:"reduce"});await expect(page.locator(".finale-door")).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
