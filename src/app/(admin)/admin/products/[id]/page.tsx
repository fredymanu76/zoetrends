"use client";

import { useState, useEffect, use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/types";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;

    fetch(`/api/products/${id}`, {
      headers: { "x-admin-password": token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-charcoal">Edit Product</h2>
        {loading ? (
          <p className="text-charcoal/60">Loading...</p>
        ) : product ? (
          <ProductForm product={product} />
        ) : (
          <p className="text-red-600">Product not found</p>
        )}
      </div>
    </AdminShell>
  );
}
