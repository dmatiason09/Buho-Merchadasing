"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REFERIDOS_LETTERS = "Referidos".split("");

// Galería estilo "Trip to Hanoï" — clusters orgánicos (2-3 fotos juntas, a veces
// solapadas) intercalados con singles aislados y respiros. Anti-patrón grid.
const GALLERY_ITEMS = [
  // CLUSTER 1 — dúo de entrada, una arriba-izq, otra solapada abajo-derecha
  { src: "/images/manifesto/01.jpg", left: "7vw",   top: "12%", width: "20vw", rotate: -3 },
  { src: "/images/manifesto/02.jpg", left: "19vw",  top: "44%", width: "15vw", rotate: 2 },

  // RESPIRO — single aislado, anclado abajo
  { src: "/images/manifesto/03.jpg", left: "46vw",  top: "60%", width: "18vw", rotate: -2 },

  // CLUSTER 2 — par top-right con solape horizontal sutil (88-94vw overlap)
  { src: "/images/manifesto/04.jpg", left: "70vw",  top: "8%",  width: "22vw", rotate: 3 },
  { src: "/images/manifesto/05.jpg", left: "88vw",  top: "38%", width: "16vw", rotate: -1 },

  // RESPIRO — single aislado, anclado abajo, más grande (anchor visual)
  { src: "/images/manifesto/06.jpg", left: "118vw", top: "55%", width: "21vw", rotate: 4 },

  // CLUSTER 3 — trío denso (los más juntos del strip)
  { src: "/images/manifesto/07.jpg", left: "150vw", top: "16%", width: "16vw", rotate: -3 },
  { src: "/images/manifesto/08.jpg", left: "162vw", top: "48%", width: "18vw", rotate: 2 },

  // RESPIRO largo — single grande arriba (foto-héroe del final)
  { src: "/images/manifesto/09.jpg", left: "196vw", top: "20%", width: "23vw", rotate: -2 },

  // CIERRE — single bajo, deja aire al final del strip antes de salir
  { src: "/images/manifesto/10.jpg", left: "228vw", top: "56%", width: "17vw", rotate: 4 },
];

// Track total: 100vw (panel texto) + 262vw (galería) = 362vw
const TEXT_PANEL_VW = 100;
const GALLERY_PANEL_VW = 262;
const TOTAL_STRIP_VW = TEXT_PANEL_VW + GALLERY_PANEL_VW;

export function HorizontalFinale() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const referidosRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    const h2 = h2Ref.current;
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!section || !strip || !h2 || !letters.length) return;

    const ctx = gsap.context(() => {
      let pinWrapWidth: number;
      let horizontalScrollLength: number;

      const refresh = () => {
        pinWrapWidth = strip.scrollWidth;
        horizontalScrollLength = pinWrapWidth - window.innerWidth;
      };

      refresh();

      // Estados iniciales:
      // - h2 centrado horizontalmente (offset hacia la derecha)
      // - Letras de Referidos invisibles
      gsap.set(h2, { x: "20vw" });
      gsap.set(letters, { opacity: 0, y: 10 });

      // Tween horizontal principal — sigue el patrón del código del usuario
      const horizontalTween = gsap.to(strip, {
        x: () => -horizontalScrollLength,
        ease: "none",
        scrollTrigger: {
          scrub: true,
          trigger: section,
          pin: section,
          start: "top top",
          end: () => `+=${pinWrapWidth}`,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.addEventListener("refreshInit", refresh);

      // Timeline de entrada — al pinearse la sección:
      // 1. El h2 (texto negro) se desliza desde el centro hacia la izquierda
      // 2. Las letras de "Referidos" se escriben una por una
      const entryTl = gsap.timeline({
        paused: true,
      });

      entryTl
        .to(h2, {
          x: 0,
          duration: 1.6,
          ease: "power3.inOut",
        })
        .to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          stagger: 0.18,
          ease: "power2.out",
        }, "-=0.7");

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () => entryTl.play(),
      });

      // Animaciones de entrada/salida por imagen — efecto smooth orgánico
      const images = strip.querySelectorAll<HTMLDivElement>(".gallery-image");
      images.forEach((img, i) => {
        const rotation = parseFloat(img.dataset.rotate || "0");
        // Drift Y sutil — imágenes alternas se mueven en direcciones opuestas
        const yDrift = i % 2 === 0 ? -50 : 50;
        // Offset Y de entrada — variedad orgánica
        const enterY = i % 2 === 0 ? 50 : -50;
        // X negativo extra al salir — la imagen acelera hacia la izquierda más que el strip
        // Varía -120 / -150 / -180 para que no todas vuelen igual
        const exitX = -120 - (i % 3) * 30;
        // Rotación extra al salir — sensación de tumble suave
        const exitRotate = rotation + (i % 2 === 0 ? -3.5 : 3.5);

        // Estado inicial: invisible, escala ligera, offset Y, sin offset X
        gsap.set(img, {
          opacity: 0,
          scale: 0.9,
          y: enterY,
          rotation: rotation * 0.4,
          x: 0,
        });

        // Timeline scrubeado — toda la animación responde al scroll horizontal
        gsap.timeline({
          scrollTrigger: {
            trigger: img,
            start: "left 110%",
            end: "right -10%",
            scrub: 1.2, // suave, sensación de inercia
            containerAnimation: horizontalTween,
          },
        })
          // ENTRADA — se asienta en su sitio, fade in suave
          .to(img, {
            opacity: 1,
            scale: 1,
            y: 0,
            rotation,
            ease: "sine.out",
            duration: 1,
          })
          // SUSPENSIÓN — drift orgánico mientras está visible
          .to(img, {
            y: yDrift,
            rotation: rotation + (yDrift > 0 ? -1.2 : 1.2),
            ease: "sine.inOut",
            duration: 1,
          })
          // SALIDA — vuela hacia la izquierda como empujada por el viento,
          // acelerando más que el strip padre + tumble sutil + fade
          .to(img, {
            opacity: 0,
            scale: 0.92,
            x: exitX,
            y: yDrift * 1.3,
            rotation: exitRotate,
            ease: "sine.in",
            duration: 1.1,
          });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Strip horizontal — texto + galería */}
      <div
        ref={stripRef}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "stretch",
          width: `${TOTAL_STRIP_VW}vw`,
          height: "100%",
          willChange: "transform",
        }}
      >
        {/* PANEL 1 — Texto Referidos */}
        <div
          style={{
            position: "relative",
            width: `${TEXT_PANEL_VW}vw`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 0 0 2.5vw",
            flexShrink: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <h2
            ref={h2Ref}
            style={{
              margin: 0,
              fontFamily: '"Universo", sans-serif',
              fontSize: "clamp(44px, 6.8vw, 106px)",
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "#0A0A0A",
            }}
          >
            <span style={{ display: "block" }}>LA MAYORÍA DE</span>
            <span style={{ display: "block" }}>NUESTRO TRABAJO</span>
            <span style={{ display: "block" }}>VIENE DE CLIENTES DE</span>
            <span style={{ display: "flex", alignItems: "baseline", flexWrap: "nowrap" }}>
              <span style={{ whiteSpace: "nowrap" }}>CONFIANZA</span>
              <em
                ref={referidosRef}
                style={{
                  fontFamily: '"Heatwood", cursive',
                  fontStyle: "normal",
                  fontSize: "clamp(38px, 5.5vw, 88px)",
                  fontWeight: 400,
                  color: "#5b3a27",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.5,
                  whiteSpace: "nowrap",
                  marginLeft: "-1.8vw",
                  position: "relative",
                  zIndex: 1,
                  padding: "0.2em 0",
                }}
              >
                {REFERIDOS_LETTERS.map((letter, i) => (
                  <span
                    key={i}
                    ref={el => { letterRefs.current[i] = el; }}
                    style={{ display: "inline-block" }}
                  >
                    {letter}
                  </span>
                ))}
              </em>
            </span>
          </h2>

          {/* Flecha + location bottom-right */}
          <div
            style={{
              position: "absolute",
              bottom: "5vh",
              right: "5vw",
              display: "flex",
              alignItems: "center",
              gap: "32px",
            }}
          >
            <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">
              <line x1="0" y1="10" x2="72" y2="10" stroke="#0A0A0A" strokeWidth="2" />
              <polyline points="64,2 78,10 64,18" stroke="#0A0A0A" strokeWidth="2" fill="none" strokeLinejoin="miter" />
            </svg>
            <div
              style={{
                fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
                fontSize: "clamp(11px, 0.9vw, 14px)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#0A0A0A",
                lineHeight: 1.5,
              }}
            >
              <div>Basados en</div>
              <div>Lima, Perú,</div>
              <div>Apasionados por la tela & el detalle</div>
            </div>
          </div>
        </div>

        {/* PANEL 2 — Galería dispersa estilo tutorial 033 */}
        <div
          style={{
            position: "relative",
            width: `${GALLERY_PANEL_VW}vw`,
            height: "100%",
            flexShrink: 0,
            backgroundColor: "#0A0A0A",
          }}
        >
          {/* Degradado de transición — fade de blanco a negro al inicio del panel */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "30vw",
              height: "100%",
              background: "linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.85) 20%, rgba(10,10,10,0.4) 65%, #0A0A0A 100%)",
              zIndex: 20,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          {/* Label superior derecha */}
          <div
            style={{
              position: "absolute",
              top: "5vh",
              right: "4vw",
              color: "#fefff8",
              fontFamily: 'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            2024 — 2026
          </div>

          {/* Imágenes dispersas */}
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className="gallery-image"
              data-rotate={item.rotate}
              style={{
                position: "absolute",
                left: item.left,
                top: item.top,
                width: item.width,
                aspectRatio: "4 / 5",
                borderRadius: "6px",
                overflow: "hidden",
                willChange: "transform, opacity",
              }}
            >
              <img
                src={item.src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
