import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ProductImage } from "@/types";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

function safeFileName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base || "product"}-${Date.now()}${ext || ".jpg"}`;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const order = Number(form.get("order") || 0);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
    }

    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
    );
    await mkdir(uploadsDir, { recursive: true });

    const fileName = safeFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured()) {
      const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || "product-images";
      const storagePath = `products/${fileName}`;
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const image: ProductImage = {
        url: data.publicUrl,
        storagePath: `${bucket}/${storagePath}`,
        order,
      };

      return NextResponse.json({ image });
    }

    const storagePath = `local/products/${fileName}`;
    const diskPath = path.join(uploadsDir, fileName);
    await writeFile(diskPath, buffer);

    const image: ProductImage = {
      url: `/uploads/products/${fileName}`,
      storagePath,
      order,
    };

    return NextResponse.json({ image });
  } catch (err) {
    console.error("POST /api/admin/uploads/product-image error:", err);
    return NextResponse.json(
      { error: "Failed to upload product image locally" },
      { status: 500 }
    );
  }
}
