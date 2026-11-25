import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3015'],{windowsHide:true,env:{...process.env,NEXT_PUBLIC_USE_MOCKS:'1',NEXT_PUBLIC_FLURZI_CHANNEL:'release'}});
let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
const timer=setTimeout(()=>child.kill(),30000);const code=await new Promise(resolve=>child.once('exit',resolve));clearTimeout(timer);
const passed=code!==0&&output.includes('Mock services require an explicit preview build');await fs.writeFile('docs/readiness/release-guard.json',JSON.stringify({code,passed,output},null,2));assert(passed,'Unsafe release configuration must reject startup');
