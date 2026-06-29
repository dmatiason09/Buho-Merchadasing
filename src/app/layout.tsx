import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, DM_Sans, Anton } from "next/font/google";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { ChunkReloader } from "@/components/effects/ChunkReloader";
import { Preloader } from "@/components/effects/Preloader";
import { PageTransition } from "@/components/effects/PageTransition";
import { TransitionProvider } from "@/providers/TransitionProvider";
import { TransitionOverlay } from "@/components/effects/TransitionOverlay";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Anton — condensado heavy estilo Druk / detroit.paris. Solo weight 400
// (su heaviness viene de la geometría comprimida, no del weight).
// Usada SOLO en la página /servicios para los textos grandes.
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Buho — Merchandising & Producción Textil",
    template: "%s | Buho",
  },
  description:
    "Diseñamos y producimos el merch de tu marca — camisetas, hoodies y gorras hechos en Perú para durar. Diseño y producción textil bajo un mismo techo.",
  keywords: [
    "merchandising Lima",
    "producción textil Perú",
    "ropa personalizada marca",
    "merch para empresas",
    "camisetas personalizadas Perú",
    "hoodies y gorras de marca",
  ],
  authors: [{ name: "Buho" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_PE",
    title: "Buho — Merchandising & Producción Textil",
    description:
      "Diseñamos y producimos el merch de tu marca — camisetas, hoodies y gorras hechos en Perú para durar.",
    siteName: "Buho",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buho",
    description:
      "Diseñamos y producimos el merch de tu marca — camisetas, hoodies y gorras hechos en Perú para durar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} ${dmSans.variable} ${anton.variable}`}
    >
      <body>
        <ChunkReloader />
        <Preloader />
        <TransitionProvider>
          <Navbar />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <PageTransition />
          <TransitionOverlay />
        </TransitionProvider>
      </body>
    </html>
  );
}
