import { getAdminDb } from "@/lib/firebase/admin";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  categoryToCollectionSlugs,
  collectionMatchesProductSlugs,
  slugify,
} from "@/lib/utils";
import type { Product, ProductImage } from "@/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_pence: number;
  original_price_pence: number | null;
  category: string | null;
  collections: string[] | null;
  colors: string[] | null;
  variants: Product["variants"] | null;
  images: ProductImage[] | null;
  badge: string | null;
  status: Product["status"];
  featured: boolean;
  model_preview_enabled: boolean;
  garment_category: Product["garmentCategory"] | null;
  ai_ready_garment_image_url: string | null;
  model_preview_images: Product["modelPreviewImages"] | null;
  created_at: string;
  updated_at: string;
};

type ProductWrite = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};

export type ProductListFilters = {
  status?: Product["status"];
  collection?: string | null;
  category?: string | null;
  featured?: boolean;
  limit?: number;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    pricePence: row.price_pence,
    originalPricePence: row.original_price_pence || undefined,
    category: row.category || "",
    collections: row.collections || [],
    colors: row.colors || [],
    variants: row.variants || [],
    images: row.images || [],
    badge: row.badge || undefined,
    status: row.status,
    featured: row.featured,
    modelPreviewEnabled: row.model_preview_enabled,
    garmentCategory: row.garment_category || undefined,
    aiReadyGarmentImageUrl: row.ai_ready_garment_image_url || undefined,
    modelPreviewImages: row.model_preview_images || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function productToRow(product: ProductWrite) {
  return {
    name: product.name,
    slug: product.slug || slugify(product.name),
    description: product.description || "",
    price_pence: product.pricePence,
    original_price_pence: product.originalPricePence || null,
    category: product.category || "",
    collections: product.collections || [],
    colors: product.colors || [],
    variants: product.variants || [],
    images: product.images || [],
    badge: product.badge || null,
    status: product.status || "draft",
    featured: product.featured || false,
    model_preview_enabled: product.modelPreviewEnabled || false,
    garment_category: product.garmentCategory || null,
    ai_ready_garment_image_url: product.aiReadyGarmentImageUrl || null,
    model_preview_images: product.modelPreviewImages || [],
  };
}

function applyProductFilters(products: Product[], filters: ProductListFilters) {
  const wantedStatus = filters.status || "active";
  return products
    .filter((product) => product.status === wantedStatus)
    .filter((product) =>
      filters.collection
        ? filters.collection === "new-arrivals" ||
          collectionMatchesProductSlugs(filters.collection, [
            ...(product.collections || []),
            ...categoryToCollectionSlugs(product.category || ""),
          ])
        : true
    )
    .filter((product) =>
      filters.category ? product.category === filters.category : true
    )
    .filter((product) => (filters.featured ? product.featured : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, filters.limit || 50);
}

async function listFirebaseProducts(filters: ProductListFilters) {
  const snap = await getAdminDb().collection("products").get();
  const products = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
  return applyProductFilters(products, filters);
}

async function listSupabaseProducts(filters: ProductListFilters) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit || 50);

  if (error) throw error;
  return applyProductFilters((data || []).map(rowToProduct), filters);
}

export async function listProducts(filters: ProductListFilters = {}) {
  if (isSupabaseConfigured()) {
    try {
      return await listSupabaseProducts(filters);
    } catch (err) {
      console.warn("Supabase products unavailable; falling back to Firebase", err);
    }
  }

  return listFirebaseProducts(filters);
}

export async function getProductById(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) return rowToProduct(data);
    } catch (err) {
      console.warn("Supabase product lookup unavailable; falling back", err);
    }
  }

  const doc = await getAdminDb().collection("products").doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Product) : null;
}

export async function getProductBySlug(slug: string) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!error && data) return rowToProduct(data);
    } catch (err) {
      console.warn("Supabase product slug lookup unavailable; falling back", err);
    }
  }

  const snap = await getAdminDb()
    .collection("products")
    .where("slug", "==", slug)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
}

export async function createProduct(product: ProductWrite) {
  if (isSupabaseConfigured()) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await getSupabaseAdmin()
        .from("products")
        .insert({
          ...productToRow(product),
          created_at: now,
          updated_at: now,
        })
        .select("id, slug")
        .single();

      if (!error && data) return data as { id: string; slug: string };
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase product create unavailable; falling back", err);
    }
  }

  const slug = product.slug || slugify(product.name);
  const now = new Date().toISOString();
  const docRef = await getAdminDb()
    .collection("products")
    .add({ ...product, slug, createdAt: now, updatedAt: now });
  return { id: docRef.id, slug };
}

export async function updateProduct(id: string, product: Partial<ProductWrite>) {
  if (isSupabaseConfigured()) {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (product.name !== undefined) {
        updateData.name = product.name;
        updateData.slug = product.slug || slugify(product.name);
      }
      if (product.description !== undefined) updateData.description = product.description;
      if (product.pricePence !== undefined) updateData.price_pence = product.pricePence;
      if (product.originalPricePence !== undefined) {
        updateData.original_price_pence = product.originalPricePence || null;
      }
      if (product.category !== undefined) updateData.category = product.category;
      if (product.collections !== undefined) updateData.collections = product.collections;
      if (product.colors !== undefined) updateData.colors = product.colors;
      if (product.variants !== undefined) updateData.variants = product.variants;
      if (product.images !== undefined) updateData.images = product.images;
      if (product.badge !== undefined) updateData.badge = product.badge || null;
      if (product.status !== undefined) updateData.status = product.status;
      if (product.featured !== undefined) updateData.featured = product.featured;
      if (product.modelPreviewEnabled !== undefined) {
        updateData.model_preview_enabled = product.modelPreviewEnabled;
      }
      if (product.garmentCategory !== undefined) {
        updateData.garment_category = product.garmentCategory || null;
      }
      if (product.aiReadyGarmentImageUrl !== undefined) {
        updateData.ai_ready_garment_image_url =
          product.aiReadyGarmentImageUrl || null;
      }
      if (product.modelPreviewImages !== undefined) {
        updateData.model_preview_images = product.modelPreviewImages;
      }

      const { error } = await getSupabaseAdmin()
        .from("products")
        .update(updateData)
        .eq("id", id);

      if (!error) return;
      throw error;
    } catch (err) {
      console.warn("Supabase product update unavailable; falling back", err);
    }
  }

  await getAdminDb()
    .collection("products")
    .doc(id)
    .update({ ...product, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await getSupabaseAdmin()
        .from("products")
        .delete()
        .eq("id", id);
      if (!error) return;
      throw error;
    } catch (err) {
      console.warn("Supabase product delete unavailable; falling back", err);
    }
  }

  await getAdminDb().collection("products").doc(id).delete();
}
