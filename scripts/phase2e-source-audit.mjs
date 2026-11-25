import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const {protectedFiles}=JSON.parse(fs.readFileSync('docs/rollback/pre-phase2e/snapshot.json','utf8'));
const results=Object.entries(protectedFiles).map(([path,expected])=>({path,unchanged:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')===expected}));
fs.writeFileSync('docs/phase2e/source-audit.json',JSON.stringify({protectedCount:results.length,results},null,2));assert(results.every(r=>r.unchanged),'Protected source changed');console.log('Protected sources unchanged:',results.length);
