import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getAdminDb();
    const body = await req.json();

    await db.collection("discounts").doc(id).update(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/discounts/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getAdminDb();

    await db.collection("discounts").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/discounts/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}
