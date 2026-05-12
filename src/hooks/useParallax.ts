"use client";

import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  /**
   * Factor de parallax. Positivo = el elemento "lagea" respecto al scroll
   * (se queda atrás, como en Refokus). 0.1 = sutil, 0.3 = pronunciado.
   */
  factor?: number;
}

/**
 * Devuelve un ref + un offset Y para aplicar como translateY al elemento.
 *
 * Mismo patrón que useScrollFade: requestAnimationFrame + ticking flag
 * para no machacar el main thread en cada scroll event.
 *
 * Uso:
 *   const { ref, offset } = useParallax<HTMLDivElement>({ factor: 0.15 });
 *   <div ref={ref} style={{ transform: `translateY(${offset}px)` }} />
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>({
  factor = 0.15,
}: UseParallaxOptions = {}) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) {
          ticking = false;
          return;
        }
        const rect = node.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = viewportCenter - elementCenter;
        setOffset(Number((distance * factor).toFixed(2)));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [factor]);

  return { ref, offset };
}
