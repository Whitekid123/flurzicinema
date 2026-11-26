import fs from 'node:fs/promises';import {spawn} from 'node:child_process';
const dir='.phase2f3-lab';
await fs.mkdir(dir,{recursive:true});
for(const path of ['app','components','lib','styles','types','data','public','scripts/fixtures','package.json','package-lock.json','next.config.ts','postcss.config.mjs','tsconfig.json','next-env.d.ts','proxy.ts']){
 try{await fs.cp(path,dir+'/'+path,{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev',dir,'--hostname','127.0.0.1','--port','3016'],{windowsHide:true,stdio:'inherit',env:process.env});
process.on('SIGTERM',()=>{child.kill();process.exit(0);});child.on('exit',code=>process.exit(code??0));
