import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const before=process.argv.includes('--before');
const dir=`docs/hero-scroll/${before?'before':'after'}`;
await fs.mkdir(dir,{recursive:true});
if(before)await fs.copyFile('components/motion/useExhibitionMotion.ts',`${dir}/useExhibitionMotion.ts.txt`);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const errors=[],samples=[];
page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3000',{waitUntil:'domcontentloaded',timeout:60000});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('.cinema-hero')?.parentElement.classList.contains('pin-spacer'));
 await page.waitForTimeout(900);
 await page.getByRole('button',{name:'Pause film sequence',exact:true}).click();
 await page.getByRole('button',{name:'Show The Quiet Beyond',exact:true}).click();
 await page.waitForTimeout(1500);
 await page.mouse.move(700,500);
 const shot=async name=>{
  await page.screenshot({path:`${dir}/${name}.png`});
  samples.push({name,...await page.evaluate(()=>{
   const hero=document.querySelector('.cinema-hero'),next=document.querySelector('.exhibition-section'),pin=hero.parentElement;
   return {scroll:scrollY,heroTop:hero.getBoundingClientRect().top,nextTop:next.getBoundingClientRect().top,pinDistance:pin.classList.contains('pin-spacer')?pin.offsetHeight-hero.offsetHeight:0,titleWidth:document.querySelector('.hero-word-beyond').getBoundingClientRect().width,camera:getComputedStyle(document.querySelector('.environment-camera')).transform,sceneProgress:document.querySelector('.cinema-hero').style.getPropertyValue('--scene-progress')};
  })});
 };
 await shot('opening');
 for(let i=1;i<=14;i++){
  await page.mouse.wheel(0,120);await page.waitForTimeout(70);
  if([3,6,10,14].includes(i)){await page.waitForTimeout(700);await shot(`wheel-${i}`)}
 }
 const distance=samples[0].pinDistance;
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),distance);await page.waitForTimeout(1000);await shot('docked');
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),distance/2);await page.waitForTimeout(900);await shot('reverse-middle');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(900);await shot('reverse-opening');
 await fs.writeFile(`${dir}/measurements.json`,JSON.stringify({errors,samples},null,2));
 console.log(JSON.stringify({errors,samples:samples.map(({name,scroll,heroTop,nextTop,pinDistance})=>({name,scroll,heroTop,nextTop,pinDistance}))}));
}finally{await browser.close()}
