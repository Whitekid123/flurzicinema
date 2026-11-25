import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const files=['package.json','package-lock.json','playwright.config.ts','vitest.config.ts','proxy.ts'];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
for(const dir of ['app','components','lib','types','styles','tests'])await walk(dir);
await fs.mkdir('docs/phase2f2',{recursive:true});
const hashes={};for(const file of files)hashes[file.replaceAll('\\','/')]=createHash('sha256').update(await fs.readFile(file)).digest('hex');
await fs.writeFile('docs/phase2f2/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'});
for(const file of ['components/streaming/StreamingShell.tsx','components/streaming/Rooms.tsx','app/browse/rooms/create/page.tsx']){const dest='docs/rollback/pre-phase2f2/'+file;await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(file,dest);}
console.log('Recorded',files.length,'existing sources/configuration files.');
