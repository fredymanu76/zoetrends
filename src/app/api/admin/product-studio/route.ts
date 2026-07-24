import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { createProduct } from "@/lib/products/repository";
import { categoryToCollectionSlugs, slugify } from "@/lib/utils";
import { SIZES } from "@/lib/constants";
import type { GarmentCategory, ProductImage } from "@/types";

const PHOTOROOM_EDIT_URL = "https://image-api.photoroom.com/v2/edit";
const PHOTOROOM_SEGMENT_URL = "https://sdk.photoroom.com/v1/segment";

// Categories that get an on-model try-on. Everything else gets a clean product shot.
const APPAREL: Record<string, GarmentCategory> = {
  Dresses: "dress",
  Tops: "top",
  Knitwear: "top",
  Trousers: "bottom",
  Jumpsuits: "full_outfit",
  "Jackets & Coats": "jacket",
};

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

/** Save a buffer to Supabase storage (preferred) or local /public as a fallback. */
async function saveImage(
  buffer: Buffer,
  contentType: string,
  bucketEnv: string,
  defaultBucket: string,
  folder: string,
  fileName: string
): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const bucket = process.env[bucketEnv] || defaultBucket;
      const storagePath = `${folder}/${fileName}`;
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, { contentType, upsert: true });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        return data.publicUrl;
      }
    } catch {
      // fall through to local
    }
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PHOTOROOM_API_KEY is not set in .env.local." },
      { status: 400 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "").trim();
    const pricePounds = parseFloat(String(form.get("price") || "0"));
    const pose = String(form.get("pose") || "standing");
    const model = String(form.get("model") || "zoe");

    // Optional per-item sizes/stock from the upload form.
    let variants: { size: string; stock: number }[] | undefined;
    const variantsRaw = form.get("variants");
    if (variantsRaw) {
      try {
        const parsed = JSON.parse(String(variantsRaw));
        if (Array.isArray(parsed)) {
          variants = parsed
            .filter((v) => v && typeof v.size === "string")
            .map((v) => ({ size: String(v.size), stock: Math.max(0, Number(v.stock) || 0) }));
        }
      } catch {
        /* ignore malformed variants, fall back to defaults */
      }
    }

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "A flat product image is required" }, { status: 400 });
    }
    if (!name) return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (!pricePounds || pricePounds <= 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }

    const flat = Buffer.from(await file.arrayBuffer());
    const isApparel = category in APPAREL;
    const base = slugify(name) || "product";
    const stamp = Date.now();

    // --- Generate the modelled / product image via Photoroom ---
    let modelledBuffer: Buffer;
    if (isApparel) {
      const editForm = new FormData();
      editForm.append("imageFile", new Blob([flat], { type: file.type }), file.name);
      editForm.append("virtualModel.mode", "ai.auto");
      editForm.append("virtualModel.model.preset.name", model);
      editForm.append("virtualModel.pose", pose);
      editForm.append("virtualModel.quality", "standard");
      editForm.append("virtualModel.size", "PORTRAIT_HD_3_2");
      editForm.append("export.format", "png");
      const res = await fetch(PHOTOROOM_EDIT_URL, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: editForm,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Photoroom on-model failed (${res.status})`, detail: detail.slice(0, 400) },
          { status: 502 }
        );
      }
      modelledBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      // Non-apparel: clean studio product shot (background removed, white backdrop).
      const segForm = new FormData();
      segForm.append("image_file", new Blob([flat], { type: file.type }), file.name);
      segForm.append("bg_color", "FFFFFF");
      segForm.append("format", "png");
      const res = await fetch(PHOTOROOM_SEGMENT_URL, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: segForm,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Photoroom product shot failed (${res.status})`, detail: detail.slice(0, 400) },
          { status: 502 }
        );
      }
      modelledBuffer = Buffer.from(await res.arrayBuffer());
    }

    // --- Save both images ---
    const modelledUrl = await saveImage(
      modelledBuffer, "image/png",
      "SUPABASE_MODEL_PREVIEWS_BUCKET", "model-previews",
      "model-previews", `${base}-model-${stamp}.png`
    );
    const flatUrl = await saveImage(
      flat, file.type,
      "SUPABASE_PRODUCTS_BUCKET", "product-images",
      "products", `${base}-flat-${stamp}.${file.type.split("/")[1] || "jpg"}`
    );

    // Modelled image is the primary (what customers see), flat image second.
    const images: ProductImage[] = [
      { url: modelledUrl, storagePath: modelledUrl, order: 0 },
      { url: flatUrl, storagePath: flatUrl, order: 1 },
    ];

    // --- Create the catalogue product (auto-placed via category) ---
    const created = await createProduct({
      name,
      description: `${name} — Made in Italy. Beautifully crafted and styled for the modern woman.`,
      pricePence: Math.round(pricePounds * 100),
      category,
      collections: categoryToCollectionSlugs(category),
      colors: [],
      variants:
        variants && variants.length
          ? variants
          : isApparel
            ? SIZES.map((size) => ({ size, stock: 10 }))
            : [{ size: "One Size", stock: 10 }],
      images,
      status: "active",
      featured: isApparel,
      modelPreviewEnabled: isApparel,
      garmentCategory: isApparel ? APPAREL[category] : undefined,
      aiReadyGarmentImageUrl: flatUrl,
      modelPreviewImages: isApparel
        ? [{ url: modelledUrl, angle: "front", modelName: model, generatedAt: new Date().toISOString(), provider: "photoroom" }]
        : [],
    });

    // Apparel cut-outs also feed the homepage hero.
    if (isApparel) {
      try {
        const dir = path.join(process.cwd(), "public", "models");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, `${base}-${stamp}.png`), modelledBuffer);
      } catch {
        /* hero mirror is best-effort */
      }
    }

    return NextResponse.json({
      ok: true,
      productId: created.id,
      slug: created.slug,
      modelledUrl,
      category,
      collections: categoryToCollectionSlugs(category),
      treatment: isApparel ? "on-model" : "product-shot",
    });
  } catch (err) {
    console.error("POST /api/admin/product-studio error:", err);
    return NextResponse.json(
      { error: "Failed to create product. Check Photoroom key and database connection." },
      { status: 500 }
    );
  }
}
