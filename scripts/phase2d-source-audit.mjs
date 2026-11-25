import fs from 'node:fs';import crypto from 'node:crypto';
const snapshot=JSON.parse(fs.readFileSync('docs/rollback/pre-phase2d/SNAPSHOT.json','utf8'));
const changed=snapshot.protectedFiles.filter(p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==snapshot.hashes[p]);
const result={protectedFiles:snapshot.protectedFiles.length,changed};fs.mkdirSync('docs/phase2d',{recursive:true});fs.writeFileSync('docs/phase2d/source-audit.json',JSON.stringify(result,null,2));console.log(result);if(changed.length)process.exitCode=1;
