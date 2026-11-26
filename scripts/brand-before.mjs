import {chromium,expect} from '@playwright/test';import fs from 'node:fs/promises';
await fs.mkdir('docs/rebranding/before-captures',{recursive:true});const browser=await chromium.launch({timeout:300000,executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});const out=[];
try{const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',hasTouch:true});const p=await context.newPage();p.setDefaultNavigationTimeout(180000);
async function capture(name){for(const width of [1440,390]){await p.setViewportSize({width,height:1000});await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'docs/rebranding/before-captures/'+width+'-'+name+'.png'});out.push({name,width,url:p.url()});}await p.setViewportSize({width:1440,height:1000});}
await p.goto('http://127.0.0.1:3000/');await capture('home');

await p.goto('http://127.0.0.1:3000/login');await expect(p.locator('#email')).toBeEnabled();await capture('login');
await p.locator('#email').fill('demo@flurzi.example');await p.locator('#password').fill('preview-only');await p.getByRole('button',{name:'Sign in',exact:true}).click();await p.waitForURL('**/subscribe');await capture('subscribe');await p.locator('input[value="mock-essential"]').check();await p.getByRole('button',{name:'Save viewing preference',exact:true}).click();await p.getByRole('link',{name:'Continue to profiles',exact:true}).click();await capture('profiles');await p.getByRole('button',{name:'Choose Main',exact:true}).click();await p.waitForURL('**/browse');await capture('browse');
await p.locator('a[href="/browse/title/mock-quiet-beyond"]').first().click();await p.waitForURL('**/browse/title/mock-quiet-beyond');await capture('title');
await p.locator('.ds-title .ds-launch').click();await capture('datasense');await p.keyboard.press('Escape');
await p.locator('.lens-launch').first().click();await capture('storylens');await p.keyboard.press('Escape');
await p.locator('.cinema-profile-trigger').click();await p.getByRole('link',{name:'Account settings',exact:true}).click();await capture('account');
await p.locator('.cinema-desktop-nav a[href="/browse/rooms"]').click();await capture('rooms');
await p.locator('.cinema-profile-trigger').click();await p.getByRole('link',{name:'StoryMatch',exact:true}).click();await capture('storymatch');
}catch(e){out.push({failure:String(e.stack??e)});throw e;}finally{await fs.writeFile('docs/rebranding/before-browser.json',JSON.stringify(out,null,2));await browser.close();}
console.log(out.length+' before captures');
