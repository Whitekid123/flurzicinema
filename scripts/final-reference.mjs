import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='docs/final-redesign/reference';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const findings=[];
try{
 await page.goto('https://flim.ai/',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForTimeout(3000);
 const reject=page.getByText('Reject',{exact:true}).first();
 if(await reject.isVisible().catch(()=>false))await reject.click();
 for(const y of [0,650,1300,2100,3000,4000,5200,6500,8000,10000,12500]){
  await page.evaluate(y=>window.scrollTo(0,y),y); await page.waitForTimeout(950);
  await page.screenshot({path:dir+'/'+y+'.png'});
  findings.push(await page.evaluate(()=>({y:scrollY,height:document.documentElement.scrollHeight,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(e=>({text:e.textContent,font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize}))})));
 }
 await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(1000);
 const input=page.locator('input').filter({visible:true}).first();
 if(await input.count()){await input.focus();await page.waitForTimeout(800);await page.screenshot({path:dir+'/focused.png'});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1500);await page.screenshot({path:dir+'/mobile.png'});
 await fs.writeFile(dir+'/observations.json',JSON.stringify(findings,null,2));console.log(JSON.stringify(findings));
}finally{await browser.close();}
