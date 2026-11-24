import fs from "node:fs/promises";
import sharp from "sharp";
for(const width of [1440,768,390]){
 const dir=`docs/public-website/${width}`;
 const files=(await fs.readdir(dir)).filter(f=>f.endsWith(".png")).sort();
 const cellWidth=480,cellHeight=390,columns=3;
 const composites=[];
 for(let i=0;i<files.length;i++){
  const input=await fs.readFile(`${dir}/${files[i]}`);
  const meta=await sharp(input).metadata();
  const view=await sharp(input).extract({left:0,top:0,width:meta.width,height:Math.min(meta.height,width===390?1000:1100)}).resize(cellWidth,cellHeight,{fit:"contain",background:"#0b1018"}).png().toBuffer();
  composites.push({input:view,left:(i%columns)*cellWidth,top:Math.floor(i/columns)*cellHeight});
 }
 await sharp({create:{width:cellWidth*columns,height:cellHeight*Math.ceil(files.length/columns),channels:3,background:"#0b1018"}}).composite(composites).png().toFile(`docs/public-website/contact-sheet-${width}.png`);
}
console.log("Created three page-overview contact sheets.");
