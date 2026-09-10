// Durable image storage for generated shots and garment photos.
// Priority: Vercel Blob (native to our hosting, works at runtime in prod)
// → Supabase storage (legacy) → local /public (dev only — Vercel's runtime
// filesystem is read-only, so falling back there in prod must be an error,
// not a silent write that vanishes).
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";
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

/**
 * Best-effort deletion of a previously-saved image, matched to whichever
 * backend produced its URL. Used to purge AI shots the seller discards or
 * never publishes — so unpublished generations aren't retained. Never throws:
 * a failed purge must not break the caller (worst case is an orphaned file).
 */
export async function deleteImage(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    // Vercel Blob — del() accepts the public URL directly.
    if (url.includes(".blob.vercel-storage.com")) {
      await del(url);
      return true;
    }

    // Supabase public URL: …/storage/v1/object/public/<bucket>/<path>
    const marker = "/storage/v1/object/public/";
    const at = url.indexOf(marker);
    if (at !== -1 && isSupabaseConfigured()) {
      const rest = url.slice(at + marker.length).split("?")[0];
      const slash = rest.indexOf("/");
      if (slash > 0) {
        const bucket = decodeURIComponent(rest.slice(0, slash));
        const objectPath = decodeURIComponent(rest.slice(slash + 1));
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.storage.from(bucket).remove([objectPath]);
        return !error;
      }
    }

    // Local dev upload (public/uploads/...).
    if (!process.env.VERCEL && url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url.replace(/^\//, "")));
      return true;
    }
  } catch (err) {
    console.error("deleteImage failed for", url, err);
  }
  return false;
}
