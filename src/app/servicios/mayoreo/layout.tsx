import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedidos al por Mayor",
  description:
    "Producción por volumen para marcas, empresas y eventos — tu merch, en la cantidad que necesites.",
};

export default function MayoreoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
