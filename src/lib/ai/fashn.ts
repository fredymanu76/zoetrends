// FASHN API client (https://docs.fashn.ai). When FASHN_API_KEY is set, FASHN is
// the on-model provider and Photoroom is only a fallback; without the key the
// Photoroom paths run exactly as before.
import sharp from "sharp";
import FASHN_MODELS from "./fashn-models.json";

const RUN_URL = "https://api.fashn.ai/v1/run";
const STATUS_URL = "https://api.fashn.ai/v1/status";

export type FashnView = "front" | "side" | "back";

const VIEW_PHRASE: Record<FashnView, string> = {
  front: "front view, facing the camera",
  side: "three-quarter turn view",
  back: "back view, photographed from behind",
};

export function isFashnConfigured(): boolean {
  return !!process.env.FASHN_API_KEY;
}

export function fashnModelNames(): string[] {
  return Object.keys(FASHN_MODELS);
}

function toDataUri(buffer: Buffer, contentType: string): string {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

/** Start a prediction, poll until done, return the first output image. */
async function run(
  modelName: string,
  inputs: Record<string, unknown>
): Promise<{ buffer: Buffer | null; error: string }> {
  const key = process.env.FASHN_API_KEY;
  if (!key) return { buffer: null, error: "FASHN_API_KEY is not set" };
  const headers = { Authorization: `Bearer ${key}` };

  const res = await fetch(RUN_URL, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ model_name: modelName, inputs }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    return { buffer: null, error: `${res.status} ${detail}` };
  }
  const { id } = (await res.json()) as { id?: string };
  if (!id) return { buffer: null, error: "FASHN returned no prediction id" };

  // Balanced-mode generations complete in ~25s; allow up to ~3 minutes.
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await fetch(`${STATUS_URL}/${id}`, { headers });
    if (!s.ok) continue;
    const j = (await s.json()) as {
      status?: string;
      output?: string[];
      error?: { name?: string; message?: string } | null;
    };
    if (j.status === "completed" && j.output?.length) {
      const img = await fetch(j.output[0]);
      if (!img.ok) return { buffer: null, error: `output fetch ${img.status}` };
      return { buffer: Buffer.from(await img.arrayBuffer()), error: "" };
    }
    if (j.status === "failed") {
      return {
        buffer: null,
        error: `${j.error?.name || "failed"}: ${j.error?.message || ""}`.slice(0, 200),
      };
    }
  }
  return { buffer: null, error: "timed out waiting for FASHN prediction" };
}

/**
 * On-model shot from a flat/hanger garment photo (product-to-model).
 * The prompt anchors garment type and product name so partial/cropped photos
 * aren't misread, and the named model + fixed seed keep the same face across
 * a product's shots and across the catalogue.
 */
export async function fashnOnModel(opts: {
  garment: Buffer;
  garmentContentType: string;
  productName: string;
  garmentNoun: string;
  view: FashnView;
  modelKey?: string;
  faceReference?: { buffer: Buffer; contentType: string } | null;
}): Promise<{ buffer: Buffer | null; error: string }> {
  const preset = FASHN_MODELS[opts.modelKey as keyof typeof FASHN_MODELS];
  const descriptor = preset?.description || "female model";
  const inputs: Record<string, unknown> = {
    product_image: toDataUri(opts.garment, opts.garmentContentType),
    prompt:
      `${descriptor} wearing ${opts.productName}, a ${opts.garmentNoun}, ` +
      `worn on its own exactly as shown, ${VIEW_PHRASE[opts.view]}, ` +
      `full-body ecommerce studio photo, clean neutral studio background`,
    aspect_ratio: "2:3",
    resolution: "1k",
    generation_mode: "balanced",
    seed: preset?.seed ?? 42,
    output_format: "png",
  };
  if (opts.faceReference) {
    inputs.face_reference = toDataUri(opts.faceReference.buffer, opts.faceReference.contentType);
  }
  return run("product-to-model", inputs);
}

/** Clean white-background product shot for non-apparel (background-remove + flatten). */
export async function fashnProductShot(
  garment: Buffer,
  contentType: string
): Promise<{ buffer: Buffer | null; error: string }> {
  const result = await run("background-remove", {
    image: toDataUri(garment, contentType),
  });
  if (!result.buffer) return result;
  const flattened = await sharp(result.buffer)
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  return { buffer: flattened, error: "" };
}
