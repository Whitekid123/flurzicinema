import {test,expect,type Page} from "@playwright/test";
async function ready(page:Page){await page.goto("/");await page.waitForSelector(".editorial-home[data-motion-ready=true]");await page.waitForTimeout(1100);}
async function scroll(page:Page,y:number){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(650);}
test("native hero wheel progression, concise measured mosaic assembly and exact reverse",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);
 await expect(page.locator(".editorial-hero .pin-spacer")).toHaveCount(0);
 const start=await page.locator(".discovery-stage").evaluate(e=>e.getBoundingClientRect().top+scrollY-64);
 const sample=()=>page.locator(".mosaic-card").evaluateAll(elements=>elements.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,transform:getComputedStyle(e).transform})));
 await page.mouse.move(15,350);for(let i=0;i<10;i++){await page.mouse.wheel(0,30);await page.waitForTimeout(20);}await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(300,0);await scroll(page,0);for(let i=0;i<6;i++){await page.mouse.wheel(0,120);await page.waitForTimeout(40);}
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(720,0);
 expect((await page.locator(".editorial-hero").boundingBox())!.y).toBeLessThan(-650);
 await scroll(page,start);const before=await sample();
 const distance=await page.locator(".discovery-stage").evaluate(e=>e.parentElement!.offsetHeight-(e as HTMLElement).offsetHeight);
 expect(distance).toBeGreaterThan(0);expect(distance).toBeLessThanOrEqual(720);
 await scroll(page,start+distance/2);const middle=await sample();expect(middle.every((x,i)=>x.transform!==before[i].transform)).toBe(true);
 await scroll(page,start+distance+2);const after=await sample();expect(Math.abs(after[0].y-after[1].y)).toBeLessThan(2);expect(after[3].y-after[1].y).toBeGreaterThan(150);
 await scroll(page,start+distance/2);const reverse=await sample();reverse.forEach((x,i)=>{expect(Math.abs(x.x-middle[i].x)).toBeLessThan(3);expect(Math.abs(x.y-middle[i].y)).toBeLessThan(3);});
 await scroll(page,0);await expect(page.locator(".hero-logotype")).toBeVisible();
});
test("hero search interrupts imagery and opens the working catalog query",async({page})=>{
 await ready(page);const field=page.getByRole("textbox",{name:"Find a film or series"});await field.fill("Velvet");await expect(page.locator(".hero-image-field")).toHaveClass(/is-searching/);await field.press("Enter");await expect(page).toHaveURL(/\/explore\?q=Velvet/);await expect(page.locator(".public-catalog-grid h3")).toHaveText("Velvet Hours");
});
test("hero image groups pause explicitly and while search has focus",async({page})=>{
 test.setTimeout(40000);await ready(page);await page.getByRole("button",{name:"Pause image sequence",exact:true}).click();const first=page.locator(".hero-frame-0");const label=await first.getAttribute("aria-label");await page.waitForTimeout(6800);await expect(first).toHaveAttribute("aria-label",label!);await page.getByRole("button",{name:"Resume image sequence",exact:true}).click();await page.getByRole("textbox",{name:"Find a film or series"}).focus();await page.waitForTimeout(6800);await expect(first).toHaveAttribute("aria-label",label!);await page.getByRole("textbox",{name:"Find a film or series"}).blur();await page.mouse.move(15,20);await expect.poll(()=>first.getAttribute("aria-label"),{timeout:9000}).not.toBe(label);
});
test("mosaic opens the corresponding title and links to its full details",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await ready(page);await page.getByRole("button",{name:"Discover The Last Train North",exact:true}).click();const dialog=page.getByRole("dialog",{name:"The Last Train North"});await expect(dialog).toBeVisible();await dialog.getByRole("link",{name:"View full story details"}).click();await expect(page).toHaveURL(/\/movies\/last-train$/,{timeout:30000});await expect(page.locator("h1")).toHaveText("The Last Train North");
});
test("motion preferences and resize release and restore the mosaic without duplicate pins",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);await expect(page.locator(".pin-spacer")).toHaveCount(3);
 await page.emulateMedia({reducedMotion:"reduce"});await expect(page.locator(".pin-spacer")).toHaveCount(0);await expect(page.locator(".mosaic-card")).toHaveCount(5);await expect(page.locator(".mosaic-card").first()).toHaveCSS("transform","none");
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:"no-preference"});await page.waitForTimeout(500);await expect(page.locator(".pin-spacer")).toHaveCount(0);
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(650);await expect(page.locator(".pin-spacer")).toHaveCount(3);await page.setViewportSize({width:1280,height:900});await page.waitForTimeout(650);await expect(page.locator(".pin-spacer")).toHaveCount(3);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const width of [1024,768,390])test("normal motion interactions at "+width+"px",async({page})=>{
 await page.setViewportSize({width,height:width===390?844:1000});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await ready(page);
 if(width<1024)await expect(page.locator(".pin-spacer")).toHaveCount(0);
 await page.getByRole("tab",{name:"StoryMatch"}).click();await page.getByRole("button",{name:"Escape",exact:true}).click();await expect(page.getByRole("button",{name:"Explore your match: The Last Train North"})).toBeVisible();await page.getByRole("tab",{name:"DataSense"}).click();await page.getByRole("radio",{name:"4K",exact:true}).check();await expect(page.getByText("7 GB",{exact:true})).toBeVisible();
 await page.locator("#vault").getByRole("button",{name:"Grid",exact:true}).click();await expect(page.locator(".vault-grid .vault-item")).toHaveCount(5);await page.waitForTimeout(1100);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test("light and dark neutral surfaces, working genre labels and clean navigation cleanup",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});await ready(page);
 await expect(page.locator(".editorial-home")).toHaveCSS("background-color","rgb(245, 245, 243)");await expect(page.locator("#features")).toHaveCSS("background-color","rgb(8, 9, 11)");
 await page.locator(".floating-label").first().click();await expect(page).toHaveURL(/\/explore\?genre=/);await expect(page.locator(".pin-spacer")).toHaveCount(0);await page.goBack();await page.waitForSelector(".editorial-home[data-motion-ready=true]");await expect(page.locator(".pin-spacer")).toHaveCount(3);expect(errors).toEqual([]);
});
test("touch viewport can swipe naturally beyond the hero",async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:"no-preference"});const page=await context.newPage();
 try{await ready(page);const session=await context.newCDPSession(page);for(let swipe=0;swipe<2;swipe++){await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:180,y:650}]});for(let y=625;y>=150;y-=25){await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:180,y}]});await page.waitForTimeout(25);}await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await page.waitForTimeout(100);}await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(600);await expect(page.locator(".pin-spacer")).toHaveCount(0);}finally{await context.close();}
});
