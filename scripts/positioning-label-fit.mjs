
import fs from 'node:fs';
const file='styles/editorial-sections.css';
fs.mkdirSync('docs/rollback/pre-positioning-copy/styles',{recursive:true});
const before=fs.readFileSync(file,'utf8');
fs.writeFileSync('docs/rollback/pre-positioning-copy/'+file,before);
const rule='\n/* Static discovery labels stay in document flow at narrow widths and with reduced motion. */\n@media(max-width:1023px),(prefers-reduced-motion:reduce){.editorial-home .floating-labels{position:relative;inset:auto}}\n';
if(before.includes('Static discovery labels'))throw new Error('Rule already applied');
fs.writeFileSync(file,before+rule);
console.log('Added one static-layout text-fit correction.');
