import fs from 'node:fs/promises';
let p='styles/brand-components.css',s=await fs.readFile(p,'utf8');s=s.replaceAll('.entry-button,.cinema-primary,','.entry-button,.cinema-primary,.cinema-button.is-primary,');
s+='\n:root .entry-switch a { color:var(--brand-champagne); }\n';await fs.writeFile(p,s);
p='scripts/brand-browser.mjs';s=await fs.readFile(p,'utf8');s=s.replaceAll('.cinema-primary,','.cinema-primary,.cinema-button.is-primary,');
s=s.replace("const m=await p.evaluate(()=>({logo:","if(name==='home'){const bounds=await p.locator('.hero-statement').evaluate(e=>e.getBoundingClientRect().toJSON());assert(bounds.right<=width+1&&bounds.x>=0,'Hero supporting copy stays within viewport');const size=await p.locator('.hero-logotype').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(size<=120,'Product headline uses responsive message sizing');}const m=await p.evaluate(()=>({logo:");
await fs.writeFile(p,s);
await fs.copyFile('docs/rebranding/preview-brand-browser.json','docs/rebranding/preview-before-visual-polish.json');
await fs.copyFile('docs/rebranding/auth/preview-browser.json','docs/rebranding/auth/preview-before-visual-polish.json');
console.log('Correct primary button and entry link contrast roles');
