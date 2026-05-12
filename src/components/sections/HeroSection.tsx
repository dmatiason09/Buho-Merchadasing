import { SplineHero } from "@/components/effects/SplineHero";

export function HeroSection() {
  return (
    <section data-nav-theme="light" className="relative h-screen w-full overflow-hidden">
      {/* Escena 3D completa de Spline (incluye fondo + logo) */}
      <SplineHero />
    </section>
  );
}
