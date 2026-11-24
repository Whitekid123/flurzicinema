import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='docs/final-redesign/current';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const records=[];
try{
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('.editorial-home')?.getAttribute('data-motion-ready')==='true');await page.waitForTimeout(1400);
 for(const y of [0,650,1000,1050,1300,1600,1710,1900,2500,3300,4200,5200,6200,7500]){
  await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(600);
  await page.screenshot({caret:'initial',path:dir+'/'+y+'.png'});
  records.push(await page.evaluate(()=>({y:scrollY,width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,stage:document.querySelector('.discovery-stage')?.getBoundingClientRect().toJSON(),cards:[...document.querySelectorAll('.mosaic-card')].map(e=>({rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform})),headings:[...document.querySelectorAll('h2')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).map(e=>e.textContent)})));
 }
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);await page.screenshot({caret:'initial',path:dir+'/reverse.png'});
 for(const width of [768,390]){
  await page.emulateMedia({reducedMotion:"reduce"});await page.setViewportSize({width,height:width===390?844:1024});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1200);
  await page.screenshot({caret:'initial',path:dir+'/'+width+'.png',fullPage:true});
  records.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,pins:document.querySelectorAll('.pin-spacer').length})));
 }
 await page.emulateMedia({reducedMotion:"no-preference"});await page.waitForTimeout(500);
 for(const [name,selector] of [["feature","#features"],["spotlight","#series"],["invitation","#membership"]]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({caret:"initial",path:dir+"/390-"+name+".png"});
 }
 await fs.writeFile(dir+'/observations.json',JSON.stringify({errors,records},null,2));console.log(JSON.stringify({errors,samples:records.length,breakpoints:records.filter(r=>r.width!==1440)}));
}finally{await browser.close();}
