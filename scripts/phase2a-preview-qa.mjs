
import {spawn} from 'node:child_process';
const origin='http://127.0.0.1:3004';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3004'],{stdio:'inherit',windowsHide:true});
console.log('Phase 2A QA server PID: '+server.pid);
try{
 let ready=false;for(let i=0;i<120;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
 if(!ready)throw new Error('Production preview unavailable.');
 const exit=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/phase2a-browser-qa.mjs'],{stdio:'inherit',windowsHide:true,env:{...process.env,PREVIEW_URL:origin}});child.on('error',reject);child.on('exit',resolve);});
 process.exitCode=exit||0;
}finally{server.kill();}
