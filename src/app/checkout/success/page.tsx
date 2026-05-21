"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPence } from "@/lib/utils";
import type { Order } from "@/types";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-charcoal/60">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { dispatch } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart on success page load
    dispatch({ type: "CLEAR_CART" });
  }, [dispatch]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-charcoal/60">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-light tracking-wide text-black mb-2">
            Thank You!
          </h1>
          <p className="text-charcoal/60 font-light">
            Your order has been placed successfully
          </p>
        </div>

        {order && (
          <div className="bg-dusty-pink-pale/50 rounded-sm p-6 space-y-4">
            <div className="text-center pb-4 border-b border-dusty-pink-light">
              <p className="text-xs uppercase tracking-widest text-charcoal/60 mb-1">
                Order Code
              </p>
              <p className="text-2xl font-semibold text-gold tracking-wider">
                {order.orderCode}
              </p>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span className="text-charcoal/60">Email:</span>{" "}
                {order.customerEmail}
              </p>
              <p>
                <span className="text-charcoal/60">Status:</span>{" "}
                <span className="text-green-600 font-medium">
                  {order.paymentStatus === "PAID"
                    ? "Payment Confirmed"
                    : "Processing"}
                </span>
              </p>
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-dusty-pink-light">
              <p className="text-xs uppercase tracking-widest text-charcoal/60 mb-3">
                Items
              </p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} ({item.size}) x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPence(item.pricePence * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-dusty-pink-light space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Subtotal</span>
                <span>{formatPence(order.subtotalPence)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Shipping</span>
                <span>
                  {order.shippingPence === 0
                    ? "FREE"
                    : formatPence(order.shippingPence)}
                </span>
              </div>
              {order.discountPence > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPence(order.discountPence)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-dusty-pink-light">
                <span>Total</span>
                <span>{formatPence(order.totalPence)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block px-10 py-3 bg-gold text-black text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
