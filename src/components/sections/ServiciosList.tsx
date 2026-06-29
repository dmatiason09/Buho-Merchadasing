"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/effects/TransitionLink";

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
  href: string;
  color: string; // color de fondo de la página destino (para el wipe)
};

const SERVICES: Service[] = [
  {
    word: "Diseño",
    tag: "DISEÑO DE MARCA",
    image: "/images/bento/02-typography.webp",
    href: "/servicios/diseno",
    color: "#0A0A0A",
  },
  {
    word: "Producción",
    tag: "PRODUCCIÓN TEXTIL",
    image: "/images/bento/06-convert.webp",
    href: "/servicios/produccion",
    color: "#0A0A0A",
  },
  {
    word: "Estampado",
    tag: "ESTAMPADO & BORDADO",
    image: "/images/bento/05-flatlay.webp",
    href: "/servicios/estampado",
    color: "#0A0A0A",
  },
  {
    word: "Mayoreo",
    tag: "PEDIDOS AL POR MAYOR",
    image: "/images/bento/07-wall.webp",
    href: "/servicios/mayoreo",
    color: "#0A0A0A",
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
      {/* Lista de palabras grandes — cada <li> incluye su propia imagen
          preview al costado izquierdo, posicionada a la altura vertical
          de SU palabra (no centrada en la seccion entera). */}
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
              // overflow:hidden YA NO va aqui — clippearia la imagen.
              // La mascara del masked-lines vive ahora en un wrapper
              // interno alrededor solo de la palabra (mas abajo).
            }}
          >
            {/* Imagen preview a la altura de ESTA palabra (left de la pagina).
                pointerEvents:none + zIndex bajo para que el hover sobre el
                <li> siga funcionando y la palabra renderice encima si llega
                a haber overlap (palabras largas como AUTOMATIZACIONES). */}
            <img
              src={s.image}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: "absolute",
                left: "3vw",
                top: "50%",
                transform: "translateY(-50%)",
                width: "22vw",
                maxWidth: "320px",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                borderRadius: "4px",
                pointerEvents: "none",
                zIndex: 0,
                opacity: hovered === i ? 1 : 0,
                // Clip-path reveal desde el centro: la imagen se "abre"
                // desde la mitad horizontal hacia arriba y abajo.
                // 'inset(top right bottom left)' — 50% top/bottom = colapsada
                // a una linea en el centro. 0 = totalmente abierta.
                // El 'round 4px' preserva el border-radius durante el reveal.
                clipPath:
                  hovered === i
                    ? "inset(0% 0% 0% 0% round 4px)"
                    : "inset(50% 0% 50% 0% round 4px)",
                transition:
                  "clip-path 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
                willChange: "clip-path, opacity",
              }}
            />

            {/* Mascara overflow:hidden alrededor de la palabra solamente. */}
            <span
              style={{
                position: "relative",
                zIndex: 1,
                display: "inline-block",
                overflow: "hidden",
                lineHeight: 0.95,
              }}
            >
              <TransitionLink
                href={s.href}
                color={s.color}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                <span
                  className="sl-word"
                  style={{
                    display: "inline-block",
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
              </TransitionLink>
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
                zIndex: 2,
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
