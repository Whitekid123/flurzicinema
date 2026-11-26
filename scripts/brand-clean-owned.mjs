import fs from 'node:fs/promises';import path from 'node:path';import net from 'node:net';
const closed=await new Promise(r=>{const s=net.connect(3020,'127.0.0.1');s.on('error',()=>r(true));s.on('connect',()=>{s.destroy();r(false);});});if(!closed)throw Error('Owned server still listening; do not remove its output.');
const target=path.resolve('.brand-lab');if(target!==path.join(process.cwd(),'.brand-lab'))throw Error('Unexpected cleanup path');await fs.rm(target,{recursive:true,force:true});
await fs.writeFile('docs/rebranding/owned-snapshot-cleanup.json',JSON.stringify({closed,removed:target},null,2));
