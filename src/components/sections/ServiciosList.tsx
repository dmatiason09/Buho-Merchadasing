"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ServiciosList — réplica del interactive list de studionamma.com.
 *
 * Mecánica:
 *  - 4 palabras gigantes apiladas verticalmente
 *  - Estado default: todas en negro
 *  - Al hacer hover en una fila:
 *      • Esa palabra QUEDA en negro
 *      • Las otras 3 se ponen GRIS CLARO → recalca la hovereada
 *      • A la izquierda aparece la IMAGEN asociada a ese servicio
 *      • A la derecha aparece el TAG (categoría) en mono pequeño
 *  - Al sacar el mouse: vuelve al estado default
 *
 * Cuando tengamos videos reales, se reemplaza `image` por `video` en
 * cada item y se ajusta el render del media.
 */

type Service = {
  word: string;
  tag: string;
  image: string;
};

const SERVICES: Service[] = [
  {
    word: "Branding",
    tag: "IDENTITY",
    image: "/images/bento/02-typography.png",
  },
  {
    word: "Web Design",
    tag: "DEVELOPMENT",
    image: "/images/bento/06-convert.png",
  },
  {
    word: "ERPs",
    tag: "SYSTEMS",
    image: "/images/bento/05-flatlay.png",
  },
  {
    word: "Automatizaciones",
    tag: "WORKFLOWS",
    image: "/images/bento/07-wall.png",
  },
];

const COLOR_BG = "#ffffff";
const COLOR_TEXT_ACTIVE = "#0A0A0A";
const COLOR_TEXT_DIM = "#D6D6D6";

export function ServiciosList() {
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Masked-lines reveal: cada palabra sube desde abajo con mascara (overflow:hidden
  // en el <li>) y stagger entre palabras. Tecnica del demo "masked-lines-with-splittext"
  // de codepen. No necesita SplitText porque cada palabra ya es un <span> separado:
  // basta con animar yPercent dentro de un wrapper con overflow oculto.
  // Se dispara con ScrollTrigger cuando la seccion entra al viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = root.querySelectorAll<HTMLElement>(".sl-word");

    gsap.set(words, { yPercent: 110, opacity: 0 });

    const tween = gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: "expo.out",
      scrollTrigger: {
        trigger: root,
        start: "top 75%",
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-nav-theme="light"
      className="sl-section relative w-full"
      style={{
        backgroundColor: COLOR_BG,
        minHeight: "100vh",
        padding: "12vh 0",
      }}
    >
      {/* Media preview a la izquierda — solo visible cuando hay hover */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "3vw",
          top: "50%",
          transform: "translateY(-50%)",
          width: "22vw",
          maxWidth: "320px",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          borderRadius: "4px",
          pointerEvents: "none",
          zIndex: 2,
          opacity: hovered !== null ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {SERVICES.map((s, i) => (
          <img
            key={s.word}
            src={s.image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: hovered === i ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Lista de palabras grandes */}
      <ul
        className="sl-list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {SERVICES.map((s, i) => (
          <li
            key={s.word}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
              overflow: "hidden",
            }}
          >
            <span
              className="sl-word"
              style={{
                fontFamily:
                  'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
                fontSize: "clamp(64px, 11vw, 220px)",
                lineHeight: 0.95,
                fontWeight: 400,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color:
                  hovered === null || hovered === i
                    ? COLOR_TEXT_ACTIVE
                    : COLOR_TEXT_DIM,
                transition: "color 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              {s.word}
            </span>

            {/* Tag a la derecha — solo visible cuando este item está hovereado */}
            <span
              className="sl-tag"
              style={{
                position: "absolute",
                right: "4vw",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily:
                  'var(--font-plex-mono), ui-monospace, "JetBrains Mono", monospace',
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                color: COLOR_TEXT_ACTIVE,
                opacity: hovered === i ? 1 : 0,
                transition: "opacity 0.25s ease",
                pointerEvents: "none",
              }}
            >
              {s.tag}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
