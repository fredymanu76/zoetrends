"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { formatPence } from "@/lib/utils";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenId, setRegenId] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;

    fetch("/api/products?status=active&limit=100", {
      headers: { "x-admin-password": token },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const token = sessionStorage.getItem("admin_token");
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": token || "" },
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleRegenerate(product: Product) {
    if (!confirm(`Generate 3 fresh model shots for "${product.name}"? This uses up to 3 Photoroom credits.`)) return;
    const token = sessionStorage.getItem("admin_token") || "";
    setRegenId(product.id);
    try {
      const res = await fetch("/api/admin/regenerate-shots", {
        method: "POST",
        headers: { "x-admin-password": token, "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, shots: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      // Refresh the row's thumbnail + shot count
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                images: [{ url: data.primaryUrl, storagePath: data.primaryUrl, order: 0 }, ...p.images.slice(1)],
                modelPreviewImages: Array.from({ length: data.shots }, () => ({
                  url: data.primaryUrl,
                  angle: "front" as const,
                  modelName: "",
                  generatedAt: "",
                  provider: "photoroom",
                })),
              }
            : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate");
    } finally {
      setRegenId(null);
    }
  }

  const totalStock = (p: Product) =>
    p.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-charcoal">Products</h2>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors"
          >
            Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-charcoal/60">Loading...</p>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-charcoal/60 mb-4">No products yet</p>
            <Link
              href="/admin/products/new"
              className="text-gold hover:text-gold-dark text-sm font-semibold"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-charcoal/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-dusty-pink-pale rounded" />
                          )}
                          <div>
                            <p className="font-medium text-charcoal">
                              {product.name}
                            </p>
                            <p className="text-xs text-charcoal/50">
                              {product.category}
                              {" · "}
                              {product.modelPreviewImages?.length || 0} model shot
                              {(product.modelPreviewImages?.length || 0) === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formatPence(product.pricePence)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            totalStock(product) <= 3
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {totalStock(product)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : product.status === "draft"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleRegenerate(product)}
                          disabled={regenId === product.id}
                          className="text-charcoal hover:text-gold text-xs font-medium disabled:opacity-50"
                        >
                          {regenId === product.id ? "Modelling…" : "Re-model (3)"}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-gold hover:text-gold-dark text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
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
