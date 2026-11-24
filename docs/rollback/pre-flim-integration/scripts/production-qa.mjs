import { spawn } from 'node:child_process';
const origin='http://127.0.0.1:3002';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3002'],{stdio:'inherit',windowsHide:true});
console.log(`QA server PID: ${server.pid}`);
const run=command=>new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,command,{stdio:'inherit',windowsHide:true,env:{...process.env,PLAYWRIGHT_BASE_URL:origin,PREVIEW_URL:origin}});
 child.on('error',reject);child.on('exit',code=>resolve(code));
});
try{
 let ready=false;
 for(let attempt=0;attempt<30;attempt++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
 if(!ready)throw new Error('Production QA server did not become ready');
 const tests=await run(['node_modules/playwright/cli.js','test','--workers=1']);
 if(tests!==0){process.exitCode=1;console.log('Browser tests failed; review results before continuing.');}
 else if(await run(['scripts/rescue-final-capture.mjs'])!==0)process.exitCode=1;
}finally{server.kill();}
