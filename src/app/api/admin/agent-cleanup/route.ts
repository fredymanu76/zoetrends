import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/lib/storage";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

/**
 * Purge AI-generated images the seller discarded or left unpublished.
 * Called both on an explicit delete and on page-leave (fetch keepalive), so
 * unpublished shots are not retained in storage. Best-effort by design.
 */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { urls?: unknown };
    const urls = Array.isArray(body.urls)
      ? body.urls.filter((u): u is string => typeof u === "string" && !!u)
      : [];
    if (!urls.length) return NextResponse.json({ ok: true, deleted: 0 });

    const results = await Promise.all(urls.map((u) => deleteImage(u)));
    return NextResponse.json({ ok: true, deleted: results.filter(Boolean).length });
  } catch (err) {
    console.error("POST /api/admin/agent-cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
