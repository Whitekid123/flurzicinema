import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const roots=['app','components','lib','types','styles'];
const files=['package.json','package-lock.json','playwright.config.ts','vitest.config.ts','proxy.ts'];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
for(const root of roots)await walk(root);
const hashes={};for(const file of files){const data=await fs.readFile(file);hashes[file.replaceAll('\\','/')]=createHash('sha256').update(data).digest('hex');}
await fs.mkdir('docs/phase2f1',{recursive:true});
await fs.writeFile('docs/phase2f1/baseline.json',JSON.stringify(hashes,null,2));
for(const file of ['components/streaming/StreamingShell.tsx','components/streaming/MediaPlayer.tsx']){const target='docs/rollback/pre-phase2f1/'+file;await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(file,target);}
console.log('Recorded',files.length,'existing files; backed up integration points.');
