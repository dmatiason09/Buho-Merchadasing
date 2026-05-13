"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ServiciosManifesto — sección manifesto estilo detroit.paris/services.
 *
 * MECÁNICA actual (2 imágenes, vamos agregando una por una):
 *   - Sección de 200vh
 *   - Wrapper sticky: el texto del manifesto queda fijo en el viewport
 *
 *   - IMAGEN 1 (izquierda, top:42% left:13%):
 *       FASE 1 (0% → 70%): aparece chica + blureada + opacity 0.55,
 *         se acerca creciendo, se enfoca (blur → 0) y opacidad sube a 1
 *       FASE 2 (70% → 100%): fade out + sigue agrandando hasta desaparecer
 *
 *   - IMAGEN 2 (derecha, top:42% left:87% — espejo de la 1):
 *       Estado inicial: invisible (scale 0 + opacity 0)
 *       FASE 1 (70% → 88%): aparece de la nada, crece a tamaño similar al
 *         final de la imagen 1, se enfoca, opacidad sube a 1
 *       FASE 2 (88% → 100%): fade out + sigue agrandando un toque
 *
 * Próximas imágenes se siguen agregando aquí, una por una.
 */

const MANIFESTO_PRIMARY = "PRODUCCIÓN A ESCALA CON CALIDAD ARTESANAL.";
const MANIFESTO_SECONDARY = [
  "Diseño obsesivo.",
  "Desarrollo riguroso.",
  "Potenciado por Next.js, n8n & Spline.",
];

const COLOR_BG = "#ffffff";
const COLOR_FG = "#0A0A0A";

// Imagen de prueba — cuando definamos todas las imágenes finales del
// portfolio, ésta se reemplaza.
const TEST_IMAGE = "/images/bento/05-flatlay.png";

// Segunda imagen — lado derecho. Aparece chica desde 0 al final, crece,
// y se desaparece. Provisoria mientras probamos las animaciones.
const TEST_IMAGE_2 = "/images/bento/06-convert.png";

export function ServiciosManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const image2 = image2Ref.current;
    if (!section || !image) return;

    // Estado inicial: chica + blureada + semi-transparente
    gsap.set(image, {
      xPercent: -50,
      yPercent: -50,
      scale: 0.5,
      filter: "blur(14px)",
      opacity: 0.55,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    // FASE 1 (0% → 70% del scroll): se acerca, crece sutilmente, se enfoca
    tl.to(
      image,
      {
        scale: 1.05,
        filter: "blur(0px)",
        opacity: 1,
        duration: 0.7,
        ease: "power2.inOut",
      },
      0
    );

    // FASE 2 (70% → 100%): un toque más grande + fade out
    tl.to(
      image,
      {
        scale: 1.15,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      0.7
    );

    // ============================================================
    // SEGUNDA IMAGEN — lado derecho. Empieza en scale 0 (invisible),
    // aparece al final mientras la primera se desvanece, y luego se
    // desvanece tambien. Mismo "lenguaje" de efecto que la primera
    // (blur->focus + crecimiento + fade) pero condensado al tramo
    // 70%-100% del scroll.
    // ============================================================
    if (image2) {
      // Estado inicial: invisible (scale 0 + opacity 0) + blureada
      gsap.set(image2, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 0,
      });

      // IMG2 FASE 1 (70% → 88% del scroll): aparece de la nada y crece
      // a un tamano similar al final de la primera. Se enfoca y opacidad
      // sube a 1.
      tl.to(
        image2,
        {
          scale: 1.15,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.18,
          ease: "power2.inOut",
        },
        0.7
      );

      // IMG2 FASE 2 (88% → 100% del scroll): un toque mas grande + fade out
      tl.to(
        image2,
        {
          scale: 1.25,
          opacity: 0,
          duration: 0.12,
          ease: "power2.in",
        },
        0.88
      );
    }

    // Refresh tras montar para que ScrollTrigger calcule posiciones correctas
    const refreshIds = [
      window.setTimeout(() => ScrollTrigger.refresh(), 100),
      window.setTimeout(() => ScrollTrigger.refresh(), 600),
    ];

    return () => {
      refreshIds.forEach((id) => window.clearTimeout(id));
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      className="manu-section relative w-full"
      style={{
        backgroundColor: COLOR_BG,
        color: COLOR_FG,
        height: "200vh",
      }}
    >
      <div
        className="manu-sticky"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Imagen de prueba — a la izquierda, ~y=50% del viewport */}
        <img
          ref={imageRef}
          src={TEST_IMAGE}
          alt=""
          style={{
            position: "absolute",
            top: "42%",
            left: "13%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Segunda imagen — espejo en el lado derecho. Centrada en
            (left: 87%, top: 42%) que es el mirror de (13%, 42%).
            Misma forma y tamano que la primera. Su animacion se define
            en el useEffect (aparece desde scale 0 en el tramo 70-100%). */}
        <img
          ref={image2Ref}
          src={TEST_IMAGE_2}
          alt=""
          style={{
            position: "absolute",
            top: "42%",
            left: "87%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Texto del manifesto — centrado, encima de la imagen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6vw",
            textAlign: "center",
            position: "relative",
            zIndex: 5,
          }}
        >
          <h2
            style={{
              fontFamily:
                'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
              fontSize: "clamp(32px, 4.2vw, 80px)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.005em",
              textTransform: "uppercase",
              maxWidth: "22ch",
              margin: "0 auto",
            }}
          >
            {MANIFESTO_PRIMARY}
          </h2>

          <div
            style={{
              marginTop: "clamp(32px, 5vh, 60px)",
              fontFamily:
                'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
              fontSize: "clamp(26px, 3.6vw, 64px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
              textTransform: "uppercase",
            }}
          >
            {MANIFESTO_SECONDARY.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
