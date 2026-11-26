import fs from 'node:fs/promises';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const mode=process.argv.includes('--release')?'release':'preview';
const commands=(process.argv.includes('--build-only')||process.argv.includes('--resume'))?['npm run build','npm run test:unit -- --maxWorkers=1']:['npm run typecheck','npm run lint','npm run build','npm run test:unit -- --maxWorkers=1'];
const records=process.argv.includes('--resume')?JSON.parse(await fs.readFile('docs/phase2f4/'+mode+'-validation.json','utf8')).filter(r=>r.code===0&&(r.command==='npm run typecheck'||r.command==='npm run lint')):[];
for(const command of commands){
 const file='docs/phase2f4/'+mode+'-'+(command.includes('typecheck')?'typecheck':command.includes('lint')?'lint':command.includes('test:unit')?'unit':'build')+'.log';
 const log=await fs.open(file,'w');const start=Date.now();console.log('Starting '+command+' ('+mode+')');
 const child=spawn(process.env.ComSpec??'cmd.exe',['/d','/s','/c',command],{windowsHide:true,stdio:['ignore',log.fd,log.fd],env:{...process.env,NEXT_PUBLIC_USE_MOCKS:command.includes('test:unit')?'0':mode==='release'?'0':'1',NEXT_PUBLIC_FLURZI_CHANNEL:mode,FLURZI_PLAYER_LAB:'0'}});
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});await log.close();records.push({command,code,seconds:(Date.now()-start)/1000,log:file});await fs.writeFile('docs/phase2f4/'+mode+'-validation.json',JSON.stringify(records,null,2));console.log(command+' exit '+code);assert.equal(code,0,command+' failed; inspect '+file);
}
const id=await fs.readFile('.next/BUILD_ID','utf8');await fs.writeFile('docs/phase2f4/'+mode+'-build-id.txt',id);console.log('Build '+id);
