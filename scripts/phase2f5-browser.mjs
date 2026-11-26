import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const mode=process.argv.includes('--preview')?'preview':'release',dir='docs/phase2f5',origin='http://127.0.0.1:3018';
const out={mode,screens:[],keyboard:[],actions:[],errors:[],http:[]};let browser,page;
const log=await fs.open(dir+'/'+mode+'-server.log','w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3018'],{windowsHide:true,stdio:['ignore',log.fd,log.fd],env:{...process.env,NEXT_PUBLIC_USE_MOCKS:mode==='preview'?'1':'0',NEXT_PUBLIC_FLURZI_CHANNEL:mode}});
const button=(name)=>page.getByRole('button',{name,exact:true});
async function metric(route,width){await page.evaluate(()=>document.fonts.ready);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=1,route+' overflow '+width);const small=await page.locator('.entry-password button,.entry-form input:not([type=checkbox]),.public-actions button').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<43.5||r.height<43.5);}).map(e=>({id:e.id,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));assert.deepEqual(small,[],'44px input/action targets');out.screens.push({route,width,overflow,smallTargets:small});}
async function keyInput(id,text,touch){const input=page.locator('#'+id);if(touch)await input.tap();else await input.click();await expect(input).toBeFocused();await input.press('ControlOrMeta+A');await input.press('Backspace');await page.keyboard.type(text);await expect(input).toHaveValue(text);await expect(input).toBeFocused();}
async function trace(){await page.evaluate(()=>{window.__events=[];for(const capture of [true,false])for(const type of ['keydown','keypress','keyup','beforeinput','input','focusin','focusout'])document.addEventListener(type,e=>{window.__events.push({type,capture,target:e.target.id,active:document.activeElement?.id,defaultPrevented:e.defaultPrevented,trusted:e.isTrusted,inputType:e.inputType,length:e.target.value?.length});if(type==='keydown')queueMicrotask(()=>window.__events.push({type:'after-keydown',defaultPrevented:e.defaultPrevented,active:document.activeElement?.id}));},capture);});}
try{
let ready=false;for(let n=0;n<80;n++){try{if((await fetch(origin+'/login',{signal:AbortSignal.timeout(5000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert(ready);
browser=await chromium.launch({timeout:300000,executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',args:['--log-file='+process.cwd()+'/'+dir+'/'+mode+'-chromium.log']});
for(const touch of [false,true]){
const context=await browser.newContext({viewport:{width:touch?390:1440,height:900},hasTouch:touch,isMobile:touch,reducedMotion:'reduce'});page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>out.errors.push(e.message));
for(const width of touch?[1920,1440,1024,768,430,390,375,360,320]:[1440]){
await page.setViewportSize({width,height:900});
for(const route of ['/login','/signup','/forgot-password']){
await page.goto(origin+route);await expect(page.locator('#email')).toBeEnabled();await trace();
await keyInput('email','viewer@example.com',touch);
if(route!=='/forgot-password'){
await keyInput('password','Keyboard-test-42',touch);
await button('Show password').click();await expect(page.locator('#password')).toBeFocused();await expect(page.locator('#password')).toHaveValue('Keyboard-test-42');await expect(page.locator('#password')).toHaveAttribute('type','text');
await page.keyboard.press('End');await page.keyboard.type('x');await expect(page.locator('#password')).toHaveValue('Keyboard-test-42x');
await button('Hide password').click();await expect(page.locator('#password')).toBeFocused();await expect(page.locator('#password')).toHaveAttribute('type','password');await expect(page.locator('#password')).toHaveJSProperty('selectionStart',17);await page.keyboard.press('Backspace');await expect(page.locator('#password')).toHaveValue('Keyboard-test-42');
}
if(route!=='/forgot-password'){const input=page.locator('#password');await input.evaluate(e=>e.setSelectionRange(3,8,'backward'));await button('Show password').click();await expect(input).toHaveJSProperty('selectionStart',3);assert.deepEqual(await input.evaluate(e=>[e.selectionStart,e.selectionEnd,e.selectionDirection]),[3,8,'backward']);await page.keyboard.type('Q');await expect(input).toHaveValue('KeyQ-test-42');await page.keyboard.press('Tab');await expect(button('Hide password')).toBeFocused();await page.keyboard.press('Enter');await expect(button('Show password')).toBeFocused();await expect(input).toHaveAttribute('type','password');}
const events=await page.evaluate(()=>window.__events);assert(events.some(e=>e.type==='input'));assert(!events.some(e=>e.type==='after-keydown'&&e.defaultPrevented));out.keyboard.push({route,width,touch,events});
await metric(route,width);
if(touch&&width===390&&route==='/login')await page.screenshot({path:dir+'/'+mode+'-390-login.png',fullPage:true});
if(mode==='release')await expect(button('Fill test credentials')).toHaveCount(0);
}
}
await page.setViewportSize({width:844,height:390});await page.goto(origin+'/login');await keyInput('email','landscape@example.com',touch);await keyInput('password','Landscape-test-42',touch);await button('Show password').click();await expect(page.locator('#password')).toBeFocused();await metric('/login-landscape',844);
await page.setViewportSize({width:390,height:844});await page.goto(origin+'/login');await keyInput('email','demo@flurzi.example',touch);await keyInput('password','preview-only',touch);await button('Sign in').click();
if(mode==='preview'){await page.waitForURL('**/subscribe');out.actions.push({touch,action:'raw-key sign-in confirmed by existing preview service'});}else{await expect(page.locator('main [role=alert]')).toBeVisible();out.actions.push({touch,action:'release sign-in unavailable; no success'});}
await page.goto(origin+'/signup');await keyInput('email','new-viewer@example.com',touch);await keyInput('password','Keyboard-test-42',touch);await page.locator('#legal').check();await button('Create account').click();
if(mode==='preview'){await page.waitForURL('**/verify-email');out.actions.push({touch,action:'raw-key registration confirmed; email verification required'});}else{await expect(page.locator('main [role=alert]')).toBeVisible();out.actions.push({touch,action:'release registration unavailable; no account created'});}
await page.goto(origin+'/forgot-password');await keyInput('email','viewer@example.com',touch);await button('Request reset link').click();
if(mode==='preview'){
await expect(page.locator('main')).toContainText('No email was sent');await page.locator('a[href*="/reset-password?token="]').click();
await keyInput('password','Keyboard-test-42',touch);await keyInput('confirm','Keyboard-test-42',touch);await button('Save new password').click();await expect(page.locator('main')).toContainText('No password was stored');
out.actions.push({touch,action:'recovery and two raw-key reset fields; truthful preview confirmation'});
}else{await expect(page.locator('main [role=alert]')).toBeVisible();out.actions.push({touch,action:'release recovery unavailable; no notification claim'});}
await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});page=await context.newPage();page.on('pageerror',e=>out.errors.push(e.message));
await page.goto(origin+'/premieres');await expect(page.locator('main')).toContainText('No release dates have been confirmed');
for(const width of [1920,1440,1024,768,430,390,375,360,320]){await page.setViewportSize({width,height:900});await metric('/premieres',width);if([1440,390,320].includes(width))await page.screenshot({path:dir+'/'+mode+'-'+width+'-premieres.png',fullPage:true});}
const reminder=page.getByRole('button',{name:'Save a local reminder',exact:true}).first();await reminder.tap();await expect(page.getByRole('button',{name:'Remove local reminder',exact:true}).first()).toHaveAttribute('aria-pressed','true');await page.reload();await expect(page.getByRole('button',{name:'Remove local reminder',exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Remove local reminder',exact:true}).first().tap();await expect(reminder).toBeVisible();
const link=page.getByRole('link',{name:/^About /}).first();const href=await link.getAttribute('href');await link.tap();await page.waitForURL('**'+href);await expect(page.locator('main h1')).toBeVisible();await page.goBack();await expect(page.locator('main')).toContainText('The opening-night clock');
await page.setViewportSize({width:844,height:390});await metric('/premieres-landscape',844);out.actions.push('Premiere local reminder toggle/reload/removal; actual catalog detail navigation/Back; no invented event/countdown');
for(const path of ['/player-lab','/api/player-lab/original.webm','/api/player-lab/captions.vtt','/scripts/fixtures/player/original.webm']){const res=await fetch(origin+path);out.http.push({path,status:res.status});assert.equal(res.status,404);}
assert.deepEqual(out.errors,[]);out.complete=true;
}catch(e){out.failure=String(e.stack??e);if(page){out.failedEvents=await page.evaluate(()=>window.__events).catch(()=>[]);out.failedSelection=await page.locator('#password').evaluate(e=>({start:e.selectionStart,end:e.selectionEnd})).catch(()=>null);out.failedUrl=page.url();out.failedText=await page.locator('body').innerText().catch(()=>'');await page.screenshot({path:dir+'/'+mode+'-failure.png'}).catch(()=>{});}throw e;}
finally{await fs.writeFile(dir+'/'+mode+'-browser.json',JSON.stringify(out,null,2));await browser?.close();server.kill();await new Promise(r=>server.once('exit',r));await log.close();out.serverExited=true;await fs.writeFile(dir+'/'+mode+'-browser.json',JSON.stringify(out,null,2));}
console.log(mode+' '+out.screens.length+' responsive observations passed');
