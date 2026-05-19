import type { Metadata } from "next";
import { PortafolioHero } from "@/components/sections/PortafolioHero";
import { Portafolio3DScroll } from "@/components/sections/Portafolio3DScroll";

export const metadata: Metadata = {
  title: "Portafolio",
  description: "Proyectos de diseño web, branding, motion y automatizaciones de Aymacode.",
};

export default function PortafolioPage() {
  return (
    <>
      <PortafolioHero />
      <Portafolio3DScroll />
    </>
  );
}
