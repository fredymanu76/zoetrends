import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getAdminDb();

    const snap = await db
      .collection("products")
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const doc = snap.docs[0];
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("GET /api/products/by-slug/[slug] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
