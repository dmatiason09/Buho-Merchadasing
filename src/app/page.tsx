import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
// import { AirpodsSequence } from "@/components/sections/AirpodsSequence"; // guardado para después
import { ScrollTextReveal } from "@/components/sections/ScrollTextReveal";
// import { BentoGallery } from "@/components/sections/BentoGallery"; // guardado para después
import { ManifestoBlock } from "@/components/sections/ManifestoBlock";
import { HomeFooterCTA } from "@/components/sections/HomeFooterCTA";
import { HorizontalFinale } from "@/components/sections/HorizontalFinale";

export const metadata: Metadata = {
  description:
    "Diseñamos y producimos el merch de tu marca — camisetas, hoodies y gorras hechos en Perú para durar, tan ambiciosos como tu visión.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
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
