"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * ServiciosHero — Hero de la página /servicios.
 *
 * Reutiliza la misma técnica de "palabras grandes" del ContactHero:
 *   - Stack vertical de 4 palabras gigantes
 *   - Cada palabra entra con rotación 3D en el eje X (efecto "lines"
 *     del SplitText demo de GSAP) con stagger
 *   - Indent por palabra para romper la columna estricta
 *
 * Para editar las palabras: cambiar el array BIG_WORDS abajo.
 * Para editar la indentación de cada palabra: cambiar BIG_WORD_INDENT (vw).
 */

// Estilo detroit.paris/services — "BUILDING / CONTENT FACTORIES / FOR LUXURY BRANDS"
const BIG_WORDS = [
  "Construyendo",
  "Fábricas de Contenido",
  "para Marcas de Lujo",
];

// Paleta estilo detroit.paris/services — blanco + negro punzante
const COLOR_BG = "#ffffff";        // blanco puro
const COLOR_BIG = "#0A0A0A";       // negro casi puro — alto contraste
const COLOR_FG = "#0A0A0A";        // negro para textos pequeños

export function ServiciosHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const bigWords = root.querySelectorAll<HTMLElement>(".sh-big-word");

    // Setup inicial: palabras invisibles, rotadas hacia atrás en X
    gsap.set(bigWords, {
      rotationX: -100,
      transformOrigin: "50% 50% -160px",
      opacity: 0,
    });

    const tl = gsap.timeline({ delay: 0.35 });

    tl.to(bigWords, {
      rotationX: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.25,
      ease: "power3",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-nav-theme="light"
      className="sh-root relative min-h-[100dvh] w-full flex flex-col"
      style={{ backgroundColor: COLOR_BG, color: COLOR_FG }}
    >
      {/* Spacer del navbar (igual altura que ContactHero) */}
      <div className="h-[80px] shrink-0" aria-hidden="true" />

      <div className="relative flex-1 flex flex-col items-center px-6 md:px-10">
        {/* Stack de palabras grandes — bloque compacto, alineado ARRIBA
            (no centrado verticalmente) y más grande. Estilo detroit. */}
        <div className="flex flex-col items-center w-full pt-[6vh]">
          {BIG_WORDS.map((word) => (
            <div
              key={word}
              className="flex items-center justify-center"
              style={{
                overflow: "visible",
                perspective: "500px",
              }}
            >
              <span
                className="sh-big-word inline-block uppercase whitespace-nowrap text-center"
                style={{
                  // Anton es ultra-condensado: caben más caracteres por
                  // línea, así que podemos subir el tamaño sin overflow.
                  fontSize: "clamp(60px, 11vw, 220px)",
                  lineHeight: 0.92,
                  fontWeight: 400, // Anton solo tiene 400; su heaviness es geométrica
                  letterSpacing: "-0.01em",
                  color: COLOR_BIG,
                  fontFamily:
                    'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
