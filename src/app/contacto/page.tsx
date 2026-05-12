import type { Metadata } from "next";
import { ContactHero } from "@/components/sections/ContactHero";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Hablemos sobre tu proyecto. Diseño web, ERPs y automatizaciones con n8n.",
};

export default function ContactoPage() {
  return <ContactHero />;
}
