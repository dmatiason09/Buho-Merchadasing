"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ServiciosFeatured — grid de imágenes en pares.
 *
 * Mecánica:
 *  - Cada PAR se anima cuando entra en viewport
 *  - Izquierda: parte de la esquina inferior-izquierda fuera del viewport, inclinada antihorario (-30°)
 *  - Derecha: parte de la esquina inferior-derecha fuera del viewport, inclinada horario (+30°)
 *  - Suben en diagonal y se enderezan al llegar (rotate → 0°)
 *  - Easing power4.out, duración 1.1s, stagger 0.08s entre izq y der del mismo par.
 */

type FeatureItem = {
  src: string;
  rotation: number; // grados de inclinación inicial
};

// Cada PAR consecutivo (2 items) forma una fila en el grid.
const ITEMS: FeatureItem[] = [
  // Par 1
  { src: "/images/portafolio/01.jpeg", rotation: -30 },
  { src: "/images/portafolio/02.jpeg", rotation: 30 },
  // Par 2
  { src: "/images/portafolio/03.jpeg", rotation: -30 },
  { src: "/images/portafolio/04.jpeg", rotation: 30 },
];

export function ServiciosFeatured() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wraps = wrapRefs.current.filter(Boolean) as HTMLDivElement[];
    if (wraps.length < 2) return;

    const ctx = gsap.context(() => {
      // Agrupa en pares (0,1), (2,3), ...
      for (let i = 0; i < wraps.length; i += 2) {
        const leftWrap = wraps[i];
        const rightWrap = wraps[i + 1];
        if (!leftWrap || !rightWrap) continue;

        // Estado inicial — diagonal desde esquina inferior + inclinadas
        gsap.set(leftWrap, {
          xPercent: -100,
          yPercent: 80,
          rotate: ITEMS[i].rotation,
        });
        gsap.set(rightWrap, {
          xPercent: 100,
          yPercent: 80,
          rotate: ITEMS[i + 1].rotation,
        });

        // Triggers ultra tempranos — disparan mucho antes de que la fila sea visible.
        const pairIndex = i / 2;
        const start = pairIndex === 0 ? "top 150%" : "top 175%";

        gsap
          .timeline({
            scrollTrigger: {
              trigger: leftWrap,
              start,
              once: true,
            },
            defaults: { duration: 1.1, ease: "power4.out" },
          })
          .to(leftWrap, { xPercent: 0, yPercent: 0, rotate: 0 }, 0)
          .to(rightWrap, { xPercent: 0, yPercent: 0, rotate: 0 }, 0.08);
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "14vh 1vw 16vh",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          margin: "0 0 11vh 0",
          fontFamily:
            'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
          fontSize: "clamp(60px, 14vw, 220px)",
          fontWeight: 400,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          color: "#0A0A0A",
        }}
      >
        Portafolio
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "20px",
          rowGap: "20px",
          maxWidth: "100%",
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        {ITEMS.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              wrapRefs.current[i] = el;
            }}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "16px",
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 45vw"
              loading="eager"
              draggable={false}
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
