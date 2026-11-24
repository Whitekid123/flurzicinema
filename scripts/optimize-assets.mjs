import sharp from "sharp";
const names = [
  "quiet-beyond",
  "last-train",
  "velvet-hours",
  "tides",
  "afterlight",
];
for (const name of names) {
  await sharp(`public/images/${name}.png`)
    .resize({
      width: name === "quiet-beyond" ? 1536 : 1024,
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toFile(`public/images/${name}.webp`);
}
console.log("Five original artwork files optimized as WebP.");
