import fs from 'node:fs/promises';import crypto from 'node:crypto';
const paths=[];async function walk(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=d+'/'+e.name;if(e.isDirectory())await walk(p);else paths.push(p);}}
for(const d of ['app','components','lib','types','data','styles','tests'])await walk(d);
paths.push('package.json','package-lock.json','playwright.config.ts','next.config.ts','proxy.ts','debug.log');
await fs.mkdir('docs/phase2f3',{recursive:true});const hashes={};
for(const p of paths){hashes[p]=crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex');}
await fs.writeFile('docs/phase2f3/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'});
