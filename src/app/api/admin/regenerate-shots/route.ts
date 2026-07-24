import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProductById, updateProduct } from "@/lib/products/repository";
import type { ProductImage } from "@/types";

const PHOTOROOM_EDIT_URL = "https://image-api.photoroom.com/v2/edit";
const PHOTOROOM_SEGMENT_URL = "https://sdk.photoroom.com/v1/segment";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

type Angle = "front" | "side" | "back";

async function loadImage(url: string): Promise<{ buffer: Buffer; contentType: string; name: string } | null> {
  try {
    if (/^https?:\/\//.test(url)) {
      const res = await fetch(url);
      if (!res.ok) return null;
      return {
        buffer: Buffer.from(await res.arrayBuffer()),
        contentType: res.headers.get("content-type") || "image/jpeg",
        name: "flat.jpg",
      };
    }
    const p = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    const buffer = Buffer.from(await readFile(p));
    const ext = path.extname(p).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { buffer, contentType, name: `flat${ext || ".jpg"}` };
  } catch {
    return null;
  }
}

async function saveImage(buffer: Buffer, folder: string, fileName: string): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const bucket = process.env.SUPABASE_MODEL_PREVIEWS_BUCKET || "model-previews";
      const storagePath = `${folder}/${fileName}`;
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });
      if (!error) return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
    } catch {
      /* fall through */
    }
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = process.env.PHOTOROOM_API_KEY;
  if (!key) return NextResponse.json({ error: "PHOTOROOM_API_KEY is not set." }, { status: 400 });

  try {
    const { productId, shots: shotsRaw } = await req.json();
    const shots = Math.max(1, Math.min(3, parseInt(String(shotsRaw ?? 3), 10) || 3));
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const product = await getProductById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const isApparel = !!product.garmentCategory;
    const flatUrl =
      product.aiReadyGarmentImageUrl || product.images[product.images.length - 1]?.url;
    if (!flatUrl) return NextResponse.json({ error: "This product has no flat image to model." }, { status: 400 });

    const flat = await loadImage(flatUrl);
    if (!flat) return NextResponse.json({ error: "Could not load the product's flat image." }, { status: 400 });

    const model = product.modelPreviewImages?.[0]?.modelName || "zoe";
    const ALL_POSES: { pose: string; angle: Angle }[] = [
      { pose: "standing", angle: "front" },
      { pose: "34turn", angle: "side" },
      { pose: "back", angle: "back" },
    ];
    const posePlan = isApparel ? ALL_POSES.slice(0, shots) : [{ pose: "standing", angle: "front" as Angle }];

    async function genOnModel(pose: string): Promise<Buffer | null> {
      const f = new FormData();
      f.append("imageFile", new Blob([new Uint8Array(flat!.buffer)], { type: flat!.contentType }), flat!.name);
      f.append("virtualModel.mode", "ai.auto");
      f.append("virtualModel.model.preset.name", model);
      f.append("virtualModel.pose", pose);
      f.append("virtualModel.quality", "standard");
      f.append("virtualModel.size", "PORTRAIT_HD_3_2");
      f.append("export.format", "png");
      const res = await fetch(PHOTOROOM_EDIT_URL, { method: "POST", headers: { "x-api-key": key! }, body: f });
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }
    async function genProductShot(): Promise<Buffer | null> {
      const f = new FormData();
      f.append("image_file", new Blob([new Uint8Array(flat!.buffer)], { type: flat!.contentType }), flat!.name);
      f.append("bg_color", "FFFFFF");
      f.append("format", "png");
      const res = await fetch(PHOTOROOM_SEGMENT_URL, { method: "POST", headers: { "x-api-key": key! }, body: f });
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }

    const generated: { buffer: Buffer; angle: Angle }[] = [];
    for (const step of posePlan) {
      const buf = isApparel ? await genOnModel(step.pose) : await genProductShot();
      if (buf) generated.push({ buffer: buf, angle: step.angle });
    }
    if (!generated.length) {
      return NextResponse.json({ error: "Photoroom generation failed. Check your key/quota." }, { status: 502 });
    }

    const base = product.slug || "product";
    const stamp = Date.now();
    const savedShots: { url: string; angle: Angle }[] = [];
    for (let i = 0; i < generated.length; i++) {
      const url = await saveImage(generated[i].buffer, "model-previews", `${base}-${generated[i].angle}-${stamp}-${i}.png`);
      savedShots.push({ url, angle: generated[i].angle });
    }

    // New gallery: fresh model shots first, keep the original flat image last.
    const images: ProductImage[] = [
      ...savedShots.map((s, i) => ({ url: s.url, storagePath: s.url, order: i })),
      { url: flatUrl, storagePath: flatUrl, order: savedShots.length },
    ];

    await updateProduct(productId, {
      images,
      modelPreviewEnabled: isApparel,
      modelPreviewImages: isApparel
        ? savedShots.map((s) => ({
            url: s.url,
            angle: s.angle,
            modelName: model,
            generatedAt: new Date().toISOString(),
            provider: "photoroom",
          }))
        : [],
    });

    // Refresh the hero mirror with the new front shot.
    if (isApparel) {
      try {
        const dir = path.join(process.cwd(), "public", "models");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, `${base}-${stamp}.png`), generated[0].buffer);
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json({ ok: true, shots: savedShots.length, primaryUrl: savedShots[0].url });
  } catch (err) {
    console.error("POST /api/admin/regenerate-shots error:", err);
    return NextResponse.json({ error: "Failed to regenerate model shots" }, { status: 500 });
  }
}
