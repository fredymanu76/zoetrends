// Generate a preview of each Photoroom preset model for the Add Products
// visual model picker. Skips models that already have a preview.
//
//   node scripts/generate-model-gallery.mjs <garment-image> [--force]
//
// Each missing preview costs Photoroom AI-image credits.
import sharp from "sharp";
import { mkdir, readFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "model-gallery");

const MODELS = [
  "zoe", "avery", "sam", "taylor", "kendall", "jordan", "casey",
  "maya", "reece", "lena", "julia", "jackson", "sophia", "emma", "ava", "fiona",
];

const garmentPath = process.argv[2];
const force = process.argv.includes("--force");
if (!garmentPath) {
  console.error("Usage: node scripts/generate-model-gallery.mjs <garment-image> [--force]");
  process.exit(1);
}

const env = await readFile(path.join(ROOT, ".env.local"), "utf8");
const KEY = env.match(/PHOTOROOM_API_KEY=(.*)/)?.[1]?.trim();
if (!KEY) {
  console.error("PHOTOROOM_API_KEY not found in .env.local");
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const garment = await readFile(garmentPath);

async function gen(model) {
  const dest = path.join(OUT, `${model}.jpg`);
  if (!force && (await access(dest).then(() => true, () => false))) {
    console.log(`${model}: exists, skipped`);
    return true;
  }
  const f = new FormData();
  f.append("imageFile", new Blob([garment], { type: "image/jpeg" }), "garment.jpg");
  f.append("virtualModel.mode", "ai.auto");
  f.append("virtualModel.model.preset.name", model);
  f.append("virtualModel.pose", "standing");
  f.append("virtualModel.quality", "standard");
  f.append("virtualModel.size", "PORTRAIT_HD_3_2");
  f.append("export.format", "png");
  const res = await fetch("https://image-api.photoroom.com/v2/edit", {
    method: "POST", headers: { "x-api-key": KEY }, body: f,
  });
  if (!res.ok) {
    console.error(`${model}: ${res.status} ${(await res.text()).slice(0, 140)}`);
    return false;
  }
  const png = Buffer.from(await res.arrayBuffer());
  await sharp(png).resize({ width: 360 }).jpeg({ quality: 82 }).toFile(dest);
  console.log(`${model}: ok`);
  return true;
}

let failures = 0;
for (let i = 0; i < MODELS.length; i += 4) {
  const results = await Promise.all(MODELS.slice(i, i + 4).map(gen));
  failures += results.filter((r) => !r).length;
}
console.log(failures ? `Done with ${failures} failures` : "Done — all previews present");
