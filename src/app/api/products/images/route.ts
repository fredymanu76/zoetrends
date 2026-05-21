import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
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
    const db = getAdminDb();
    const { productId, image } = (await req.json()) as {
      productId: string;
      image: ProductImage;
    };

    const docRef = db.collection("products").doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = doc.data()!;
    const images: ProductImage[] = data.images || [];
    images.push(image);

    await docRef.update({
      images,
      updatedAt: new Date().toISOString(),
    });

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
    const db = getAdminDb();
    const { productId, storagePath } = await req.json();

    const docRef = db.collection("products").doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = doc.data()!;
    const images: ProductImage[] = (data.images || []).filter(
      (img: ProductImage) => img.storagePath !== storagePath
    );

    await docRef.update({
      images,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products/images error:", err);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
