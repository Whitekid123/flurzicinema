import {chromium,firefox,webkit,expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const authOnly=process.argv.includes('--auth-only');
const preview=process.argv.includes('--preview'),channel=preview?'preview':'release',dir='docs/readiness',origin='http://127.0.0.1:3014';
const evidence={channel,auth:[],screens:[],interactions:[],engines:[],errors:[],limitations:['Physical keyboard and operating-system virtual keyboard behavior require phone verification. Viewport shrink is an emulation only.']};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3014','--hostname','127.0.0.1'],{windowsHide:true,stdio:'ignore',env:{...process.env,NEXT_PUBLIC_USE_MOCKS:preview?'1':'0',NEXT_PUBLIC_FLURZI_CHANNEL:channel}});
let browser;
const button=(p,name)=>p.getByRole('button',{name,exact:true});
async function tapInput(p,id,value){const input=p.locator('#'+id);await input.scrollIntoViewIfNeeded();await expect(input).toBeEnabled();const hit=await input.evaluate(e=>{const r=e.getBoundingClientRect(),target=document.elementFromPoint(r.x+r.width*.3,r.y+r.height/2);return {id:target?.id,disabled:e.disabled,inert:!!e.closest('[inert]'),size:getComputedStyle(e).fontSize};});assert.equal(hit.id,id);await input.tap();await expect(input).toBeFocused();await input.fill('');await p.keyboard.type(value);await expect(input).toHaveValue(value);return hit;}
async function route(p,path){await p.goto(origin+path,{waitUntil:'domcontentloaded',timeout:180000});await p.locator('main h1').first().waitFor();}
async function measure(p,name,width){await p.evaluate(()=>document.fonts.ready);const m=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,heading:document.querySelector('main h1')?.textContent}));assert(m.overflow<=1,name+' overflow '+m.overflow);evidence.screens.push({name,width,...m});}
async function completeAuthForms(browser){
 const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();p.setDefaultTimeout(30000);
 await route(p,'/signup');await button(p,'Create account').tap();await expect(p.locator('#email')).toHaveAttribute('aria-invalid','true');await tapInput(p,'email','new-viewer@example.com');await tapInput(p,'password','fictional-password');await p.locator('#legal').tap();await button(p,'Create account').tap();
 if(preview){await p.waitForURL('**/verify-email');await p.getByRole('link',{name:'Open test verification link',exact:true}).tap();await button(p,'Verify email').tap();await expect(p.locator('main h1')).toContainText('verified');await button(p,'Continue').tap();await p.waitForURL('**/welcome');}else await expect(p.locator('main [role=alert]')).toContainText('Unable to complete');
 await route(p,'/reset-password');await p.getByRole('link',{name:'Request a new link',exact:true}).tap();await p.waitForURL('**/forgot-password');
 if(preview){await tapInput(p,'email','viewer@example.com');await button(p,'Request reset link').tap();await p.getByRole('link',{name:'Open test reset link',exact:true}).tap();await p.waitForURL('**/reset-password?token=*');}else await route(p,'/reset-password?token=mock-reset');await tapInput(p,'password','fictional-password');await tapInput(p,'confirm','different-password');await button(p,'Save new password').tap();await expect(p.locator('#confirm')).toHaveAttribute('aria-invalid','true');await tapInput(p,'confirm','fictional-password');await button(p,'Save new password').tap();
 if(preview)await expect(p.locator('.entry-intro')).toContainText('No password was stored');else await expect(p.locator('main [role=alert]')).toContainText('Unable to complete');
 if(!preview){await route(p,'/verify-email?token=invalid');await button(p,'Verify email').tap();await expect(p.locator('main [role=alert]')).toContainText('Unable to complete');await expect(p.getByRole('link',{name:'Open test verification link'})).toHaveCount(0);}
 evidence.interactions.push('Signup validation/submission, missing reset link, password confirmation validation/submission and verification action');await c.close();
}
async function openFromBrowse(p,path){
 if(await p.locator('.cinema-brand').isVisible())await p.locator('.cinema-brand').tap();
 await p.waitForURL(url=>url.pathname==='/browse');
 const menu=async(name)=>{await p.locator('.cinema-profile-trigger').tap();await p.locator('.cinema-profile-menu').getByRole('link',{name,exact:true}).tap();};
 if(path==='/browse')return;
 if(['/browse/movies','/browse/series','/browse/search','/browse/my-list'].includes(path)){await p.locator('.cinema-mobile-nav a[href="'+path+'"]').tap();}
 else if(path==='/browse/history')await menu('Viewing history');
 else if(path.startsWith('/browse/title/'))await p.locator('.cinema-card-art a[href="'+path+'"]').first().tap();
 else if(path.startsWith('/account')||path==='/subscribe'||path==='/welcome'){await menu('Account settings');if(path!=='/account'){const target=path.startsWith('/account')?path:'/account/billing';await p.locator('main a[href="'+target+'"]').first().tap();if(path==='/subscribe'||path==='/welcome'){await p.locator('main a[href="/subscribe"]').tap();if(path==='/welcome')await p.locator('main a[href="/welcome"]').tap();}}}
 else if(path.startsWith('/browse/rooms')){await menu('Cinema Rooms');if(path!=='/browse/rooms')await p.locator('main a[href="'+path+'"]').first().tap();}
 else if(path.startsWith('/browse/storymatch')){await menu('StoryMatch');if(path!=='/browse/storymatch')await p.locator('.sm-mode').first().tap();}
 else if(path==='/profiles/manage')await menu('Manage profiles');
 else if(path.startsWith('/profiles')){await menu('Switch profile');if(path==='/profiles/new')await p.locator('main a[href="/profiles/new"]').first().tap();}
 else throw Error('Missing UI navigation for '+path);
 await p.waitForURL(url=>url.pathname===path);
}
async function login(p){await route(p,'/login');await tapInput(p,'email','demo@flurzi.example');await tapInput(p,'password','preview-only');await button(p,'Sign in').tap();await p.waitForURL('**/subscribe');await p.locator('input[value="mock-essential"]').tap();await button(p,'Save viewing preference').tap();await p.getByRole('link',{name:'Continue to profiles',exact:true}).tap();await button(p,'Choose Main').tap();await p.waitForURL('**/browse');}
try{
 await fs.mkdir(dir,{recursive:true});let ready=false;for(let i=0;i<160;i++){try{if((await fetch(origin+'/login',{signal:AbortSignal.timeout(3000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert(ready,'Server ready');
 for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]){
  if(name!=='chromium'){try{const test=await engine.launch({timeout:10000});await test.close();evidence.engines.push({name,available:true});}catch(e){evidence.engines.push({name,available:false,reason:String(e).split('\n')[0]});}continue;}
  browser=await engine.launch({executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',timeout:300000,args:['--log-file='+process.cwd()+'/'+dir+'/chromium.log']});evidence.engines.push({name,available:true});
 }
 if(!authOnly){for(const width of [1920,1440,1024,768,430,390,375,360,320]){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true});const p=await context.newPage();p.setDefaultTimeout(30000);p.on('pageerror',e=>evidence.errors.push(e.message));
  for(const screen of ['login','signup','forgot-password','reset-password?token=mock-reset','verify-email?token=mock-verification']){
   await route(p,'/'+screen);const hits=[];
   if(screen==='login'||screen==='signup'||screen==='forgot-password')hits.push(await tapInput(p,'email','viewer@example.com'));
   if(screen==='login'||screen==='signup'||screen.startsWith('reset-password')){hits.push(await tapInput(p,'password','fictional-password'));await button(p,screen.startsWith('reset')?'Show new password':'Show password').tap();await expect(p.locator('#password')).toHaveAttribute('type','text');await button(p,screen.startsWith('reset')?'Hide new password':'Hide password').tap();await expect(p.locator('#password')).toHaveAttribute('type','password');}
   if(screen==='signup'){await p.locator('#legal').tap();await expect(p.locator('#legal')).toBeChecked();}
   if(screen.startsWith('reset'))await tapInput(p,'confirm','fictional-password');
   await measure(p,screen,width);evidence.auth.push({width,screen,hits});
   if(width===390){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:dir+'/'+channel+'-'+screen.split('?')[0]+'.png',fullPage:true});}
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await context.newPage();p.setDefaultTimeout(30000);p.on('pageerror',e=>evidence.errors.push(e.message));
 await route(p,'/login');await button(p,'Sign in').tap();await expect(p.locator('#email')).toHaveAttribute('aria-invalid','true');await tapInput(p,'email','viewer@example.com');await tapInput(p,'password','fictional-password');await p.setViewportSize({width:390,height:400});await p.locator('#email').tap();await expect(p.locator('#email')).toBeFocused();await p.locator('#password').tap();await expect(p.locator('#password')).toBeFocused();if(!preview)await button(p,'Sign in').tap();
 if(!preview){await expect(p.locator('main [role=alert]')).toContainText('Unable to complete your request');await expect(p.locator('#email')).toBeEnabled();await expect(button(p,'Fill test credentials')).toHaveCount(0);await expect(p.locator('.entry-preview')).toHaveCount(0);}
 evidence.interactions.push('Validation recovery, email/password taps, typing, visibility toggle, submission, viewport shrink scrolling');
 await p.setViewportSize({width:390,height:844});await route(p,'/login');await p.getByRole('link',{name:'Forgot password?',exact:true}).tap();await p.waitForURL('**/forgot-password');await tapInput(p,'email','viewer@example.com');await button(p,'Request reset link').tap();if(preview)await expect(p.locator('.entry-intro')).toContainText('No email was sent');else await expect(p.locator('main [role=alert]')).toContainText('Unable to complete');
 await route(p,'/login');await p.getByRole('link',{name:'Create an account',exact:true}).tap();await p.waitForURL('**/signup');evidence.interactions.push('Recovery and registration links');
 if(!preview){
  for(const path of ['/browse','/account','/browse/rooms','/browse/storymatch']){await route(p,path);await expect(p.locator('main')).toContainText('We can’t connect');}
  for(const path of ['/player-lab','/api/player-lab/original.webm'])assert.equal((await p.request.get(origin+path)).status(),404);
  await route(p,'/contact');await expect(p.locator('main')).toContainText('Contact is currently unavailable');await expect(p.locator('main form')).toHaveCount(0);
  for(const path of ['/','/explore','/movies','/series','/features','/pricing','/about','/help','/contact','/get-started','/sign-in','/legal/privacy','/movies/quiet-beyond','/series/velvet-hours','/premieres','/originals']){await route(p,path);for(const width of [1920,1440,1024,768,430,390,375,360,320]){await p.setViewportSize({width,height:844});await measure(p,path,width);}await p.setViewportSize({width:390,height:844});}
await route(p,'/explore');await button(p,'Open navigation').tap();await expect(p.getByRole('dialog',{name:'Navigation'})).toBeVisible();await p.getByRole('dialog').getByRole('link',{name:'Movies',exact:true}).tap();await p.waitForURL('**/movies');await expect(p.getByRole('dialog')).toHaveCount(0);
evidence.interactions.push('Public navigation dialog opens, Movies link navigates, dialog closes and scrolling restores');
evidence.interactions.push('Release fails closed for protected routes, contact unavailable, test footage returns 404');
 }else{
  await login(p);
  const paths=['/browse','/browse/movies','/browse/series','/browse/search','/browse/my-list','/browse/history','/browse/title/mock-quiet-beyond','/browse/title/mock-velvet-hours','/welcome','/subscribe','/account','/account/details','/account/billing','/account/security','/account/devices','/account/preferences','/browse/rooms','/browse/rooms/create','/browse/rooms/join','/browse/storymatch','/browse/storymatch/new','/profiles','/profiles/manage','/profiles/new'];
  for(const path of paths){const auditContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await auditContext.newPage();p.setDefaultTimeout(30000);p.on('pageerror',error=>evidence.errors.push(error.message));await login(p);await openFromBrowse(p,path);for(const width of [1920,1440,1024,768,430,390,375,360,320]){await p.setViewportSize({width,height:844});await measure(p,path,width);}await p.setViewportSize({width:390,height:844});
   const controls=p.locator('main :is(input:not([type=hidden]),select,button,a,summary)');const count=await controls.count();let checked=0;
   for(let i=0;i<count;i++){const control=controls.nth(i);if(!await control.isVisible()||!await control.isEnabled())continue;await control.scrollIntoViewIfNeeded();const hit=await control.evaluate(e=>{const r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {name:(e.getAttribute('aria-label')||e.textContent||e.id).trim().slice(0,75),tag:e.tagName,hit:e===t||e.contains(t)||t?.contains(e)||Array.from(e.labels||[]).some(label=>label.contains(t)),width:r.width,height:r.height,target:t?.tagName};});if(hit.width>3&&hit.height>3){assert(hit.hit,path+' blocked control '+JSON.stringify(hit));checked++;}}
   evidence.interactions.push({path,actualPath:new URL(p.url()).pathname,hitTestedControls:checked});await auditContext.close();
  }
  await openFromBrowse(p,'/browse/search');const search=p.locator('input[type=search]').first();await search.tap();await p.keyboard.type('Quiet');await p.keyboard.press('Enter');await expect(p.locator('main')).toContainText('The Quiet Beyond');
  await openFromBrowse(p,'/account/preferences');const selects=p.locator('main select');if(await selects.count()){await selects.first().selectOption({index:1});await button(p,'Cancel changes').tap();}
  await openFromBrowse(p,'/account/security');await button(p,'Request password recovery').tap();const dialog=p.getByRole('dialog');await expect(dialog).toBeVisible();await dialog.locator('input').count();const bounds=await dialog.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=391);await p.screenshot({path:dir+'/preview-security-dialog.png',fullPage:true});await button(p,'Close dialog').tap();await expect(dialog).toHaveCount(0);
  await openFromBrowse(p,'/profiles/new');await tapInput(p,'profile-name','Mobile viewer');await p.locator('.avatar-picker label').last().tap();await p.getByRole('link',{name:'Cancel',exact:true}).tap();
  await button(p,'Choose Main').tap();await p.waitForURL('**/browse');await p.locator('.cinema-profile-trigger').tap();await p.locator('.cinema-profile-menu').getByRole('link',{name:'Account settings',exact:true}).tap();await p.waitForURL('**/account');
  await p.setViewportSize({width:844,height:390});await route(p,'/login');await measure(p,'landscape-login',844);
  evidence.interactions.push('Search typed/submitted, preference select/cancel, recovery dialog open/close/bounds, profile name/avatar/cancel, mobile profile menu navigation');
 }
 }
 await completeAuthForms(browser);assert.deepEqual(evidence.errors,[]);evidence.complete=true;
}catch(error){evidence.failure=String(error.stack||error);throw error;}
finally{await fs.writeFile(dir+'/'+channel+(authOnly?'-auth-completion':'-browser')+'.json',JSON.stringify(evidence,null,2));await browser?.close();server.kill();}
