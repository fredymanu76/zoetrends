import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { formatSlug } from "@/lib/utils";
import type { Product } from "@/types";

async function getCollectionProducts(slug: string): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/products?collection=${slug}&limit=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = formatSlug(slug);
  const products = await getCollectionProducts(slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-xs text-charcoal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{title}</span>
        </nav>
      </div>

      {/* New customer discount banner */}
      {slug === "new-arrivals" && (
        <section className="bg-[#2ec4c4] py-6 md:py-8 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              You&apos;ve Been Missing Out!
            </h3>
            <p className="text-sm md:text-base text-white font-semibold">
              Enter code:{" "}
              <span className="font-extrabold text-white uppercase tracking-wider">
                Welcome
              </span>{" "}
              at the checkout to receive 10% off your first order!
            </p>
          </div>
        </section>
      )}

      {/* Collection header */}
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          {title}
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        <p className="text-sm text-charcoal/70 mt-4 font-light">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Filters bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-dusty-pink-light">
        <div className="flex gap-4">
          <button className="text-xs uppercase tracking-widest text-black hover:text-gold transition-colors">
            Filter
          </button>
          <button className="text-xs uppercase tracking-widest text-black hover:text-gold transition-colors">
            Sort
          </button>
        </div>
        <p className="text-xs text-charcoal/60">
          Showing {products.length} results
        </p>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal/60 font-light">
              No products in this collection yet
            </p>
            <Link
              href="/collections/new-arrivals"
              className="inline-block mt-4 px-8 py-3 bg-gold text-black text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300"
            >
              Browse New Arrivals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
