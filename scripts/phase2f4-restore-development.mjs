import fs from 'node:fs/promises';import net from 'node:net';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const listening=()=>new Promise(resolve=>{const s=net.connect(3000,'127.0.0.1');s.on('error',()=>resolve(false));s.on('connect',()=>{s.destroy();resolve(true);});});
const alreadyRunning=await listening();let pid;
const command=['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000'];
if(!alreadyRunning){
 const stdout=await fs.open('docs/phase2f4/restored-development.stdout.log','a'),stderr=await fs.open('docs/phase2f4/restored-development.stderr.log','a');
 const child=spawn(process.execPath,command,{cwd:process.cwd(),detached:true,windowsHide:true,stdio:['ignore',stdout.fd,stderr.fd],env:{...process.env,NODE_ENV:'development'}});
 await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});pid=child.pid;child.unref();await stdout.close();await stderr.close();
}
let status;for(let n=0;n<120;n++){try{const response=await fetch('http://127.0.0.1:3000/login',{signal:AbortSignal.timeout(5000)});if(response.ok){status=response.status;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
const result={alreadyRunning,pid,command,port:3000,status,usesExistingEnvironment:true,existingServerStopped:false};await fs.writeFile('docs/phase2f4/restored-development-server.json',JSON.stringify(result,null,2));assert.equal(status,200,'Standard development server did not become ready');console.log(JSON.stringify(result));
