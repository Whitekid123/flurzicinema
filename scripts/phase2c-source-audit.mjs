import fs from 'node:fs';import crypto from 'node:crypto';
const snapshot=JSON.parse(fs.readFileSync('docs/rollback/pre-phase2c/SNAPSHOT.json','utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const changed=Object.entries(snapshot.protected).filter(([file,value])=>hash(file)!==value).map(([file])=>file);
const css=fs.readFileSync('styles/streaming-discovery.css','utf8');
const classes=new Set([...css.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)].map(m=>m[1]).filter(c=>c.startsWith('discovery-')||c.startsWith('detail-')));
const collisions=[];for(const file of fs.readdirSync('styles').filter(p=>p.endsWith('.css')&&p!=='streaming-discovery.css'))for(const match of fs.readFileSync('styles/'+file,'utf8').matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g))if(classes.has(match[1]))collisions.push({file,className:match[1]});
const result={protectedFiles:Object.keys(snapshot.protected).length,changed,cssCollisions:collisions};
fs.mkdirSync('docs/phase2c',{recursive:true});fs.writeFileSync('docs/phase2c/source-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(changed.length||collisions.length)process.exitCode=1;
