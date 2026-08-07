import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";
import { isFashnConfigured, fashnFromDescription } from "@/lib/ai/fashn";
import type { FashnView } from "@/lib/ai/fashn";

// A balanced-mode generation takes ~25s; leave headroom for polling.
export const maxDuration = 300;

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

/**
 * Chat studio generation: garment photo + the seller's own description →
 * one on-model shot. Accepts either a fresh file upload or the flatUrl of a
 * previously saved garment (for extra angles / retries).
 */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFashnConfigured()) {
    return NextResponse.json(
      { error: "FASHN_API_KEY is not set. Add it in .env.local and Vercel." },
      { status: 400 }
    );
  }

  try {
    const form = await req.formData();
    const description = String(form.get("description") || "").trim();
    const view = (String(form.get("view") || "front") as FashnView) || "front";
    const seed = parseInt(String(form.get("seed") || "42"), 10) || 42;
    const file = form.get("file");
    const flatUrlIn = String(form.get("flatUrl") || "").trim();

    if (!description) {
      return NextResponse.json({ error: "A description is required" }, { status: 400 });
    }

    let garment: Buffer;
    let contentType: string;
    let flatUrl = flatUrlIn;
    const stamp = Date.now();

    if (file instanceof File && file.type.startsWith("image/")) {
      garment = Buffer.from(await file.arrayBuffer());
      contentType = file.type;
      flatUrl = await saveImage(
        garment, contentType,
        "SUPABASE_PRODUCTS_BUCKET", "product-images",
        "products", `studio-flat-${stamp}.${contentType.split("/")[1] || "jpg"}`
      );
    } else if (flatUrlIn) {
      const res = await fetch(flatUrlIn);
      if (!res.ok) {
        return NextResponse.json({ error: "Could not load the saved garment image." }, { status: 400 });
      }
      garment = Buffer.from(await res.arrayBuffer());
      contentType = res.headers.get("content-type") || "image/jpeg";
    } else {
      return NextResponse.json({ error: "A garment image is required" }, { status: 400 });
    }

    const result = await fashnFromDescription({
      garment,
      garmentContentType: contentType,
      description,
      view,
      seed,
    });
    if (!result.buffer) {
      const outOfCredits = /402|exhausted|insufficient|credit/i.test(result.error);
      return NextResponse.json(
        {
          error: outOfCredits
            ? "Your FASHN API credits have run out. Top up at app.fashn.ai/api, then try again."
            : `Generation failed. ${result.error}`.trim(),
        },
        { status: outOfCredits ? 402 : 502 }
      );
    }

    const shotUrl = await saveImage(
      result.buffer, "image/png",
      "SUPABASE_MODEL_PREVIEWS_BUCKET", "model-previews",
      "model-previews", `studio-shot-${view}-${stamp}.png`
    );

    return NextResponse.json({ ok: true, flatUrl, shotUrl, view });
  } catch (err) {
    console.error("POST /api/admin/agent-generate error:", err);
    return NextResponse.json({ error: "Generation failed unexpectedly." }, { status: 500 });
  }
}
