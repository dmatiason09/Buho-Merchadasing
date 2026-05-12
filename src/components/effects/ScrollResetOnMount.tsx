"use client";

import { useEffect } from "react";

/**
 * ScrollResetOnMount
 * ==================
 * Fuerza scrollY=0 cada vez que se monta el componente. Útil en la HomePage
 * para que cuando el usuario vuelva al home desde otra ruta (contacto, etc.),
 * arranque siempre desde el top — no desde una posición preservada que
 * podría caer en mitad de una sección con scroll-driven animations (ej. el
 * BentoGallery, que necesita arrancar en progress=0).
 *
 * También desactiva el scroll-restoration nativo del browser para que no
 * pelee con esto.
 */
export function ScrollResetOnMount() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}
