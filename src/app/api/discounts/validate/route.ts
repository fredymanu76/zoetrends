import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Discount } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotalPence } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const snap = await db
      .collection("discounts")
      .where("code", "==", code.toUpperCase())
      .where("active", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "Invalid discount code" },
        { status: 404 }
      );
    }

    const doc = snap.docs[0];
    const discount = { id: doc.id, ...doc.data() } as Discount;

    const now = new Date().toISOString();
    if (now < discount.validFrom || now > discount.validUntil) {
      return NextResponse.json(
        { error: "Discount code has expired" },
        { status: 400 }
      );
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return NextResponse.json(
        { error: "Discount code has reached its usage limit" },
        { status: 400 }
      );
    }

    if (
      discount.minimumOrderPence &&
      subtotalPence < discount.minimumOrderPence
    ) {
      const minPounds = (discount.minimumOrderPence / 100).toFixed(2);
      return NextResponse.json(
        { error: `Minimum order of £${minPounds} required` },
        { status: 400 }
      );
    }

    let discountPence = 0;
    if (discount.type === "percentage") {
      discountPence = Math.round((subtotalPence * discount.value) / 100);
    } else {
      discountPence = discount.value;
    }

    return NextResponse.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountPence,
      },
    });
  } catch (err) {
    console.error("POST /api/discounts/validate error:", err);
    return NextResponse.json(
      { error: "Failed to validate discount" },
      { status: 500 }
    );
  }
}
