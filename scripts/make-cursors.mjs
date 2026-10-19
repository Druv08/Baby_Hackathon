/**
 * Builds the 48×48 paw cursors in public/cursors/ from each character's paw
 * emblem. The slug → file mapping is read from src/lib/paws.ts, the single
 * source of truth, so changing a paw there and re-running this updates the
 * cursor too. Browsers ignore cursor images larger than 128px.
 *
 *   node scripts/make-cursors.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = 48;

const mapping = fs.readFileSync(path.join(ROOT, "src/lib/paws.ts"), "utf8");
const block = mapping.slice(mapping.indexOf("PAW_FILES"), mapping.indexOf("};"));
const SOURCES = Object.fromEntries([...block.matchAll(/(\w+): "([^"]+\.png)"/g)].map((m) => [m[1], m[2]]));

for (const [slug, file] of Object.entries(SOURCES)) {
  await sharp(path.join(ROOT, "public/paws", file))
    .trim()
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ROOT, "public/cursors", `${slug}.png`));
  console.log(`cursors/${slug}.png ← paws/${file}`);
}
