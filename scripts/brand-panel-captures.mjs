import fs from 'node:fs/promises';
const p='scripts/brand-browser.mjs';let s=await fs.readFile(p,'utf8');
const helper="async function panelCapture(selector,name){for(const width of [1440,390]){await p.setViewportSize({width,height:1000});await p.locator(selector).screenshot({path:dir+'/'+mode+'-captures/'+width+'-'+name+'.png'});}await p.setViewportSize({width:1440,height:1000});}\n";
s=s.replace('async function contrast(){',helper+'async function contrast(){');
s=s.replace("await capture('storylens');","await capture('storylens');await panelCapture('.lens-panel','storylens-panel');");
s=s.replace("await capture('datasense');","await capture('datasense');await panelCapture('.ds-title-plan','datasense-panel');");
s=s.replace("await art.screenshot({path:dir+'/'+mode+'-captures/official-brand-art.png'});","await art.screenshot({path:dir+'/'+mode+'-captures/official-brand-art.png'});await panelCapture('.footer','public-footer');");
await fs.writeFile(p,s);
