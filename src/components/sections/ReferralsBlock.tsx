"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REFERIDOS_LETTERS = "Referidos".split("");

export function ReferralsBlock() {
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const referidosRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const h2 = h2Ref.current;
    const referidos = referidosRef.current;
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!section || !h2 || !referidos || !letters.length) return;

    // Estado inicial: texto centrado, letras invisibles
    gsap.set(h2, { x: "20vw" });
    gsap.set(letters, { opacity: 0, y: 10 });

    const tl = gsap.timeline({ paused: true });

    // Paso 1: h2 se desliza a la izquierda
    tl.to(h2, {
      x: 0,
      duration: 1.6,
      ease: "power3.inOut",
    })
    // Paso 2: letras de "Referidos" aparecen una por una (efecto escritura)
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
      onEnter: () => tl.play(),
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 0 0 2.5vw",
        position: "relative",
      }}
    >
      {/* Footer location dentro de la misma sección */}
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
        <svg
          width="80"
          height="20"
          viewBox="0 0 80 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
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
          <div>Apasionados por el diseño & código</div>
        </div>
      </div>

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
              color: "#E8271E",
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
    </section>
  );
}
