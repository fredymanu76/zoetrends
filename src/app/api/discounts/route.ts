import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return !!auth && auth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("discounts")
      .orderBy("validFrom", "desc")
      .get();

    const discounts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(discounts);
  } catch (err) {
    console.error("GET /api/discounts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
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

    const discountData = {
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      minimumOrderPence: body.minimumOrderPence || null,
      maxUses: body.maxUses || null,
      currentUses: 0,
      active: body.active ?? true,
      validFrom: body.validFrom,
      validUntil: body.validUntil,
    };

    const docRef = await db.collection("discounts").add(discountData);
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/discounts error:", err);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}
