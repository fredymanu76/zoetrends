import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateOrderCode } from "@/lib/utils";
import {
  SUMUP_API_URL,
  SUMUP_CURRENCY,
  FREE_SHIPPING_THRESHOLD_PENCE,
  SHIPPING_RATES,
} from "@/lib/constants";
import { FieldValue } from "firebase-admin/firestore";
import type { CartItem, ShippingAddress, OrderItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      shippingAddress,
      shippingType,
      discountCode,
    } = body as {
      items: CartItem[];
      shippingAddress: ShippingAddress;
      shippingType: "standard" | "nextDay";
      discountCode?: string;
    };

    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Validate prices server-side by fetching products from Firestore
    let subtotalPence = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const productDoc = await db
        .collection("products")
        .doc(item.productId)
        .get();

      if (!productDoc.exists) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }

      const productData = productDoc.data()!;

      if (productData.status !== "active") {
        return NextResponse.json(
          { error: `Product unavailable: ${item.name}` },
          { status: 400 }
        );
      }

      // Check stock
      const variant = productData.variants?.find(
        (v: { size: string; stock: number }) => v.size === item.size
      );
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name} (${item.size})`,
          },
          { status: 400 }
        );
      }

      // Use server-side price, not client-provided price
      const serverPrice = productData.pricePence;
      subtotalPence += serverPrice * item.quantity;

      orderItems.push({
        productId: item.productId,
        name: productData.name,
        slug: productData.slug,
        pricePence: serverPrice,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: productData.images?.[0]?.url || undefined,
      });
    }

    // Calculate shipping
    const shippingPence =
      subtotalPence >= FREE_SHIPPING_THRESHOLD_PENCE
        ? 0
        : SHIPPING_RATES[shippingType]?.pence || SHIPPING_RATES.standard.pence;

    // Validate discount
    let discountPence = 0;
    if (discountCode) {
      const discountSnap = await db
        .collection("discounts")
        .where("code", "==", discountCode.toUpperCase())
        .where("active", "==", true)
        .limit(1)
        .get();

      if (!discountSnap.empty) {
        const disc = discountSnap.docs[0].data();
        const now = new Date().toISOString();

        if (
          now >= disc.validFrom &&
          now <= disc.validUntil &&
          (!disc.maxUses || disc.currentUses < disc.maxUses)
        ) {
          if (
            !disc.minimumOrderPence ||
            subtotalPence >= disc.minimumOrderPence
          ) {
            if (disc.type === "percentage") {
              discountPence = Math.round(
                (subtotalPence * disc.value) / 100
              );
            } else {
              discountPence = disc.value;
            }

            // Increment usage
            await discountSnap.docs[0].ref.update({
              currentUses: FieldValue.increment(1),
            });
          }
        }
      }
    }

    const totalPence = Math.max(
      0,
      subtotalPence + shippingPence - discountPence
    );

    // Create order
    const orderCode = generateOrderCode();
    const now = new Date().toISOString();

    const orderData = {
      orderCode,
      customerEmail: shippingAddress.email,
      customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      items: orderItems,
      shippingAddress,
      subtotalPence,
      shippingPence,
      discountPence,
      totalPence,
      paymentStatus: "PENDING",
      orderStatus: "PENDING_PAYMENT",
      discountCode: discountCode || null,
      trackingNumber: null,
      createdAt: now,
      updatedAt: now,
    };

    const orderRef = await db.collection("orders").add(orderData);
    const orderId = orderRef.id;

    // Create SumUp hosted checkout
    const totalPounds = totalPence / 100;
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const sumupRes = await fetch(`${SUMUP_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: orderId,
        amount: totalPounds,
        currency: SUMUP_CURRENCY,
        pay_to_email: process.env.SUMUP_PAY_TO_EMAIL,
        description: `ZoeTrends Order ${orderCode} — ${orderItems.length} item(s)`,
        redirect_url: `${origin}/checkout/success?order_id=${orderId}`,
        hosted_checkout: { enabled: true },
      }),
    });

    if (!sumupRes.ok) {
      const errText = await sumupRes.text();
      console.error("SumUp checkout creation failed:", errText);
      // Clean up order
      await orderRef.delete();
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 502 }
      );
    }

    const checkout = await sumupRes.json();

    // Store SumUp checkout ID on order
    await orderRef.update({ sumupCheckoutId: checkout.id });

    // SumUp hosted checkout URL pattern
    const checkoutUrl = `https://pay.sumup.com/b2c/Q${checkout.id}`;

    return NextResponse.json({
      orderId,
      orderCode,
      checkoutUrl,
    });
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
