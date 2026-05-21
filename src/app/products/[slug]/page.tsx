"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiHeart, FiShare2, FiTruck, FiRotateCw } from "react-icons/fi";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Gold", hex: "#c9a84c" },
  { name: "Dusty Pink", hex: "#d4a0a0" },
];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const title = formatSlug(slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-xs text-charcoal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/collections/clothing"
            className="hover:text-gold transition-colors"
          >
            Clothing
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Product images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-dusty-pink-pale rounded-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 border-2 border-gold/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gold/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-dusty-pink-dark/60">
                  Product Image
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-dusty-pink-pale rounded-sm border-2 border-transparent hover:border-gold cursor-pointer transition-colors"
                />
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-2">
              {title}
            </h1>
            <p className="text-2xl text-gold font-semibold mb-6">£49.00</p>

            {/* Color selection */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-charcoal mb-3">
                Colour: <span className="text-gold">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      selectedColor === color.name
                        ? "border-gold"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-charcoal mb-3">
                Size
              </p>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm tracking-wide transition-all ${
                      selectedSize === size
                        ? "border-gold bg-gold text-white"
                        : "border-gray-200 text-charcoal hover:border-gold"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-charcoal mb-3">
                Quantity
              </p>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-charcoal hover:text-gold transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-charcoal hover:text-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="flex gap-3 mb-8">
              <button className="flex-1 py-4 bg-black text-gold text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300">
                Add to Bag
              </button>
              <button className="w-14 h-14 border border-dusty-pink flex items-center justify-center hover:bg-dusty-pink-pale transition-colors">
                <FiHeart className="w-5 h-5 text-dusty-pink" />
              </button>
              <button className="w-14 h-14 border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery info */}
            <div className="space-y-3 border-t border-dusty-pink-light pt-6">
              <div className="flex items-center gap-3 text-sm text-charcoal">
                <FiTruck className="w-5 h-5 text-gold" />
                <span className="font-light">
                  Next day delivery available
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal">
                <FiRotateCw className="w-5 h-5 text-gold" />
                <span className="font-light">Free returns within 14 days</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-dusty-pink-light pt-6">
              <h3 className="text-xs uppercase tracking-widest text-black mb-4">
                Description
              </h3>
              <p className="text-sm text-charcoal/80 font-light leading-relaxed">
                A beautifully crafted piece from our Italian collection.
                Designed with attention to detail and made from premium
                materials for an effortlessly elegant look. Perfect for both
                casual daytime wear and evening occasions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
