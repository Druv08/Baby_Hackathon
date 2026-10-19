/**
 * Builds small cursor images from the paw artwork in public/paws/ (left
 * untouched). The artwork has a checkerboard painted in instead of real
 * transparency, so the grey background is removed by flood-filling
 * low-saturation pixels from the edges, then the paw is cropped and scaled
 * to 48×48 (browsers ignore cursor images larger than 128px).
 *
 *   node scripts/make-cursors.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = {
  normal: "Base.png",
  blossom: "Blossom.png",
  star: "Star.png",
  cloud: "Cloud.png",
  aqua: "Aqua.png",
  inventor: "Inventor.png",
  forest: "forest.png",
  melody: "melody.png",
  luna: "Luna.png",
};
const SIZE = 48;
/** Square crops (source pixels) for paws whose trails would skew an automatic crop. */
const MANUAL_CROPS = {
  inventor: { cx: 527, cy: 555, side: 500 },
  forest: { cx: 500, cy: 572, side: 560 },
  melody: { cx: 532, cy: 535, side: 600 },
};

async function build(slug, file) {
  const { data, info } = await sharp(path.join(ROOT, "public/paws", file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const sat = (i) => Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);

  // Flood fill the neutral-grey background from every edge pixel.
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || sat(p * 4) > 22) continue;
    bg[p] = 1;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }
  for (let p = 0; p < w * h; p++) if (bg[p]) data[p * 4 + 3] = 0;

  // Crop to the paw. Paws drawn with long trails use hand-measured boxes;
  // the rest are cropped to the bulk of the dark fur (trimmed percentiles
  // ignore stray sparkles).
  let left, top, size;
  if (MANUAL_CROPS[slug]) {
    const { cx, cy, side } = MANUAL_CROPS[slug];
    [left, top, size] = [cx - side / 2, cy - side / 2, side];
  } else {
    const xs = [];
    const ys = [];
    for (let p = 0; p < w * h; p++) {
      const i = p * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (!bg[p] && r > g && r - b > 10 && r + g + b < 360) {
        xs.push(p % w);
        ys.push(Math.floor(p / w));
      }
    }
    xs.sort((a, b) => a - b);
    ys.sort((a, b) => a - b);
    const q = (arr, f) => arr[Math.floor((arr.length - 1) * f)];
    const [x0, x1, y0, y1] = [q(xs, 0.01), q(xs, 0.99), q(ys, 0.01), q(ys, 0.99)];
    size = Math.max(x1 - x0, y1 - y0) * 1.08;
    left = (x0 + x1) / 2 - size / 2;
    top = (y0 + y1) / 2 - size / 2;
  }
  left = Math.max(0, Math.round(left));
  top = Math.max(0, Math.round(top));
  size = Math.min(Math.round(size), w - left, h - top);

  const out = path.join(ROOT, "public/cursors", `${slug}.png`);
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: size, height: size })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(slug.padEnd(9), "→", path.relative(ROOT, out));
}

fs.mkdirSync(path.join(ROOT, "public/cursors"), { recursive: true });
for (const [slug, file] of Object.entries(SOURCES)) await build(slug, file);
