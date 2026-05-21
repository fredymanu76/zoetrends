"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiHeart, FiShare2, FiTruck, FiRotateCw } from "react-icons/fi";
import { formatPence } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types";

export default function ProductDetail({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const availableVariants = product.variants.filter((v) => v.stock > 0);

  function handleAddToCart() {
    if (!selectedSize) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        pricePence: product.pricePence,
        size: selectedSize,
        color: selectedColor,
        quantity,
        image: product.images[0]?.url,
      },
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

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
            {product.category || "Clothing"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Product images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-dusty-pink-pale rounded-sm overflow-hidden">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]?.url || product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
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
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img.storagePath}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-colors ${
                      selectedImage === i
                        ? "border-gold"
                        : "border-transparent hover:border-gold/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl text-gold font-semibold">
                {formatPence(product.pricePence)}
              </p>
              {product.originalPricePence && (
                <p className="text-lg text-dusty-pink-dark line-through">
                  {formatPence(product.originalPricePence)}
                </p>
              )}
            </div>

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-charcoal mb-3">
                  Colour:{" "}
                  <span className="text-gold">{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                        selectedColor === color
                          ? "border-gold"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-charcoal mb-3">
                Size
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((variant) => {
                  const inStock = variant.stock > 0;
                  return (
                    <button
                      key={variant.size}
                      onClick={() => inStock && setSelectedSize(variant.size)}
                      disabled={!inStock}
                      className={`w-12 h-12 border text-sm tracking-wide transition-all ${
                        selectedSize === variant.size
                          ? "border-gold bg-gold text-white"
                          : inStock
                          ? "border-gray-200 text-charcoal hover:border-gold"
                          : "border-gray-100 text-gray-300 line-through cursor-not-allowed"
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <p className="text-xs text-charcoal/50 mt-2">
                  {availableVariants.find((v) => v.size === selectedSize)
                    ?.stock || 0}{" "}
                  in stock
                </p>
              )}
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
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`flex-1 py-4 text-sm uppercase tracking-widest transition-all duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : selectedSize
                    ? "bg-gold text-black hover:bg-gold-dark"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {added
                  ? "Added to Bag!"
                  : selectedSize
                  ? "Add to Bag"
                  : "Select a Size"}
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
                <span className="font-light">
                  Free returns within 14 days
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t border-dusty-pink-light pt-6">
                <h3 className="text-xs uppercase tracking-widest text-black mb-4">
                  Description
                </h3>
                <p className="text-sm text-charcoal/80 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
