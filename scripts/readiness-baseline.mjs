import fs from 'node:fs/promises';
import crypto from 'node:crypto';
if(await fs.stat('docs/readiness/baseline.json').then(()=>true,()=>false))throw Error('The initial baseline already exists; it must not be overwritten.');
const files=[];
async function scan(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await scan(p);else files.push(p);}}
for(const d of ['app','components','lib','styles','tests'])await scan(d);
files.push('package.json','next.config.ts','.env.example','proxy.ts');
await fs.mkdir('docs/readiness/before',{recursive:true});
const hashes={};for(const p of files){const b=await fs.readFile(p);hashes[p]=crypto.createHash('sha256').update(b).digest('hex');await fs.mkdir('docs/readiness/before/'+p.split('/').slice(0,-1).join('/'),{recursive:true});await fs.writeFile('docs/readiness/before/'+p+'.txt',b);}
await fs.writeFile('docs/readiness/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'});
