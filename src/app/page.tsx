import ScrollingModelHero from "@/components/ScrollingModelHero";
import HeroSlider from "@/components/HeroSlider";
import CollectionTiles from "@/components/CollectionTiles";
import PromoBanner from "@/components/PromoBanner";
import ProductGrid from "@/components/ProductGrid";
import MadeInItaly from "@/components/MadeInItaly";
import MissionStatement from "@/components/MissionStatement";
import LiveEvents from "@/components/LiveEvents";
import Newsletter from "@/components/Newsletter";

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
