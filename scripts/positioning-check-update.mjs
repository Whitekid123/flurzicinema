
import fs from 'node:fs';
const testFile='tests/editorial-home.spec.ts';
let t=fs.readFileSync(testFile,'utf8');
const helper=`async function readableStaticGenres(page:Page){
 const labels=await page.locator(".floating-label").evaluateAll(els=>els.map(e=>({height:e.getBoundingClientRect().height,bottom:e.getBoundingClientRect().bottom})));
 const heading=await page.locator(".discovery-title").boundingBox();
 const mosaic=await page.locator(".mosaic-interface").boundingBox();
 expect(labels.length).toBeGreaterThan(0);
 for(const label of labels){expect(label.height).toBeLessThan(100);expect(label.bottom).toBeLessThanOrEqual(mosaic!.y);expect(label.bottom-label.height).toBeGreaterThan(heading!.y+heading!.height);}
}
`;
t=t.replace('test("native hero',helper+'test("native hero');
t=t.replace('await expect(page.locator(".mosaic-card").first()).toHaveCSS("transform","none");','await expect(page.locator(".mosaic-card").first()).toHaveCSS("transform","none");await readableStaticGenres(page);');
t=t.replace('if(width<1024)await expect(page.locator(".pin-spacer")).toHaveCount(0);','if(width<1024){await expect(page.locator(".pin-spacer")).toHaveCount(0);await readableStaticGenres(page);}');
fs.writeFileSync(testFile,t);
const p='scripts/positioning-copy-capture.mjs';
let s=fs.readFileSync(p,'utf8');
s=s.replace("await page.screenshot({path:dir+'/'+width+'-full.png',fullPage:true,caret:'initial'});",`await page.screenshot({path:dir+'/'+width+'-full.png',fullPage:true,caret:'initial'});
  for(const [name,selector] of Object.entries({hero:'.editorial-masthead',discovery:'.discovery-stage',spotlight:'.editorial-spotlight',finale:'.editorial-finale'})){
   await page.locator(selector).screenshot({path:dir+'/'+width+'-'+name+'.png',caret:'initial'});
  }`);
fs.writeFileSync(p,s);
console.log('Added static-label regression checks and section captures.');
