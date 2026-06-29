import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producción Textil",
  description:
    "Confección a medida en nuestra propia fábrica: tela, corte y acabado controlados de principio a fin.",
};

export default function ProduccionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
