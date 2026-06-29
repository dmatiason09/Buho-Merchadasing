"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ServiciosManifesto — sección manifesto estilo detroit.paris/services.
 *
 * MECÁNICA actual (10 imágenes con el mismo patrón escalonado):
 *   - Sección de calc(100vh + 5130px) — sticky 100vh + runway 5130px (= 57 scrolls)
 *   - Wrapper sticky: el texto del manifesto queda fijo en el viewport
 *   - Cada imagen tiene su PROPIO ScrollTrigger con start/end en pixeles
 *     absolutos. Cálculo: ~90px por scroll de mouse wheel (con Lenis
 *     wheelMultiplier:0.9 y 100px delta nativo Windows).
 *
 *   - IMAGEN 1 (izquierda arriba, top:42% left:13%):
 *       Scroll range: 0 → 1440px (= scrolls 0 a 16; total 16 scrolls).
 *       FASE 1 (scrolls 0 → 12): aparece chica + blureada + opacity 0.55,
 *         se acerca creciendo, se enfoca, opacidad sube a 1
 *       FASE 2 (scrolls 12 → 16, ULTIMOS 4 SCROLLS): fade out + agranda
 *
 *   - IMAGEN 2 (derecha abajo, top:72% left:87%):
 *       Scroll range: 360 → 1890px (= scrolls 4 a 21; total 17 scrolls).
 *       Estado inicial: invisible (scale 0 + opacity 0)
 *       FASE 1 (scrolls 0 → 13 del timeline = absolutos 4 → 17):
 *         aparece de la nada, crece, se enfoca, opacidad sube a 1
 *       FASE 2 (scrolls 13 → 17 = absolutos 17 → 21, ULTIMOS 4 SCROLLS):
 *         fade out + sigue agrandando
 *
 *   - IMAGEN 3 (izquierda abajo, top:65% left:13%):
 *       Scroll range: 720 → 2610px (= scrolls 8 a 29; total 21 scrolls).
 *       Empieza en el 4o scroll de img2.
 *       Estado inicial: invisible (scale 0 + opacity 0)
 *       FASE 1 (scrolls 0 → 17 del timeline = absolutos 8 → 25):
 *         aparece de la nada, crece, se enfoca, opacidad sube a 1
 *       FASE 2 (scrolls 17 → 21 = absolutos 25 → 29, ULTIMOS 4 SCROLLS):
 *         fade out + sigue agrandando
 *
 *   - IMAGEN 4 (derecha arriba, top:30% left:87%):
 *       Scroll range: 1080 → 2970px (= scrolls 12 a 33; total 21 scrolls).
 *       Empieza en el 4o scroll de img3.
 *       Estado inicial: invisible (scale 0 + opacity 0)
 *       FASE 1 (scrolls 0 → 17 del timeline = absolutos 12 → 29):
 *         aparece de la nada, crece, se enfoca, opacidad sube a 1
 *       FASE 2 (scrolls 17 → 21 = absolutos 29 → 33, ULTIMOS 4 SCROLLS):
 *         fade out + sigue agrandando
 *
 * REGLA: la fase de fade siempre dura los ULTIMOS 4 SCROLLS de cada
 * imagen. Si una imagen futura tiene mas o menos scrolls totales, su
 * fade sigue siendo 4 scrolls (cambia solo la duracion del grow).
 *
 * IMG 5–10 siguen el mismo patrón escalonado: cada una arranca +360px (4
 * scrolls) después de la anterior (top-=720, -1080, -1440 … hasta -3240),
 * con duración +=1890px. IMG 1–4 quedan documentadas arriba como referencia.
 */

const MANIFESTO_PRIMARY = "PRODUCCIÓN A ESCALA CON CALIDAD ARTESANAL.";
const MANIFESTO_SECONDARY = [
  "Diseño obsesivo.",
  "Confección rigurosa.",
  "Hecho a mano en Perú.",
];

const COLOR_BG = "#ffffff";
const COLOR_FG = "#0A0A0A";

// Imagen 1 — F1 car, vertical
const TEST_IMAGE = "/images/manifesto/01.jpg";

// Imagen 2 — Dior hand / sky, vertical
const TEST_IMAGE_2 = "/images/manifesto/09.jpg";

// Imagen 3 — Costa Obscura rum jungle, vertical
const TEST_IMAGE_3 = "/images/manifesto/05.jpg";

// Imagen 4 — Luxury watch, vertical
const TEST_IMAGE_4 = "/images/manifesto/07.jpg";

// Imagen 5 — Vase pampas grass, vertical
const TEST_IMAGE_5 = "/images/manifesto/06.jpg";

// Imagen 6 — Woman white shirt concrete, vertical
const TEST_IMAGE_6 = "/images/manifesto/03.jpg";

// Imagen 7 — Man in suit corridor, vertical
const TEST_IMAGE_7 = "/images/manifesto/08.jpg";

// Imagen 8 — Solis perfume salt flats, HORIZONTAL (unica horizontal)
const TEST_IMAGE_8 = "/images/manifesto/10.jpg";

// Imagen 9 — Silk fabric macro, casi cuadrada
const TEST_IMAGE_9 = "/images/manifesto/04.jpg";

// Imagen 10 — Modelo 3D metalico, vertical — centro de pantalla
const TEST_IMAGE_10 = "/images/manifesto/02.jpg";

export function ServiciosManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image3Ref = useRef<HTMLImageElement>(null);
  const image4Ref = useRef<HTMLImageElement>(null);
  const image5Ref = useRef<HTMLImageElement>(null);
  const image6Ref = useRef<HTMLImageElement>(null);
  const image7Ref = useRef<HTMLImageElement>(null);
  const image8Ref = useRef<HTMLImageElement>(null);
  const image9Ref = useRef<HTMLImageElement>(null);
  const image10Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const image2 = image2Ref.current;
    const image3 = image3Ref.current;
    const image4 = image4Ref.current;
    const image5 = image5Ref.current;
    const image6 = image6Ref.current;
    const image7 = image7Ref.current;
    const image8 = image8Ref.current;
    const image9 = image9Ref.current;
    const image10 = image10Ref.current;
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
      opacity: 1,
    });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=1440",
        scrub: 0.6,
      },
    });

    // FASE 1 (scrolls 0 → 12 = primeros 12 scrolls de img1): se acerca,
    // crece sutilmente, se enfoca.
    // NOTA sobre unidades: con scrub, la "duracion" del tween es relativa
    // al total del timeline. Usamos numeros enteros que coinciden con la
    // cuenta de scrolls (1 unidad = 1 scroll de mouse wheel ≈ 90px).
    // Scale crece en los 12 scrolls completos
    tl1.to(image, { scale: 1.05, duration: 12, ease: "power2.inOut" }, 0);
    // Blur fase lenta (scrolls 0 → 4): de 14px a 10px despacio
    tl1.to(image, { filter: "blur(10px)", duration: 4, ease: "power1.in" }, 0);
    // Blur fase rapida (scrolls 4 → 8): de 10px a 0px mas agresivo
    tl1.to(image, { filter: "blur(0px)", duration: 4, ease: "power2.out" }, 4);

    // FASE 2 (scrolls 12 → 16 = ULTIMOS 4 SCROLLS): se agranda un toque
    // mas y se desvanece.
    tl1.to(
      image,
      {
        scale: 1.15,
        opacity: 0,
        duration: 4,
        ease: "power2.in",
      },
      12
    );

    // ============================================================
    // IMAGEN 2 — ScrollTrigger independiente.
    //   Start: scroll 4 (360px = 4 × 90px) despues del top de la seccion.
    //   End:   scroll 21; duracion 1530px = 17 scrolls.
    // ============================================================
    let tl2: gsap.core.Timeline | null = null;
    if (image2) {
      // Estado inicial: invisible (scale 0 + opacity 0) + blureada
      gsap.set(image2, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=360", // scroll 4 × 90px = 360px
          end: "+=1530",         // duracion 17 scrolls × 90px (termina en scroll 21)
          scrub: 0.6,
        },
      });

      // IMG2 FASE 1 (scrolls 0 → 13 de su timeline = absolutos 4 → 17):
      // aparece de la nada, crece a tamano similar al final de img1,
      // se enfoca, opacidad sube a 1. 13 scrolls de growth.
      // Scale crece en los 13 scrolls completos
      tl2.to(image2, { scale: 1.15, duration: 13, ease: "power2.inOut" }, 0);
      // Blur: se mantiene hasta el scroll 6, luego se limpia rapido en 5 scrolls
      tl2.to(image2, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG2 FASE 2 (scrolls 13 → 17 de su timeline = ULTIMOS 4 SCROLLS
      // absolutos 17 → 21): fade out + crece un toque mas.
      tl2.to(
        image2,
        {
          scale: 1.25,
          opacity: 0,
          duration: 4,
          ease: "power2.in",
        },
        13
      );
    }

    // ============================================================
    // IMAGEN 3 — ScrollTrigger independiente.
    //   Start: scroll 8 (= 4o scroll de img2; 8 × 90 = 720px desde el top).
    //   End:   scroll 29 (720 + 1890 = 2610px); duracion 21 scrolls.
    // Misma dinamica que img2: invisible al inicio, crece + se enfoca,
    // fade en los ULTIMOS 4 SCROLLS (scrolls 25 → 29).
    // ============================================================
    let tl3: gsap.core.Timeline | null = null;
    if (image3) {
      gsap.set(image3, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=720", // scroll 8 × 90px = 720px
          end: "+=1890",         // duracion 21 scrolls × 90px (termina en scroll 29)
          scrub: 0.6,
        },
      });

      // IMG3 FASE 1 (scrolls 0 → 17 de su timeline = absolutos 8 → 25):
      // aparece de la nada, crece, se enfoca, opacidad sube a 1. 17 de
      // los 21 scrolls.
      // Scale crece en los 17 scrolls completos
      tl3.to(image3, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      // Blur: se mantiene hasta el scroll 6, luego se limpia rapido en 5 scrolls
      tl3.to(image3, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG3 FASE 2 (scrolls 17 → 21 de su timeline = ULTIMOS 4 SCROLLS
      // absolutos 25 → 29): fade out + crece un toque mas.
      tl3.to(
        image3,
        {
          scale: 1.25,
          opacity: 0,
          duration: 4,
          ease: "power2.in",
        },
        17
      );
    }

    // ============================================================
    // IMAGEN 4 — ScrollTrigger independiente.
    //   Start: scroll 12 (= 4o scroll de img3; 12 × 90 = 1080px desde el top).
    //   End:   scroll 33 (1080 + 1890 = 2970px); duracion 21 scrolls.
    // Misma dinamica que img3: invisible al inicio, crece + se enfoca,
    // fade en los ULTIMOS 4 SCROLLS (scrolls 29 → 33).
    // ============================================================
    let tl4: gsap.core.Timeline | null = null;
    if (image4) {
      gsap.set(image4, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=1080", // scroll 12 × 90px = 1080px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 33)
          scrub: 0.6,
        },
      });

      // IMG4 FASE 1 (scrolls 0 → 17 de su timeline = absolutos 12 → 29):
      // aparece de la nada, crece, se enfoca, opacidad sube a 1. 17 de
      // los 21 scrolls.
      // Scale crece en los 17 scrolls completos
      tl4.to(image4, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      // Blur: se mantiene hasta el scroll 6, luego se limpia rapido en 5 scrolls
      tl4.to(image4, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG4 FASE 2 (scrolls 17 → 21 de su timeline = ULTIMOS 4 SCROLLS
      // absolutos 29 → 33): fade out + crece un toque mas.
      tl4.to(
        image4,
        {
          scale: 1.25,
          opacity: 0,
          duration: 4,
          ease: "power2.in",
        },
        17
      );
    }

    // ============================================================
    // IMAGEN 5 — ScrollTrigger independiente.
    //   Start: scroll 16 (= 4o scroll de img4; 16 × 90 = 1440px desde el top).
    //   End:   scroll 37 (1440 + 1890 = 3330px); duracion 21 scrolls.
    //   Posicion: ligeramente a la izquierda de img2, detras de las letras.
    // ============================================================
    let tl5: gsap.core.Timeline | null = null;
    if (image5) {
      gsap.set(image5, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl5 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=1440", // scroll 16 × 90px = 1440px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 37)
          scrub: 0.6,
        },
      });

      // IMG5 FASE 1 (scrolls 0 → 17 de su timeline = absolutos 16 → 33):
      // scale crece; blur fijo hasta scroll 6, luego se limpia en 5 scrolls.
      tl5.to(image5, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl5.to(image5, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG5 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS
      // absolutos 33 → 37): fade out + crece un toque mas.
      tl5.to(image5, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
    }

    // ============================================================
    // IMAGEN 6 — ScrollTrigger independiente.
    //   Start: scroll 20 (= 4o scroll de img5; 20 × 90 = 1800px desde el top).
    //   End:   scroll 41 (1800 + 1890 = 3690px); duracion 21 scrolls.
    //   Posicion: derecha de img4, detras de las palabras, un poco mas arriba.
    // ============================================================
    let tl6: gsap.core.Timeline | null = null;
    if (image6) {
      gsap.set(image6, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl6 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=1800", // scroll 20 × 90px = 1800px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 41)
          scrub: 0.6,
        },
      });

      // IMG6 FASE 1 (scrolls 0 → 17 de su timeline = absolutos 20 → 37):
      // scale crece; blur fijo hasta scroll 6, luego se limpia en 5 scrolls.
      tl6.to(image6, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl6.to(image6, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG6 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS
      // absolutos 37 → 41): fade out + crece un toque mas.
      tl6.to(image6, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
    }

    // ============================================================
    // IMAGEN 7 — ScrollTrigger independiente.
    //   Start: scroll 24 (= 4o scroll de img6; 24 × 90 = 2160px desde el top).
    //   End:   scroll 45 (2160 + 1890 = 4050px); duracion 21 scrolls.
    //   Posicion: ligeramente a la izquierda de img4, detras de las palabras.
    // ============================================================
    let tl7: gsap.core.Timeline | null = null;
    if (image7) {
      gsap.set(image7, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl7 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=2160", // scroll 24 × 90px = 2160px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 45)
          scrub: 0.6,
        },
      });

      // IMG7 FASE 1 (scrolls 0 → 17 de su timeline = absolutos 24 → 41):
      // scale crece; blur fijo hasta scroll 6, luego se limpia en 5 scrolls.
      tl7.to(image7, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl7.to(image7, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG7 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS
      // absolutos 41 → 45): fade out + crece un toque mas.
      tl7.to(image7, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
    }

    // ============================================================
    // IMAGEN 8 — ScrollTrigger independiente. HORIZONTAL.
    //   Start: scroll 28 (= 4o scroll de img7; 28 × 90 = 2520px desde el top).
    //   End:   scroll 49 (2520 + 1890 = 4410px); duracion 21 scrolls.
    //   Posicion: arriba de img6 (top:52% left:30%), misma columna izquierda.
    // ============================================================
    let tl8: gsap.core.Timeline | null = null;
    if (image8) {
      gsap.set(image8, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl8 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=2520", // scroll 28 × 90px = 2520px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 49)
          scrub: 0.6,
        },
      });

      // IMG8 FASE 1 (scrolls 0 → 17): scale crece; blur fijo hasta scroll 6,
      // luego se limpia en 5 scrolls.
      tl8.to(image8, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl8.to(image8, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG8 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS): fade out.
      tl8.to(image8, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
    }

    // ============================================================
    // IMAGEN 9 — ScrollTrigger independiente. CASI CUADRADA.
    //   Start: scroll 32 (= 4o scroll de img8; 32 × 90 = 2880px desde el top).
    //   End:   scroll 53 (2880 + 1890 = 4770px); duracion 21 scrolls.
    //   Posicion: entre img5 (70%, 68%) e img6 (56%, 30%), un poco mas abajo.
    // ============================================================
    let tl9: gsap.core.Timeline | null = null;
    if (image9) {
      gsap.set(image9, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl9 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=2880", // scroll 32 × 90px = 2880px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 53)
          scrub: 0.6,
        },
      });

      // IMG9 FASE 1 (scrolls 0 → 17): scale crece; blur fijo hasta scroll 6,
      // luego se limpia en 5 scrolls.
      tl9.to(image9, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl9.to(image9, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);

      // IMG9 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS): fade out.
      tl9.to(image9, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
    }

    // ============================================================
    // IMAGEN 10 — ScrollTrigger independiente. CENTRO DE PANTALLA.
    //   Start: scroll 36 (= 4o scroll de img9; 36 × 90 = 3240px desde el top).
    //   End:   scroll 57 (3240 + 1890 = 5130px); duracion 21 scrolls.
    //   Posicion: centro exacto del viewport (top:50%, left:50%).
    // ============================================================
    let tl10: gsap.core.Timeline | null = null;
    if (image10) {
      gsap.set(image10, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        filter: "blur(14px)",
        opacity: 1,
      });

      tl10 = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top-=3240", // scroll 36 × 90px = 3240px
          end: "+=1890",          // duracion 21 scrolls × 90px (termina en scroll 57)
          scrub: 0.6,
        },
      });

      // IMG10 FASE 1 (scrolls 0 → 17): scale crece; blur fijo hasta scroll 6,
      // luego se limpia en 5 scrolls.
      tl10.to(image10, { scale: 1.15, duration: 17, ease: "power2.inOut" }, 0);
      tl10.to(image10, { filter: "blur(0px)", duration: 5, ease: "power2.out" }, 6);
      // En el scroll 8 salta por encima del texto (zIndex 5 → 6).
      // Antes del scroll 8 queda detras de las letras, desde el 8 las tapa.
      tl10.set(image10, { zIndex: 6 }, 8);

      // IMG10 FASE 2 (scrolls 17 → 21 = ULTIMOS 4 SCROLLS): fade out.
      tl10.to(image10, { scale: 1.25, opacity: 0, duration: 4, ease: "power2.in" }, 17);
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
      tl3?.scrollTrigger?.kill();
      tl3?.kill();
      tl4?.scrollTrigger?.kill();
      tl4?.kill();
      tl5?.scrollTrigger?.kill();
      tl5?.kill();
      tl6?.scrollTrigger?.kill();
      tl6?.kill();
      tl7?.scrollTrigger?.kill();
      tl7?.kill();
      tl8?.scrollTrigger?.kill();
      tl8?.kill();
      tl9?.scrollTrigger?.kill();
      tl9?.kill();
      tl10?.scrollTrigger?.kill();
      tl10?.kill();
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
        // height = 100vh del sticky + 2970px de "scroll runway".
        // 2970px = 33 scrolls × 90px (Lenis wheelMultiplier:0.9, delta
        // nativo Windows 100px). Scroll-33 es donde termina la imagen 4.
        // Img1 acaba en scroll-16, img2 en scroll-21, img3 en scroll-29,
        // img4 en scroll-33: el sticky aguanta hasta el final de la mas tardia.
        height: "calc(100vh + 5130px)",
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
            top: "28%",
            left: "11%",
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

        {/* Segunda imagen — lado derecho abajo. */}
        <img
          ref={image2Ref}
          src={TEST_IMAGE_2}
          alt=""
          style={{
            position: "absolute",
            top: "72%",
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

        {/* Tercera imagen — lado izquierdo, debajo de la imagen 1.
            Animacion en el useEffect (start scroll 8, fin 29). */}
        <img
          ref={image3Ref}
          src={TEST_IMAGE_3}
          alt=""
          style={{
            position: "absolute",
            top: "65%",
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

        {/* Cuarta imagen — lado derecho, arriba de la imagen 2.
            Animacion en el useEffect (start scroll 12, fin 33). */}
        <img
          ref={image4Ref}
          src={TEST_IMAGE_4}
          alt=""
          style={{
            position: "absolute",
            top: "30%",
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

        {/* Quinta imagen — ligeramente a la izquierda de img2, detras de las letras.
            zIndex: 0 para que quede por debajo del texto (zIndex 5). */}
        <img
          ref={image5Ref}
          src={TEST_IMAGE_5}
          alt=""
          style={{
            position: "absolute",
            top: "70%",
            left: "68%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Sexta imagen — derecha de img4, detras de las palabras, un poco mas arriba.
            zIndex: 0 para que quede por debajo del texto. */}
        <img
          ref={image6Ref}
          src={TEST_IMAGE_6}
          alt=""
          style={{
            position: "absolute",
            top: "56%",
            left: "30%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Septima imagen — ligeramente a la izquierda de img4, detras de las palabras.
            zIndex: 0 para que quede por debajo del texto. */}
        <img
          ref={image7Ref}
          src={TEST_IMAGE_7}
          alt=""
          style={{
            position: "absolute",
            top: "28%",
            left: "72%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Octava imagen — HORIZONTAL, arriba de img6 (left:30%), misma columna.
            Dimensiones invertidas: mas ancha que alta. zIndex 0 detras del texto. */}
        <img
          ref={image8Ref}
          src={TEST_IMAGE_8}
          alt=""
          style={{
            position: "absolute",
            top: "22%",
            left: "30%",
            width: "28vw",
            height: "18vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Novena imagen — casi cuadrada, entre img5 e img6, un poco mas abajo.
            20vw × 22vw: ligeramente mas alta que ancha. zIndex 0. */}
        <img
          ref={image9Ref}
          src={TEST_IMAGE_9}
          alt=""
          style={{
            position: "absolute",
            top: "72%",
            left: "50%",
            width: "20vw",
            height: "22vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Decima imagen — modelo 3D, centro exacto del viewport.
            zIndex 0 para quedar detras del texto. */}
        <img
          ref={image10Ref}
          src={TEST_IMAGE_10}
          alt=""
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "18vw",
            height: "24vw",
            objectFit: "cover",
            transformOrigin: "center center",
            willChange: "transform, filter, opacity",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 0,
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
