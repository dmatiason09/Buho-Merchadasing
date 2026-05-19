"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * NammaTransition — réplica del page transition de studionamma.com.
 *
 * Headless: no renderiza ningún elemento DOM, no envuelve nada.
 * Opera directamente sobre document.body para evitar romper
 * position:sticky, ScrollTrigger o cualquier layout existente.
 *
 * Intercepta clicks en <a data-namma> (atributo propio, distinto de
 * data-transition para no colisionar con PageTransition/SVG curtain).
 *
 * EXIT : body tilta hacia atrás (rotateX negativo) + sube + fade out
 * ENTER: body entra desde rotateX positivo + abajo + fade in
 */
export function NammaTransition() {
  const isAnimating = useRef(false);
  const router      = useRouter();
  const pathname    = usePathname();

  // ── ENTER (PASO 1) ───────────────────────────────────────────────
  // La nueva página entra desde arriba bajando RECTO (translateY),
  // pero está rotada hacia la derecha (rotation positiva).
  // Se mantiene rotada al llegar — pasos futuros definirán qué hace
  // después.
  useLayoutEffect(() => {
    gsap.fromTo(
      document.body,
      {
        y: "-100%",
        rotation: 8,
      },
      {
        y: "0%",
        rotation: 8,
        duration: 0.9,
        ease: "power3.out",
      }
    );
  }, [pathname]);

  // ── EXIT ─────────────────────────────────────────────────────────
  // Por ahora un fade rápido — el efecto principal vive en el ENTER
  // de la página entrante. Se ajustará cuando definas los siguientes
  // pasos.
  const navigate = useCallback(
    (href: string) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      gsap.to(document.body, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          isAnimating.current = false;
          router.push(href);
        },
      });
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      )
        return;

      const target = (e.target as Element)?.closest?.(
        "a[data-namma]"
      ) as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      if (href === pathname) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      navigate(href);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate, pathname]);

  return null;
}
