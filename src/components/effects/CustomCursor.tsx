"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * CustomCursor — estilo douglus.site
 *
 * Estructura:
 *   - `.cursor-dot`    → punto pequeño que sigue al mouse EXACTAMENTE (sin lag)
 *   - `.cursor-circle` → círculo grande que sigue con lerp (lag suave)
 *
 * Hover states (vía atributos data-*):
 *   - data-cursor-style="link" | "cta" | "img" | "nav"  → cambia clase del circle
 *   - data-cursor-text="View"                           → muestra texto dentro
 *   - data-cursor-scale="1.5"                           → escala el circle
 *
 * Se desactiva en pantallas touch.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Esperar a tener document para crear el portal (evita errores en SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip en touch (no hay cursor)
    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isDesktop) return;

    const dot = dotRef.current;
    const circle = circleRef.current;
    const label = labelRef.current;
    const hand = handRef.current;
    if (!dot || !circle || !label || !hand) return;

    // Posición target (mouse real) y current (interpolada para el circle)
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let targetScale = 1;
    let currentScale = 1;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      // El dot y la mano siguen exacto sin lerp
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      // La mano se posiciona con la PUNTA DEL DEDO en la coord del mouse:
      // dedo está en ~50% del ancho y ~5% del alto del PNG → translate(-50%, -5%)
      hand.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -5%)`;
    };

    const onMouseLeave = () => {
      circle.style.opacity = "0";
      dot.style.opacity = "0";
      hand.style.opacity = "0";
    };
    const onMouseEnter = () => {
      circle.style.opacity = "1";
      dot.style.opacity = "1";
    };

    // Detectar hover sobre elementos con data-cursor-*
    const onPointerOver = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest?.("[data-cursor-style], [data-cursor-text], [data-cursor-scale], a, button");
      if (!target) {
        circle.className = "cursor-circle";
        label.textContent = "";
        targetScale = 1;
        // Sin hover → ocultar mano, mostrar círculo
        hand.style.opacity = "0";
        circle.style.opacity = "1";
        dot.style.opacity = "1";
        return;
      }
      const el = target as HTMLElement;
      const style = el.dataset.cursorStyle;
      const text = el.dataset.cursorText;
      const scale = el.dataset.cursorScale;

      // Sobre elemento clickeable → mostrar mano y ocultar círculo+dot
      hand.style.opacity = "1";
      circle.style.opacity = "0";
      dot.style.opacity = "0";

      // Resetear y aplicar (mantengo la lógica del círculo por si se quita la mano)
      circle.className = "cursor-circle cursor-circle--active";
      if (style === "link" || el.tagName === "A") circle.classList.add("cursor-circle--hover-link");
      else if (style === "cta" || el.tagName === "BUTTON") circle.classList.add("cursor-circle--hover-cta");
      else if (style === "img") circle.classList.add("cursor-circle--hover-img");
      else if (style === "nav") circle.classList.add("cursor-circle--hover-nav");

      if (text) {
        label.textContent = text;
        circle.classList.add("cursor-circle--label");
      } else {
        label.textContent = "";
      }

      targetScale = scale ? parseFloat(scale) : (text ? 2.2 : 1.4);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("pointerover", onPointerOver);

    // Animation loop: lerp para el circle (con lag smooth)
    const lerp = 0.18;
    const scaleLerp = 0.12;

    const animate = () => {
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;
      currentScale += (targetScale - currentScale) * scaleLerp;

      circle.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale})`;

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, [mounted]);

  // Renderizamos vía Portal directo a document.body → escapamos cualquier
  // stacking context creado por transforms/filters en parents.
  if (!mounted) return null;

  return createPortal(
    <div aria-hidden="true" className="custom-cursor">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={circleRef} className="cursor-circle">
        <span ref={labelRef} className="cursor-circle__label" />
      </div>
      <div ref={handRef} className="cursor-hand" />
    </div>,
    document.body,
  );
}
