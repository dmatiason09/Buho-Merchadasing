import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, DM_Sans, Anton, Barlow_Semi_Condensed, Instrument_Serif } from "next/font/google";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/effects/CustomCursor";
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

// Barlow Semi Condensed — semi condensado heavy, alternativa a Miedinger Bold
const barlowSemiCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-barlow-semi-condensed",
  display: "swap",
});

// Instrument Serif — display serif italic con alto contraste, estilo editorial.
// Usado en el footer gigante de /servicios (réplica de detroit.paris/insights).
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aymacode — Websites & Automatizaciones",
    template: "%s | Aymacode",
  },
  description:
    "Hacemos que tu empresa luzca y se sienta tan ambiciosa como su visión. Diseño y desarrollo de páginas web, ERPs y automatizaciones con n8n.",
  keywords: [
    "agencia web Lima",
    "desarrollo web Perú",
    "automatización n8n",
    "diseño web 3D",
    "motion sites",
    "ERPs personalizados",
  ],
  authors: [{ name: "Aymacode" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_PE",
    title: "Aymacode — Websites & Automatizaciones",
    description:
      "Hacemos que tu empresa luzca y se sienta tan ambiciosa como su visión.",
    siteName: "Aymacode",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aymacode",
    description:
      "Hacemos que tu empresa luzca y se sienta tan ambiciosa como su visión.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} ${dmSans.variable} ${anton.variable} ${barlowSemiCondensed.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <TransitionProvider>
          <Navbar />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <CustomCursor />
          <PageTransition />
          <TransitionOverlay />
        </TransitionProvider>
      </body>
    </html>
  );
}
