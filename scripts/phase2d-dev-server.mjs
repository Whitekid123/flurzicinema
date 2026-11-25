import fs from 'node:fs';import path from 'node:path';import next from 'next';import {createServer} from 'node:http';
process.env.NODE_ENV='development';process.env.FLURZI_PLAYER_LAB='1';process.env.NEXT_PUBLIC_USE_MOCKS='1';
const root=process.cwd(),dir=path.resolve(root,'docs/phase2d/preview-workspace');
if(!dir.startsWith(root+path.sep)||dir!==path.join(root,'docs','phase2d','preview-workspace'))throw Error('Invalid QA workspace');
function copyChanged(from,to){if(fs.statSync(from).isDirectory()){fs.mkdirSync(to,{recursive:true});for(const name of fs.readdirSync(from))copyChanged(path.join(from,name),path.join(to,name));}else if(!fs.existsSync(to)||!fs.readFileSync(from).equals(fs.readFileSync(to)))fs.copyFileSync(from,to);}
fs.mkdirSync(dir,{recursive:true});
for(const name of ['app','components','lib','types','data','styles'])copyChanged(path.join(root,name),path.join(dir,name));
for(const name of ['package.json','tsconfig.json','postcss.config.mjs','next-env.d.ts','.gitignore','proxy.ts'])if(fs.existsSync(name))copyChanged(name,path.join(dir,name));
// Equivalent isolated preview config avoids repeatedly transpiling the root TS config.
const tsConfig=path.join(dir,'next.config.ts');if(fs.existsSync(tsConfig))fs.unlinkSync(tsConfig);
const config='export default {poweredByHeader:false,devIndicators:false};\n';const configPath=path.join(dir,'next.config.mjs');if(!fs.existsSync(configPath)||fs.readFileSync(configPath,'utf8')!==config)fs.writeFileSync(configPath,config);
function linkTree(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){const src=path.join(from,entry.name),dest=path.join(to,entry.name);if(entry.isDirectory())linkTree(src,dest);else if(!fs.existsSync(dest))fs.linkSync(src,dest);}}
linkTree(path.join(root,'public'),path.join(dir,'public'));fs.mkdirSync(path.join(dir,'scripts/fixtures'),{recursive:true});copyChanged(path.join(root,'scripts/fixtures/player'),path.join(dir,'scripts/fixtures/player'));
if(!fs.existsSync(path.join(dir,'node_modules')))fs.symlinkSync(path.join(root,'node_modules'),path.join(dir,'node_modules'),'junction');
console.log('Isolated preview sources ready');process.chdir(dir);
const app=next({dev:true,webpack:true,dir,hostname:'127.0.0.1',port:3007});
await app.prepare();const handler=app.getRequestHandler();const server=createServer((req,res)=>handler(req,res));
server.listen(3007,'127.0.0.1',()=>console.log('Owned isolated player lab ready on 3007, PID '+process.pid));
async function stop(){server.close();await app.close();process.exit(0);}process.on('SIGTERM',stop);process.on('SIGINT',stop);
