"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * NosotrosLogo3D — sección con el logo 3D realista de Buho.
 *
 * Comportamiento (estilo Floema):
 *   - Sección de 150vh (más alta que el viewport)
 *   - Blobs borrosos atmosféricos en el fondo
 *   - Logo GIGANTE anclado al BOTTOM, con la MITAD inferior cortada por overflow
 *   - Al scrollear, el usuario ve la sección más alta y el logo medio asomando abajo
 */

// `depth` controla la intensidad del parallax del mouse (más alto = se mueve más)
const BLOBS = [
  { top: "5%",  left: "20%", size: 380, blur: 90,  opacity: 0.65, color: "#5E625F",  shape: "60% 40% 50% 70%", depth: 1.8 },
  { top: "12%", left: "55%", size: 440, blur: 110, opacity: 0.55, color: "#6E6A5B",  shape: "40% 60% 70% 30%", depth: 2.4 },
  { top: "8%",  left: "78%", size: 340, blur: 85,  opacity: 0.60, color: "#5C544A",  shape: "50% 50% 40% 60%", depth: 1.5 },
  { top: "45%", left: "10%", size: 420, blur: 100, opacity: 0.50, color: "#544F45",  shape: "70% 30% 60% 40%", depth: 2.2 },
  { top: "55%", left: "85%", size: 360, blur: 90,  opacity: 0.58, color: "#665E54",  shape: "45% 55% 65% 35%", depth: 1.6 },
  { top: "72%", left: "40%", size: 400, blur: 100, opacity: 0.48, color: "#4F483D",  shape: "55% 45% 35% 65%", depth: 2.0 },
  { top: "78%", left: "70%", size: 320, blur: 80,  opacity: 0.55, color: "#5A5246",  shape: "40% 60% 50% 50%", depth: 1.4 },
];

export function NosotrosLogo3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const logo = logoRef.current;
    const title = titleRef.current;
    const textBlock = textBlockRef.current;
    if (!section || !logo || !title || !textBlock) return;

    const ctx = gsap.context(() => {
      // Estados iniciales de los 3 elementos
      gsap.set(logo, { yPercent: 120, opacity: 0 });
      gsap.set(title, { opacity: 0 });
      gsap.set(textBlock, { opacity: 0, y: 30 });

      // Timeline de entrada SECUENCIAL: 1) logo, 2) título, 3) texto izquierda
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
          defaults: { ease: "power4.out" },
        })
        .to(logo, { yPercent: 0, opacity: 1, duration: 1.4 }, 0)
        .to(title, { opacity: 1, duration: 0.9 }, 0.5)
        .to(textBlock, { opacity: 1, y: 0, duration: 0.8 }, 1.1);

      // Parallax suave del título "Nosotros" (independiente del timeline de entrada)
      gsap.to(title, {
        y: "50vh",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    // PARALLAX DEL MOUSE en los blobs — cada uno con su propio `depth`
    const mouse = { x: 50, y: 50 };
    const current = { x: 50, y: 50 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 100;
      mouse.y = (e.clientY / window.innerHeight) * 100;
    };
    window.addEventListener("mousemove", onMouseMove);

    const blobTicker = () => {
      // Lerp un poco más rápido para que el efecto se sienta más responsivo
      current.x += (mouse.x - current.x) * 0.07;
      current.y += (mouse.y - current.y) * 0.07;

      const deltaX = current.x - 50; // -50 a +50
      const deltaY = current.y - 50;

      blobsRef.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        const depth = BLOBS[i].depth;
        // Multiplicador subido de 0.5 → 1.4 para que el parallax sea claramente notorio
        const offsetX = deltaX * depth * 1.4;
        const offsetY = deltaY * depth * 1.4;
        // Centering (-50%, -50%) + parallax del mouse en un solo transform
        wrapper.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`;
      });
    };
    gsap.ticker.add(blobTicker);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(blobTicker);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "150vh",
        backgroundColor: "#F5F1E8",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blobs decorativos atmosféricos — wrapper centra + recibe parallax,
          interior es el blob visible con drift animado */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => {
            blobsRef.current[i] = el;
          }}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 0,
            willChange: "transform",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: blob.color,
              borderRadius: blob.shape,
              filter: `blur(${blob.blur}px)`,
              opacity: blob.opacity,
              animation: `blobDrift${i % 3} ${18 + i * 2}s ease-in-out infinite`,
              willChange: "transform",
            }}
          />
        </div>
      ))}

      {/* Bloque de texto inferior-izquierda — estilo Floema */}
      <div
        ref={textBlockRef}
        style={{
          position: "absolute",
          top: "70vh",
          left: "4vw",
          zIndex: 1,
          pointerEvents: "none",
          maxWidth: "12vw",
          willChange: "transform, opacity",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: "clamp(17px, 1.4vw, 26px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#1F1F1F",
          }}
        >
          Sobrepensando cada prenda más allá de las expectativas
        </h3>

        <div
          style={{
            marginTop: "3em",
            paddingTop: "0.9em",
            borderTop: "1px solid #1F1F1F",
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: "clamp(11px, 0.85vw, 14px)",
            fontWeight: 500,
            color: "#1F1F1F",
          }}
        >
          Así es como lo hacemos ↓
        </div>
      </div>

      {/* Wrapper de parallax — GSAP anima este, el h2 conserva su posición interna */}
      <div
        ref={titleRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          willChange: "transform",
        }}
      >
        <h2
          style={{
            position: "absolute",
            top: "17%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: "clamp(80px, 16vw, 320px)",
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: "#1F1F1F",
            whiteSpace: "nowrap",
          }}
        >
          Nosotros
        </h2>
      </div>

      {/* Logo 3D realista — centrado por el flex del section, totalmente visible */}
      <img
        ref={logoRef}
        src="/images/nosotros/logo-realista.png"
        alt="Buho logo 3D"
        draggable={false}
        style={{
          position: "relative",
          width: "min(90vw, 1500px)",
          maxHeight: "95vh",
          height: "auto",
          objectFit: "contain",
          marginTop: "38vh",
          zIndex: 1,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      />

      {/* Degradado de salida — suaviza el seam entre esta sección y la siguiente */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "180px",
          background:
            "linear-gradient(to bottom, rgba(245,241,232,0) 0%, rgba(245,241,232,0.6) 55%, rgba(245,241,232,1) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <style>{`
        @keyframes blobDrift0 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(30px, -20px); }
        }
        @keyframes blobDrift1 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-25px, 25px); }
        }
        @keyframes blobDrift2 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(20px, 30px); }
        }
      `}</style>
    </section>
  );
}
