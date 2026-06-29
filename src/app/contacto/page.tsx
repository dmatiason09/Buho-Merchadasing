import type { Metadata } from "next";
import { ContactHero } from "@/components/sections/ContactHero";
import { ServiciosFooter } from "@/components/sections/ServiciosFooter";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Hablemos sobre tu merch. Diseño, producción textil, estampado y pedidos al por mayor.",
};

export default function ContactoPage() {
  return (
    <main>
      <ContactHero />
      <ServiciosFooter />
    </main>
  );
}
