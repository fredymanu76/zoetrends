import { NextRequest, NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/products/repository";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const products = await listProducts({
      collection,
      category,
      featured: featured === "true",
      status: (status || "active") as "draft" | "active" | "archived",
      limit,
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const productData = {
      name: body.name,
      description: body.description || "",
      pricePence: body.pricePence,
      originalPricePence: body.originalPricePence || null,
      category: body.category || "",
      collections: body.collections || [],
      colors: body.colors || [],
      variants: body.variants || [],
      images: body.images || [],
      badge: body.badge || null,
      status: body.status || "draft",
      featured: body.featured || false,
      modelPreviewEnabled: false,
      garmentCategory: undefined,
      aiReadyGarmentImageUrl: undefined,
      modelPreviewImages: [],
    };

    const result = await createProduct(productData);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
