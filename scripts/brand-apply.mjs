import fs from 'node:fs/promises';import postcss from 'postcss';
const touched=[];async function save(p,s){const original=await fs.readFile(p,'utf8');if(original===s)return;const dest='docs/rebranding/before/'+p+'.txt';await fs.mkdir(dest.slice(0,dest.lastIndexOf('/')),{recursive:true});try{await fs.writeFile(dest,original,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}await fs.writeFile(p,s);touched.push(p);}
const changes=[];
for(const dir of ['styles','components/streaming'])for(const name of await fs.readdir(dir)){
 if(!name.endsWith('.css')||name.startsWith('brand-'))continue;
 const p=dir+'/'+name,css=await fs.readFile(p,'utf8'),root=postcss.parse(css);
 const home=/editorial|motion-followup/.test(name);
 root.walkDecls(d=>{
  if(!/^(?:color|background(?:-color)?|border(?:-.*)?|outline(?:-color)?|accent-color|fill|stroke|caret-color|text-decoration-color)$/.test(d.prop))return;
  const selector=d.parent.selector||'',prop=d.prop;
  const background=prop.startsWith('background'),border=/border|outline/.test(prop);
  const action=/(?:\.button|\.editorial-button|\.entry-button|\.cinema-primary|\.rooms-button\.primary|\.sm-button\.primary|\.ds-primary)/.test(selector)&&!/secondary|outline|cancel/.test(selector);
  const lightAuth=name==='streaming-entry.css'&&/auth-main|auth-header \.entry-back|auth-content|entry-intro|entry-preview|auth-footer/.test(selector);
  const selected=/aria-(?:pressed|selected)=true|:checked|\.is-selected|\.is-active/.test(selector);const lightSurface=d.parent.nodes?.some(n=>/^(background|background-color)$/.test(n.prop||'')&&/^#(?:f[0-9a-f]{5}|e[0-9a-f]{5}|fff|eee)$/i.test(n.value||''));
  const before=d.value;
  d.value=d.value.replace(/#[0-9a-f]{3,8}\b/gi,raw=>{
   let hex=raw.slice(1).toLowerCase();if(hex.length===3)hex=[...hex].map(x=>x+x).join('');if(hex.length!==6)return raw;
   const n=parseInt(hex,16),r=n>>16,g=n>>8&255,b=n&255,max=Math.max(r,g,b),min=Math.min(r,g,b),avg=(r+g+b)/3;
   // Only migrate existing neutral paint; artwork colours and translucent scrims stay intact.
   if(max-min>32)return raw;
   if(border)return 'var(--brand-'+(avg>110?'border-strong':'border')+')';
   if(prop==='accent-color')return 'var(--brand-accent)';
   if(selected&&!border)return 'var(--brand-'+(background?'selected-bg':'selected-text')+')';
   if(background){
    if(action)return 'var(--brand-action)';
    if(avg>190)return home||lightAuth?'var(--brand-bg-secondary)':'var(--brand-surface-raised)';
    if(avg<14)return 'var(--brand-bg)';
    if(avg<23)return 'var(--brand-bg-secondary)';
    if(avg<39)return 'var(--brand-surface)';
    return 'var(--brand-surface-hover)';
   }
   if(action&&avg<80)return 'var(--brand-on-action)';
   if((home||lightAuth||lightSurface)&&avg<100)return 'var(--brand-text)';
   if(avg>185)return 'var(--brand-text)';
   if(avg>65)return 'var(--brand-text-secondary)';
   return raw;
  });
  if(before!==d.value)changes.push({path:p,selector,property:prop,before,after:d.value});
 });
 await save(p,root.toString());
}
let p='app/layout.tsx',s=await fs.readFile(p,'utf8');s=s.replace('import "@/styles/globals.css";','import "@/styles/brand-tokens.css";\nimport "@/styles/globals.css";');s=s.replace('import "@/styles/interaction-corrections.css";','import "@/styles/interaction-corrections.css";\nimport "@/styles/brand-components.css";');s=s.replace('themeColor: "#0B1018"','themeColor: "#08090B"');await save(p,s);
p='components/layout/Header.tsx';s=await fs.readFile(p,'utf8');s=s.replace('import { Modal }','import { BrandWordmark } from "@/components/ui/BrandWordmark";\nimport { Modal }');s=s.replace(/<span className="brand">[\s\S]*?<\/span>\s*\);/, '<span className="brand"><BrandWordmark/></span>\n  );');await save(p,s);
p='components/streaming/EntryUI.tsx';s=await fs.readFile(p,'utf8');s=s.replace('import Link from "next/link";','import Link from "next/link";\nimport {BrandWordmark} from "@/components/ui/BrandWordmark";');s=s.replace(/<strong>flurzi<span aria-hidden="true">.*?<\/span><\/strong><span>CINEMA<\/span>/,'<BrandWordmark/>');await save(p,s);
p='components/streaming/StreamingShell.tsx';s=await fs.readFile(p,'utf8');s=s.replace('import Link from "next/link";','import Link from "next/link";\nimport {BrandWordmark} from "@/components/ui/BrandWordmark";');s=s.replace(/<strong>flurzi<span aria-hidden="true">.*?<\/span><\/strong><span>CINEMA<\/span>/,'<BrandWordmark/>');await save(p,s);
p='components/layout/Footer.tsx';s=await fs.readFile(p,'utf8');s=s.replace('import { Brand }','import {BrandWordmark} from "@/components/ui/BrandWordmark";\nimport { Brand }');s=s.replace(/flurzi<span>.*?<\/span>/,'<BrandWordmark/>');await save(p,s);
p='components/home/CinemaHero.tsx';s=await fs.readFile(p,'utf8');s=s.replace('flurzi<span>®</span>','FLURZI').replace('aria-hidden="true">cinema.</span>','aria-hidden="true">CINEMA</span>');await save(p,s);
p='app/(public)/about/page.tsx';s=await fs.readFile(p,'utf8');s='import {OfficialBrandArt} from "@/components/ui/OfficialBrandArt";\n'+s;s=s.replace('<section className="public-values"','<OfficialBrandArt/><section className="public-values"');await save(p,s);
await fs.writeFile('docs/rebranding/colour-migration.json',JSON.stringify(changes,null,2));
await fs.writeFile('docs/rebranding/touched.json',JSON.stringify(touched,null,2));console.log(JSON.stringify({files:touched,neutralPaintChanges:changes.length}));
