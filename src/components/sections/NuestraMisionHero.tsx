"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TITLE_WORDS = ["Nuestra", "Mision"];

/**
 * Sección "Nuestra Misión" — el título grande "NUESTRA MISIÓN" usa el efecto
 * letter-rise center-out (cada letra arranca debajo de su máscara y sube a su
 * sitio, con stagger desde el centro). El bloque de texto chico de la DERECHA
 * entra deslizándose desde la derecha. Ambos se disparan al entrar la sección.
 */
export function NuestraMisionHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<HTMLSpanElement[][]>(TITLE_WORDS.map(() => []));
  const missionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const wordsLetters = letterRefs.current;
    const mission = missionRef.current;

    const ctx = gsap.context(() => {
      // Título: letras arrancan ARRIBA de su máscara (yPercent: -110) y bajan
      // a sitio. Es el espejo del efecto "Nuestro Equipo" (que sube desde abajo).
      wordsLetters.forEach((letters) => {
        gsap.set(letters, { yPercent: -110 });
      });
      // Bloque de misión (derecha): arranca fuera del viewport por la DERECHA
      // (xPercent: 100) e invisible. El overflow:hidden del sticky lo recorta.
      if (mission) gsap.set(mission, { xPercent: 100, opacity: 0 });

      // Esperamos un frame + refresh para que los pines previos hayan
      // extendido la página ANTES de calcular la posición de este trigger
      requestAnimationFrame(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 40%",
          once: true,
          onEnter: () => {
            // Título: letter-rise center-out (efecto original, intacto).
            wordsLetters.forEach((letters) => {
              gsap.to(letters, {
                yPercent: 0,
                duration: 1.0,
                ease: "power3.out",
                stagger: { each: 0.08, from: "center" },
              });
            });
            // Texto de la derecha: entra deslizándose desde la DERECHA.
            if (mission) {
              gsap.to(mission, {
                xPercent: 0,
                opacity: 1,
                duration: 1.1,
                ease: "power4.out",
              });
            }
          },
        });
        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        // Sección de 150vh — el hijo sticky de 100vh queda pineado para los
        // primeros 50vh extra de scroll. Eso da tiempo de leer el bloque de
        // misión sin que el slide cambie.
        height: "150vh",
        backgroundColor: "#F5F1E8",
        // Overlap para no dejar una línea sub-pixel con la sección anterior
        marginTop: "-1px",
      }}
    >
      {/* Wrapper sticky: mantiene el contenido visible en el viewport mientras
          el usuario scrollea a través del espacio extra de la sección. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
      {/* Bloque de misión, alineado arriba de las letras "ON" de MISION */}
      <div
        ref={missionRef}
        style={{
          position: "absolute",
          top: "6vh",
          right: "2vw",
          width: "min(33vw, 460px)",
          fontFamily: '"Jumper", sans-serif',
          fontSize: "clamp(18px, 1.8vw, 30px)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#1F1F1F",
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      >
        <p style={{ margin: "0 0 0.9em 0" }}>
          Nuestra misión es eliminar el espacio entre lo que tu marca imagina
          y lo que termina puesto en una prenda — donde diseño y producción
          viven bajo el mismo techo, no en fábricas separadas.
        </p>
        <p style={{ margin: 0 }}>
          Ninguna marca sale de aquí con una prenda que no la represente. Cada
          pedido se entrega listo para vender, no para quedarse guardado en una
          caja seis meses.
        </p>
      </div>

      <h1
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-6vh",
          margin: 0,
          padding: "0 2vw",
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(80px, 14.5vw, 280px)",
          fontWeight: 900,
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          textAlign: "left",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {TITLE_WORDS.map((word, wi) => (
          <span
            key={word}
            style={{
              display: "block",
              whiteSpace: "nowrap",
              fontSize: wi === 0 ? "0.78em" : "1.5em",
              lineHeight: wi === 0 ? 0.7 : 0.95,
              transform: wi === 0 ? "translateY(0.28em)" : "none",
              // Máscara por LÍNEA — confina la animación de las letras a
              // su propia línea, así NUESTRA y MISION no se ven invadirse
              // mientras los glyphs viajan desde -110% hacia 0
              overflow: "hidden",
            }}
          >
            {word.split("").map((letter, li) => {
              // La T tiene la barra superior ancha que conecta visualmente con
              // la letra siguiente cuando la máscara tiene padding horizontal.
              // Para T quitamos el padding horizontal → su barra queda
              // recortada al ancho natural de avance, sin verse "unida" a la R
              const isT = letter.toLowerCase() === "t";
              return (
              <span
                key={li}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  paddingTop: "0.7em",
                  marginTop: "-0.7em",
                  paddingBottom: "0.35em",
                  marginBottom: "-0.35em",
                  paddingLeft: isT ? "0" : "0.08em",
                  marginLeft: isT ? "0" : "-0.08em",
                  paddingRight: isT ? "0" : "0.08em",
                  marginRight: isT ? "0" : "-0.08em",
                  verticalAlign: "top",
                }}
              >
                <span
                  ref={(el) => {
                    if (el) letterRefs.current[wi][li] = el;
                  }}
                  style={{
                    display: "inline-block",
                    willChange: "transform",
                  }}
                >
                  {letter}
                </span>
              </span>
              );
            })}
          </span>
        ))}
      </h1>
      </div>
    </section>
  );
}
