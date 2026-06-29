"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SLOTS = [
  { left: 0, size: 6 },
  { left: 6, size: 12 },
  { left: 18, size: 19 },
  { left: 37, size: 25 },
  { left: 62, size: 38 },
];
const NUM_SLOTS = SLOTS.length;
const BASE_SIZE = SLOTS[SLOTS.length - 1].size; // 38vw = mayor tamaño
const SCROLL_PER_SLOT = 220; // px de scroll para avanzar 1 slot
const NUM_CYCLES = 2;
const PIN_RANGE = SCROLL_PER_SLOT * NUM_SLOTS * NUM_CYCLES;

const IMAGES = [
  "/images/portafolio/01.jpeg",
  "/images/portafolio/02.jpeg",
  "/images/portafolio/03.jpeg",
  "/images/portafolio/04.jpeg",
  "/images/portafolio/05.jpeg",
];

export function PortafolioHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${PIN_RANGE}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const phaseAdvance = (self.progress * PIN_RANGE) / SCROLL_PER_SLOT;

          imgRefs.current.forEach((img, i) => {
            if (!img) return;
            const phase =
              (((i + phaseAdvance) % NUM_SLOTS) + NUM_SLOTS) % NUM_SLOTS;
            const slotA = Math.floor(phase);
            const slotB = (slotA + 1) % NUM_SLOTS;
            const t = phase - slotA;
            const isWrap = slotA === NUM_SLOTS - 1;

            let left: number;
            let size: number;

            if (isWrap) {
              // Wrap zone: extensión natural de la cascade hacia slot virtual 5 (100, 51)
              // Adyacencia con la imagen anterior preservada
              const virtualLeft = 100;
              const virtualSize = SLOTS[slotA].size + 13;
              left =
                SLOTS[slotA].left + t * (virtualLeft - SLOTS[slotA].left);
              size =
                SLOTS[slotA].size + t * (virtualSize - SLOTS[slotA].size);
            } else {
              left =
                SLOTS[slotA].left +
                (SLOTS[slotB].left - SLOTS[slotA].left) * t;
              size =
                SLOTS[slotA].size +
                (SLOTS[slotB].size - SLOTS[slotA].size) * t;
            }

            const scaleFactor = size / BASE_SIZE;
            img.style.transform = `translate3d(${left}vw, 0, 0) scale(${scaleFactor})`;
          });

          // GHOST: copia de la imagen en wrap, creciendo desde la izquierda hacia slot 0
          // Activa solo durante la segunda mitad del wrap (t in [0.5, 1])
          // Adyacente a la imagen siguiente: ghost.right = nextImg.left
          //   nextImg phase = t (cycle ahead), nextImg.left = 6 * t
          //   ghost size grows 0 → 6 linearly: 12 * (t - 0.5)
          //   ghost left = 6t - 12(t - 0.5) = 6(1 - t)
          ghostRefs.current.forEach((ghost, i) => {
            if (!ghost) return;
            const phase =
              (((i + phaseAdvance) % NUM_SLOTS) + NUM_SLOTS) % NUM_SLOTS;
            const slotA = Math.floor(phase);
            const t = phase - slotA;
            const isWrap = slotA === NUM_SLOTS - 1;

            if (isWrap && t >= 0.5) {
              const ghostLeft = 6 * (1 - t);
              const ghostSize = 12 * (t - 0.5);
              const scaleFactor = ghostSize / BASE_SIZE;
              ghost.style.transform = `translate3d(${ghostLeft}vw, 0, 0) scale(${scaleFactor})`;
              ghost.style.opacity = "1";
            } else {
              ghost.style.opacity = "0";
            }
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const line = (delay: number): React.CSSProperties => ({
    display: "block",
    animation: `portafolio-rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
  });

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "22vh 4vw 10vh",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          margin: 0,
          maxWidth: "1100px",
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(38px, 6.5vw, 120px)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.035em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          position: "relative",
          zIndex: 2,
        }}
      >
        <span style={line(0.1)}>Dejamos que nuestro</span>
        <span style={line(0.25)}>
          <span
            style={{
              fontFamily: '"Heatwood", cursive',
              fontWeight: 400,
              fontSize: "1.05em",
              color: "#5b3a27",
              textTransform: "none",
              letterSpacing: "0",
              display: "inline-block",
              transform: "rotate(-3deg)",
              verticalAlign: "baseline",
            }}
          >
            Trabajo
          </span>{" "}
          Hable por
        </span>
        <span style={line(0.4)}>Nosotros</span>
      </h1>

      {IMAGES.map((src, i) => {
        const initialSlot = SLOTS[i];
        const initialScale = initialSlot.size / BASE_SIZE;
        return (
          <img
            key={`main-${i}`}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={src}
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: `${BASE_SIZE}vw`,
              height: `${BASE_SIZE}vw`,
              objectFit: "cover",
              pointerEvents: "none",
              zIndex: 1,
              transformOrigin: "bottom left",
              transform: `translate3d(${initialSlot.left}vw, 0, 0) scale(${initialScale})`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {IMAGES.map((src, i) => (
        <img
          key={`ghost-${i}`}
          ref={(el) => {
            ghostRefs.current[i] = el;
          }}
          src={src}
          alt=""
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: `${BASE_SIZE}vw`,
            height: `${BASE_SIZE}vw`,
            objectFit: "cover",
            pointerEvents: "none",
            zIndex: 1,
            transformOrigin: "bottom left",
            transform: `translate3d(0, 0, 0) scale(0)`,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      <style>{`
        @keyframes portafolio-rise {
          from { opacity: 0; transform: translateY(70px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
