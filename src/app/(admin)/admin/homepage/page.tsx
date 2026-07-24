"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { Product } from "@/types";

// Homepage blocks, top → bottom. New Arrivals is the last block.
const BLOCKS = [
  { key: "hero", label: "Hero", kind: "featured" as const, hint: "scrolling models — needs a model image" },
  { key: "home-spring-summer", label: "Spring Summer", kind: "collection" as const },
  { key: "home-made-in-italy", label: "Made in Italy", kind: "collection" as const },
  { key: "home-clothing", label: "Clothing", kind: "collection" as const },
  { key: "home-new-arrivals", label: "New Arrivals", kind: "collection" as const },
];

export default function HomepagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return;
    fetch("/api/products?status=active&limit=200", { headers: { "x-admin-password": token } })
      .then((r) => (r.ok ? r.json() : []))
      .then((p) => setProducts(p))
      .finally(() => setLoading(false));
  }, []);

  function isOn(p: Product, block: (typeof BLOCKS)[number]) {
    return block.kind === "featured" ? !!p.featured : (p.collections || []).includes(block.key);
  }

  async function toggle(p: Product, block: (typeof BLOCKS)[number]) {
    const token = sessionStorage.getItem("admin_token") || "";
    const on = isOn(p, block);

    let patch: { featured?: boolean; collections?: string[] };
    let nextProduct: Product;
    if (block.kind === "featured") {
      patch = { featured: !on };
      nextProduct = { ...p, featured: !on };
    } else {
      const collections = new Set(p.collections || []);
      if (on) collections.delete(block.key);
      else collections.add(block.key);
      const arr = Array.from(collections);
      patch = { collections: arr };
      nextProduct = { ...p, collections: arr };
    }

    // optimistic update
    setProducts((prev) => prev.map((x) => (x.id === p.id ? nextProduct : x)));

    const res = await fetch("/api/admin/placements", {
      method: "POST",
      headers: { "x-admin-password": token, "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, ...patch }),
    });
    if (!res.ok) {
      // revert on failure
      setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    }
  }

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-charcoal">Homepage</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Tick where each product should appear on your homepage. Changes go live
            immediately. Blocks are shown in the order they appear on the page.
          </p>
        </div>

        {loading ? (
          <p className="text-charcoal/60 text-sm">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-charcoal/60 text-sm">
            No products yet. Add some in <strong>Add Products</strong> first.
          </p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="p-3 font-medium text-charcoal">Product</th>
                  {BLOCKS.map((b) => (
                    <th key={b.key} className="p-3 font-medium text-charcoal text-center whitespace-nowrap">
                      {b.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = p.modelPreviewImages?.[0]?.url || p.images?.[0]?.url;
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt="" className="w-10 h-12 object-cover rounded bg-gray-50 shrink-0" />
                          <div>
                            <p className="text-charcoal font-medium leading-tight">{p.name}</p>
                            <p className="text-xs text-charcoal/50">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      {BLOCKS.map((b) => {
                        const disabled = b.key === "hero" && !(p.modelPreviewImages && p.modelPreviewImages.length);
                        return (
                          <td key={b.key} className="p-3 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[#c9a84c] disabled:opacity-30"
                              checked={isOn(p, b)}
                              disabled={disabled}
                              title={disabled ? "This product has no model image yet" : undefined}
                              onChange={() => toggle(p, b)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
