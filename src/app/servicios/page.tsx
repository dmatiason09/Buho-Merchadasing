import type { Metadata } from "next";
import { ServiciosHero } from "@/components/sections/ServiciosHero";
import { ServiciosManifesto } from "@/components/sections/ServiciosManifesto";
import { ServiciosList } from "@/components/sections/ServiciosList";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Diseño web, desarrollo, ERPs y automatizaciones con n8n. Construimos webs que convierten.",
};

export default function ServiciosPage() {
  return (
    <>
      <ServiciosHero />
      <ServiciosManifesto />
      <ServiciosList />
    </>
  );
}
