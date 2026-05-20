"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BIO_TEXT =
  "Software engineer full stack, especializado en diseñar y construir ERPs robustos y escalables a la medida de cada negocio. Cada sistema es una pieza de ingeniería invisible que ordena operaciones, automatiza decisiones y libera tiempo al equipo para enfocarse en lo que importa.";

const BIO_TEXT_2 =
  "Systems Engineer, Full Stack, especializado en diseño y automatizaciones que transforman procesos repetitivos en sistemas elegantes. Flujos invisibles que liberan tiempo y hacen escalar cada operación sin fricción.";

const NAME_1 = ["Ayrton", "Fabrizzio", "Ramirez"];
const NAME_2 = ["Dennis", "Matias", "Ortiz"];

/**
 * QuienesSomos — scrollytelling de 2 personas en una sección pineada.
 *
 * Arquitectura clave: el "pin" se hace con CSS `position: sticky` (no con
 * `pin: true` de ScrollTrigger). Esto fue lo que rompía la versión vieja:
 * ScrollTrigger.pin calculaba posiciones antes de que las imágenes cargaran
 * y se desfasaban → un scroll te teletransportaba a NuestraMision.
 *
 * Con sticky es 100% CSS nativo: el contenido se queda pegado al top del
 * viewport mientras el padre sigue siendo "largo" (500vh). El padre define
 * cuánto scroll dura la experiencia. ScrollTrigger solo controla CUÁNDO se
 * ejecutan las animaciones del timeline (scrub), no la posición del bloque.
 *
 * Secuencia (mapeada al scroll progress 0 → 1):
 *   0.00 - 0.15  → P1 entra: foto desde diagonal, texto column-major
 *   0.15 - 0.50  → HOLD P1: 2/5 del scroll para leer a Ayrton
 *   0.50 - 0.65  → P1 sale toda hacia la izquierda
 *   0.50 - 0.75  → P2 entra: foto diagonal espejada, texto column-major
 *   0.75 - 1.00  → HOLD P2: el final del scroll para leer a Dennis
 */
export function QuienesSomos() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Row 1 — Ayrton (foto izquierda, bio derecha)
  const row1Ref = useRef<HTMLDivElement>(null);
  const photo1Ref = useRef<HTMLDivElement>(null);
  const bio1Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const name1Refs = useRef<(HTMLSpanElement | null)[]>([]);

  // Row 2 — Dennis (bio izquierda, foto derecha, espejado)
  const photo2Ref = useRef<HTMLDivElement>(null);
  const bio2Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const name2Refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const photo1 = photo1Ref.current;
    const photo2 = photo2Ref.current;
    const row1 = row1Ref.current;
    const bio1 = bio1Refs.current.filter((w): w is HTMLSpanElement => w !== null);
    const bio2 = bio2Refs.current.filter((w): w is HTMLSpanElement => w !== null);
    const name1 = name1Refs.current.filter((w): w is HTMLSpanElement => w !== null);
    const name2 = name2Refs.current.filter((w): w is HTMLSpanElement => w !== null);

    // Helper: ordenar palabras por columna (column-major). reverse=true arranca
    // por la derecha. Idéntico al de la versión vieja.
    const orderColumnMajor = (
      group: HTMLSpanElement[],
      reverse = false
    ): HTMLSpanElement[] => {
      const data = group.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top, left: r.left };
      });
      const lines: { top: number; words: typeof data }[] = [];
      data.forEach((w) => {
        let line = lines.find((l) => Math.abs(l.top - w.top) < 8);
        if (!line) {
          line = { top: w.top, words: [] };
          lines.push(line);
        }
        line.words.push(w);
      });
      lines.sort((a, b) => a.top - b.top);
      lines.forEach((l) => l.words.sort((a, b) => a.left - b.left));
      const maxCols = Math.max(0, ...lines.map((l) => l.words.length));
      const out: HTMLSpanElement[] = [];
      if (reverse) {
        for (let col = maxCols - 1; col >= 0; col--) {
          lines.forEach((l) => {
            if (l.words[col]) out.push(l.words[col].el);
          });
        }
      } else {
        for (let col = 0; col < maxCols; col++) {
          lines.forEach((l) => {
            if (l.words[col]) out.push(l.words[col].el);
          });
        }
      }
      return out;
    };

    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        const orderedBio1 = orderColumnMajor(bio1);
        const orderedName1 = orderColumnMajor(name1);
        const orderedBio2 = orderColumnMajor(bio2, true);
        const orderedName2 = orderColumnMajor(name2, true);

        // Estados iniciales — TODO arranca oculto/fuera de sitio
        if (photo1) gsap.set(photo1, { xPercent: -120, yPercent: 80, rotate: -30 });
        gsap.set(orderedBio1, { x: () => window.innerWidth, opacity: 0 });
        gsap.set(orderedName1, { x: () => window.innerWidth, opacity: 0 });

        if (photo2) gsap.set(photo2, { xPercent: 120, yPercent: 80, rotate: 30 });
        gsap.set(orderedBio2, { x: () => -window.innerWidth, opacity: 0 });
        gsap.set(orderedName2, { x: () => -window.innerWidth, opacity: 0 });

        // Timeline scrubbed mapeado al scroll a través del padre 500vh.
        // scrub: 3 = la animación va con bastante lag detrás del scroll →
        // sensación más cinemática, deslizante, smooth.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 3,
          },
        });

        // === FASE 1: P1 entra (0 → 3) — ENTRADA LENTA Y SMOOTH ===
        // Cada tween ahora dura más (2.8-3) en lugar de 1-1.5 → ocupa el doble
        // del tramo de scroll, se siente deliberado.
        if (photo1) {
          tl.fromTo(
            photo1,
            { xPercent: -120, yPercent: 80, rotate: -30 },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              ease: "power3.out",
              duration: 2.8,
            },
            0
          );
        }
        tl.fromTo(
          orderedBio1,
          { x: () => window.innerWidth, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 2.5,
            stagger: 0.07,
          },
          0
        );
        tl.fromTo(
          orderedName1,
          { x: () => window.innerWidth, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 2.5,
            stagger: 0.12,
          },
          0.3
        );

        // === FASE 2: HOLD P1 (3 → 5) ===
        // Espacio vacío en el timeline — la animación no avanza pero el scroll
        // sigue. Tiempo de leer a Ayrton sin que nada cambie.
        tl.to({}, { duration: 2 }, 3);

        // === FASE 3: P1 sale por la izquierda (5 → 5.8) ===
        if (row1) {
          tl.to(
            row1,
            {
              xPercent: -110,
              ease: "power2.in",
              duration: 0.8,
            },
            5
          );
        }

        // === FASE 4: P2 entra (5.6 → 8.6) — DESPUÉS que P1 casi terminó de salir ===
        // P1 exit termina en 5.8 → P2 arranca en 5.6 (sólo 0.2 unidades de
        // solape, contra 0.8 de antes). Así el viewport queda casi vacío entre
        // que Ayrton se va y Dennis entra → la aparición de Dennis se siente
        // más limpia, no compite visualmente con la salida de Ayrton.
        if (photo2) {
          tl.fromTo(
            photo2,
            { xPercent: 120, yPercent: 80, rotate: 30 },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              ease: "power3.out",
              duration: 2.8,
            },
            5.6
          );
        }
        tl.fromTo(
          orderedBio2,
          { x: () => -window.innerWidth, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 2.5,
            stagger: 0.07,
          },
          5.6
        );
        tl.fromTo(
          orderedName2,
          { x: () => -window.innerWidth, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 2.5,
            stagger: 0.12,
          },
          5.9
        );

        // === FASE 5: HOLD P2 (8.6 → 10) — 1.4 unidades de lectura ===
        tl.to({}, { duration: 1.4 }, 8.6);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const bioWords1 = BIO_TEXT.split(" ");
  const bioWords2 = BIO_TEXT_2.split(" ");

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        // 500vh = 5 viewports de scroll. La sticky child de 100vh queda
        // pineada los 400vh extra → tiempo de sobra para las 5 fases.
        height: "500vh",
        backgroundColor: "#F5F1E8",
      }}
    >
      {/* Wrapper sticky: pineado al top mientras se scrollea por el padre */}
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Eyebrow — siempre visible mientras dura la sección */}
        <p
          style={{
            position: "absolute",
            top: "6vh",
            left: "2vw",
            margin: 0,
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: "clamp(11px, 0.85vw, 14px)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#1F1F1F",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          (Conócenos)
        </p>

        {/* Row 1 — Ayrton (entera animable: entra y luego sale por la izquierda) */}
        <div
          ref={row1Ref}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "4vw",
            padding: "11vh 6vw 8vh 6vw",
            willChange: "transform",
          }}
        >
          {/* Columna foto + nombre */}
          <div
            ref={photo1Ref}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              flexShrink: 0,
              width: "min(28vw, 400px)",
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <img
              src="/images/nosotros/fabrizzio.webp"
              alt="Fabrizzio Ramirez"
              draggable={false}
              className="bio-photo"
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: "20px",
                display: "block",
              }}
            />
            <h3
              style={{
                margin: 0,
                fontFamily: '"Universo", sans-serif',
                fontSize: "clamp(20px, 1.9vw, 34px)",
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color: "#0A0A0A",
                textAlign: "center",
              }}
            >
              {NAME_1.map((w, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    name1Refs.current[i] = el;
                  }}
                  style={{
                    display: "inline-block",
                    marginRight: i < NAME_1.length - 1 ? "0.3em" : 0,
                    willChange: "transform, opacity",
                  }}
                >
                  {w}
                </span>
              ))}
            </h3>
          </div>

          {/* Bio text */}
          <div
            style={{
              flex: 1,
              maxWidth: "560px",
              fontFamily: '"Jumper", sans-serif',
              fontSize: "clamp(20px, 2.2vw, 36px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1F1F1F",
              marginTop: "8vh",
            }}
          >
            {bioWords1.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  bio1Refs.current[i] = el;
                }}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  willChange: "transform, opacity",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — Dennis (espejado: bio izquierda, foto derecha) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            gap: "4vw",
            padding: "11vh 6vw 8vh 6vw",
            pointerEvents: "none",
          }}
        >
          {/* Bio text 2 — izquierda */}
          <div
            style={{
              maxWidth: "560px",
              fontFamily: '"Jumper", sans-serif',
              fontSize: "clamp(20px, 2.2vw, 36px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1F1F1F",
              marginTop: "8vh",
            }}
          >
            {bioWords2.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  bio2Refs.current[i] = el;
                }}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  willChange: "transform, opacity",
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Columna foto 2 + nombre — derecha */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              flexShrink: 0,
              width: "min(28vw, 400px)",
              pointerEvents: "auto",
            }}
          >
            <div
              ref={photo2Ref}
              style={{
                transformOrigin: "center center",
                willChange: "transform",
              }}
            >
              <img
                src="/images/nosotros/persona2.webp"
                alt="Dennis Matias Ortiz"
                draggable={false}
                className="bio-photo"
                style={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "3 / 4",
                  objectFit: "cover",
                  objectPosition: "center top",
                  borderRadius: "20px",
                  display: "block",
                }}
              />
            </div>
            <h3
              style={{
                margin: "0 auto",
                maxWidth: "75%",
                fontFamily: '"Universo", sans-serif',
                fontSize: "clamp(20px, 1.9vw, 34px)",
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color: "#0A0A0A",
                textAlign: "center",
              }}
            >
              {NAME_2.map((w, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    name2Refs.current[i] = el;
                  }}
                  style={{
                    display: "inline-block",
                    marginRight: i < NAME_2.length - 1 ? "0.3em" : 0,
                    willChange: "transform, opacity",
                  }}
                >
                  {w}
                </span>
              ))}
            </h3>
          </div>
        </div>

        <style>{`
          .bio-photo {
            filter: grayscale(100%) blur(6px);
            transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .bio-photo:hover {
            filter: grayscale(0%) blur(0);
          }
        `}</style>
      </div>
    </section>
  );
}
