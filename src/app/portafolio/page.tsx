import type { Metadata } from "next";
import { PortafolioHero } from "@/components/sections/PortafolioHero";
import { Portafolio3DScroll } from "@/components/sections/Portafolio3DScroll";
import { ServiciosFooter } from "@/components/sections/ServiciosFooter";

export const metadata: Metadata = {
  title: "Portafolio",
  description: "Merch y prendas que hemos producido para marcas, creadores y eventos — el trabajo de Buho.",
};

export default function PortafolioPage() {
  return (
    <main>
      <PortafolioHero />
      <Portafolio3DScroll />
      <ServiciosFooter />
    </main>
  );
}
