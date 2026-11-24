import sharp from 'sharp';
import fs from 'node:fs/promises';
const dir='docs/final-redesign/comparisons';await fs.mkdir(dir,{recursive:true});
for(const [name,reference,current] of [
 ['hero','docs/flim-reference/interaction-hero-first.png','0'],
 ['assembled-interface','docs/flim-reference/1440-2003.png','1710'],
 ['typography-composition','docs/flim-reference/1440-3004.png','1000'],
 ['contrasting-feature','docs/flim-reference/1440-5007.png','4200']
]){
 const ref=await sharp(reference).resize(1008,700,{fit:'fill'}).toBuffer();
 const ours=await sharp('docs/final-redesign/current/'+current+'.png').resize(1008,700,{fit:'fill'}).toBuffer();
 const heading=Buffer.from('<svg width="2032" height="50"><rect width="2032" height="50" fill="#f5f5f3"/><text x="18" y="31" font-family="Arial" font-size="17" fill="#08090b">FLIM — saved browser reference, 1440 × 1000</text><text x="1040" y="31" font-family="Arial" font-size="17" fill="#08090b">FLURZI — current local browser, 1440 × 1000</text></svg>');
 await sharp({create:{width:2032,height:750,channels:3,background:'#d0d0d0'}}).composite([{input:heading,top:0,left:0},{input:ref,top:50,left:0},{input:ours,top:50,left:1024}]).png().toFile(dir+'/'+name+'.png');
}
console.log('Four semantic-state comparison sheets saved. Reference is previously captured, not a fresh live browser session.');
