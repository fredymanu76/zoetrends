import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query: FirebaseFirestore.Query = db.collection("products");

    if (collection) {
      query = query.where("collections", "array-contains", collection);
    }
    if (category) {
      query = query.where("category", "==", category);
    }
    if (featured === "true") {
      query = query.where("featured", "==", true);
    }
    if (status) {
      query = query.where("status", "==", status);
    } else {
      query = query.where("status", "==", "active");
    }

    query = query.orderBy("createdAt", "desc").limit(limit);

    const snap = await query.get();
    const products: Product[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

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
    const db = getAdminDb();
    const body = await req.json();

    const slug = slugify(body.name);
    const now = new Date().toISOString();

    const productData = {
      name: body.name,
      slug,
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
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("products").add(productData);

    return NextResponse.json({ id: docRef.id, slug }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
