import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
await fs.mkdir('docs/phase2f5',{recursive:true});
const hashes={};async function scan(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await scan(p);else hashes[p]=crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex');}}
for(const d of ['app','components','lib','types','data','styles','tests'])await scan(d);
for(const p of ['package.json','package-lock.json','next.config.ts','playwright.config.ts','vitest.config.ts','tsconfig.json','proxy.ts','debug.log'])hashes[p]=crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex');
if(!(await fs.stat('docs/phase2f5/baseline.json').catch(()=>null)))await fs.writeFile('docs/phase2f5/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'}); console.log('Launching Chromium');
const browser=await chromium.launch({timeout:300000,executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
console.log('Browser ready');const result=[];
try{for(const mobile of [false,true]){
const context=await browser.newContext({viewport:{width:mobile?390:1440,height:900},hasTouch:mobile,isMobile:mobile});
const p=await context.newPage();await p.goto('http://127.0.0.1:3000/login');
await expect(p.locator('#password')).toBeVisible();
await p.evaluate(()=>{window.__trace=[];for(const phase of [true,false])for(const type of ['keydown','keypress','keyup','beforeinput','input','focusin','focusout'])document.addEventListener(type,e=>{window.__trace.push({type,phase,target:e.target.id,active:document.activeElement?.id,prevented:e.defaultPrevented,trusted:e.isTrusted,key:e.key,inputType:e.inputType,length:e.target.value?.length});if(type==='keydown')queueMicrotask(()=>window.__trace.push({type:'after-keydown',prevented:e.defaultPrevented,active:document.activeElement?.id}));},phase);});
for(const id of ['email','password']){const el=p.locator('#'+id);if(mobile)await el.tap();else await el.click();await p.keyboard.type('abc123');result.push({mobile,id,method:'type',length:(await el.inputValue()).length,trace:await p.evaluate(()=>window.__trace.splice(0))});await el.fill('');await p.keyboard.press('KeyA');result.push({mobile,id,method:'press-KeyA',length:(await el.inputValue()).length,trace:await p.evaluate(()=>window.__trace.splice(0))});}
await p.evaluate(()=>{const el=document.createElement('input');el.id='native-probe';el.type='password';el.style.cssText='position:fixed;top:100px;left:10px;z-index:999999';document.body.append(el);});
await p.locator('#native-probe').click();await p.keyboard.type('abc123');result.push({mobile,id:'native-uncontrolled',length:(await p.locator('#native-probe').inputValue()).length,trace:await p.evaluate(()=>window.__trace.splice(0))});
await p.setContent('<input id="plain"><input id="secure" type="password">');for(const id of ['plain','secure']){await p.locator('#'+id).click();await p.keyboard.type('abc123');result.push({mobile,id:'isolated-'+id,length:(await p.locator('#'+id).inputValue()).length});}
await context.close();
}}finally{await fs.writeFile('docs/phase2f5/initial-auth-investigation.json',JSON.stringify(result,null,2));await browser.close();}
console.log(JSON.stringify(result.map(r=>({mobile:r.mobile,id:r.id,method:r.method,length:r.length}))));
