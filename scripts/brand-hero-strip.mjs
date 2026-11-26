import fs from 'node:fs/promises';
await fs.appendFile('styles/brand-components.css','\n:root .hero-field-bottom { background:var(--brand-bg-secondary); color:var(--brand-text-secondary); border-top:1px solid var(--brand-border); }\n');
const p='scripts/brand-browser.mjs';let s=await fs.readFile(p,'utf8');s=s.replace('.ds-primary:not(:disabled)\'','.ds-primary:not(:disabled),.hero-field-bottom\'');await fs.writeFile(p,s);
