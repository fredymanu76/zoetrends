import Link from "next/link";
import ProductCard from "./ProductCard";
import { listProducts } from "@/lib/products/repository";
import type { Product } from "@/types";

async function getNewArrivals(): Promise<Product[]> {
  try {
    // Curated via the Homepage page (products ticked into "New Arrivals").
    const curated = await listProducts({
      status: "active",
      collection: "home-new-arrivals",
      limit: 8,
    });
    if (curated.length) return curated;
    // Fallback: newest featured products.
    return await listProducts({ status: "active", featured: true, limit: 8 });
  } catch {
    return [];
  }
}

export default async function ProductGrid() {
  const products = await getNewArrivals();

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Just Landed
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-black">
            New Arrivals
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-charcoal/60 text-sm">
            Products coming soon
          </p>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            href="/collections/new-arrivals"
            className="inline-block px-10 py-3 border-2 border-black text-sm tracking-[0.2em] uppercase text-black hover:bg-black hover:text-gold transition-all duration-300"
          >
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
