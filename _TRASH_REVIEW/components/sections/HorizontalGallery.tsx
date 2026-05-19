"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Layout estilo "random gallery" (tutorial 033) — posiciones dispersas
const GALLERY_ITEMS = [
  { src: "/images/manifesto/01.jpg", left: "5vw",   top: "15%", width: "20vw", rotate: -3 },
  { src: "/images/manifesto/02.jpg", left: "32vw",  top: "55%", width: "16vw", rotate: 2 },
  { src: "/images/manifesto/03.jpg", left: "54vw",  top: "10%", width: "22vw", rotate: -2 },
  { src: "/images/manifesto/04.jpg", left: "82vw",  top: "48%", width: "18vw", rotate: 4 },
  { src: "/images/manifesto/05.jpg", left: "108vw", top: "22%", width: "17vw", rotate: -4 },
  { src: "/images/manifesto/06.jpg", left: "132vw", top: "58%", width: "20vw", rotate: 3 },
  { src: "/images/manifesto/07.jpg", left: "160vw", top: "14%", width: "19vw", rotate: -1 },
  { src: "/images/manifesto/08.jpg", left: "186vw", top: "50%", width: "16vw", rotate: 5 },
  { src: "/images/manifesto/09.jpg", left: "210vw", top: "20%", width: "21vw", rotate: -3 },
  { src: "/images/manifesto/10.jpg", left: "238vw", top: "52%", width: "17vw", rotate: 2 },
];

const STRIP_WIDTH_VW = 262; // ancho total del strip horizontal

export function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    const ctx = gsap.context(() => {
      // Patrón del código del usuario: pin + scrub + horizontal x animation
      let pinWrapWidth: number;
      let horizontalScrollLength: number;

      const refresh = () => {
        pinWrapWidth = strip.scrollWidth;
        horizontalScrollLength = pinWrapWidth - window.innerWidth;
      };

      refresh();

      // Estado inicial: la galería entra POR LA DERECHA (offset = ancho de viewport)
      gsap.set(strip, { x: () => window.innerWidth });

      // Tween principal — primero entra desde la derecha, luego scroll horizontal
      const horizontalTween = gsap.to(strip, {
        x: () => -horizontalScrollLength,
        ease: "none",
        scrollTrigger: {
          scrub: true,
          trigger: section,
          pin: section,
          start: "top top",
          end: () => `+=${pinWrapWidth + window.innerWidth}`,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.addEventListener("refreshInit", refresh);

      // Capa adicional (tutorial 033): entrada/salida por imagen
      const images = strip.querySelectorAll<HTMLDivElement>(".gallery-image");
      images.forEach((img) => {
        const rotation = parseFloat(img.dataset.rotate || "0");

        // Estado inicial
        gsap.set(img, { opacity: 0, scale: 0.65, rotation: rotation * 0.3 });

        // Timeline atado al horizontalTween via containerAnimation
        gsap.timeline({
          scrollTrigger: {
            trigger: img,
            start: "left 95%",
            end: "right 5%",
            scrub: 0.6,
            containerAnimation: horizontalTween,
          },
        })
          .to(img, {
            opacity: 1,
            scale: 1,
            rotation,
            ease: "power2.out",
            duration: 0.4,
          })
          .to(img, {
            opacity: 0,
            scale: 0.75,
            rotation: rotation * 0.3,
            ease: "power2.in",
            duration: 0.4,
          }, ">0.2");
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
      }}
    >
      {/* Labels superiores estilo tutorial 033 */}
      <div
        style={{
          position: "absolute",
          top: "5vh",
          left: 0,
          right: 0,
          padding: "0 4vw",
          display: "flex",
          justifyContent: "space-between",
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
        <span>Proyectos recientes</span>
        <span>Aymacode Studio</span>
        <span>2024 — 2026</span>
      </div>

      {/* Strip horizontal — se mueve con el scroll vertical */}
      <div
        ref={stripRef}
        className="horiz-gallery-strip"
        style={{
          position: "relative",
          display: "block",
          width: `${STRIP_WIDTH_VW}vw`,
          height: "100%",
          willChange: "transform",
        }}
      >
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
    </section>
  );
}
