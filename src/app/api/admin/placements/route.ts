import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/products/repository";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

/**
 * Lightweight homepage-placement update. Updates ONLY `featured` and
 * `collections` so a product's AI model images and other fields are preserved.
 */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, featured, collections } = body as {
      id?: string;
      featured?: boolean;
      collections?: string[];
    };
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const patch: { featured?: boolean; collections?: string[] } = {};
    if (typeof featured === "boolean") patch.featured = featured;
    if (Array.isArray(collections)) patch.collections = collections;

    await updateProduct(id, patch);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/placements error:", err);
    return NextResponse.json({ error: "Failed to update placement" }, { status: 500 });
  }
}
