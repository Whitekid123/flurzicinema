import fs from 'node:fs/promises';
let p='styles/brand-components.css',s=await fs.readFile(p,'utf8');s=s.replace('\n.flurzi-wordmark {','\n:root .flurzi-wordmark {');
s+=`
/* Keep text and selection readable in legacy light-theme entry/browse states. */
:root .entry-app ::selection { background:var(--brand-champagne); color:var(--brand-on-action); }
:root .cinema-toast { background:var(--brand-surface-raised); color:var(--brand-text); border:1px solid var(--brand-border); }
:root .cinema-resume { background:var(--brand-selected-bg); color:var(--brand-champagne); }
:root .entry-plan.selected { background:var(--brand-selected-bg); color:var(--brand-selected-text); border-color:var(--brand-accent); }
`;await fs.writeFile(p,s);
p='scripts/brand-browser.mjs';s=await fs.readFile(p,'utf8');
s=s.replace("const m=await p.evaluate(()=>({logo:","const lockup=await symbol.evaluate(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.querySelector('.flurzi-name').getBoundingClientRect();return {right:a.right,left:b.left};});assert(lockup.right<=lockup.left+2,'Logo F and LURZI remain horizontal');const m=await p.evaluate(()=>({logo:");
await fs.writeFile(p,s);console.log('Final mobile logo and legacy feedback contrast corrections applied');
