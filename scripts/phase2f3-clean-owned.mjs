import fs from 'node:fs/promises';import path from 'node:path';import net from 'node:net';
const closed=await new Promise(r=>{const s=net.connect(3016,'127.0.0.1');s.on('error',()=>r(true));s.on('connect',()=>{s.destroy();r(false);});});
if(!closed)throw Error('Owned preview still listening; do not remove its output.');
const removed=[];for(const name of ['.phase2f3-lab','.next-storylens-qa']){
 const target=path.resolve(name);if(target!==path.join(process.cwd(),name))throw Error('Unexpected cleanup path');
 await fs.rm(target,{recursive:true,force:true});removed.push(target);
}
const helpers=['accessibility-fix','adjust-harness','browser-strengthen','capture-harness','escape-fix','expiry-render-fix','final-harness-detail','handoff','harness-fix','integrate','lab-integrate','polish','prewarm-harness','pure-expiry-fix','release-harness-fix','seek-harness-fix'];
for(const name of helpers){const target=path.resolve('scripts/phase2f3-'+name+'.mjs');if(path.dirname(target)!==path.join(process.cwd(),'scripts'))throw Error('Unexpected helper path');await fs.rm(target,{force:true});removed.push(target);}
await fs.writeFile('docs/phase2f3/owned-snapshot-cleanup.json',JSON.stringify({closed,removed},null,2));
