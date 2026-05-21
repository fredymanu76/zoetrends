import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  href: string;
  colors: string[];
  badge?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={product.href} className="product-card group block">
      {/* Image placeholder */}
      <div className="relative aspect-[3/4] bg-dusty-pink-pale overflow-hidden rounded-sm mb-3">
        <div className="product-image w-full h-full bg-gradient-to-br from-dusty-pink-light to-dusty-pink-pale flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 border-2 border-gold/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gold/40"
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
            <p className="text-xs text-dusty-pink-dark/60">Product Image</p>
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-gold text-white text-[10px] tracking-widest uppercase px-3 py-1">
            {product.badge}
          </span>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4">
          <span className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white text-black text-xs uppercase tracking-widest px-6 py-2 shadow-lg">
            Quick View
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="text-center">
        <h3 className="text-sm text-charcoal group-hover:text-gold transition-colors leading-snug mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-semibold text-black">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-dusty-pink-dark line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {product.colors.map((color, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
