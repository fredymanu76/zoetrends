"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiX, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "@/lib/cart-context";
import { formatPence } from "@/lib/utils";

export default function CartPage() {
  const { items, totalPence, dispatch } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountPence, setDiscountPence] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState("");
  const [validating, setValidating] = useState(false);

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setValidating(true);
    setDiscountError("");

    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotalPence: totalPence }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDiscountError(data.error);
        setDiscountPence(0);
        setDiscountApplied("");
      } else {
        setDiscountPence(data.discount.discountPence);
        setDiscountApplied(data.discount.code);
        setDiscountError("");
      }
    } catch {
      setDiscountError("Failed to validate code");
    } finally {
      setValidating(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-light tracking-wide text-black text-center mb-2">
            Your Bag
          </h1>
          <div className="w-12 h-0.5 bg-gold mx-auto mb-12" />

          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 border-2 border-dusty-pink-light rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-dusty-pink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-lg text-charcoal font-light mb-2">
              Your bag is empty
            </p>
            <p className="text-sm text-charcoal/60 font-light mb-8">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/collections/new-arrivals"
              className="inline-block px-10 py-3 bg-gold text-black text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const finalTotal = Math.max(0, totalPence - discountPence);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-light tracking-wide text-black text-center mb-2">
          Your Bag
        </h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mb-12" />

        {/* Cart items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 py-4 border-b border-dusty-pink-light"
            >
              {/* Image */}
              <Link
                href={`/products/${item.slug}`}
                className="flex-shrink-0 w-24 h-32 bg-dusty-pink-pale rounded-sm relative overflow-hidden"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dusty-pink-light to-dusty-pink-pale" />
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium text-charcoal hover:text-gold transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-charcoal/50 mt-1">
                      Size: {item.size} | Colour: {item.color}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_ITEM",
                        payload: {
                          productId: item.productId,
                          size: item.size,
                          color: item.color,
                        },
                      })
                    }
                    className="p-1 text-charcoal/40 hover:text-red-500 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          payload: {
                            productId: item.productId,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity - 1,
                          },
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:text-gold"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          payload: {
                            productId: item.productId,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity + 1,
                          },
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:text-gold"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-black">
                    {formatPence(item.pricePence * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Discount code */}
        <div className="mt-8 pb-6 border-b border-dusty-pink-light">
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Discount code"
              className="flex-1 px-4 py-2.5 border border-dusty-pink-light text-sm outline-none focus:border-gold transition-colors"
            />
            <button
              onClick={applyDiscount}
              disabled={validating || !discountCode.trim()}
              className="px-6 py-2.5 bg-gold text-black text-sm uppercase tracking-wider hover:bg-gold-dark transition-all disabled:opacity-50"
            >
              {validating ? "..." : "Apply"}
            </button>
          </div>
          {discountError && (
            <p className="text-xs text-red-500 mt-2">{discountError}</p>
          )}
          {discountApplied && (
            <p className="text-xs text-green-600 mt-2">
              Code {discountApplied} applied — saving{" "}
              {formatPence(discountPence)}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/60">Subtotal</span>
            <span className="font-medium">{formatPence(totalPence)}</span>
          </div>
          {discountPence > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountApplied})</span>
              <span>-{formatPence(discountPence)}</span>
            </div>
          )}
          <div className="flex justify-between text-charcoal/60">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-3 border-t border-dusty-pink-light">
            <span>Total</span>
            <span>{formatPence(finalTotal)}</span>
          </div>
        </div>

        {/* Checkout button */}
        <div className="mt-8 space-y-3">
          <Link
            href={`/checkout${discountApplied ? `?discount=${discountApplied}` : ""}`}
            className="block w-full py-4 bg-gold text-black text-sm text-center uppercase tracking-widest hover:bg-gold-dark transition-all duration-300"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/collections/new-arrivals"
            className="block w-full py-3 border border-dusty-pink-light text-sm text-center uppercase tracking-widest text-charcoal hover:border-gold hover:text-gold transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
