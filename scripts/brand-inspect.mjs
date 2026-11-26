import fs from 'node:fs/promises';
for(const dir of ['styles','components/streaming']){for(const name of await fs.readdir(dir)){if(!name.endsWith('.css'))continue;const s=await fs.readFile(dir+'/'+name,'utf8');const counts={};for(const x of s.matchAll(/#[a-fA-F0-9]{3,8}\b/g))counts[x[0]]=(counts[x[0]]||0)+1;console.log(dir+'/'+name,s.length,JSON.stringify(Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,18)));}}
for(const p of ['components/layout/Footer.tsx','components/home/CinemaHero.tsx','components/streaming/AccountUI.tsx','components/streaming/RequireAuth.tsx']){const s=await fs.readFile(p,'utf8');console.log(p,s.split('\n').filter(l=>/wordmark|logotype|brand|EntryLoading/.test(l)).join('\n').slice(0,1700));}
console.log('postcss',import.meta.resolve('postcss'));
