
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=process.env.PREVIEW_URL||'http://127.0.0.1:3004';
const dir='docs/phase2a';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const results=[],errors=[];
async function capture(page,width,name){
 await page.locator('main h1').waitFor();
 if(name==='subscribe')await page.locator('.entry-plan').first().waitFor();
 if(name==='profile-manage')await page.locator('.profile-grid').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.entry-app img').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>undefined))));
 await page.screenshot({path:dir+'/'+width+'-'+name+'.png',fullPage:true,caret:'initial'});
 const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,clipped:[...document.querySelectorAll('.entry-app main h1,.entry-app main h2,.entry-field')].filter(e=>e.offsetWidth&&e.scrollWidth>e.clientWidth+2).map(e=>e.textContent),heading:document.querySelector('main h1')?.textContent}));
 assert.equal(metrics.overflow,0,name+' overflow');assert.equal(metrics.clipped.length,0,name+' clipped text');
 results.push({width,screen:name,...metrics});
}
async function path(page,route){await page.waitForURL(url=>url.pathname===route,{timeout:45000});}
const click=(page,name)=>page.getByRole('button',{name,exact:true}).click();
const link=(page,name)=>page.getByRole('link',{name,exact:true}).click();
async function choosePlan(page,id='mock-essential'){
 await page.locator('input[value="'+id+'"]').check();await click(page,'Save preview preference');await link(page,'Continue to profiles');await path(page,'/profiles');await page.locator('.profile-grid').waitFor();
}
try{
 for(const width of (process.env.PHASE2A_WIDTHS||"1440,1920,1024,768,390,320").split(",").map(Number)){
  const context=await browser.newContext({viewport:{width,height:width<800?844:1000},reducedMotion:'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',e=>errors.push({width,message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({width,message:m.text()});});
  await page.goto(origin+'/login',{waitUntil:'domcontentloaded',timeout:60000});
  await page.getByLabel('Email address',{exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('#email').disabled);
  await capture(page,width,'login');
  if(width===1440){
   await click(page,'Sign in');assert.equal(await page.locator('#email').getAttribute('aria-invalid'),'true');
   await click(page,'Use demo details');await click(page,'Show password');assert.equal(await page.locator('#password').getAttribute('type'),'text');await click(page,'Hide password');
   await click(page,'Sign in');await path(page,'/subscribe');await choosePlan(page);
   await click(page,'Choose Kids');await page.getByLabel('Profile PIN',{exact:true}).fill('9999');await click(page,'Open profile');await page.getByText('Incorrect demo PIN.',{exact:false}).waitFor();
   await page.getByLabel('Profile PIN',{exact:true}).fill('1234');await click(page,'Open profile');await path(page,'/browse');await link(page,'Switch profile: Kids');await path(page,'/profiles');
   await link(page,'Manage profiles');await path(page,'/profiles/manage');await click(page,'Edit Main');
   await page.getByLabel('Profile name',{exact:true}).fill('Main TV');await page.getByLabel('Language preference',{exact:true}).selectOption('fr');await page.getByLabel('Playback preference',{exact:true}).selectOption('high');await page.getByLabel('Reduce motion preference',{exact:true}).check();
   await click(page,'Save changes');await page.getByRole('button',{name:'Edit Main TV',exact:true}).waitFor();await click(page,'Edit Main TV');assert.equal(await page.getByLabel('Language preference',{exact:true}).inputValue(),'fr');assert.equal(await page.getByLabel('Reduce motion preference',{exact:true}).isChecked(),true);await link(page,'Cancel');
   await link(page,'Done');await click(page,'Sign out');await path(page,'/login');
  }
  await link(page,'Create an account');await path(page,'/signup');await capture(page,width,'signup');
  await page.getByLabel('Email address',{exact:true}).fill('viewer'+width+'@flurzi.example');await page.getByLabel('Password',{exact:true}).fill('fictional-only');await page.locator('#legal').check();await click(page,'Create account');await path(page,'/verify-email');await capture(page,width,'verify-email');
  await link(page,'Open demo verification link');await click(page,'Verify email');await page.getByRole('heading',{name:'You’re verified.',exact:true}).waitFor();
  await click(page,'Continue');await path(page,'/welcome');await capture(page,width,'welcome');
  await click(page,'Continue setup');await path(page,'/subscribe');await capture(page,width,'subscribe');assert.equal(await page.getByText('€8.99',{exact:false}).count(),0);await choosePlan(page,'mock-premium');
  await link(page,'Add profile');await path(page,'/profiles/new');await capture(page,width,'profile-new');
  await page.getByLabel('Profile name',{exact:true}).fill('Nova');await page.getByRole('radio',{name:'Frame',exact:true}).check();await click(page,'Create profile');await path(page,'/profiles');await page.getByRole('button',{name:'Choose Nova',exact:true}).waitFor();await capture(page,width,'profiles');
  await link(page,'Manage profiles');await path(page,'/profiles/manage');await capture(page,width,'profile-manage');await click(page,'Edit Nova');await capture(page,width,'profile-edit');
  if(width===1440){await click(page,'Delete profile');await capture(page,width,'delete-confirmation');await click(page,'Keep profile');assert.equal(await page.getByRole('dialog').count(),0);await click(page,'Delete profile');await page.getByRole('dialog').getByRole('button',{name:'Delete profile',exact:true}).click();await page.getByText('Profile removed.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Edit Nova',exact:true}).count(),0);}
  else await link(page,'Cancel');
  await link(page,'Done');
  if(width!==1440){await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Choose Nova',exact:true}).hover();assert.equal(await page.locator('.profile-art').first().evaluate(e=>getComputedStyle(e).transform),'none');}
  await click(page,'Sign out');await path(page,'/login');await link(page,'Forgot password?');await path(page,'/forgot-password');await capture(page,width,'forgot-password');
  await page.getByLabel('Email address',{exact:true}).fill('viewer'+width+'@flurzi.example');await click(page,'Request reset link');await page.getByRole('link',{name:'Open demo reset link',exact:true}).waitFor();await capture(page,width,'recovery-submitted');await link(page,'Open demo reset link');await path(page,'/reset-password');await capture(page,width,'reset-password');
  await page.getByLabel('New password',{exact:true}).fill('fictional-reset');await page.getByLabel('Confirm new password',{exact:true}).fill('fictional-reset');await click(page,'Save new password');await page.getByRole('heading',{name:'Password reset complete.',exact:true}).waitFor();await capture(page,width,'reset-confirmation');
  await link(page,'Return to sign in');await path(page,'/login');
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>/auth|password|token|session/i.test(k))),false);
  if(width===1440){
   await page.goto(origin+'/reset-password',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Let’s try a new link.',exact:true}).waitFor();await capture(page,width,'reset-invalid');
   await page.goto(origin+'/verify-email?token=expired',{waitUntil:'domcontentloaded'});await click(page,'Verify email');await page.getByRole('heading',{name:'This link needs a refresh.',exact:true}).waitFor();await capture(page,width,'verify-invalid');
   await page.goto(origin+'/profiles',{waitUntil:'domcontentloaded'});await path(page,'/login');
   await page.goto(origin+'/sign-in',{waitUntil:'domcontentloaded'});await path(page,'/login');
   await page.goto(origin+'/get-started',{waitUntil:'domcontentloaded'});await path(page,'/signup');
  }
  await context.close();console.log('Verified entry screens at '+width+'px');
 }
 assert.equal(errors.length,0,'Browser console/page errors');console.log('Phase 2A focused browser inspection passed.');
} catch(e){results.push({failure:String(e),stack:e.stack});console.error(e);process.exitCode=1;}
finally{await fs.writeFile(dir+'/browser-observations.json',JSON.stringify({origin,results,errors},null,2));await browser.close();}
