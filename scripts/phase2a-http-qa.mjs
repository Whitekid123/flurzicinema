
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3004';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3004'],{stdio:'inherit',windowsHide:true});
const results=[];
try{
 let ready=false;for(let i=0;i<120;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
 if(!ready)throw new Error('HTTP preview unavailable.');
 for(const route of ['login','signup','forgot-password','reset-password','verify-email','welcome','subscribe','profiles','profiles/new','profiles/manage']){
  const response=await fetch(origin+'/'+route);assert.equal(response.status,200,route);results.push({route,status:response.status});await response.body?.cancel();
 }
 for(const [route,target] of [['sign-in','/login'],['get-started','/signup']]){
  const response=await fetch(origin+'/'+route,{redirect:'manual'});assert.equal(response.status,307,route);assert.equal(response.headers.get('location'),target);results.push({route,status:response.status,location:target});await response.body?.cancel();
 }
 const home='components/home/CinemaHome.tsx';const original=await fs.readFile('docs/rollback/pre-phase2a/'+home,'utf8');
 assert.equal(await fs.readFile(home,'utf8'),original.replace('<Header onSignIn={() => setInfo("Sign in is coming later")} />','<Header />'));
 const path='.next/static/chunks';
 const files=await fs.readdir(path,{recursive:true});let latestTouchStyle=false;
 for(const file of files.filter(p=>p.endsWith('.css'))){const css=await fs.readFile(path+'/'+file,'utf8');if(/auth-footer a[^}]*min-height:44px/.test(css)||/min-height:44px[^}]*auth-footer a/.test(css))latestTouchStyle=true;}
 assert.equal(latestTouchStyle,true,'Final build includes the latest touch-target CSS.');
 await fs.mkdir('docs/phase2a',{recursive:true});await fs.writeFile('docs/phase2a/http-observations.json',JSON.stringify({origin,results,homeCompositionPreserved:true,latestTouchStyle},null,2));
 console.log(JSON.stringify({results,homeCompositionPreserved:true,latestTouchStyle},null,2));
}finally{server.kill();}
