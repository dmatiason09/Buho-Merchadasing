"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

/**
 * ServiciosHero — Hero de la página /servicios.
 *
 * Combina:
 *  - Stack de palabras grandes con entrada 3D (rotationX desde -100° con stagger)
 *  - Imagen que sigue al cursor con tilt 3D según velocidad (efecto magnetic-trail
 *    que antes vivía en /servicios/branding).
 */

// Estilo detroit.paris/services — "BUILDING / CONTENT FACTORIES / FOR LUXURY BRANDS"
const BIG_WORDS = [
  "Construyendo",
  "Fábricas de Contenido",
  "para Marcas de Lujo",
];

// Paleta estilo detroit.paris/services — blanco + negro punzante
const COLOR_BG = "#ffffff";
const COLOR_BIG = "#0A0A0A";
const COLOR_FG = "#0A0A0A";

// Tamaño de la imagen que sigue al cursor
const FOLLOW_W = 240;
const FOLLOW_H = 320;
const FOLLOW_SRC = "/images/bento/02-typography.webp";

export function ServiciosHero() {
  const rootRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const bounds = useRef({ left: 0, top: 0 });

  const updateBounds = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    bounds.current = { left: rect.left, top: rect.top };
  }, []);

  // Entrada 3D de las palabras grandes
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const bigWords = root.querySelectorAll<HTMLElement>(".sh-big-word");

    gsap.set(bigWords, {
      rotationX: -100,
      transformOrigin: "50% 50% -160px",
      opacity: 0,
    });

    const tl = gsap.timeline({ delay: 0.35 });

    tl.to(bigWords, {
      rotationX: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.25,
      ease: "power3",
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Imagen que sigue al cursor con tilt 3D según velocidad
  useEffect(() => {
    const root = rootRef.current;
    const img = imgRef.current;
    if (!root || !img) return;

    updateBounds();
    gsap.set(img, { transformPerspective: 800 });
    window.addEventListener("resize", updateBounds);

    let prevX = 0;
    let prevY = 0;

    const onEnter = () => {
      gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(img, {
        opacity: 0,
        scale: 0.9,
        rotateX: 0,
        rotateY: 0,
        rotation: 0,
        duration: 0.4,
        ease: "power2.in",
      });
      prevX = 0;
      prevY = 0;
    };
    const onMove = (e: MouseEvent) => {
      updateBounds();
      const curX = e.clientX;
      const curY = e.clientY;
      const deltaX = curX - prevX;
      const deltaY = curY - prevY;
      prevX = curX;
      prevY = curY;

      const tiltY = gsap.utils.clamp(-25, 25, deltaX * 1.5);
      const tiltX = gsap.utils.clamp(-15, 15, -deltaY * 1.2);

      gsap.to(img, {
        x: curX - bounds.current.left + 40,
        y: curY - bounds.current.top + 30,
        rotateY: tiltY,
        rotateX: tiltX,
        duration: 2.0,
        ease: "power3.out",
      });
    };

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("resize", updateBounds);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("mousemove", onMove);
    };
  }, [updateBounds]);

  return (
    <section
      ref={rootRef}
      data-nav-theme="light"
      className="sh-root relative min-h-[100dvh] w-full flex flex-col"
      style={{ backgroundColor: COLOR_BG, color: COLOR_FG, cursor: "default" }}
    >
      {/* Spacer del navbar */}
      <div className="h-[80px] shrink-0" aria-hidden="true" />

      {/* Imagen flotante que sigue al cursor */}
      <div
        ref={imgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: FOLLOW_W,
          height: FOLLOW_H,
          pointerEvents: "none",
          opacity: 0,
          borderRadius: "8px",
          overflow: "hidden",
          willChange: "transform",
          zIndex: 2,
        }}
      >
        <img
          src={FOLLOW_SRC}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 md:px-10">
        <div className="flex flex-col items-center w-full pt-[6vh]">
          {BIG_WORDS.map((word) => (
            <div
              key={word}
              className="flex items-center justify-center"
              style={{
                overflow: "visible",
                perspective: "500px",
              }}
            >
              <span
                className="sh-big-word inline-block uppercase whitespace-nowrap text-center"
                style={{
                  fontSize: "clamp(60px, 11vw, 220px)",
                  lineHeight: 0.92,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: COLOR_BIG,
                  fontFamily:
                    'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
