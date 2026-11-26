import fs from 'node:fs/promises';import crypto from 'node:crypto';
const files=[];async function scan(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=d+'/'+e.name;if(e.isDirectory())await scan(p);else files.push(p);}}
for(const d of ['app','components','lib','types','data','styles','tests'])await scan(d);
files.push('package.json','package-lock.json','next.config.ts','playwright.config.ts','vitest.config.ts','tsconfig.json','proxy.ts','debug.log');
await fs.mkdir('docs/phase2f4',{recursive:true});const hashes={};for(const p of files)hashes[p]=crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex');
await fs.writeFile('docs/phase2f4/baseline.json',JSON.stringify(hashes,null,2),{flag:'wx'});
for(const p of ['components/streaming/MediaPlayer.tsx','components/streaming/StoryLens.tsx','components/streaming/TitleDetails.tsx','components/streaming/AccountScreens.tsx','components/streaming/ProfileScreens.tsx','components/streaming/PlayerLab.tsx','lib/media-transport.ts','lib/api/services.ts','types/streaming.ts','components/public/FeatureShowcase.tsx','components/home/FeatureLab.tsx']){
 await fs.mkdir('docs/phase2f4/before/'+p.split('/').slice(0,-1).join('/'),{recursive:true});await fs.copyFile(p,'docs/phase2f4/before/'+p+'.txt');
}
