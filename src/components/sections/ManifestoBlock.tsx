"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Distancia final entre la línea y el borde superior del cuadrado
const FINAL_GAP_VH = 10;

const REVEAL_TEXT =
  "La producción, para nosotros, es práctica. Significa entender qué es lo que hace que una prenda valga la pena:";

export function ManifestoBlock() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLParagraphElement>(null);
  const squareParasRef = useRef<(HTMLParagraphElement | null)[]>([]);
  const keywordsRef = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const square = squareRef.current;
    if (!section || !square) return;

    // Estado inicial: cuadrado completamente ARRIBA de la línea
    // (translateado hacia arriba por su propia altura + el gap, + inclinado)
    // El overflow:hidden del wrapper, cuyo borde superior está EN la línea,
    // recorta todo lo que está por encima — el cuadrado queda invisible.
    gsap.set(square, {
      yPercent: -100,
      y: `-${FINAL_GAP_VH + 6}vh`, // gap + margen de seguridad por la rotación
      rotation: -8,
      transformOrigin: "top center",
    });

    const ctx = gsap.context(() => {
      gsap.to(square, {
        yPercent: 0,
        y: 0,
        rotation: 0,
        ease: "none", // interpolación lineal según scroll
        scrollTrigger: {
          trigger: section,
          start: "top bottom", // arranca cuando el top de la sección entra desde abajo del viewport
          end: "top top",      // termina cuando el top llega a tocar el top del viewport (pinea)
          scrub: 0.3,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Párrafos del cuadrado: slide-up al terminar la animación de caída
  useEffect(() => {
    const paras = squareParasRef.current.filter(Boolean) as HTMLParagraphElement[];
    if (!paras.length) return;

    gsap.set(paras, { opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        paras,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Keywords: caen de arriba siguiendo el scroll (scrub bidireccional)
  useEffect(() => {
    const words = keywordsRef.current.filter(Boolean) as HTMLParagraphElement[];
    if (!words.length) return;

    const ctx = gsap.context(() => {
      words.forEach((word) => {
        gsap.fromTo(
          word,
          { y: -100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: word,
              start: "top 85%",
              end: "top 15%",
              scrub: 0.6,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  // Stagger word reveal igual que el BIG_TEXT de AboutSection
  useEffect(() => {
    const root = revealRef.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLSpanElement>(".manifesto-word"));
    if (!words.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.03,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const revealWords = REVEAL_TEXT.split(" ");

  return (
    <>
    <section
      ref={sectionRef}
      data-nav-theme="light"
      className="relative w-full"
      style={{
        backgroundColor: "#ffffff",
        marginTop: "-15vh",
        height: "100vh",
      }}
    >
      {/* Sticky pin: línea + wrapper quedan fijos en pantalla durante el scroll */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Línea horizontal con márgenes laterales */}
        <div
          ref={lineRef}
          style={{
            width: "calc(100% - 6vw)",
            margin: "20vh auto 0",
            height: "1px",
            backgroundColor: "#000000",
          }}
        />

        {/* WRAPPER con overflow:hidden — su borde superior COINCIDE con la línea
            Todo lo que esté arriba de este borde queda recortado. */}
        <div
          ref={maskRef}
          style={{
            overflow: "hidden",
            paddingTop: `${FINAL_GAP_VH}vh`,
            paddingBottom: "10vh",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={squareRef}
            style={{
              width: "clamp(300px, 42vw, 620px)",
              aspectRatio: "5 / 4",
              overflow: "hidden",
              backgroundColor: "#000000",
              borderRadius: "16px",
              padding: "clamp(24px, 4vw, 52px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "clamp(14px, 2vw, 24px)",
            }}
          >
            {[
              <>Esos años los pasamos <em style={{ fontStyle: "italic" }}>cosiendo</em>. No contando.</>,
              <>Cada pedido: tela real, plazo real, una marca esperando su merch al otro lado.</>,
              <>Aprendimos, refinamos, dejamos atrás lo que no aguantó el tiempo.</>,
              <>Esto que ves ahora es lo que <em style={{ fontStyle: "italic" }}>sí</em> aguantó.</>,
            ].map((text, i) => (
              <p
                key={i}
                ref={el => { squareParasRef.current[i] = el; }}
                style={{
                  margin: 0,
                  fontFamily: '"Britanica", sans-serif',
                  fontSize: "clamp(19px, 2.2vw, 34px)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Texto reveal debajo del cuadrado */}
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "12vh 14vw 16vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <p
        ref={revealRef}
        style={{
          margin: 0,
          maxWidth: "820px",
          textAlign: "center",
          fontFamily: '"Jumper", sans-serif',
          fontSize: "clamp(22px, 2.8vw, 46px)",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "#000000",
        }}
      >
        {revealWords.map((word, i) => (
          <span
            key={i}
            className="manifesto-word"
            style={{ display: "inline-block", marginRight: "0.22em", opacity: 0 }}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
    {/* Lista de palabras clave debajo del texto reveal */}
    <div
      style={{
        backgroundColor: "#ffffff",
        paddingBottom: "14vh",
        textAlign: "center",
      }}
    >
      {["IDENTIDAD", "TELA", "PRODUCCIÓN", "MARCA"].map((word, i) => (
        <div key={word} style={{ overflow: "hidden" }}>
          <p
            ref={el => { keywordsRef.current[i] = el; }}
            style={{
              margin: 0,
              fontFamily: '"Universo", sans-serif',
              fontSize: "clamp(42px, 8vw, 130px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "#0A0A0A",
            }}
          >
            {word}
          </p>
        </div>
      ))}
    </div>
    </>
  );
}
