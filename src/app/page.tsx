import HeroSlider from "@/components/HeroSlider";
import PromoBanner from "@/components/PromoBanner";
import ProductGrid from "@/components/ProductGrid";
import MissionStatement from "@/components/MissionStatement";
import LiveEvents from "@/components/LiveEvents";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <PromoBanner />
      <ProductGrid />
      <MissionStatement />
      <LiveEvents />
      <Newsletter />
    </>
  );
}
