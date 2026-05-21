"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientStorage, isFirebaseConfigured } from "@/lib/firebase/client";
import { CATEGORIES, COLLECTIONS, SIZES } from "@/lib/constants";
import { formatPence } from "@/lib/utils";
import type { Product, ProductImage, ProductVariant } from "@/types";
import { FiX, FiUpload } from "react-icons/fi";

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [pricePounds, setPricePounds] = useState(
    product ? (product.pricePence / 100).toFixed(2) : ""
  );
  const [originalPricePounds, setOriginalPricePounds] = useState(
    product?.originalPricePence
      ? (product.originalPricePence / 100).toFixed(2)
      : ""
  );
  const [category, setCategory] = useState(product?.category || "");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    product?.collections || []
  );
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [colorInput, setColorInput] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || SIZES.map((s) => ({ size: s, stock: 0 }))
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [badge, setBadge] = useState(product?.badge || "");
  const [status, setStatus] = useState(product?.status || "draft");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addColor() {
    const c = colorInput.trim();
    if (c && !colors.includes(c)) {
      setColors([...colors, c]);
      setColorInput("");
    }
  }

  function removeColor(c: string) {
    setColors(colors.filter((x) => x !== c));
  }

  function toggleCollection(slug: string) {
    setSelectedCollections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function updateVariantStock(size: string, stock: number) {
    setVariants((prev) =>
      prev.map((v) => (v.size === size ? { ...v, stock } : v))
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !isFirebaseConfigured) return;

    setUploading(true);
    const token = sessionStorage.getItem("admin_token");
    const storage = getClientStorage();

    try {
      for (const file of Array.from(files)) {
        const path = `products/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const newImage: ProductImage = {
          url,
          storagePath: path,
          order: images.length,
        };

        setImages((prev) => [...prev, newImage]);

        // If editing, save image metadata to backend
        if (isEdit && product) {
          await fetch("/api/products/images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": token || "",
            },
            body: JSON.stringify({ productId: product.id, image: newImage }),
          });
        }
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeImage(storagePath: string) {
    const token = sessionStorage.getItem("admin_token");
    setImages((prev) => prev.filter((img) => img.storagePath !== storagePath));

    if (isEdit && product) {
      await fetch("/api/products/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token || "",
        },
        body: JSON.stringify({ productId: product.id, storagePath }),
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const token = sessionStorage.getItem("admin_token");
    const pricePence = Math.round(parseFloat(pricePounds) * 100);
    const origPence = originalPricePounds
      ? Math.round(parseFloat(originalPricePounds) * 100)
      : null;

    const body = {
      name,
      description,
      pricePence,
      originalPricePence: origPence,
      category,
      collections: selectedCollections,
      colors,
      variants: variants.filter((v) => v.stock > 0 || isEdit),
      images,
      badge: badge || null,
      status,
      featured,
    };

    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token || "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Product Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Price (£)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={pricePounds}
            onChange={(e) => setPricePounds(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
          />
          {pricePounds && (
            <p className="text-xs text-charcoal/50 mt-1">
              = {formatPence(Math.round(parseFloat(pricePounds) * 100))}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Original Price (£){" "}
            <span className="text-charcoal/50">optional</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={originalPricePounds}
            onChange={(e) => setOriginalPricePounds(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Collections */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Collections
        </label>
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.map((col) => (
            <button
              key={col.slug}
              type="button"
              onClick={() => toggleCollection(col.slug)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                selectedCollections.includes(col.slug)
                  ? "bg-gold text-white border-gold"
                  : "border-gray-300 text-charcoal hover:border-gold"
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Colors (hex codes)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
          />
          <button
            type="button"
            onClick={addColor}
            className="px-3 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
            >
              <span
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: c }}
              />
              {c}
              <button type="button" onClick={() => removeColor(c)}>
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Sizes & Stock */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Sizes & Stock
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {variants.map((v) => (
            <div key={v.size} className="text-center">
              <p className="text-xs font-medium text-charcoal mb-1">
                {v.size}
              </p>
              <input
                type="number"
                min="0"
                value={v.stock}
                onChange={(e) =>
                  updateVariantStock(v.size, parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center outline-none focus:border-gold"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Images
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img) => (
            <div key={img.storagePath} className="relative w-24 h-24 group">
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(img.storagePath)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-charcoal/60 cursor-pointer hover:border-gold hover:text-gold transition-colors">
          <FiUpload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload Images"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Badge, Status, Featured */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Badge <span className="text-charcoal/50">optional</span>
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="New, Sale, Bestseller"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "active" | "archived")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-gold"
            />
            Featured
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gold text-black font-semibold rounded-lg text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEdit
            ? "Update Product"
            : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2.5 border border-gray-300 text-charcoal rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
