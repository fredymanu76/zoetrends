// Durable image storage for generated shots and garment photos.
// Priority: Vercel Blob (native to our hosting, works at runtime in prod)
// → Supabase storage (legacy) → local /public (dev only — Vercel's runtime
// filesystem is read-only, so falling back there in prod must be an error,
// not a silent write that vanishes).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export async function saveImage(
  buffer: Buffer,
  contentType: string,
  bucketEnv: string,
  defaultBucket: string,
  folder: string,
  fileName: string
): Promise<string> {
  const errors: string[] = [];

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`${folder}/${fileName}`, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
      });
      return blob.url;
    } catch (err) {
      errors.push(`blob: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

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
      errors.push(`supabase: ${error.message}`);
    } catch (err) {
      errors.push(`supabase: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);
    return `/uploads/${folder}/${fileName}`;
  }

  throw new Error(
    `Image storage failed (${errors.join("; ") || "no storage backend configured"})`
  );
}
