import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";
import { createProduct } from "@/lib/products/repository";
import { categoryToCollectionSlugs, slugify } from "@/lib/utils";
import { SIZES } from "@/lib/constants";
import { isFashnConfigured, fashnOnModel, fashnProductShot } from "@/lib/ai/fashn";
import type { FashnView } from "@/lib/ai/fashn";
import type { GarmentCategory, ProductImage } from "@/types";

// Generating up to 3 on-model shots sequentially can take a few minutes.
export const maxDuration = 300;

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

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey && !isFashnConfigured()) {
    return NextResponse.json(
      { error: "No AI provider configured. Set FASHN_API_KEY (or PHOTOROOM_API_KEY) in .env.local." },
      { status: 400 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "").trim();
    const pricePounds = parseFloat(String(form.get("price") || "0"));
    const model = String(form.get("model") || "zoe");
    const shots = Math.max(1, Math.min(3, parseInt(String(form.get("shots") || "3"), 10) || 3));

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

    // Optional custom brand model image (used instead of a preset model).
    const brandEntry = form.get("customModel");
    const brandModelBuf = brandEntry instanceof File ? Buffer.from(await brandEntry.arrayBuffer()) : null;
    const brandModelType = brandEntry instanceof File ? brandEntry.type : "image/png";

    // Narrowed captures so the nested helpers keep their types.
    const imageFile: File = file;
    const key: string = apiKey || "";
    const useFashn = isFashnConfigured();
    const flat = Buffer.from(await imageFile.arrayBuffer());
    const isApparel = category in APPAREL;
    const base = slugify(name) || "product";
    const stamp = Date.now();

    // --- Generate model shot(s) via Photoroom ---
    // Apparel: on-model shots (front / ¾ turn / back per `shots`).
    // Non-apparel: one clean studio product shot (on-model try-on doesn't apply).
    type Angle = "front" | "side" | "back";
    const ALL_POSES: { pose: string; angle: Angle }[] = [
      { pose: "standing", angle: "front" },
      { pose: "34turn", angle: "side" },
      { pose: "back", angle: "back" },
    ];
    const posePlan: { pose: string; angle: Angle }[] = isApparel
      ? ALL_POSES.slice(0, shots)
      : [{ pose: "standing", angle: "front" }];

    // Anchor the garment type so partial/cropped photos (e.g. one dress cut out
    // of a rack shot) aren't misread as a different garment worn over other clothes.
    const GARMENT_NOUN: Record<GarmentCategory, string> = {
      dress: "dress",
      top: "top",
      bottom: "trousers",
      full_outfit: "jumpsuit",
      jacket: "jacket",
    };
    async function genOnModel(pose: string): Promise<Buffer | null> {
      const f = new FormData();
      f.append("imageFile", new Blob([flat], { type: imageFile.type }), imageFile.name);
      f.append("virtualModel.mode", "ai.auto");
      if (isApparel) {
        f.append("virtualModel.prompt", `wearing ${name}, a ${GARMENT_NOUN[APPAREL[category]]}, worn on its own exactly as shown`);
      }
      if (brandModelBuf) {
        f.append(
          "virtualModel.model.custom.imageFile",
          new Blob([new Uint8Array(brandModelBuf)], { type: brandModelType }),
          "brand-model.png"
        );
      } else {
        f.append("virtualModel.model.preset.name", model);
      }
      f.append("virtualModel.pose", pose);
      f.append("virtualModel.quality", "standard");
      f.append("virtualModel.size", "PORTRAIT_HD_3_2");
      f.append("export.format", "png");
      const res = await fetch(PHOTOROOM_EDIT_URL, { method: "POST", headers: { "x-api-key": key }, body: f });
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }
    async function genProductShot(): Promise<Buffer | null> {
      const f = new FormData();
      f.append("image_file", new Blob([flat], { type: imageFile.type }), imageFile.name);
      f.append("bg_color", "#FFFFFF");
      f.append("format", "png");
      const res = await fetch(PHOTOROOM_SEGMENT_URL, { method: "POST", headers: { "x-api-key": key }, body: f });
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }

    let genError = "";
    async function generateOne(step: { pose: string; angle: Angle }): Promise<Buffer | null> {
      if (useFashn) {
        const result = isApparel
          ? await fashnOnModel({
              garment: flat,
              garmentContentType: imageFile.type,
              productName: name,
              garmentNoun: GARMENT_NOUN[APPAREL[category]],
              view: step.angle as FashnView,
              modelKey: model,
              faceReference: brandModelBuf
                ? { buffer: brandModelBuf, contentType: brandModelType }
                : null,
            })
          : await fashnProductShot(flat, imageFile.type);
        if (!result.buffer) genError = result.error;
        return result.buffer;
      }
      return isApparel ? genOnModel(step.pose) : genProductShot();
    }

    const generated: { buffer: Buffer; angle: Angle }[] = [];
    for (const step of posePlan) {
      const buf = await generateOne(step);
      if (buf) generated.push({ buffer: buf, angle: step.angle });
    }
    if (!generated.length) {
      const provider = useFashn ? "FASHN" : "Photoroom";
      return NextResponse.json(
        { error: `${provider} generation failed. Check your API key and remaining credits. ${genError}`.trim() },
        { status: 502 }
      );
    }

    // --- Save model shot(s) + the flat image ---
    const savedShots: { url: string; angle: Angle }[] = [];
    for (let i = 0; i < generated.length; i++) {
      const url = await saveImage(
        generated[i].buffer, "image/png",
        "SUPABASE_MODEL_PREVIEWS_BUCKET", "model-previews",
        "model-previews", `${base}-${generated[i].angle}-${stamp}-${i}.png`
      );
      savedShots.push({ url, angle: generated[i].angle });
    }
    const flatUrl = await saveImage(
      flat, file.type,
      "SUPABASE_PRODUCTS_BUCKET", "product-images",
      "products", `${base}-flat-${stamp}.${file.type.split("/")[1] || "jpg"}`
    );

    // Model shots are primary (gallery order); flat image last.
    const images: ProductImage[] = [
      ...savedShots.map((s, i) => ({ url: s.url, storagePath: s.url, order: i })),
      { url: flatUrl, storagePath: flatUrl, order: savedShots.length },
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
        ? savedShots.map((s) => ({
            url: s.url,
            angle: s.angle,
            modelName: model,
            generatedAt: new Date().toISOString(),
            provider: useFashn ? "fashn" : "photoroom",
          }))
        : [],
    });

    // Front apparel shot also feeds the homepage hero.
    if (isApparel) {
      try {
        const dir = path.join(process.cwd(), "public", "models");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, `${base}-${stamp}.png`), generated[0].buffer);
      } catch {
        /* hero mirror is best-effort */
      }
    }

    return NextResponse.json({
      ok: true,
      productId: created.id,
      slug: created.slug,
      shots: savedShots.length,
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
