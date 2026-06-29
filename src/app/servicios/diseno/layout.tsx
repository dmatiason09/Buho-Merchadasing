import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diseño de Merch",
  description:
    "Convertimos la identidad de tu marca en prendas: arte, mockups y dirección de diseño listos para producir.",
};

export default function DisenoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
