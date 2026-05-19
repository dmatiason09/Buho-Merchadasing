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

export function QuienesSomos() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nameWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const row1Ref = useRef<HTMLDivElement>(null);
  const photoColRef = useRef<HTMLDivElement>(null);
  // Refs row 2 (segunda persona)
  const wordRefs2 = useRef<(HTMLSpanElement | null)[]>([]);
  const nameWord2Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const photoCol2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const words = wordRefs.current.filter(
      (w): w is HTMLSpanElement => w !== null
    );
    if (!section || words.length === 0) return;

    const ctx = gsap.context(() => {
      // Helper: ordena un grupo de palabras en column-major. `reverse: true`
      // empieza por la columna derecha (orden inverso) en vez de la izquierda
      const orderColumnMajor = (
        group: HTMLSpanElement[],
        reverse = false
      ) => {
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
        const maxCols = Math.max(...lines.map((l) => l.words.length));
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

      requestAnimationFrame(() => {
        const nameWords = nameWordRefs.current.filter(
          (w): w is HTMLSpanElement => w !== null
        );
        const words2 = wordRefs2.current.filter(
          (w): w is HTMLSpanElement => w !== null
        );
        const nameWords2 = nameWord2Refs.current.filter(
          (w): w is HTMLSpanElement => w !== null
        );

        const ordered = orderColumnMajor(words);
        const orderedNames = orderColumnMajor(nameWords);
        // Row 2: column-major INVERSO (primero la columna derecha de cada
        // línea, luego la siguiente columna a la izquierda, etc.)
        const ordered2 = orderColumnMajor(words2, true);
        const orderedNames2 = orderColumnMajor(nameWords2, true);

        // Row 1 — palabras inicialmente fuera de pantalla por la derecha
        gsap.set(ordered, { x: () => window.innerWidth, opacity: 0 });
        gsap.set(orderedNames, { x: () => window.innerWidth, opacity: 0 });
        // Row 2 — palabras inicialmente fuera de pantalla por la IZQUIERDA
        // (entran viajando hacia la derecha, espejado del row 1)
        gsap.set(ordered2, { x: () => -window.innerWidth, opacity: 0 });
        gsap.set(orderedNames2, { x: () => -window.innerWidth, opacity: 0 });
        // Foto 2 — estado inicial diagonal espejado (abajo-derecha, rotada +30°)
        if (photoCol2Ref.current) {
          gsap.set(photoCol2Ref.current, {
            xPercent: 120,
            yPercent: 80,
            rotate: 30,
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=5600",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Fase 1 — entrada row 1 (texto del costado + nombre)
        tl.to(
          ordered,
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.4,
            stagger: 0.05,
          },
          0
        );
        tl.to(
          orderedNames,
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.4,
            stagger: 0.08,
          },
          0
        );

        // Fase 2 — row 1 sale por la izquierda (tras ~1.1s de hold)
        if (row1Ref.current) {
          tl.to(
            row1Ref.current,
            {
              x: () => -window.innerWidth * 1.1,
              ease: "power2.in",
              duration: 1.0,
            },
            2.4
          );
        }

        // Fase 3 — entrada row 2 (espejada): foto 2 baja en diagonal desde
        // abajo-derecha, texto + nombre entran column-major desde la izquierda
        const ROW2_START = 3.6;
        if (photoCol2Ref.current) {
          tl.to(
            photoCol2Ref.current,
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              duration: 1.1,
              ease: "power4.out",
            },
            ROW2_START
          );
        }
        tl.to(
          ordered2,
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.4,
            stagger: 0.05,
          },
          ROW2_START
        );
        tl.to(
          orderedNames2,
          {
            x: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.4,
            stagger: 0.08,
          },
          ROW2_START
        );

        ScrollTrigger.refresh();
      });

      // Entrada diagonal de la foto 1 (copia del efecto de ServiciosFeatured)
      // ligada al scroll: arranca cuando section top entra al 80% del viewport
      // y termina cuando section top alcanza el top del viewport (justo antes
      // del pin). Es scrubbed → animación reversible mientras scrolleas
      if (photoColRef.current) {
        gsap.set(photoColRef.current, {
          xPercent: -120,
          yPercent: 80,
          rotate: -30,
        });
        gsap.to(photoColRef.current, {
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top top",
            scrub: 1,
          },
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = BIO_TEXT.split(" ");
  const words2 = BIO_TEXT_2.split(" ");

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F5F1E8",
        overflow: "hidden",
      }}
    >
      {/* Etiqueta eyebrow */}
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
          zIndex: 2,
        }}
      >
        (Conócenos)
      </p>

      {/* Fila 1 — foto + texto + nombre. Entera animable (entra y luego sale) */}
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
          ref={photoColRef}
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
                  nameWordRefs.current[i] = el;
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

        {/* Texto bio — bajado un poco */}
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
          {words.map((word, i) => (
            <span
              key={i}
              ref={(el) => {
                wordRefs.current[i] = el;
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

      {/* Fila 2 — espejada: texto PEGADO a la izquierda de la foto, no en el
          extremo del section. Aparece cuando row 1 ya se fue.
          pointerEvents: none en el wrapper para no bloquear el hover de la foto
          de row 1, que vive debajo en el stacking — se reactiva solo en la foto2 */}
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
        {/* Texto bio 2 — izquierda, pegado al foto, bajado un poco */}
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
          {words2.map((word, i) => (
            <span
              key={i}
              ref={(el) => {
                wordRefs2.current[i] = el;
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

        {/* Columna foto 2 + nombre — derecha. Solo la FOTO rota/diagonal entry,
            el nombre h3 vive afuera del wrapper rotativo para que no se incline.
            pointerEvents: auto para restaurar el hover sobre la foto2 */}
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
            ref={photoCol2Ref}
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
                  nameWord2Refs.current[i] = el;
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
    </section>
  );
}
