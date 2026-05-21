"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { formatPence } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING_PAYMENT" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Dispatched", value: "DISPATCHED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  DISPATCHED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-orange-100 text-orange-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;

    const url = filter ? `/api/orders?status=${filter}` : "/api/orders";
    fetch(url, { headers: { "x-admin-password": token } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <AdminShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-charcoal">Orders</h2>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                setLoading(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                filter === f.value
                  ? "bg-gold text-white border-gold"
                  : "border-gray-300 text-charcoal hover:border-gold"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-charcoal/60">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-charcoal/60">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Payment
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-charcoal/70">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-gold hover:text-gold-dark"
                        >
                          {order.orderCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-charcoal/50">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            statusColors[order.orderStatus] || ""
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            order.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPence(order.totalPence)}
                      </td>
                      <td className="px-4 py-3 text-charcoal/60">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
