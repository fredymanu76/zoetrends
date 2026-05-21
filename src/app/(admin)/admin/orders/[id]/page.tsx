"use client";

import { useState, useEffect, use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPence } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;

    fetch(`/api/orders/${id}`, {
      headers: { "x-admin-password": token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setOrder(data);
          setNewStatus(data.orderStatus);
          setTrackingNumber(data.trackingNumber || "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate() {
    if (!order) return;
    setSaving(true);
    const token = sessionStorage.getItem("admin_token");

    const body: Record<string, string> = {};
    if (newStatus && newStatus !== order.orderStatus)
      body.orderStatus = newStatus;
    if (trackingNumber && trackingNumber !== order.trackingNumber)
      body.trackingNumber = trackingNumber;

    if (Object.keys(body).length === 0) {
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": token || "",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setOrder({
        ...order,
        ...(body.orderStatus && {
          orderStatus: body.orderStatus as OrderStatus,
        }),
        ...(body.trackingNumber && { trackingNumber: body.trackingNumber }),
      });
    }
    setSaving(false);
  }

  return (
    <AdminShell>
      {loading ? (
        <p className="text-charcoal/60">Loading...</p>
      ) : !order ? (
        <p className="text-red-600">Order not found</p>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-charcoal">
              Order {order.orderCode}
            </h2>
            <span
              className={`px-3 py-1 rounded text-sm ${
                order.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-700"
                  : order.paymentStatus === "FAILED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-charcoal mb-3">Customer</h3>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm text-charcoal/60">{order.customerEmail}</p>
            {order.shippingAddress && (
              <div className="mt-3 text-sm text-charcoal/70">
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.county &&
                    `, ${order.shippingAddress.county}`}
                </p>
                <p>{order.shippingAddress.postcode}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-charcoal mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-charcoal/50">
                      Size: {item.size} | Color: {item.color} | Qty:{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPence(item.pricePence * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Subtotal</span>
                <span>{formatPence(order.subtotalPence)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Shipping</span>
                <span>{formatPence(order.shippingPence)}</span>
              </div>
              {order.discountPence > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount{order.discountCode && ` (${order.discountCode})`}
                  </span>
                  <span>-{formatPence(order.discountPence)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPence(order.totalPence)}</span>
              </div>
            </div>
          </div>

          {/* Update status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-charcoal mb-3">Update Order</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as OrderStatus)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="mt-4 px-4 py-2 bg-gold text-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Order"}
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
