import { readdir } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { listProducts } from "@/lib/products/repository";

/**
 * Homepage fashion hero: a scrolling row of model cut-outs.
 * Source order: (1) FEATURED catalogue products' AI model shots, so newly
 * published products flow to the homepage automatically; (2) the /public/models
 * folder; (3) placeholder graphics.
 */
type HeroModel = { src: string; slug?: string };

const PLACEHOLDER_IMAGES: HeroModel[] = [
  { src: "/uploads/seed-products/made-in-italy-floral-wrap-dress.svg" },
  { src: "/uploads/seed-products/italian-linen-jumpsuit.svg" },
  { src: "/uploads/seed-products/cream-knit-cardigan.svg" },
  { src: "/uploads/seed-products/pleated-midi-skirt.svg" },
  { src: "/uploads/seed-products/satin-button-blouse.svg" },
];

async function getFeaturedModels(): Promise<HeroModel[]> {
  try {
    const products = await listProducts({ status: "active", featured: true, limit: 12 });
    const out: HeroModel[] = [];
    for (const p of products) {
      const src = p.modelPreviewImages?.[0]?.url || p.images?.[0]?.url;
      if (src) out.push({ src, slug: p.slug });
    }
    return out;
  } catch {
    return [];
  }
}

async function getFolderModels(): Promise<HeroModel[]> {
  try {
    const dir = path.join(process.cwd(), "public", "models");
    const files = (await readdir(dir))
      .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
      .sort();
    return files.map((f) => ({ src: `/models/${f}` }));
  } catch {
    return [];
  }
}

async function getHeroModels(): Promise<HeroModel[]> {
  const featured = await getFeaturedModels();
  if (featured.length >= 3) return featured;
  const folder = await getFolderModels();
  if (featured.length + folder.length >= 3) return [...featured, ...folder];
  return PLACEHOLDER_IMAGES;
}

export default async function ScrollingModelHero() {
  const models = await getHeroModels();
  // Duplicate the set so the loop is seamless (translateX -50% lands on a copy).
  const track = [...models, ...models];

  return (
    <section className="relative w-full bg-gradient-to-b from-dusty-pink-pale via-off-white to-white">
      {/* Heading */}
      <div className="text-center pt-10 md:pt-14 pb-4 px-4">
        <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-gold mb-2">
          Made in Italy
        </p>
        <h1 className="text-3xl md:text-5xl font-light tracking-[0.12em] text-black">
          Spring Summer New
        </h1>
      </div>

      {/* Continuously scrolling row of AI model cut-outs (pauses on hover) */}
      <div className="relative w-full overflow-hidden">
        <div className="hero-scroll flex items-end w-max gap-6 md:gap-10 px-8">
          {track.map((m, i) => {
            const inner = (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={m.src}
                alt="ZoeTrends look"
                className="h-full w-auto object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.12)]"
              />
            );
            return (
              <div
                key={i}
                className="relative shrink-0 w-[240px] md:w-[320px] h-[52vh] md:h-[68vh] flex items-end justify-center"
              >
                {m.slug ? (
                  <Link href={`/products/${m.slug}`} className="h-full flex items-end">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>

        {/* Soft fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-dusty-pink-pale to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-white to-transparent z-10" />
      </div>

      {/* CTA */}
      <div className="text-center py-9 md:py-12">
        <Link
          href="/collections/new-arrivals"
          className="inline-block px-10 py-3 border-2 border-black text-sm tracking-[0.2em] uppercase text-black hover:bg-gold hover:text-white hover:border-gold transition-colors duration-300"
        >
          Shop New Arrivals
        </Link>
      </div>
    </section>
  );
}
