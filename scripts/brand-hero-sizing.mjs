import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const p='styles/brand-components.css';let s=await fs.readFile(p,'utf8');
const a=s.indexOf(':root .hero-logotype {'),b=s.indexOf(':root .hero-image-field {',a);assert(a>0&&b>a);
s=s.slice(0,a)+`:root .hero-product-title { min-width:0; }
:root .hero-product-title .hero-logotype {
  display:block; color:var(--brand-champagne); font-family:var(--brand-display);
  font-size:clamp(48px,5.7vw,108px); font-weight:400;
  letter-spacing:-.045em; line-height:1.02; margin-left:0;
  overflow-wrap:normal;
}
:root .hero-statement>p {
  font-size:clamp(18px,1.65vw,27px); line-height:1.4;
  letter-spacing:-.025em; max-width:26ch;
}
`+s.slice(b);await fs.writeFile(p,s);console.log('Replaced old oversized masthead rule');
