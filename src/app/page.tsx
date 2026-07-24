import ScrollingModelHero from "@/components/ScrollingModelHero";
import HeroSlider from "@/components/HeroSlider";
import CollectionTiles from "@/components/CollectionTiles";
import PromoBanner from "@/components/PromoBanner";
import ProductGrid from "@/components/ProductGrid";
import MadeInItaly from "@/components/MadeInItaly";
import MissionStatement from "@/components/MissionStatement";
import LiveEvents from "@/components/LiveEvents";
import Newsletter from "@/components/Newsletter";

// Read the catalogue fresh on every request so Homepage curation (ticks) and
// newly published products reflect immediately, instead of a build-time snapshot.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <ScrollingModelHero />
      <HeroSlider />
      <CollectionTiles />
      <ProductGrid />
      <PromoBanner />
      <MadeInItaly />
      <MissionStatement />
      <LiveEvents />
      <Newsletter />
    </>
  );
}
