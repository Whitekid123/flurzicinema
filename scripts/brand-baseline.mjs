import fs from 'node:fs/promises';import crypto from 'node:crypto';
const files=[];async function scan(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=d+'/'+e.name;if(e.isDirectory())await scan(p);else files.push(p);}}
for(const d of ['app','components','styles','lib','types','data','tests','public'])await scan(d);
files.push('package.json','package-lock.json','next.config.ts','playwright.config.ts','vitest.config.ts','tsconfig.json','proxy.ts','debug.log');
await fs.mkdir('docs/rebranding/before',{recursive:true});const hashes={};
for(const p of files){const b=await fs.readFile(p);hashes[p]=crypto.createHash('sha256').update(b).digest('hex');if(p.endsWith('.css')||['app/layout.tsx','components/layout/Header.tsx','components/layout/Footer.tsx','components/streaming/EntryUI.tsx','components/streaming/StreamingShell.tsx','components/streaming/AccountUI.tsx','components/home/CinemaHero.tsx'].includes(p)){const dest='docs/rebranding/before/'+p+'.txt';await fs.mkdir(dest.slice(0,dest.lastIndexOf('/')),{recursive:true});await fs.writeFile(dest,b);}}
await fs.writeFile('docs/rebranding/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'});console.log(files.length+' baseline files; affected styles and brand integrations backed up');
