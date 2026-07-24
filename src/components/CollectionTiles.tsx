import Link from "next/link";
import { listProducts } from "@/lib/products/repository";

// Each tile is a homepage sub-block. `placement` is the tag ticked on the
// Homepage admin page; `href` is where "Shop Now" takes the customer.
const tiles = [
  {
    label: "Spring Summer",
    caption: "The New Season",
    placement: "home-spring-summer",
    href: "/collections/new-arrivals",
    bg: "bg-gradient-to-br from-dusty-pink-pale to-dusty-pink-light",
    text: "text-black",
  },
  {
    label: "Made in Italy",
    caption: "Italian Craftsmanship",
    placement: "home-made-in-italy",
    href: "/collections/made-in-italy",
    bg: "bg-gradient-to-br from-black to-charcoal",
    text: "text-white",
  },
  {
    label: "Clothing",
    caption: "Shop the Edit",
    placement: "home-clothing",
    href: "/collections/clothing",
    bg: "bg-gradient-to-br from-[#f5e6d3] to-dusty-pink-light",
    text: "text-black",
  },
];

async function tileImage(placement: string): Promise<string | null> {
  try {
    const products = await listProducts({ status: "active", collection: placement, limit: 1 });
    const p = products[0];
    return p ? p.modelPreviewImages?.[0]?.url || p.images?.[0]?.url || null : null;
  } catch {
    return null;
  }
}

export default async function CollectionTiles() {
  const images = await Promise.all(tiles.map((t) => tileImage(t.placement)));

  return (
    <section className="py-14 md:py-20 bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-gold mb-3">Explore</p>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-black">
            Shop by Collection
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile, i) => {
            const img = images[i];
            return (
              <Link
                key={tile.label}
                href={tile.href}
                className={`group relative overflow-hidden rounded-sm h-72 md:h-96 flex items-center justify-center ${
                  img ? "bg-black" : tile.bg
                }`}
              >
                {img ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
                  </>
                ) : (
                  <div className="absolute inset-0 overflow-hidden opacity-60">
                    <div className="absolute -top-8 -right-8 w-40 h-40 border border-gold/20 rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full overflow-hidden border border-gold/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.png" alt="" aria-hidden="true" className="w-full h-full object-cover opacity-40" />
                    </div>
                  </div>
                )}

                <div className={`relative z-10 text-center px-6 ${img ? "text-white" : tile.text}`}>
                  <p className="text-xs tracking-[0.3em] uppercase opacity-80 mb-3">{tile.caption}</p>
                  <h3 className="text-2xl md:text-3xl font-light tracking-[0.1em] mb-6">{tile.label}</h3>
                  <span className="inline-block px-8 py-2.5 border border-gold text-xs tracking-[0.2em] uppercase group-hover:bg-gold group-hover:text-white transition-all duration-300">
                    Shop Now
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
