import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const baseline=JSON.parse(await fs.readFile('docs/phase2f1/baseline.json','utf8'));
const integrations=['components/streaming/StreamingShell.tsx','components/streaming/MediaPlayer.tsx'];
const result={protected:[],integrations,changed:[]};
for(const [file,hash] of Object.entries(baseline)){const current=createHash('sha256').update(await fs.readFile(file)).digest('hex');if(current!==hash&&!integrations.includes(file))result.changed.push(file);else if(!integrations.includes(file))result.protected.push(file);}
await fs.writeFile('docs/phase2f1/source-audit.json',JSON.stringify(result,null,2));
console.log(`${result.protected.length} protected sources unchanged. Unexpected changes: ${result.changed.length}.`);if(result.changed.length)process.exitCode=1;
