import { LoadingScreen } from "@/components/effects/LoadingScreen";
import { ScrollResetOnMount } from "@/components/effects/ScrollResetOnMount";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
// import { AirpodsSequence } from "@/components/sections/AirpodsSequence"; // guardado para después
import { ScrollTextReveal } from "@/components/sections/ScrollTextReveal";
// import { BentoGallery } from "@/components/sections/BentoGallery"; // guardado para después
import { ManifestoBlock } from "@/components/sections/ManifestoBlock";
import { HomeFooterCTA } from "@/components/sections/HomeFooterCTA";
import { HorizontalFinale } from "@/components/sections/HorizontalFinale";

export default function HomePage() {
  return (
    <>
      <ScrollResetOnMount />
      <LoadingScreen />
      <main>
        <HeroSection />
        <AboutSection />
        <ScrollTextReveal />
        <ManifestoBlock />
        {/* <BentoGallery /> guardado para después */}
        <HomeFooterCTA />
        <HorizontalFinale />
      </main>
    </>
  );
}
