import type { Metadata } from "next";
import { ServiciosHero } from "@/components/sections/ServiciosHero";
import { ServiciosManifesto } from "@/components/sections/ServiciosManifesto";
import { ServiciosList } from "@/components/sections/ServiciosList";
import { ServiciosFeatured } from "@/components/sections/ServiciosFeatured";
import { ServiciosFooter } from "@/components/sections/ServiciosFooter";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Diseño de merch, producción textil, estampado y bordado, y pedidos al por mayor — tu marca hecha prenda.",
};

export default function ServiciosPage() {
  return (
    <main>
      <ServiciosHero />
      <ServiciosManifesto />
      <ServiciosList />
      <ServiciosFeatured />
      <ServiciosFooter />
    </main>
  );
}
