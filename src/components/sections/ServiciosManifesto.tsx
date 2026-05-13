"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ServiciosManifesto — sección manifesto estilo detroit.paris/services.
 *
 * MECÁNICA actual (2 imágenes, vamos agregando una por una):
 *   - Sección de calc(100vh + 1890px) — sticky 100vh + runway 1890px (= 21 scrolls)
 *   - Wrapper sticky: el texto del manifesto queda fijo en el viewport
 *   - Cada imagen tiene su PROPIO ScrollTrigger con start/end en pixeles
 *     absolutos. Cálculo: ~90px por scroll de mouse wheel (con Lenis
 *     wheelMultiplier:0.9 y 100px delta nativo Windows).
 *
 *   - IMAGEN 1 (izquierda, top:42% left:13%):
 *       Scroll range: 0px → 1440px del top de la sección (= scrolls 0 a 16).
 *       FASE 1 (0% → 70% del propio scroll): aparece chica + blureada +
 *         opacity 0.55, se acerca creciendo, se enfoca, opacidad sube a 1
 *       FASE 2 (70% → 100%): fade out + sigue agrandando hasta desaparecer
 *
 *   - IMAGEN 2 (derecha, top:42% left:87% — espejo de la 1):
 *       Scroll range: 360px → 1890px del top (= scrolls 4 a 21; total 17 scrolls).
 *       Estado inicial: invisible (scale 0 + opacity 0)
 *       FASE 1 (0% → 70% del propio scroll = scrolls 4 a 16): aparece de
 *         la nada, crece a tamaño similar al final de img1, se enfoca,
 *         opacidad sube a 1
 *       FASE 2 (70% → 100% = scrolls 16 a 21): fade out + sigue agrandando
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

    // ============================================================
    // IMAGEN 1 — ScrollTrigger propio: empieza en el top de la
    // seccion y dura 1440px (≈ 16 scrolls de mouse wheel con Lenis
    // wheelMultiplier:0.9 y delta nativo Windows de 100px).
    // Misma animacion que antes (sin cambios visuales).
    // ============================================================
    gsap.set(image, {
      xPercent: -50,
      yPercent: -50,
      scale: 0.5,
      filter: "blur(14px)",
      opacity: 0.55,
    });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=1440",
        scrub: 0.6,
      },
    });

    // FASE 1 (0% → 70% del scroll de img1): se acerca, crece sutilmente, se enfoca
    tl1.to(
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

    // FASE 2 (70% → 100% del scroll de img1): un toque más grande + fade out
    tl1.to(
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
    // IMAGEN 2 — ScrollTrigger independiente.
    //   Start: scroll 4 (360px = 4 × 90px) despues del top de la seccion.
    //   End:   scroll 25 (2250px desde el top); duracion 1890px = 21 scrolls.
    // Asi:
    //   - Img2 comienza a aparecer cuando img1 lleva 4 scrolls hechos.
    //   - Img2 alcanza tamano similar al final de img1 alrededor del scroll 16.
    //   - Img2 termina de desvanecerse en el scroll 25.
    // ============================================================
    let tl2: gsap.core.Timeline | null = null;
    if (image2) {
      // Estado inicial: invisible (scale 0 + opacity 0) + blureada
      gsap.set(image2, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 0,
      });

      tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=360", // scroll 4 × 90px = 360px
          end: "+=1530",         // duracion 17 scrolls × 90px (termina en scroll 21)
          scrub: 0.6,
        },
      });

      // IMG2 FASE 1 (0% → 70% de su scroll ≈ scrolls 4 a 16): aparece de la
      // nada, crece a tamano similar al final de img1, se enfoca, opacidad
      // sube a 1. 12 de los 17 scrolls = ~70%.
      tl2.to(
        image2,
        {
          scale: 1.15,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.7,
          ease: "power2.inOut",
        },
        0
      );

      // IMG2 FASE 2 (70% → 100% ≈ scrolls 16 a 21): fade out + crece un toque mas.
      // 5 de los 17 scrolls = ~30%.
      tl2.to(
        image2,
        {
          scale: 1.25,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0.7
      );
    }

    // Refresh tras montar para que ScrollTrigger calcule posiciones correctas
    const refreshIds = [
      window.setTimeout(() => ScrollTrigger.refresh(), 100),
      window.setTimeout(() => ScrollTrigger.refresh(), 600),
    ];

    return () => {
      refreshIds.forEach((id) => window.clearTimeout(id));
      tl1.scrollTrigger?.kill();
      tl1.kill();
      tl2?.scrollTrigger?.kill();
      tl2?.kill();
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
        // height = 100vh del sticky + 1890px de "scroll runway".
        // 1890px = 21 scrolls × 90px (con Lenis wheelMultiplier:0.9 y
        // 100px delta nativo de Windows). Es el scroll-21, donde la
        // segunda imagen termina de desvanecerse. Img1 termina antes,
        // en el scroll-16, pero el sticky tiene que aguantar hasta el
        // final de img2.
        height: "calc(100vh + 1890px)",
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
