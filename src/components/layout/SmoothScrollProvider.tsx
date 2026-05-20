"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SmoothScrollProvider
 * ====================
 * Smooth scroll de toda la app, estilo agencias premium (somoswaka, douglus,
 * active theory). El secreto NO es bajar el `lerp` sino usar `duration` +
 * easing exponencial — eso da la sensación deslizante "tipo aceite".
 *
 * Config:
 *  - duration: 1.4 → tiempo objetivo para "asentar" el scroll después de un
 *      wheel tick. Más alto = más deslizamiento residual = más smooth.
 *      Sweet spot 1.2 - 1.8.
 *  - easing: curva exponencial out (1 - 2^(-10t)) → la que Lenis recomienda
 *      para sensación natural premium. Arranca rápido, desacelera suave.
 *  - wheelMultiplier: 0.9 → un pelín más lento que default (1.0). Hace que
 *      cada tick del wheel sienta más controlado.
 *  - touchMultiplier: 2 → mantiene la sensibilidad esperada en touch.
 *  - smoothWheel: true.
 *
 * Para ajustar la sensación:
 *  - Más smooth/deslizante → duration: 1.8
 *  - Más responsivo/snappy → duration: 1.0
 *  - Cada tick scrollea menos → wheelMultiplier: 0.7
 *  - Cada tick scrollea más  → wheelMultiplier: 1.2
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 2,
      smoothWheel: true,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      // Avisar a ScrollTrigger en cada frame que el scroll cambió. Sin esto,
      // los componentes con `scrub` (BentoGallery, ServiciosManifesto, etc.)
      // se quedan con el timeline en progress 0 porque Lenis suprime los
      // eventos `scroll` nativos del window que ScrollTrigger normalmente
      // escucha. Una línea, cero efectos colaterales.
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Re-calcular posiciones de ScrollTrigger una vez que TODAS las imágenes
    // y fuentes terminen de cargar. Sin esto, los pin/scrub que se inicializan
    // antes de que las imágenes carguen (e.g. QuienesSomos en /nosotros) quedan
    // con posiciones obsoletas → al primer scroll el browser detecta el desfase
    // y "salta" varias secciones a la vez. Esto pasa especialmente cuando la
    // página se carga DETRÁS de la cortina de PageTransition (no hay urgencia
    // de cargar imágenes hasta que la cortina sale).
    const refreshTriggers = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      // La página YA terminó de cargar (navegación SPA tardía) → refresh al next frame
      requestAnimationFrame(refreshTriggers);
    } else {
      window.addEventListener("load", refreshTriggers, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener("load", refreshTriggers);
    };
  }, []);

  return <>{children}</>;
}
