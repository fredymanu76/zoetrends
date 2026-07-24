import Link from "next/link";

const tiles = [
  {
    label: "Spring Summer",
    caption: "The New Season",
    href: "/collections/new-arrivals",
    bg: "bg-gradient-to-br from-dusty-pink-pale to-dusty-pink-light",
    text: "text-black",
  },
  {
    label: "Made in Italy",
    caption: "Italian Craftsmanship",
    href: "/collections/made-in-italy",
    bg: "bg-gradient-to-br from-black to-charcoal",
    text: "text-white",
  },
  {
    label: "Clothing",
    caption: "Shop the Edit",
    href: "/collections/clothing",
    bg: "bg-gradient-to-br from-[#f5e6d3] to-dusty-pink-light",
    text: "text-black",
  },
];

export default function CollectionTiles() {
  return (
    <section className="py-14 md:py-20 bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-gold mb-3">
            Explore
          </p>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-black">
            Shop by Collection
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`group relative overflow-hidden rounded-sm h-72 md:h-96 flex items-center justify-center ${tile.bg}`}
            >
              {/* Decorative gold rings + brand watermark */}
              <div className="absolute inset-0 overflow-hidden opacity-60">
                <div className="absolute -top-8 -right-8 w-40 h-40 border border-gold/20 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full overflow-hidden border border-gold/20">
                  <img
                    src="/logo.png"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
              </div>

              <div className={`relative z-10 text-center px-6 ${tile.text}`}>
                <p className="text-xs tracking-[0.3em] uppercase opacity-70 mb-3">
                  {tile.caption}
                </p>
                <h3 className="text-2xl md:text-3xl font-light tracking-[0.1em] mb-6">
                  {tile.label}
                </h3>
                <span className="inline-block px-8 py-2.5 border border-gold text-xs tracking-[0.2em] uppercase group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
