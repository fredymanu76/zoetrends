"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPence } from "@/lib/utils";
import type { Product, Order } from "@/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;

    Promise.all([
      fetch("/api/products?status=active&limit=100", {
        headers: { "x-admin-password": token },
      }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/orders", {
        headers: { "x-admin-password": token },
      }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalPence, 0);

  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= 3)
  );
  const visibleLowStockProducts = lowStockProducts.slice(0, 6);
  const hiddenLowStockCount =
    lowStockProducts.length - visibleLowStockProducts.length;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal">
            Welcome back, Theo
          </h2>
          <p className="text-sm text-charcoal/60 mt-1">
            Here&apos;s what&apos;s happening with your store today
          </p>
        </div>

        {loading ? (
          <p className="text-charcoal/60">Loading...</p>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Active Products" value={String(products.length)} />
              <StatCard label="Total Orders" value={String(orders.length)} />
              <StatCard
                label="Revenue"
                value={formatPence(totalRevenue)}
              />
              <StatCard
                label="Low Stock"
                value={String(lowStockProducts.length)}
                alert={lowStockProducts.length > 0}
              />
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-charcoal mb-3">
                Recent Orders
              </h3>
              {orders.length === 0 ? (
                <p className="text-sm text-charcoal/60">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <span className="font-medium">{order.orderCode}</span>
                        <span className="text-charcoal/60 ml-2">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
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
                        <span className="font-medium">
                          {formatPence(order.totalPence)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low stock alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-yellow-800">
                      Low Stock Alert
                    </h3>
                    <p className="text-xs text-yellow-700/80 mt-1">
                      Showing items with 3 or fewer units in any size.
                    </p>
                  </div>
                  {hiddenLowStockCount > 0 && (
                    <span className="text-xs text-yellow-800">
                      +{hiddenLowStockCount} more
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleLowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-yellow-200 bg-white/70 p-3"
                    >
                      <p className="text-sm font-medium text-yellow-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {p.variants
                          .filter((v) => v.stock <= 3 && v.stock > 0)
                          .map((v) => `${v.size}: ${v.stock} left`)
                          .join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        alert
          ? "bg-yellow-50 border-yellow-200"
          : "bg-white border-gray-200"
      }`}
    >
      <p className="text-xs text-charcoal/60 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-semibold text-charcoal mt-1">{value}</p>
    </div>
  );
}
