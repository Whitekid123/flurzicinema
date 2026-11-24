
import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='docs/positioning-copy';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const observations=[];
try{
 for(const width of [1440,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:width>800?1000:844},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3002',{waitUntil:'networkidle',timeout:120000});
  await page.locator('.editorial-home[data-motion-ready=true]').waitFor({timeout:90000});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:dir+'/'+width+'-full.png',fullPage:true,caret:'initial'});
  for(const [name,selector] of Object.entries({hero:'.editorial-masthead',discovery:'.discovery-stage',spotlight:'.editorial-spotlight',finale:'.editorial-finale'})){
   await page.locator(selector).screenshot({path:dir+'/'+width+'-'+name+'.png',caret:'initial'});
  }
  for(const feature of ['rooms','match','lens','data']){
   await page.locator('#tab-'+feature).click();
   await page.locator('#feature-panel-'+feature).screenshot({path:dir+'/'+width+'-feature-'+feature+'.png',caret:'initial'});
  }
  observations.push(await page.evaluate(({width,errors})=>({
   width,errors,title:document.title,
   description:document.querySelector('meta[name=description]')?.content,
   overflow:document.documentElement.scrollWidth-innerWidth,
   headings:[...document.querySelectorAll('main h1,main h2')].map(e=>({text:e.textContent,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),
   clippedText:[...document.querySelectorAll('.hero-statement p,.hero-grid-label,.feature-text h3,.feature-text p,.spotlight-copy h2,.editorial-finale h2,.faq-section h2')].filter(e=>e.offsetWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({text:e.textContent,scroll:e.scrollWidth,client:e.clientWidth}))
  }),{width,errors}));
  await page.close();
 }
 await fs.writeFile(dir+'/observations.json',JSON.stringify(observations,null,2));
 console.log(JSON.stringify(observations,null,2));
 if(observations.some(o=>o.errors.length||o.overflow>0||o.clippedText.length))process.exitCode=1;
}finally{await browser.close();}
