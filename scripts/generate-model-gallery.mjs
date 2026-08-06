// Generate a preview of each preset model for the Add Products visual model
// picker. Uses FASHN when FASHN_API_KEY is set in .env.local, otherwise
// Photoroom. Skips models that already have a preview.
//
//   node scripts/generate-model-gallery.mjs <garment-image> [--force]
//
// Each missing preview costs AI image credits (FASHN balanced 1k = 2 credits).
import sharp from "sharp";
import { mkdir, readFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "model-gallery");
const FASHN_MODELS = JSON.parse(
  await readFile(path.join(ROOT, "src", "lib", "ai", "fashn-models.json"), "utf8")
);
const MODEL_NAMES = Object.keys(FASHN_MODELS);

const garmentPath = process.argv[2];
const force = process.argv.includes("--force");
if (!garmentPath) {
  console.error("Usage: node scripts/generate-model-gallery.mjs <garment-image> [--force]");
  process.exit(1);
}

const env = await readFile(path.join(ROOT, ".env.local"), "utf8");
const FASHN_KEY = env.match(/^FASHN_API_KEY=(.*)$/m)?.[1]?.trim();
const PHOTOROOM_KEY = env.match(/^PHOTOROOM_API_KEY=(.*)$/m)?.[1]?.trim();
if (!FASHN_KEY && !PHOTOROOM_KEY) {
  console.error("Neither FASHN_API_KEY nor PHOTOROOM_API_KEY found in .env.local");
  process.exit(1);
}
console.log(`Provider: ${FASHN_KEY ? "FASHN" : "Photoroom"}`);

await mkdir(OUT, { recursive: true });
const garment = await readFile(garmentPath);
const garmentUri = `data:image/jpeg;base64,${garment.toString("base64")}`;

async function genFashn(model) {
  const preset = FASHN_MODELS[model];
  const headers = { Authorization: `Bearer ${FASHN_KEY}` };
  const res = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: "product-to-model",
      inputs: {
        product_image: garmentUri,
        prompt: `${preset.description} wearing this garment on its own exactly as shown, front view, facing the camera, full-body ecommerce studio photo, clean neutral studio background`,
        aspect_ratio: "2:3",
        resolution: "1k",
        generation_mode: "balanced",
        seed: preset.seed,
        output_format: "png",
      },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
  const { id } = await res.json();
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await fetch(`https://api.fashn.ai/v1/status/${id}`, { headers });
    const j = await s.json();
    if (j.status === "completed" && j.output?.length) {
      const img = await fetch(j.output[0]);
      return Buffer.from(await img.arrayBuffer());
    }
    if (j.status === "failed") throw new Error(`${j.error?.name}: ${j.error?.message}`);
  }
  throw new Error("timed out");
}

async function genPhotoroom(model) {
  const f = new FormData();
  f.append("imageFile", new Blob([garment], { type: "image/jpeg" }), "garment.jpg");
  f.append("virtualModel.mode", "ai.auto");
  f.append("virtualModel.model.preset.name", model);
  f.append("virtualModel.pose", "standing");
  f.append("virtualModel.quality", "standard");
  f.append("virtualModel.size", "PORTRAIT_HD_3_2");
  f.append("export.format", "png");
  const res = await fetch("https://image-api.photoroom.com/v2/edit", {
    method: "POST", headers: { "x-api-key": PHOTOROOM_KEY }, body: f,
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function gen(model) {
  const dest = path.join(OUT, `${model}.jpg`);
  if (!force && (await access(dest).then(() => true, () => false))) {
    console.log(`${model}: exists, skipped`);
    return true;
  }
  try {
    const png = FASHN_KEY ? await genFashn(model) : await genPhotoroom(model);
    await sharp(png).resize({ width: 360 }).jpeg({ quality: 82 }).toFile(dest);
    console.log(`${model}: ok`);
    return true;
  } catch (err) {
    console.error(`${model}: ${err.message}`);
    return false;
  }
}

let failures = 0;
for (let i = 0; i < MODEL_NAMES.length; i += 4) {
  const results = await Promise.all(MODEL_NAMES.slice(i, i + 4).map(gen));
  failures += results.filter((r) => !r).length;
}
console.log(failures ? `Done with ${failures} failures` : "Done — all previews present");
