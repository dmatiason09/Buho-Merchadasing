"use client";

import { useEffect, useRef } from "react";

/**
 * Aplica el efecto de "word reveal" al hacer scroll, similar al efecto de Refokus.
 *
 * Mejoras vs el scroll.js original:
 * - Usa IntersectionObserver para no ejecutar lógica cuando el elemento no está visible
 * - Usa requestAnimationFrame para no saturar el main thread
 * - Cleanup correcto al desmontar (no leaks)
 * - Tipado seguro
 *
 * Uso: <p ref={useWordReveal()}>texto que se va a separar en palabras</p>
 */
export function useWordReveal<T extends HTMLElement = HTMLParagraphElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 1. Separar el texto en spans, una palabra por span
    const text = element.textContent?.trim() ?? "";
    const words = text.split(/\s+/);
    element.innerHTML = words
      .map((w) => `<span class="reveal-word">${w}</span>`)
      .join(" ");

    const wordSpans = Array.from(
      element.querySelectorAll<HTMLSpanElement>(".reveal-word")
    );

    // 2. Solo procesar mientras el contenedor está visible (IntersectionObserver)
    let isInView = false;
    let rafId: number;
    let ticking = false;

    const updateWords = () => {
      const windowHeight = window.innerHeight;
      const triggerStart = windowHeight * 0.85;
      const triggerEnd = windowHeight * 0.4;

      for (const word of wordSpans) {
        const rect = word.getBoundingClientRect();
        const wordCenterY = rect.top + rect.height / 2;

        let opacity: number;
        if (wordCenterY > triggerStart) {
          opacity = 0.2;
        } else if (wordCenterY < triggerEnd) {
          opacity = 1;
        } else {
          const progress =
            (triggerStart - wordCenterY) / (triggerStart - triggerEnd);
          opacity = 0.2 + progress * 0.8;
        }
        word.style.opacity = opacity.toFixed(2);
      }
    };

    const handleScroll = () => {
      if (!isInView || ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        updateWords();
        ticking = false;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInView = entry.isIntersecting;
          if (isInView) updateWords();
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );

    observer.observe(element);
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateWords(); // Estado inicial

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return ref;
}
