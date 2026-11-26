import fs from 'node:fs/promises';import path from 'node:path';
const names=['contracts','integrate','public-lab','hardening','cleanup-fix','testfix','smallfix','ui-refine','rangefix','handoff','harness-fix','browser-strengthen','preview-strengthen','loop-harness','copyfix','capture-harness','test-strengthen','expiry-fix','subscription-fix','consumer-copy','audit-refine','final-polish','auth-diagnose','auth-input-probe','auth-focus-probe','auth-entry','password-probe-refine','planner-harness','nav-harness','log-evidence','production-maps','interruption-report','resume-validation','recover-build'];
const removed=[];
for(const name of names){const target=path.resolve('scripts/phase2f4-'+name+'.mjs');if(path.dirname(target)!==path.join(process.cwd(),'scripts'))throw Error('Unexpected helper target');await fs.rm(target,{force:true});removed.push(target);}
await fs.writeFile('docs/phase2f4/mutation-helper-cleanup.json',JSON.stringify({removed},null,2));
