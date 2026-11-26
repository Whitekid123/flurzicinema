import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const mode=process.argv.includes('--dev')?'development':process.argv.includes('--preview')?'preview':'release';
const dir='docs/phase2f3',origin='http://127.0.0.1:3016',widths=[1920,1440,1024,768,430,390,375,360,320];
const out={mode,screens:[],interactions:[],errors:[],http:[]};let browser;
await fs.mkdir(dir,{recursive:true});
const log=await fs.open(dir+'/'+mode+'-server.log','w');
const server=spawn(process.execPath,(mode==='development'?['scripts/phase2f3-dev-server.mjs']:['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3016']),{windowsHide:true,stdio:['ignore',log.fd,log.fd],env:{...process.env,NEXT_PUBLIC_USE_MOCKS:mode==='release'?'0':'1',NEXT_PUBLIC_FLURZI_CHANNEL:mode==='release'?'release':'preview',FLURZI_PLAYER_LAB:mode==='development'?'1':'0'}});
const button=(p,name)=>p.getByRole('button',{name,exact:true});
async function check(p,name,width){await p.evaluate(()=>document.fonts.ready);const metrics=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,video:document.querySelector('video')?.getBoundingClientRect().width}));assert(metrics.overflow<=1,name+' overflow '+JSON.stringify(metrics));const small=await p.locator('.storylens button').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<43.5||r.height<43.5);}).map(e=>e.textContent));assert.deepEqual(small,[],'StoryLens touch target dimensions');out.screens.push({name,width,...metrics});}
async function auth(p){
 await p.goto(origin+'/login',{timeout:180000});await p.locator('#email').tap();await p.keyboard.type('demo@flurzi.example');await expect(p.locator('#email')).toHaveValue('demo@flurzi.example');
 await p.locator('#password').tap();await p.keyboard.type('preview-only');await button(p,'Show password').tap();await expect(p.locator('#password')).toBeFocused();await expect(p.locator('#password')).toHaveAttribute('type','text');await button(p,'Hide password').tap();
 await button(p,'Sign in').tap();await p.waitForURL('**/subscribe');await p.locator('input[value="mock-essential"]').tap();await button(p,'Save viewing preference').tap();await p.getByRole('link',{name:'Continue to profiles',exact:true}).tap();await button(p,'Choose Main').tap();await p.waitForURL('**/browse');
 await p.locator('a[href="/browse/title/mock-quiet-beyond"]').first().tap();await p.waitForURL('**/browse/title/mock-quiet-beyond');
}
async function seek(p,time){await p.locator('video').evaluate((v,t)=>{v.pause();v.currentTime=t;},time);await expect.poll(()=>p.locator('video').evaluate((v,t)=>Math.abs(v.currentTime-t),time)).toBeLessThan(.5);out.seeks??=[];out.seeks.push(await p.locator('video').evaluate(v=>({time:v.currentTime,paused:v.paused,duration:v.duration,seekable:Array.from({length:v.seekable.length},(_,i)=>[v.seekable.start(i),v.seekable.end(i)])})));}
async function catalog(p){
  await auth(p);
  for(const width of widths){await p.setViewportSize({width,height:900});await p.locator('.lens-launch').tap();await expect(p.locator('.lens-scroll')).toContainText('currently unavailable');await expect(p.locator('.lens-section')).toContainText('The story, in focus');await check(p,'title-storylens',width);if([1440,390,320].includes(width)){await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:dir+'/'+mode+'-'+width+'-title-panel.png',fullPage:true});}await p.keyboard.press('Escape');await expect(p.locator('.lens-launch')).toBeFocused();}
  await p.setViewportSize({width:390,height:844});await p.locator('.lens-launch').tap();await button(p,'Related content').tap();await expect(p.locator('.lens-related')).not.toHaveCount(0);await p.locator('.lens-related').first().getByRole('button',{name:'Explore title',exact:true}).tap();
  const dialog=p.getByRole('dialog');await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'Close dialog'}).focus();await p.keyboard.press('Shift+Tab');await expect(dialog.getByRole('link',{name:'Go to title details'})).toBeFocused();await p.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Close dialog'})).toBeFocused();await p.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(p.locator('.lens-related').first().getByRole('button',{name:'Explore title',exact:true})).toBeFocused();
  await p.locator('.lens-related').first().getByRole('button',{name:'Explore title',exact:true}).tap();await dialog.getByRole('link',{name:'Go to title details'}).tap();await p.waitForURL(url=>url.pathname.startsWith('/browse/title/')&&!url.pathname.endsWith('mock-quiet-beyond'));await p.goBack();await p.waitForURL('**/browse/title/mock-quiet-beyond');await expect(p.locator('.lens-launch')).toBeVisible();
  out.interactions.push('Normal touch sign-in/profile flow retained; unavailable/retry/catalog fallback; nine widths; related confirmation/Escape/focus restoration/intentional navigation/Back');

}
try{
 let ready=false;for(let n=0;n<180;n++){try{if((await fetch(origin+'/login',{signal:AbortSignal.timeout(5000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert(ready,'Owned server ready');
 if(mode==='development'){await fetch(origin+'/browse/title/mock-quiet-beyond',{signal:AbortSignal.timeout(180000)});out.prewarmed=['/browse/title/mock-quiet-beyond'];}
 browser=await chromium.launch({timeout:300000,executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',args:['--log-file='+process.cwd()+'/'+dir+'/chromium.log']});
 const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();p.setDefaultTimeout(45000);p.on('pageerror',e=>out.errors.push(e.message));
 if(mode==='development'){
  await p.goto(origin+'/player-lab',{timeout:180000});await expect(p.locator('video')).toHaveJSProperty('readyState',4,{timeout:60000});
  for(const width of widths){
   await p.setViewportSize({width,height:900});await seek(p,5);
   const before=await p.locator('video').evaluate(v=>({paused:v.paused,time:v.currentTime}));
   await p.locator('.lens-launch').tap();await expect(p.locator('.lens-header h2')).toBeFocused();
   await expect(p.locator('.lens-section')).toContainText('The opening study');assert.equal(await p.locator('video').evaluate(v=>v.paused),before.paused);
   await button(p,'Cast & characters').tap();await expect(p.locator('.lens-section')).toContainText('Test performer');
   await button(p,'Music & soundtrack').tap();await expect(p.locator('.lens-section')).toContainText('A synthesized tone');
   await button(p,'Locations').tap();await expect(p.locator('.lens-section')).toContainText('A generated canvas');
   await button(p,'Film insights').tap();await expect(p.locator('.storylens')).not.toContainText('FUTURE_TEST_SECRET');await expect(p.locator('.storylens')).not.toContainText('UNCLASSIFIED_TEST_SECRET');
   await check(p,'player-panel',width);if([1440,390,320].includes(width))await p.screenshot({path:dir+'/'+width+'-player-panel.png',fullPage:true});
   await button(p,'Close StoryLens').tap();await expect(p.locator('.lens-launch')).toBeFocused();await expect(p.locator('.lens-panel')).toHaveCount(0);
  }
  await p.setViewportSize({width:390,height:844});await seek(p,14);await p.locator('.lens-launch').tap();await expect(p.locator('.lens-section')).toContainText('The second half');
  await expect(p.locator('.storylens')).not.toContainText('REVEALED_TEST_DETAIL');await button(p,'Reveal this detail').focus();await p.keyboard.press('Enter');await expect(p.locator('.storylens')).toContainText('REVEALED_TEST_DETAIL');
  await seek(p,12);await expect(p.locator('.storylens')).not.toContainText('REVEALED_TEST_DETAIL');
  await seek(p,5);await expect(p.locator('.lens-section')).toContainText('The opening study');await expect(button(p,'Reveal this detail')).toHaveCount(0);
  await p.keyboard.press('Escape');await expect(p.locator('.lens-launch')).toBeFocused();
  await button(p,'Player settings').tap();await p.getByLabel('Subtitles',{exact:true}).selectOption('0');await button(p,'Close settings').tap();
  await button(p,'Play').tap();await expect.poll(()=>p.locator('video').evaluate(v=>v.paused)).toBe(false);
  await p.locator('.lens-launch').tap();await expect.poll(()=>p.locator('video').evaluate(v=>v.paused)).toBe(false);await button(p,'Close StoryLens').tap();
  const caption=await p.locator('video').evaluate(v=>v.textTracks[0]?.mode);assert.equal(caption,'showing');
  await button(p,'Pause').tap();
  await button(p,'Enable isolated room-control test').tap();await button(p,'Play').tap();await expect(p.getByTestId('lab-room-intents')).toHaveText('Room intents: 1');await expect.poll(()=>p.locator('video').evaluate(v=>v.paused)).toBe(false);const intents=await p.getByTestId('lab-room-intents').innerText();
  await p.locator('.lens-launch').tap();await button(p,'Overview').tap();await button(p,'Close StoryLens').tap();assert.equal(await p.getByTestId('lab-room-intents').innerText(),intents);
  await button(p,'Disable isolated room-control test').tap();
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.lens-launch').tap();assert.equal(await p.locator('.lens-panel').evaluate(e=>getComputedStyle(e).animationName),'none');
  await p.setViewportSize({width:844,height:390});await check(p,'landscape-player',844);await p.screenshot({path:dir+'/landscape-player.png',fullPage:true});await button(p,'Close StoryLens').tap();
  const full=button(p,'Fullscreen');if(await full.isVisible()){await full.tap();await expect.poll(()=>p.evaluate(()=>!!document.fullscreenElement)).toBe(true);await p.locator('.lens-launch').tap();await expect(p.locator('.lens-panel')).toBeVisible();assert(await p.locator('.lens-panel').evaluate(e=>document.fullscreenElement?.contains(e)));await button(p,'Close StoryLens').tap();await button(p,'Exit fullscreen').tap();}
  if(process.argv.includes('--with-catalog'))await catalog(p);
  out.interactions.push('Nine widths: panel tap/category/close/focus; boundary/forward/backward seek; explicit spoiler reveal/reset; unknown/future suppression; playback continues; captions retained; zero panel room intents; reduced motion; landscape and fullscreen');
 }else if(mode==='preview'){
  await catalog(p);
 }else{
  for(const width of widths){await p.setViewportSize({width,height:844});await p.goto(origin+'/login');await p.locator('#email').tap();await p.keyboard.type('viewer@example.com');await expect(p.locator('#email')).toBeFocused();await p.locator('#password').tap();await p.keyboard.type('a-password');await expect(p.locator('#password')).toBeFocused();await button(p,'Show password').tap();await expect(p.locator('#password')).toBeFocused();await expect(p.locator('#password')).toHaveAttribute('type','text');await button(p,'Hide password').tap();await check(p,'release-auth-input',width);await expect(button(p,'Fill test credentials')).toHaveCount(0);}
  await button(p,'Sign in').tap();await expect(p.locator('main [role=alert]')).toBeVisible();
  await p.goto(origin+'/features');await expect(p.locator('#storylens')).toContainText('Look a little');await p.locator('#storylens a').tap();await p.waitForURL('**/browse/movies');await expect(p.locator('.entry-gate')).toContainText('unable to access your account');await expect(p.locator('.lens-launch')).toHaveCount(0);await p.getByRole('link',{name:'Return to sign in',exact:true}).tap();await p.waitForURL('**/login');
  out.interactions.push('Release auth fields tap/focus/type at nine widths; real unavailable submission; StoryLens discovery uses auth guard; no test credential utility');
 }
 for(const path of ['/player-lab','/api/player-lab/original.webm','/api/player-lab/captions.vtt','/scripts/fixtures/player/original.webm']){const res=await fetch(origin+path);out.http.push({path,status:res.status});assert.equal(res.status,mode==='development'&&!path.startsWith('/scripts')?200:404);}
 assert.deepEqual(out.errors,[]);out.complete=true;
}catch(e){out.failure=String(e.stack??e);throw e;}finally{await fs.writeFile(dir+'/'+mode+(process.argv.includes('--with-catalog')?'-final':'')+'-browser.json',JSON.stringify(out,null,2));await browser?.close();server.kill();await log.close();}
