import fs from 'node:fs/promises';import sharp from 'sharp';import assert from 'node:assert/strict';
const image=sharp('public/brand/flurzi-f-symbol.webp');const {data,info}=await image.raw().toBuffer({resolveWithObject:true});let transparent=0,opaque=0;
for(let i=3;i<data.length;i+=info.channels){if(data[i]===0)transparent++;if(data[i]>=224)opaque++;}
assert(info.channels===4&&transparent>1000&&opaque>1000);
const s=await fs.readFile('components/home/CinemaHero.tsx','utf8');assert(s.includes('A world of movies.<br />Endless entertainment.'));assert(s.includes('Discover movies, explore unforgettable series and experience cinema together.'));assert(!s.includes('All in one place.'));
const b=await fs.readFile('components/ui/BrandWordmark.tsx','utf8');assert(b.includes('>LURZI<'));assert(!b.includes('>FLURZI<'));
const result={transparentPixels:transparent,opaquePixels:opaque,width:info.width,height:info.height,bytes:(await fs.stat('public/brand/flurzi-f-symbol.webp')).size,iconBytes:(await fs.stat('app/icon.png')).size,derivedRaster:true,pixelIdenticalMaster:false};
await fs.writeFile('docs/rebranding/logo-asset-check.json',JSON.stringify(result,null,2));console.log(result);
let p='scripts/brand-browser.mjs',t=await fs.readFile(p,'utf8');
t=t.replace("const m=await p.evaluate(()=>({overflow:","const symbol=p.locator('.flurzi-symbol').first();await symbol.evaluate(e=>e.decode());assert(await symbol.evaluate(e=>e.naturalWidth===176&&e.naturalHeight===192));const m=await p.evaluate(()=>({logo:document.querySelector('.flurzi-wordmark')?.getAttribute('aria-label'),overflow:");
t=t.replace("if(route==='/'){await p.setViewportSize","if(route==='/'){await expect(p.locator('#cinema-title')).toHaveText('A world of movies.Endless entertainment.');await expect(p.locator('.hero-statement>p')).toHaveText('Discover movies, explore unforgettable series and experience cinema together.');await p.setViewportSize");
await fs.writeFile(p,t);
