import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-light tracking-wide text-black text-center mb-2">
          Your Bag
        </h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mb-12" />

        {/* Empty cart */}
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 border-2 border-dusty-pink-light rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-dusty-pink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="text-lg text-charcoal font-light mb-2">
            Your bag is empty
          </p>
          <p className="text-sm text-charcoal/60 font-light mb-8">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/collections/new-arrivals"
            className="inline-block px-10 py-3 bg-black text-gold text-sm tracking-widest uppercase hover:bg-gold hover:text-black transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
