// Derived images (originals in public/assets are never modified):
//   public/assets/r/hero_photo-{1080,1600,2400}.{avif,webp} — responsive hero (CSS background)
//   public/assets/r/hero_skymask.webp — sky mask as lossless WebP
//   public/og.jpg — 1200×630 social preview cut from the hero render
//   src/content/image-sizes.json — intrinsic sizes for <Image width height>
//   node tools/images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = path.join(root, 'public/assets');
fs.mkdirSync(path.join(A, 'r'), { recursive: true });

for (const w of [1080, 1600, 2400]) {
  const src = sharp(path.join(A, 'hero_photo.webp')).resize({ width: w });
  const outs = [];
  if (w < 2400) outs.push([path.join(A, 'r', `hero_photo-${w}.webp`), src.clone().webp({ quality: 74, effort: 6 })]);
  outs.push([path.join(A, 'r', `hero_photo-${w}.avif`), src.clone().avif({ quality: 52, effort: 7 })]);
  for (const [out, img] of outs) {
    await img.toFile(out);
    console.log(path.relative(root, out), Math.round(fs.statSync(out).size / 1024) + ' KB');
  }
}
await sharp(path.join(A, 'hero_skymask.png')).webp({ lossless: true, effort: 6 }).toFile(path.join(A, 'r', 'hero_skymask.webp'));
await sharp(path.join(A, 'hero_photo.webp'))
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'top' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(root, 'public/og.jpg'));
console.log('public/og.jpg', Math.round(fs.statSync(path.join(root, 'public/og.jpg')).size / 1024) + ' KB');

const sizes = {};
for (const f of fs.readdirSync(A).sort()) {
  if (!/\.(webp|png|jpg)$/.test(f)) continue;
  const m = await sharp(path.join(A, f)).metadata();
  sizes['/assets/' + f] = [m.width, m.height];
}
fs.writeFileSync(path.join(root, 'src/content/image-sizes.json'), JSON.stringify(sizes, null, 0) + '\n');
console.log('image-sizes.json', Object.keys(sizes).length, 'images');
