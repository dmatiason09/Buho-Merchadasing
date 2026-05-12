import { LoadingScreen } from "@/components/effects/LoadingScreen";
import { ScrollResetOnMount } from "@/components/effects/ScrollResetOnMount";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { HandsSection } from "@/components/sections/HandsSection";
import { BentoGallery } from "@/components/sections/BentoGallery";

export default function HomePage() {
  return (
    <>
      <ScrollResetOnMount />
      <LoadingScreen />
      <main>
        <HeroSection />
        <AboutSection />
        <HandsSection />
        <BentoGallery />
      </main>
    </>
  );
}
