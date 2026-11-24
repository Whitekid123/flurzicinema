import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
const dir='docs/motion-followup';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
console.log('Capture browser ready');
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',recordVideo:{dir:dir+'/video',size:{width:1440,height:1000}}});const page=await context.newPage();const errors=[],records=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const capture=async(name)=>{await page.screenshot({path:dir+'/'+name+'.png',caret:'initial'});};
const move=async(y)=>{await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(500);};
const sample=async()=>records.push(await page.evaluate(()=>({y:scrollY,pins:document.querySelectorAll('.pin-spacer').length,overflow:document.documentElement.scrollWidth-innerWidth,feature:getComputedStyle(document.querySelector('.feature-journey-track')).transform,door:getComputedStyle(document.querySelector('.finale-door')).transform})));
try{
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3000',{waitUntil:'domcontentloaded',timeout:120000});console.log('Page received');await page.waitForSelector('.editorial-home[data-motion-ready=true]',{timeout:90000});console.log('Motion ready');await page.waitForTimeout(1500);await capture('hero');
 const field=await page.locator('.hero-image-field').boundingBox();await move(field.y+field.height/2-520);
 for(let i=0;i<12;i++){await page.mouse.move(100+i*105,460+(i%3)*65);await page.waitForTimeout(130);}await capture('pointer-reveals');await sample();
 await page.mouse.move(10,20);
 const fall=await page.locator('.film-fall-stage').evaluate(e=>e.getBoundingClientRect().top+scrollY-64);
 await move(fall);await capture('fall-before');await sample();
 for(let i=0;i<24;i++){await page.mouse.wheel(0,26);await page.waitForTimeout(45);}await capture('fall-landed');await sample();
 for(let i=0;i<24;i++){await page.mouse.wheel(0,-26);await page.waitForTimeout(35);}await capture('fall-reverse');
 const mosaic=await page.locator('.discovery-stage').evaluate(e=>e.getBoundingClientRect().top+scrollY-64);await move(mosaic+720);await capture('collection');
 const feature=await page.locator('.feature-journey-stage').evaluate(e=>e.getBoundingClientRect().top+scrollY-80);await move(feature);await capture('feature-rooms');
 for(let i=0;i<3;i++){for(let j=0;j<12;j++){await page.mouse.wheel(0,27);await page.waitForTimeout(45);}await page.waitForTimeout(350);await capture('feature-'+(i+1));await sample();}
 for(let i=0;i<36;i++){await page.mouse.wheel(0,-27);await page.waitForTimeout(35);}await capture('feature-reverse');
 const door=await page.locator('.finale-window').evaluate(e=>e.getBoundingClientRect().top+scrollY);
 await move(door-900);await capture('door-closed');await sample();
 for(let i=0;i<24;i++){await page.mouse.wheel(0,20);await page.waitForTimeout(50);}await capture('door-open');await sample();
 for(let i=0;i<24;i++){await page.mouse.wheel(0,-20);await page.waitForTimeout(35);}await capture('door-reverse');await sample();
 for(const width of [768,390]){await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await move(0);await page.waitForTimeout(500);await capture('static-'+width);await sample();}
 await fs.writeFile(dir+'/observations.json',JSON.stringify({errors,records},null,2));console.log(JSON.stringify({errors,records}));
}finally{const video=page.video();await context.close();if(video)await video.saveAs(dir+'/motion-walkthrough.webm');await browser.close();}
