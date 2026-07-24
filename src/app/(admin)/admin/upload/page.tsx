"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { CATEGORIES, SIZES } from "@/lib/constants";

type Variant = { size: string; stock: number };

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  price: string;
  category: string;
  variants: Variant[];
  expanded: boolean;
  status: "idle" | "processing" | "done" | "error";
  message?: string;
  slug?: string;
};

const APPAREL = new Set([
  "Dresses", "Tops", "Trousers", "Jumpsuits", "Knitwear", "Jackets & Coats",
]);

function defaultVariants(category: string): Variant[] {
  return APPAREL.has(category)
    ? SIZES.map((size) => ({ size, stock: 10 }))
    : [{ size: "One Size", stock: 10 }];
}

// Turn a filename into a friendly product name — but blank out junk names
// (screenshots, IMG_1234, dates) so the seller is forced to type a real one.
function nameFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  const junk = /^(screenshot|image|img|photo|untitled|dsc|pxl|whatsapp|download)\b/i;
  const mostlyNumbers = /^[\d\s.:-]+$/;
  if (junk.test(base) || mostlyNumbers.test(base)) return "";
  return base;
}

export default function UploadPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const cat = CATEGORIES[0];
    const next: Item[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: nameFromFile(f.name),
        price: "",
        category: cat,
        variants: defaultVariants(cat),
        expanded: false,
        status: "idle",
      }));
    setItems((prev) => [...prev, ...next]);
  }

  function update(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function changeCategory(id: string, category: string) {
    // Reset sizes to sensible defaults for the new category.
    update(id, { category, variants: defaultVariants(category) });
  }

  function setStock(id: string, size: string, stock: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, variants: it.variants.map((v) => (v.size === size ? { ...v, stock } : v)) }
          : it
      )
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function publishOne(it: Item, token: string) {
    update(it.id, { status: "processing", message: "Modelling…" });
    try {
      const fd = new FormData();
      fd.append("file", it.file);
      fd.append("name", it.name);
      fd.append("price", it.price);
      fd.append("category", it.category);
      fd.append("variants", JSON.stringify(it.variants));
      const res = await fetch("/api/admin/product-studio", {
        method: "POST",
        headers: { "x-admin-password": token },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      update(it.id, {
        status: "done",
        slug: data.slug,
        message: data.treatment === "on-model" ? "Live — modelled" : "Live — product shot",
      });
    } catch (err) {
      update(it.id, { status: "error", message: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function publishAll() {
    const token = sessionStorage.getItem("admin_token") || "";
    const ready = items.filter(
      (it) => it.status !== "done" && it.name.trim() && Number(it.price) > 0
    );
    if (!ready.length) return;
    setBusy(true);
    for (const it of ready) await publishOne(it, token);
    setBusy(false);
  }

  const readyCount = items.filter(
    (it) => it.status !== "done" && it.name.trim() && Number(it.price) > 0
  ).length;

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-charcoal">Add Products</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Drop in your flat product photos, add a name, price and category, then
            press <strong>Publish</strong>. We model each item and place it in the
            right part of your shop automatically.
          </p>
        </div>

        {/* Drop zone */}
        <label className="block border-2 border-dashed border-gold/40 rounded-xl bg-gold/5 p-10 text-center cursor-pointer hover:bg-gold/10 transition-colors">
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <p className="text-charcoal font-medium">Click to choose photos</p>
          <p className="text-xs text-charcoal/50 mt-1">
            You can select many at once — clothing, bags, shoes, accessories.
          </p>
        </label>

        {items.length > 0 && (
          <>
            <div className="mt-6 space-y-4">
              {items.map((it) => (
                <div key={it.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.previewUrl} alt="" className="w-20 h-24 object-cover rounded bg-gray-50 shrink-0" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <input
                        value={it.name}
                        onChange={(e) => update(it.id, { name: e.target.value })}
                        placeholder="Product name *"
                        className={`border rounded px-3 py-2 text-sm ${
                          it.status === "idle" && !it.name.trim()
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      <div className="flex items-center border border-gray-300 rounded px-3 py-2 text-sm">
                        <span className="text-charcoal/50 mr-1">£</span>
                        <input
                          value={it.price}
                          onChange={(e) => update(it.id, { price: e.target.value })}
                          placeholder="0.00"
                          inputMode="decimal"
                          className="w-full outline-none"
                        />
                      </div>
                      <select
                        value={it.category}
                        onChange={(e) => changeCategory(it.id, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-40 text-right shrink-0">
                      {it.status === "idle" && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => update(it.id, { expanded: !it.expanded })}
                            className="text-xs text-charcoal/70 hover:text-gold"
                          >
                            {it.expanded ? "Hide sizes" : "Sizes & stock"}
                          </button>
                          <button onClick={() => remove(it.id)} className="text-xs text-charcoal/40 hover:text-red-600">
                            Remove
                          </button>
                        </div>
                      )}
                      {it.status === "processing" && <span className="text-xs text-gold">{it.message}</span>}
                      {it.status === "done" && (
                        <a href={`/products/${it.slug}`} target="_blank" className="text-xs text-green-700 underline">
                          {it.message} ↗
                        </a>
                      )}
                      {it.status === "error" && <span className="text-xs text-red-600">{it.message}</span>}
                    </div>
                  </div>

                  {/* Sizes & stock editor */}
                  {it.expanded && it.status === "idle" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-wide text-charcoal/50 mb-2">
                        Stock per size <span className="normal-case">(set 0 to hide a size)</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {it.variants.map((v) => (
                          <div key={v.size} className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1">
                            <span className="text-xs font-medium text-charcoal w-14">{v.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={v.stock}
                              onChange={(e) => setStock(it.id, v.size, Math.max(0, Number(e.target.value)))}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-charcoal/60">{readyCount} ready to publish</p>
              <button
                onClick={publishAll}
                disabled={busy || readyCount === 0}
                className="px-8 py-3 bg-gold text-black text-sm uppercase tracking-widest font-semibold rounded hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {busy ? "Publishing…" : `Publish ${readyCount} Product${readyCount === 1 ? "" : "s"}`}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
