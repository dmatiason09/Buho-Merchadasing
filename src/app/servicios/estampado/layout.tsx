import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estampado & Bordado",
  description:
    "Estampado y bordado de alta calidad sobre cualquier prenda — tu logo y diseños, hechos para durar.",
};

export default function EstampadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
