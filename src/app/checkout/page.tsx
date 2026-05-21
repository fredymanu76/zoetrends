"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPence } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_PENCE, SHIPPING_RATES } from "@/lib/constants";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-charcoal/60">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, totalPence } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [shipping, setShipping] = useState<"standard" | "nextDay">("standard");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const discountCode = searchParams.get("discount") || "";
  const [discountPence, setDiscountPence] = useState(0);
  const [discountValidated, setDiscountValidated] = useState(false);

  // Calculate shipping
  const shippingPence =
    totalPence >= FREE_SHIPPING_THRESHOLD_PENCE
      ? 0
      : SHIPPING_RATES[shipping].pence;
  const grandTotal = Math.max(0, totalPence - discountPence + shippingPence);

  // Validate discount on mount if code passed from cart
  useState(() => {
    if (discountCode && totalPence > 0) {
      fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotalPence: totalPence }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setDiscountPence(data.discount.discountPence);
            setDiscountValidated(true);
          }
        })
        .catch(() => {});
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setError("");
    setProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: {
            firstName,
            lastName,
            email,
            phone,
            address1,
            address2,
            city,
            county,
            postcode,
            country: "United Kingdom",
          },
          shippingType: shipping,
          discountCode: discountValidated ? discountCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to SumUp hosted checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/60 mb-4">Your bag is empty</p>
          <button
            onClick={() => router.push("/collections/new-arrivals")}
            className="px-8 py-3 bg-gold text-black text-sm tracking-widest uppercase"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-light tracking-wide text-black text-center mb-2">
          Checkout
        </h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mb-10" />

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Shipping form */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-lg font-semibold text-charcoal">
                Shipping Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Address Line 2{" "}
                  <span className="text-charcoal/50 normal-case">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    County
                  </label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Shipping method */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-charcoal mb-3">
                  Shipping Method
                </h3>
                <div className="space-y-2">
                  {totalPence >= FREE_SHIPPING_THRESHOLD_PENCE && (
                    <label className="flex items-center justify-between p-3 border border-gold bg-gold/5 rounded cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="accent-gold"
                        />
                        <span className="text-sm">
                          {SHIPPING_RATES.free.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        FREE
                      </span>
                    </label>
                  )}
                  {totalPence < FREE_SHIPPING_THRESHOLD_PENCE && (
                    <>
                      <label
                        className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                          shipping === "standard"
                            ? "border-gold bg-gold/5"
                            : "border-dusty-pink-light"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shipping === "standard"}
                            onChange={() => setShipping("standard")}
                            className="accent-gold"
                          />
                          <span className="text-sm">
                            {SHIPPING_RATES.standard.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPence(SHIPPING_RATES.standard.pence)}
                        </span>
                      </label>
                      <label
                        className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                          shipping === "nextDay"
                            ? "border-gold bg-gold/5"
                            : "border-dusty-pink-light"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shipping === "nextDay"}
                            onChange={() => setShipping("nextDay")}
                            className="accent-gold"
                          />
                          <span className="text-sm">
                            {SHIPPING_RATES.nextDay.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPence(SHIPPING_RATES.nextDay.pence)}
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-dusty-pink-pale/50 p-6 rounded-sm sticky top-28">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-charcoal">
                          {item.name}
                        </p>
                        <p className="text-xs text-charcoal/50">
                          {item.size} / {item.color} x {item.quantity}
                        </p>
                      </div>
                      <span className="ml-4 font-medium">
                        {formatPence(item.pricePence * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm border-t border-dusty-pink-light pt-4">
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Subtotal</span>
                    <span>{formatPence(totalPence)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Shipping</span>
                    <span>
                      {shippingPence === 0
                        ? "FREE"
                        : formatPence(shippingPence)}
                    </span>
                  </div>
                  {discountPence > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountCode})</span>
                      <span>-{formatPence(discountPence)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-dusty-pink-light">
                    <span>Total</span>
                    <span>{formatPence(grandTotal)}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 mt-4">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 py-4 bg-gold text-black text-sm uppercase tracking-widest hover:bg-gold-dark transition-all duration-300 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
