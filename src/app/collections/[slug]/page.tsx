import Link from "next/link";
import ProductCard, { Product } from "@/components/ProductCard";

const sampleProducts: Product[] = [
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
  {
    id: "5",
    name: "The Amalfi Coast Linen Wrap Dress",
    price: "£39.00",
    href: "/products/amalfi-coast-dress",
    colors: ["#f0dada", "#c9a84c"],
    badge: "Bestseller",
  },
  {
    id: "6",
    name: "The Roma Gold Thread Midi Skirt",
    price: "£35.00",
    href: "/products/roma-gold-skirt",
    colors: ["#c9a84c", "#1a1a1a"],
  },
  {
    id: "7",
    name: "The Milano Black Evening Blouse",
    price: "£42.00",
    href: "/products/milano-blouse",
    colors: ["#1a1a1a", "#d4a0a0"],
  },
  {
    id: "8",
    name: "The Firenze Dusty Rose Maxi Dress",
    price: "£55.00",
    originalPrice: "£75.00",
    href: "/products/firenze-maxi-dress",
    colors: ["#d4a0a0", "#f0dada", "#1a1a1a"],
    badge: "Sale",
  },
];

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = formatSlug(slug);

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
              You've Been Missing Out!
            </h3>
            <p className="text-sm md:text-base text-white font-semibold">
              Enter code:{" "}
              <span className="font-extrabold text-white uppercase tracking-wider">Welcome</span> at the
              checkout to receive 10% off your first order!
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
          {sampleProducts.length} products
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
          Showing {sampleProducts.length} results
        </p>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
