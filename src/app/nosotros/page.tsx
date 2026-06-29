import type { Metadata } from "next";
import { NosotrosHero } from "@/components/sections/NosotrosHero";
import { NosotrosLogo3D } from "@/components/sections/NosotrosLogo3D";
import { EquipoManifesto } from "@/components/sections/EquipoManifesto";
import { NuestraMisionHero } from "@/components/sections/NuestraMisionHero";
import { ServiciosFooter } from "@/components/sections/ServiciosFooter";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce a Buho: un equipo pequeño donde diseño y producción viven bajo el mismo techo. Prendas hechas en Perú para durar, no para guardarse.",
};

export default function NosotrosPage() {
  return (
    <main>
      <NosotrosLogo3D />
      <NosotrosHero />
      <EquipoManifesto />
      <NuestraMisionHero />
      <ServiciosFooter />
    </main>
  );
}
