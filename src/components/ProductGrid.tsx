import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";

const newArrivals: Product[] = [
  {
    id: "1",
    name: "The Sculpted Olive Button Through Sleeveless Dress",
    price: "£49.00",
    href: "/products/sculpted-olive-dress",
    colors: ["#6a7756", "#1a1a1a", "#d4a0a0"],
    badge: "New",
  },
  {
    id: "2",
    name: "The Julia Pretty Woman Polka Dress With Belt",
    price: "£32.00",
    href: "/products/julia-polka-dress",
    colors: ["#1a1a1a", "#c9a84c", "#ffffff"],
    badge: "New",
  },
  {
    id: "3",
    name: "The Oasis Golden Thread Glow Button Through Shirt Dress",
    price: "£29.00",
    href: "/products/oasis-golden-dress",
    colors: ["#c9a84c", "#d4a0a0", "#f0dada"],
  },
  {
    id: "4",
    name: "The Santorini Sands Classic Summer Cross Front Dress With Belt",
    price: "£29.00",
    href: "/products/santorini-sands-dress",
    colors: ["#e8d5c0", "#1a1a1a", "#d4a0a0"],
  },
];

export default function ProductGrid() {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

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
