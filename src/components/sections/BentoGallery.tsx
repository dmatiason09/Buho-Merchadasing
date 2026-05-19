"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, Flip);

type BentoItem =
  | { type: "image"; src: string; alt: string; objectPosition?: string }
  | { type: "frames"; alt: string };

/**
 * Orden de slots = orden de aparición en el grid del CSS (.gallery--bento).
 * El slot 3 (centro, alto) es donde queda anclada la laptop.
 *
 * - Slot 1 (top-left, 2 filas):  manos tecleando
 * - Slot 2 (top-center, 1 fila): macro tipografía
 * - Slot 3 (centro, 2 filas):    **laptop frame sequence**
 * - Slot 4 (top-right, 2 filas): blob 3D
 * - Slot 5 (mid-left, 1 fila):   flat-lay wireframes
 * - Slot 6 (bottom-right, 2 filas): "designed to convert"
 * - Slot 7 (bottom-left, 1 fila):   sombra de ventana
 * - Slot 8 (bottom-center, 1 fila): silueta atardecer
 */
const BENTO_ITEMS: BentoItem[] = [
  { type: "image", src: "/images/bento/07-wall.webp", alt: "Sombra de ventana sobre pared", objectPosition: "center 80%" }, // slot 1 — pared (subido para ver la planta)
  { type: "image", src: "/images/bento/02-typography.webp", alt: "Macro de tipografía editorial" },  // slot 2 — tipografía macro
  { type: "frames", alt: "MacBook abriéndose" },                                                       // slot 3 — laptop (FIJO)
  { type: "image", src: "/images/bento/08-silhouette.webp", alt: "Silueta trabajando al atardecer" },// slot 4 — silueta atardecer
  { type: "image", src: "/images/bento/03-blob.webp", alt: "Render 3D abstracto en crema" },         // slot 5 — Blob 3D
  { type: "image", src: "/images/bento/06-convert.webp", alt: "Monitor con designed to convert" },   // slot 6 — designed to convert
  { type: "image", src: "/images/bento/05-flatlay.webp", alt: "Workspace con wireframes y café" },   // slot 7 — flatlay wireframes
  { type: "image", src: "/images/bento/01-typing.webp", alt: "Manos escribiendo código" },           // slot 8 — manos tecleando
];

// Frame sequence de la laptop generado con ffmpeg a partir del mp4.
// 120 frames @ 540×960 → ~2.4MB total. Sincronizado 1:1 con el scrub.
const LAPTOP_FRAMES = 120;
const laptopFrameUrl = (i: number) =>
  `/frames/bento-laptop/${String(i + 1).padStart(4, "0")}.jpg`;

export function BentoGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const laptopImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    const galleryElement = galleryRef.current;
    const laptopImg = laptopImgRef.current;
    if (!sectionElement || !galleryElement) return;

    const items = galleryElement.querySelectorAll<HTMLElement>(".gallery__item");

    // Preload de todos los frames de la laptop, así el src-swap durante el scroll
    // no provoca flicker ni recarga desde red.
    const frameCache: HTMLImageElement[] = [];
    for (let i = 0; i < LAPTOP_FRAMES; i++) {
      const img = new Image();
      img.src = laptopFrameUrl(i);
      frameCache.push(img);
    }
    const frameState = { frame: 0 };

    let tl: gsap.core.Timeline | null = null;

    const build = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.set(items, { clearProps: "all" });
      galleryElement.classList.remove("gallery--final");

      // Capturar el estado final de las tarjetas
      galleryElement.classList.add("gallery--final");
      const flipState = Flip.getState(items);
      galleryElement.classList.remove("gallery--final");

      const flip = Flip.to(flipState, {
        simple: true,
        ease: "expoScale(1, 5)",
        duration: 1,
      });

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // Flip explota el bento en posición 0 de la timeline
      tl.add(flip, 0);

      // En paralelo, frame de laptop avanza 0 → 119 con la misma duración.
      // Resultado: a medida que el scroll progresa, la laptop "se abre"
      // exactamente al mismo ritmo que el bento se expande.
      tl.to(
        frameState,
        {
          frame: LAPTOP_FRAMES - 1,
          ease: "none",
          snap: "frame",
          duration: 1,
          onUpdate: () => {
            const i = Math.round(frameState.frame);
            const cached = frameCache[i];
            if (laptopImg && cached?.complete) {
              laptopImg.src = cached.src;
            }
          },
        },
        0
      );
    };

    // En lugar de correr build() inmediatamente, esperar 2 RAF para que el
    // layout (incluido Spline, imágenes y todas las secciones de arriba) se
    // asiente. Luego de build(), forzar progress=0 + refresh, así el bento
    // arranca SIEMPRE compacto sin importar el scrollY restaurado al remontar.
    let setupRaf1: number = 0;
    let setupRaf2: number = 0;
    setupRaf1 = requestAnimationFrame(() => {
      setupRaf2 = requestAnimationFrame(() => {
        build();
        // Forzar el timeline a progress 0 INMEDIATAMENTE después de crearlo.
        // Esto sobrescribe cualquier estado inicial raro del Flip.to (que
        // por default tiene immediateRender:true y puede dejar items en
        // posiciones intermedias antes de que ScrollTrigger los seedee).
        // NO usar .pause() — eso rompe el scrub.
        if (tl) tl.progress(0);
        ScrollTrigger.refresh();
        // Después del refresh, ScrollTrigger ajustará el progress al scrollY
        // real. Si estamos antes del sectionStart, progress queda en 0.
        if (tl) tl.progress(0);
      });
    });

    const refreshIds: number[] = [];
    refreshIds.push(
      window.setTimeout(() => ScrollTrigger.refresh(), 500),
      window.setTimeout(() => ScrollTrigger.refresh(), 1500)
    );

    // Si la window 'load' aún no se disparó, refrescar entonces también
    // (cuando todas las imágenes/recursos terminaron de cargar y el body
    // height se estabilizó completamente).
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState !== "complete") {
      window.addEventListener("load", onLoad, { once: true });
    }

    // ResizeObserver del <body>: cualquier cambio en el alto del documento
    // (porque cargan imágenes arriba, porque Spline renderiza, porque
    // HandsSection ajusta su altura, etc.) dispara un refresh. Sin esto, los
    // start/end calculados quedan obsoletos y el bento puede caer en
    // progress=1 al remontar tras una navegación.
    let lastBodyHeight = document.body.scrollHeight;
    let bodyRefreshRaf: number | null = null;
    const bodyObserver = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastBodyHeight) > 5) {
        lastBodyHeight = h;
        if (bodyRefreshRaf !== null) cancelAnimationFrame(bodyRefreshRaf);
        bodyRefreshRaf = requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    });
    bodyObserver.observe(document.body);

    let resizeRaf: number | null = null;
    const handleResize = () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => build());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(setupRaf1);
      cancelAnimationFrame(setupRaf2);
      refreshIds.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("load", onLoad);
      bodyObserver.disconnect();
      if (bodyRefreshRaf !== null) cancelAnimationFrame(bodyRefreshRaf);
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.set(items, { clearProps: "all" });
      window.removeEventListener("resize", handleResize);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="bento-section relative w-full bg-white"
    >
      <div className="gallery-wrap">
        <div ref={galleryRef} className="gallery gallery--bento">
          {BENTO_ITEMS.map((item, i) => (
            <div key={i} className="gallery__item">
              {item.type === "frames" ? (
                <img
                  ref={laptopImgRef}
                  src={laptopFrameUrl(0)}
                  alt={item.alt}
                  draggable={false}
                  // Encuadre del frame portrait dentro del slot landscape:
                  // shift hacia abajo del frame para que la laptop (que vive
                  // en la mitad inferior) ocupe más espacio dentro del slot.
                  style={{ objectPosition: "center 60%" }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
