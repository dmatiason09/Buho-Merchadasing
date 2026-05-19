"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TEXT = "Somos un equipo pequeño pero con una capacidad enorme";

/**
 * Cada palabra vive dentro de una máscara (overflow:hidden) de exactamente
 * una línea. Dentro hay dos copias apiladas — la animación sube yPercent
 * 0 → -50 (una línea completa), reemplazando la primera copia con la segunda
 * dentro de la misma línea.
 *
 * Los wraps de palabras se detectan en runtime y se animan POR LÍNEA, de
 * arriba a abajo: primera línea completa primero, luego segunda, tercera y
 * cuarta. La sección queda pineada durante el tránsito.
 */
export function EquipoManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const words = wordRefs.current.filter(
      (w): w is HTMLSpanElement => w !== null
    );
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 0 });

      requestAnimationFrame(() => {
        // Agrupar palabras por línea midiendo el top del padre (la máscara)
        const lines: { top: number; words: HTMLSpanElement[] }[] = [];
        words.forEach((w) => {
          const top = w.parentElement?.getBoundingClientRect().top ?? 0;
          let line = lines.find((l) => Math.abs(l.top - top) < 8);
          if (!line) {
            line = { top, words: [] };
            lines.push(line);
          }
          line.words.push(w);
        });
        lines.sort((a, b) => a.top - b.top);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            // Arranca cuando el texto YA está bien metido en el viewport
            // (top 60% = sección a medio camino entre abajo y el centro), así
            // el efecto sucede mientras el usuario scrollea sobre la sección,
            // no antes de verla
            start: "top 60%",
            end: "bottom bottom",
            scrub: 4.5,
          },
        });

        // Cada línea rueda en su propio tramo (1s del timeline, sin overlap),
        // así primero termina la línea 1, luego arranca la 2, después la 3...
        lines.forEach((line, idx) => {
          tl.to(
            line.words,
            { yPercent: -50, ease: "none", duration: 1 },
            idx
          );
        });

        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = TEXT.split(" ");

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F5F1E8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8vh 6vw",
        overflow: "hidden",
        // Overlap 1px con la sección anterior para eliminar el seam
        // sub-pixel que aparece entre dos secciones del mismo color
        marginTop: "-1px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(36px, 6vw, 110px)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          textAlign: "center",
          color: "#0A0A0A",
          maxWidth: "1400px",
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              height: "1em",
              lineHeight: 1,
              marginRight: i < words.length - 1 ? "0.3em" : 0,
            }}
          >
            <span
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              style={{
                display: "block",
                willChange: "transform",
                lineHeight: 1,
              }}
            >
              <span style={{ display: "block", lineHeight: 1 }}>{word}</span>
              <span style={{ display: "block", lineHeight: 1 }} aria-hidden>
                {word}
              </span>
            </span>
          </span>
        ))}
      </h2>
    </section>
  );
}
