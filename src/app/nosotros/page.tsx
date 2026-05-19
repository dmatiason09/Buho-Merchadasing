import { NosotrosHero } from "@/components/sections/NosotrosHero";
import { NosotrosLogo3D } from "@/components/sections/NosotrosLogo3D";
import { QuienesSomos } from "@/components/sections/QuienesSomos";
import { EquipoManifesto } from "@/components/sections/EquipoManifesto";
import { NuestraMisionHero } from "@/components/sections/NuestraMisionHero";
import { ServiciosFooter } from "@/components/sections/ServiciosFooter";

export default function NosotrosPage() {
  return (
    <main>
      <NosotrosLogo3D />
      <NosotrosHero />
      <QuienesSomos />
      <EquipoManifesto />
      <NuestraMisionHero />
      <ServiciosFooter />
    </main>
  );
}
