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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: FirebaseFirestore.Query = db.collection("orders");

    if (status) {
      query = query.where("orderStatus", "==", status);
    }

    query = query.orderBy("createdAt", "desc").limit(100);

    const snap = await query.get();
    const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
