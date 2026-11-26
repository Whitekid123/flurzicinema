import sharp from 'sharp';
const source='public/brand/flurzi-f-extracted.png';
await sharp(source).trim().resize({height:192}).webp({quality:90,alphaQuality:100}).toFile('public/brand/flurzi-f-symbol.webp');
await sharp(source).trim().resize(192,192,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('app/icon.png');
console.log(JSON.stringify({original:await sharp(source).metadata(),optimized:await sharp('public/brand/flurzi-f-symbol.webp').metadata()},null,2));
