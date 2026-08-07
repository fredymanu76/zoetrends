import { NextRequest, NextResponse } from "next/server";
import { createProduct } from "@/lib/products/repository";
import { categoryToCollectionSlugs } from "@/lib/utils";
import { SIZES } from "@/lib/constants";
import type { GarmentCategory, ProductImage } from "@/types";

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

/** Publish a product from shots already generated in the chat studio. */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      price?: number;
      category?: string;
      flatUrl?: string;
      shots?: { url: string; view?: string }[];
    };
    const name = String(body.name || "").trim();
    const pricePounds = Number(body.price || 0);
    const category = String(body.category || "").trim();
    const flatUrl = String(body.flatUrl || "").trim();
    const shots = (body.shots || []).filter((s) => s && typeof s.url === "string");

    if (!name) return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    if (!pricePounds || pricePounds <= 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (!shots.length) return NextResponse.json({ error: "No generated shots to publish" }, { status: 400 });

    const isApparel = category in APPAREL;
    const VIEW_TO_ANGLE: Record<string, "front" | "side" | "back"> = {
      front: "front", side: "side", back: "back",
    };

    const images: ProductImage[] = [
      ...shots.map((s, i) => ({ url: s.url, storagePath: s.url, order: i })),
      ...(flatUrl ? [{ url: flatUrl, storagePath: flatUrl, order: shots.length }] : []),
    ];

    const created = await createProduct({
      name,
      description: `${name} — Made in Italy. Beautifully crafted and styled for the modern woman.`,
      pricePence: Math.round(pricePounds * 100),
      category,
      collections: categoryToCollectionSlugs(category),
      colors: [],
      variants: isApparel
        ? SIZES.map((size) => ({ size, stock: 10 }))
        : [{ size: "One Size", stock: 10 }],
      images,
      status: "active",
      featured: isApparel,
      modelPreviewEnabled: isApparel,
      garmentCategory: isApparel ? APPAREL[category] : undefined,
      aiReadyGarmentImageUrl: flatUrl || undefined,
      modelPreviewImages: isApparel
        ? shots.map((s) => ({
            url: s.url,
            angle: VIEW_TO_ANGLE[s.view || "front"] || "front",
            modelName: "described",
            generatedAt: new Date().toISOString(),
            provider: "fashn",
          }))
        : [],
    });

    return NextResponse.json({ ok: true, productId: created.id, slug: created.slug });
  } catch (err) {
    console.error("POST /api/admin/agent-publish error:", err);
    return NextResponse.json({ error: "Failed to publish product." }, { status: 500 });
  }
}
