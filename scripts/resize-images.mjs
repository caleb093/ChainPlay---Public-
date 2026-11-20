import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

// Resize oversized public images down to ~2x their displayed size. The site is
// a static export with next/image `unoptimized: true`, so source files ship
// as-is — there is no runtime optimizer to shrink them.
const targets = [
  // [path, targetWidth] — height auto, aspect preserved
  ["public/assets/pbot/pbot-wave.webp", 240], // displayed 120x120
  ["public/icons/logo_bold.webp", 240],        // displayed ~112x112
  ["public/landing-page/flapBounce.webp", 832], // displayed 416x278
  ["public/landing-page/maze.webp", 832],
  ["public/landing-page/rpc.webp", 832],
  ["public/landing-page/wordix.webp", 832],
];

for (const [path, width] of targets) {
  const before = readFileSync(path);
  const meta = await sharp(before).metadata();
  if (meta.width <= width) {
    console.log(`skip  ${path} (already ${meta.width}px wide)`);
    continue;
  }
  const out = await sharp(before)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(path, out);
  console.log(
    `done  ${path}  ${meta.width}x${meta.height} -> ${width}px  ` +
      `${(before.length / 1024).toFixed(1)}KiB -> ${(out.length / 1024).toFixed(1)}KiB`
  );
}
