import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { SUMUP_API_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, id: checkoutId } = body as {
      event_type?: string;
      id?: string;
    };

    if (event_type !== "CHECKOUT_STATUS_CHANGED" || !checkoutId) {
      return NextResponse.json({}, { status: 200 });
    }

    // Verify checkout status via SumUp API
    const verifyRes = await fetch(`${SUMUP_API_URL}/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
      },
    });

    if (!verifyRes.ok) {
      console.error(
        "Failed to verify SumUp checkout:",
        await verifyRes.text()
      );
      return NextResponse.json({}, { status: 200 });
    }

    const checkout = await verifyRes.json();
    const { status, checkout_reference } = checkout as {
      status: string;
      checkout_reference: string;
    };

    if (!checkout_reference) {
      return NextResponse.json({}, { status: 200 });
    }

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(checkout_reference);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error("Order not found for checkout:", checkout_reference);
      return NextResponse.json({}, { status: 200 });
    }

    if (status === "PAID") {
      const orderData = orderSnap.data()!;

      // Update order status
      await orderRef.update({
        paymentStatus: "PAID",
        orderStatus: "PAID",
        sumupCheckoutId: checkoutId,
        updatedAt: new Date().toISOString(),
      });

      // Decrement stock for each item
      for (const item of orderData.items || []) {
        const productRef = db.collection("products").doc(item.productId);
        const productSnap = await productRef.get();

        if (productSnap.exists) {
          const productData = productSnap.data()!;
          const variants = (productData.variants || []).map(
            (v: { size: string; stock: number }) =>
              v.size === item.size
                ? { ...v, stock: Math.max(0, v.stock - item.quantity) }
                : v
          );

          await productRef.update({
            variants,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } else if (status === "FAILED" || status === "EXPIRED") {
      await orderRef.update({
        paymentStatus: "FAILED",
        orderStatus: "CANCELLED",
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.error("SumUp webhook error:", err);
    return NextResponse.json({}, { status: 200 });
  }
}
