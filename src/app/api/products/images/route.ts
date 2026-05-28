import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct } from "@/lib/products/repository";
import type { ProductImage } from "@/types";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

// Add image metadata to product after client-side upload to Firebase Storage
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, image } = (await req.json()) as {
      productId: string;
      image: ProductImage;
    };

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const images: ProductImage[] = product.images || [];
    images.push(image);

    await updateProduct(productId, { images });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/products/images error:", err);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

// Remove image metadata from product
export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, storagePath } = await req.json();

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const images: ProductImage[] = (product.images || []).filter(
      (img: ProductImage) => img.storagePath !== storagePath
    );

    await updateProduct(productId, { images });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products/images error:", err);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
