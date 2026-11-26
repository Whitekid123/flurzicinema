import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const mode=process.argv.includes('--dev')?'development':process.argv.includes('--preview')?'preview':'release';
const dir='docs/rebranding',origin='http://127.0.0.1:3020',widths=[1920,1440,1024,768,430,390,375,360,320];
const out={mode,screens:[],interactions:[],errors:[],http:[]};let browser,currentPage;
const log=await fs.open(dir+'/'+mode+'-server.log','w');
const server=spawn(process.execPath,mode==='development'?['scripts/rebranding-dev-server.mjs']:['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3020'],{windowsHide:true,stdio:['ignore',log.fd,log.fd],env:{...process.env,NEXT_PUBLIC_USE_MOCKS:mode==='release'?'0':'1',NEXT_PUBLIC_FLURZI_CHANNEL:mode==='release'?'release':'preview',FLURZI_PLAYER_LAB:mode==='development'?'1':'0'}});
const button=(p,name)=>p.getByRole('button',{name,exact:true});
async function check(p,name,width){
 await p.evaluate(()=>document.fonts.ready);
 const metrics=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,videoWidth:document.querySelector('video')?.getBoundingClientRect().width}));
 assert(metrics.overflow<=1,name+' overflow '+JSON.stringify(metrics));
 const small=await p.locator('.data-sense button,.data-sense input,.data-sense select,.data-sense summary').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<43.5||r.height<43.5);}).map(e=>({text:e.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
 assert.deepEqual(small,[],'44px DataSense targets');out.screens.push({name,width,...metrics});
}
async function calculator(p,width){
 await p.setViewportSize({width,height:900});
 const calc=p.getByRole('region',{name:'Independent data calculator'});
 await calc.getByLabel('Available viewing budget',{exact:true}).tap();await p.keyboard.type('1');
 await expect(calc.getByLabel('Available viewing budget',{exact:true})).toBeFocused();
 await calc.getByLabel('Budget unit',{exact:true}).selectOption('GB');
 await calc.getByLabel('Combined audio and video bitrate in Mbps').fill('4');
 await calc.getByLabel('Viewing time in minutes').fill('60');
 await expect(calc.locator('.ds-hero-number strong')).toHaveText('1.8 GB');await expect(calc).toContainText('Estimate exceeds your budget');
 await calc.getByLabel('Budget unit',{exact:true}).selectOption('MB');await calc.getByLabel('Available viewing budget',{exact:true}).fill('2000');
 await expect(calc).toContainText('Estimate is approaching your budget');await calc.getByLabel('Available viewing budget',{exact:true}).fill('3000');await expect(calc).toContainText('Estimated use fits your budget');
 await calc.getByLabel('Available viewing budget',{exact:true}).fill('-1');await expect(calc.getByLabel('Available viewing budget',{exact:true})).toHaveAttribute('aria-invalid','true');
 await calc.getByLabel('Available viewing budget',{exact:true}).fill('2000');
 await check(p,'public-calculator',width);
 if([1440,390,320].includes(width)){await calc.scrollIntoViewIfNeeded();await p.locator('#datasense').screenshot({path:dir+'/'+mode+'-'+width+'-calculator.png'});}
 await button(calc,'Reset calculator').tap();await expect(calc.getByLabel('Available viewing budget',{exact:true})).toHaveValue('');await expect(calc.locator('.ds-hero-number strong')).toHaveText('Your estimate starts here');
}
async function auth(p){
 const record=async name=>{out.authSteps??=[];out.authSteps.push({name,...await p.evaluate(()=>({email:document.querySelector('#email')?.value,passwordLength:document.querySelector('#password')?.value.length,passwordAttributeLength:document.querySelector('#password')?.getAttribute('value')?.length,active:document.activeElement?.id,documentFocus:document.hasFocus(),readOnly:document.querySelector('#password')?.readOnly,disabled:document.querySelector('#password')?.disabled}))});};
 await p.goto(origin+'/login',{timeout:180000});await p.locator('#email').tap();await p.keyboard.type('demo@flurzi.example');await p.locator('#password').tap();await expect(p.locator('#password')).toBeFocused();await record('password-tap');await p.locator('#password').fill('preview-only');out.passwordEntryMethod='tap and standard input events';await record('password-entered');await expect(p.locator('#password')).toHaveValue('preview-only');
 await button(p,'Show password').tap();await record('password-shown');await expect(p.locator('#password')).toBeFocused();await button(p,'Hide password').tap();await record('password-hidden');await expect(p.locator('#email')).toHaveValue('demo@flurzi.example');await expect(p.locator('#password')).toHaveValue('preview-only');await button(p,'Sign in').tap();
 await p.waitForURL('**/subscribe');await p.locator('input[value="mock-essential"]').tap();await button(p,'Save viewing preference').tap();await p.getByRole('link',{name:'Continue to profiles',exact:true}).tap();await button(p,'Choose Main').tap();await p.waitForURL('**/browse');
 await p.locator('a[href="/browse/title/mock-quiet-beyond"]').first().tap();await p.waitForURL('**/browse/title/mock-quiet-beyond');
}
async function player(p){
 await p.goto(origin+'/player-lab',{timeout:180000});await expect(p.locator('video')).toHaveJSProperty('readyState',4,{timeout:60000});
 await p.locator('video').evaluate(v=>{v.loop=true;});
 const ds=p.locator('.ds-player');
 for(const width of widths){
  await p.setViewportSize({width,height:900});await ds.locator('.ds-launch').tap();await expect(ds.locator('h2')).toBeFocused();
  const input=ds.getByLabel('Available viewing budget',{exact:true});await input.tap();await p.keyboard.type('10');await expect(input).toHaveValue('10');await expect(input).toBeFocused();await ds.getByLabel('Budget unit',{exact:true}).selectOption('MB');
  await expect(ds).toContainText('Illustrative test telemetry');await expect(ds.getByLabel('Current playback quality')).toHaveValue('example-a');
  await check(p,'player-datasense',width);
  if([1440,390,320].includes(width)){await ds.locator('.ds-panel-scroll').evaluate(e=>{e.scrollTop=0;});await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:dir+'/'+width+'-player.png',fullPage:true});}
  await button(ds,'Clear budget').tap();await p.keyboard.press('Escape');await expect(ds.locator('.ds-launch')).toBeFocused();await expect(ds.locator('.ds-panel')).toHaveCount(0);
 }
 await p.setViewportSize({width:390,height:844});
 await button(p,'Player settings').tap();await p.getByLabel('Subtitles',{exact:true}).selectOption('0');await button(p,'Close settings').tap();await button(p,'Play').tap();await expect.poll(()=>p.locator('video').evaluate(v=>v.paused)).toBe(false);
 await ds.locator('.ds-launch').tap();const input=ds.getByLabel('Available viewing budget',{exact:true});await input.tap();await p.keyboard.type('100');await new Promise(r=>setTimeout(r,1400));await expect(input).toBeFocused();await expect(input).toHaveValue('100');await expect.poll(()=>p.locator('video').evaluate(v=>v.paused)).toBe(false);
 await p.locator('.lens-launch').tap();await expect(ds.locator('.ds-panel')).toHaveCount(0);await expect(p.locator('.lens-panel')).toBeVisible();
 await ds.locator('.ds-launch').tap();await expect(p.locator('.lens-panel')).toHaveCount(0);await expect(ds.locator('.ds-panel')).toBeVisible();
 await button(p,'Pause').tap();await ds.getByLabel('Budget unit',{exact:true}).selectOption('MB');await input.fill('.001');await expect(ds.locator('.ds-notification')).toContainText('Estimated session use exceeds your budget');await button(ds,'Continue watching').tap();await expect(ds.locator('.ds-notification')).toHaveCount(0);await input.fill('1');
 await button(p,'Add example 1 MB transfer').tap();await expect(ds.locator('.ds-notification')).toContainText('Example transfer total reached your budget');
 const fact=ds.locator('.ds-live-facts>div').filter({has: p.getByText('Example transfer total',{exact:true})});await expect(fact.locator('dd')).toHaveText('1 MB');
 await button(p,'Repeat example transfer event').tap();await expect(fact.locator('dd')).toHaveText('1 MB');
 await button(ds,'Dismiss data budget notification').tap();await expect(ds.locator('.ds-notification')).toHaveCount(0);await button(p,'Repeat example transfer event').tap();await expect(ds.locator('.ds-notification')).toHaveCount(0);
 const before=await p.locator('video').evaluate(v=>({time:v.currentTime,src:v.currentSrc,paused:v.paused}));
 await ds.getByLabel('Current playback quality').selectOption('example-b');await expect(ds.getByLabel('Current playback quality')).toHaveValue('example-b');
 const after=await p.locator('video').evaluate(v=>({time:v.currentTime,src:v.currentSrc,paused:v.paused}));assert.equal(after.src,before.src);assert.equal(after.paused,before.paused);assert(Math.abs(after.time-before.time)<.1);
 await button(ds,'Clear budget').tap();await button(ds,'Close DataSense').tap();
 await button(p,'Enable isolated room-control test').tap();await button(p,'Play').tap();await expect(p.getByTestId('lab-room-intents')).toHaveText('Room intents: 1');
 const intents=await p.getByTestId('lab-room-intents').innerText();await ds.locator('.ds-launch').tap();await ds.getByLabel('Available viewing budget',{exact:true}).fill('10');await ds.getByLabel('Current playback quality').selectOption('example-a');await button(ds,'Close DataSense').tap();assert.equal(await p.getByTestId('lab-room-intents').innerText(),intents);
 await button(p,'Disable isolated room-control test').tap();assert.equal(await p.locator('video').evaluate(v=>v.textTracks[0]?.mode),'showing');await p.locator('video').evaluate(v=>{v.pause();v.currentTime=14;});await p.locator('.lens-launch').tap();await expect(p.locator('.lens-section')).toContainText('The second half');await button(p,'Reveal this detail').focus();await p.keyboard.press('Enter');await expect(p.locator('.storylens')).toContainText('REVEALED_TEST_DETAIL');await p.locator('video').evaluate(v=>{v.currentTime=5;});await expect(p.locator('.storylens')).not.toContainText('REVEALED_TEST_DETAIL');await expect(p.locator('.storylens')).not.toContainText('FUTURE_TEST_SECRET');await p.keyboard.press('Escape');
 await p.emulateMedia({reducedMotion:'reduce'});await ds.locator('.ds-launch').tap();assert.equal(await ds.locator('.ds-panel').evaluate(e=>getComputedStyle(e).animationName),'none');
 await p.setViewportSize({width:844,height:390});await check(p,'landscape-player',844);await button(ds,'Close DataSense').tap();
 if(await button(p,'Fullscreen').isVisible()){await button(p,'Fullscreen').tap();await expect.poll(()=>p.evaluate(()=>!!document.fullscreenElement)).toBe(true);await ds.locator('.ds-launch').tap();assert(await ds.locator('.ds-panel').evaluate(e=>document.fullscreenElement?.contains(e)));await button(ds,'Close DataSense').tap();await button(p,'Exit fullscreen').tap();}
 await button(p,'Use native unknown telemetry').tap();await expect(p.locator('video')).toHaveJSProperty('readyState',4);await ds.locator('.ds-launch').tap();await expect(ds).toContainText('This source does not report a usable bitrate');await expect(ds.getByLabel('Current playback quality')).toHaveCount(0);await expect(ds.locator('.ds-live-facts')).not.toContainText('0 MB');
 out.interactions.push('Player: nine widths; touch typing/focus during playback; panel exclusivity; local example transfer deduplication and notification dismissal; confirmed example selection preserves source/position; zero auxiliary room intents; reduced motion; landscape; fullscreen; native unknown telemetry');
}
try{
 let ready=false;for(let n=0;n<180;n++){try{if((await fetch(origin+'/login',{signal:AbortSignal.timeout(5000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert(ready,'Owned server ready');
 if(mode==='development'){for(const path of ['/player-lab','/features','/browse/title/mock-quiet-beyond','/api/player-lab/original.webm','/api/player-lab/captions.vtt'])await fetch(origin+path,{signal:AbortSignal.timeout(180000)});}
 browser=await chromium.launch({timeout:300000,executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',args:['--log-file='+process.cwd()+'/'+dir+'/chromium.log']});
 const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();currentPage=p;p.setDefaultTimeout(45000);p.on('pageerror',e=>out.errors.push(e.message));
 if(mode==='development')await player(p);
 if(!process.argv.includes('--auth-only')){await p.goto(origin+'/features',{timeout:180000});for(const width of widths)await calculator(p,width);}else await p.setViewportSize({width:320,height:900});
 if(mode==='preview'){
  await auth(p);
  for(const width of widths){await p.setViewportSize({width,height:900});await p.locator('.ds-title .ds-launch').tap();await expect(p.locator('.ds-title')).toContainText('No verified bitrate is available');await p.locator('.ds-title-plan').getByLabel('Available viewing budget',{exact:true}).fill('1');await check(p,'title-unavailable-planning',width);if([1440,390,320].includes(width))await p.locator('.ds-title').screenshot({path:dir+'/preview-'+width+'-title.png'});await p.keyboard.press('Escape');await expect(p.locator('.ds-title .ds-launch')).toBeFocused();}
  await p.locator('.cinema-profile-trigger').tap();await p.locator('.cinema-profile-menu').getByRole('link',{name:'Account settings',exact:true}).tap();await p.locator('.account-sidebar a[href="/account/preferences"]').tap();await p.waitForURL('**/account/preferences');
  const pref=p.locator('.ds-preferences');await pref.getByLabel('Data-use preference',{exact:true}).selectOption('low');await button(pref,'Cancel preference changes').tap();await expect(pref.getByLabel('Data-use preference',{exact:true})).toHaveValue('auto');await pref.getByLabel('Data-use preference',{exact:true}).selectOption('low');await button(pref,'Save data preference').tap();await expect(pref).toContainText('Preference saved');
  for(const width of widths){await p.setViewportSize({width,height:900});await check(p,'account-preference',width);if([1440,390,320].includes(width))await pref.screenshot({path:dir+'/preview-'+width+'-preference.png'});}
  await p.goBack();await p.goForward();await expect(p.locator('.ds-preferences').getByLabel('Data-use preference',{exact:true})).toHaveValue('low');
  await p.locator('.account-back').tap();await p.locator('a[href="/browse/title/mock-velvet-hours"]').first().tap();await p.waitForURL('**/browse/title/mock-velvet-hours');await p.locator('.ds-title .ds-launch').tap();const planner=p.locator('.ds-title');await expect(planner).toContainText('Choose a listed episode');await planner.getByLabel('Episode for data estimate').selectOption('mock-vh-s1e1');await expect(planner).toContainText('Supplied runtime: 42 min');await planner.getByLabel('Episode for data estimate').selectOption('mock-vh-s1e2');await expect(planner).toContainText('Supplied runtime: 44 min');await expect(planner).toContainText('No verified bitrate is available');await expect(p.locator('video')).toHaveCount(0);
  await p.locator('.cinema-profile-trigger').tap();await p.getByRole('link',{name:'Switch profile',exact:true}).tap();await button(p,'Choose Kids').tap();await p.locator('#profile-unlock-pin').fill('1234');await button(p,'Open profile').tap();await p.waitForURL('**/browse');
  await p.locator('.cinema-profile-trigger').tap();await p.locator('.cinema-profile-menu').getByRole('link',{name:'Account settings',exact:true}).tap();await p.locator('.account-sidebar a[href="/account/preferences"]').tap();await p.waitForURL('**/account/preferences');await expect(p.locator('.ds-preferences').getByLabel('Data-use preference',{exact:true})).toHaveValue('auto');await p.locator('.ds-preferences').getByLabel('Data-use preference',{exact:true}).selectOption('medium');await button(p.locator('.ds-preferences'),'Save data preference').tap();await expect(p.locator('.ds-preferences')).toContainText('Preference saved');
  await p.locator('.cinema-profile-trigger').tap();await p.getByRole('link',{name:'Switch profile',exact:true}).tap();await button(p,'Choose Main').tap();await p.waitForURL('**/browse');await p.locator('.cinema-profile-trigger').tap();await p.locator('.cinema-profile-menu').getByRole('link',{name:'Account settings',exact:true}).tap();await p.locator('.account-sidebar a[href="/account/preferences"]').tap();await expect(p.locator('.ds-preferences').getByLabel('Data-use preference',{exact:true})).toHaveValue('low');
  out.interactions.push('Episode-specific 42/44 minute runtime; no bitrate/video fabrication; actual Kids PIN flow and separated Main/Kids preferences');
  out.interactions.push('Normal preview auth/profile flow; title unknown metadata and budget input; account preference cancel/save/client-navigation persistence');
 }else if(mode==='release'){
  for(const width of widths){await p.setViewportSize({width,height:844});await p.goto(origin+'/login');await p.locator('#email').tap();await p.keyboard.type('viewer@example.com');await expect(p.locator('#email')).toBeFocused();await p.locator('#password').tap();await p.locator('#password').fill('a-password');await expect(p.locator('#password')).toHaveValue('a-password');await button(p,'Show password').tap();await expect(p.locator('#password')).toHaveValue('a-password');await expect(p.locator('#password')).toBeFocused();await expect(p.locator('#password')).toHaveAttribute('type','text');await check(p,'release-auth',width);await expect(button(p,'Fill test credentials')).toHaveCount(0);}
  await button(p,'Sign in').tap();await expect(p.locator('main [role=alert]')).toBeVisible();out.interactions.push('Release login tap/type/visibility focus at nine widths; unavailable submission remains accurate; no test credentials');
 }
 for(const path of ['/player-lab','/api/player-lab/original.webm','/api/player-lab/captions.vtt','/scripts/fixtures/player/original.webm']){const res=await fetch(origin+path);out.http.push({path,status:res.status});assert.equal(res.status,mode==='development'&&!path.startsWith('/scripts')?200:404);}
 assert.deepEqual(out.errors,[]);out.complete=true;
}catch(e){out.failure=String(e.stack??e);if(currentPage){out.failedPage={url:currentPage.url(),text:await currentPage.locator('body').innerText().catch(()=>''),inputs:await currentPage.locator('input').evaluateAll(es=>es.map(e=>({id:e.id,type:e.type,value:e.id==='password'?'[redacted]':e.value}))).catch(()=>[])};await currentPage.screenshot({path:dir+'/'+mode+'-failure.png',fullPage:true}).catch(()=>{});}throw e;}finally{await fs.writeFile(dir+'/'+mode+'-browser.json',JSON.stringify(out,null,2));await browser?.close();server.kill();await log.close();}
