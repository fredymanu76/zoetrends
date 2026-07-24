import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

// Photoroom on-model try-on: flat garment image in -> AI model wearing it out.
// Docs: POST /v2/edit with virtualModel.* params. Optionally cut out the
// background (POST /v1/segment) to produce a transparent PNG for the hero.
const PHOTOROOM_EDIT_URL = "https://image-api.photoroom.com/v2/edit";
const PHOTOROOM_SEGMENT_URL = "https://sdk.photoroom.com/v1/segment";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

function safeFileName(name: string) {
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `model-${base || "look"}-${Date.now()}.png`;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "PHOTOROOM_API_KEY is not set. Add it to .env.local (Photoroom Plus plan required) and restart the dev server.",
      },
      { status: 400 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "A flat garment image is required" },
        { status: 400 }
      );
    }

    const model = String(form.get("model") || "zoe");
    const pose = String(form.get("pose") || "standing");
    const scene = String(form.get("scene") || "flowers");
    const quality = String(form.get("quality") || "standard");
    const size = String(form.get("size") || "PORTRAIT_HD_3_2");
    const cutout = String(form.get("cutout") || "false") === "true";

    const garment = Buffer.from(await file.arrayBuffer());

    // --- Step 1: generate the on-model image via /v2/edit ---
    const editForm = new FormData();
    editForm.append("imageFile", new Blob([garment], { type: file.type }), file.name);
    editForm.append("virtualModel.mode", "ai.auto");
    // Nested params must be sent as dotted field names (not JSON strings).
    editForm.append("virtualModel.model.preset.name", model);
    editForm.append("virtualModel.pose", pose);
    editForm.append("virtualModel.scene.preset.name", scene);
    editForm.append("virtualModel.quality", quality);
    editForm.append("virtualModel.size", size);
    editForm.append("export.format", "png");

    const editRes = await fetch(PHOTOROOM_EDIT_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: editForm,
    });

    if (!editRes.ok) {
      const detail = await editRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Photoroom /v2/edit failed (${editRes.status})`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    let outBuffer = Buffer.from(await editRes.arrayBuffer());
    let contentType = "image/png";

    // --- Step 2 (optional): cut out background for a transparent hero PNG ---
    if (cutout) {
      const segForm = new FormData();
      segForm.append(
        "image_file",
        new Blob([outBuffer], { type: "image/png" }),
        "on-model.png"
      );
      segForm.append("format", "png");
      const segRes = await fetch(PHOTOROOM_SEGMENT_URL, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: segForm,
      });
      if (segRes.ok) {
        outBuffer = Buffer.from(await segRes.arrayBuffer());
      }
      // If segmentation fails we keep the scene image rather than erroring.
    }

    // --- Save so the scrolling hero picks it up ---
    const fileName = safeFileName(file.name);

    if (isSupabaseConfigured()) {
      const bucket = process.env.SUPABASE_MODEL_PREVIEWS_BUCKET || "model-previews";
      const storagePath = `hero/${fileName}`;
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, outBuffer, { contentType, upsert: false });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        // Also mirror to /public/models so the filesystem-backed hero shows it.
        const modelsDir = path.join(process.cwd(), "public", "models");
        await mkdir(modelsDir, { recursive: true });
        await writeFile(path.join(modelsDir, fileName), outBuffer);
        return NextResponse.json({ url: data.publicUrl, fileName, cutout });
      }
    }

    const modelsDir = path.join(process.cwd(), "public", "models");
    await mkdir(modelsDir, { recursive: true });
    await writeFile(path.join(modelsDir, fileName), outBuffer);
    return NextResponse.json({ url: `/models/${fileName}`, fileName, cutout });
  } catch (err) {
    console.error("POST /api/admin/ai-model error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI model image" },
      { status: 500 }
    );
  }
}
