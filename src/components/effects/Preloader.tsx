"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

/* ============================================================
   Preloader — intro estilo outfit.hellohello.is
   ------------------------------------------------------------
   - Contador 000 → 100 (acelera hacia el final).
   - Pila de imágenes que entran una por una y CRECEN al centro.
   - La palabra "Buho" se revela detrás, letra por letra.
   - Al terminar, TODO se revierte rápido (imágenes se encogen/desaparecen y las
     letras caen de vuelta a su máscara) y el fondo se desvanece revelando el sitio.
   - Solo se muestra UNA vez por sesión (sessionStorage). Respeta
     prefers-reduced-motion (se salta).
   ============================================================ */

const IMAGES = [
  "/preloader/image-01.jpg",
  "/preloader/image-02.jpg",
  "/preloader/image-03.jpg",
  "/preloader/image-04.jpg",
  "/preloader/image-05.jpg",
  "/preloader/image-06.jpg",
  "/preloader/image-07.jpg",
  "/preloader/image-08.jpg",
];

const WORD = "Buho";
const DURATION = 3.2; // segundos de la secuencia principal
const SESSION_KEY = "buho_preloader_shown";

// Delay por letra en orden de lectura (B, u, h, o). Cada letra es independiente
// y sale en su propio tiempo: la secuencia VISIBLE es h → u → B → o, separadas
// ~0.4s para que se lean una tras otra (no superpuestas como el wordmark base).
//   h = 0.00  →  u = 0.40  →  B = 0.80  →  o = 1.20
const LETTER_DELAY = [0.8, 0.4, 0.0, 1.2];

// Salida (reverso, rápido): las letras caen de vuelta a su máscara en orden
// INVERSO o → B → u → h. Delays en orden de lectura (B, u, h, o), muy juntos.
const EXIT_DELAY = [0.07, 0.14, 0.21, 0.0];

export function Preloader() {
  const [hidden, setHidden] = useState(false);
  // Las letras animan vía CSS (mismo timing que Buho Shop); arrancan ocultas
  // y se disparan cuando la fuente está lista, para no animar con la de respaldo.
  const [ready, setReady] = useState(false);
  // Fase de SALIDA: al terminar la entrada, todo se revierte rápido.
  const [exiting, setExiting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const regRef = useRef<HTMLSpanElement>(null);

  /* ----- Cierre: marca sesión, revela el sitio y desmonta ----- */
  const finishNow = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* sessionStorage no disponible: igual revelamos el sitio */
    }
    setHidden(true);
    document.body.style.overflow = "";
  }, []);

  /* ----- Saltar si ya se mostró o el usuario pidió menos movimiento ----- */
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shown =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1";

    if (reduced || shown) {
      setHidden(true);
      return;
    }
    document.body.style.overflow = "hidden";
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ----- Disparar el revelado de letras cuando la fuente esté lista ----- */
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    const play = () => {
      if (!cancelled) setReady(true);
    };
    // Esperamos a AG Schoolbook para no animar con la fuente de respaldo.
    // Fallback a los 1800ms por si la fuente nunca resolviera.
    const t = window.setTimeout(play, 1800);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.load('1em "AG Schoolbook"').then(play).catch(play);
      document.fonts.ready.then(play).catch(play);
    } else {
      play();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [hidden]);

  /* ----- Animación principal ----- */
  useEffect(() => {
    if (hidden) return;
    const overlay = overlayRef.current;
    const stage = stageRef.current;
    const stack = stackRef.current;
    const counter = counterRef.current;
    const reg = regRef.current;
    const imgs = imgRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!overlay || !stage || !stack || !counter) return;

    // Rotaciones deterministas por imagen → look de "mazo de cartas".
    const rot = imgs.map((_, i) => (i % 2 === 0 ? -1 : 1) * (4 + ((i * 1.7) % 7)));

    const ctx = gsap.context(() => {
      gsap.set(imgs, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
        rotation: (i) => rot[i] * 2,
      });
      gsap.set(stack, { scale: 0.5 });
      if (reg) gsap.set(reg, { opacity: 0 });

      const countObj = { v: 0 };
      // Al completar la entrada pasamos a la fase de SALIDA (reverso rápido).
      const tl = gsap.timeline({ onComplete: () => setExiting(true) });

      // Contador 000 → 100 (acelera).
      tl.to(
        countObj,
        {
          v: 100,
          duration: DURATION,
          ease: "power1.in",
          onUpdate: () => {
            counter.textContent = String(Math.round(countObj.v));
          },
        },
        0
      );

      // La pila entera crece a lo largo de toda la secuencia.
      tl.to(stack, { scale: 1.05, duration: DURATION, ease: "power1.inOut" }, 0);

      // Las imágenes entran una por una (apilándose, cada una rotada).
      tl.to(
        imgs,
        {
          scale: 1,
          opacity: 1,
          rotation: (i) => rot[i],
          duration: 0.55,
          ease: "back.out(1.5)",
          stagger: (DURATION - 0.9) / Math.max(1, imgs.length),
        },
        0.15
      );

      // (Las letras "Buho" se animan vía CSS con su timing escalonado.)
      // El ® aparece con un fade suave una vez que la palabra ya está formada.
      if (reg) tl.to(reg, { opacity: 1, duration: 0.4, ease: "power2.out" }, 2.0);
    });

    return () => ctx.revert();
  }, [hidden]);

  /* ----- Fase de SALIDA: todo el efecto en reverso, rápido ----- */
  useEffect(() => {
    if (!exiting) return;
    const overlay = overlayRef.current;
    const stack = stackRef.current;
    const counter = counterRef.current;
    const reg = regRef.current;
    const imgs = imgRefs.current.filter(Boolean) as HTMLDivElement[];
    // Mismas rotaciones que en la entrada, para revertir igual.
    const rot = imgs.map((_, i) => (i % 2 === 0 ? -1 : 1) * (4 + ((i * 1.7) % 7)));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finishNow });

      // Las imágenes se VAN: se encogen y desaparecen en orden inverso (rápido).
      tl.to(
        imgs,
        {
          scale: 0,
          opacity: 0,
          rotation: (i) => rot[i] * 2,
          duration: 0.3,
          ease: "power2.in",
          stagger: { each: 0.04, from: "end" },
        },
        0
      );
      // La pila se contrae.
      if (stack) tl.to(stack, { scale: 0.4, duration: 0.45, ease: "power2.in" }, 0);
      // Contador y ® se desvanecen.
      if (counter) tl.to(counter, { opacity: 0, duration: 0.25 }, 0);
      if (reg) tl.to(reg, { opacity: 0, duration: 0.25 }, 0);
      // El fondo negro se desvanece → revela el sitio.
      if (overlay)
        tl.to(overlay, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0.5);
    });

    return () => ctx.revert();
  }, [exiting, finishNow]);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
        isolation: "isolate",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Contador — arriba a la derecha */}
      <span
        ref={counterRef}
        style={{
          position: "absolute",
          top: "5vh",
          right: "6vw",
          fontFamily:
            'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
          fontSize: "clamp(18px, 2vw, 30px)",
          letterSpacing: "0.08em",
          color: "#F5F1E8",
        }}
      >
        0
      </span>

      {/* Escenario centrado: palabra detrás + pila de imágenes encima */}
      <div
        ref={stageRef}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity",
        }}
      >
        {/* Palabra "Buho" ENCIMA de la pila con mix-blend-mode: difference →
            donde cruza una imagen su color se invierte/distorsiona pero sigue
            legible (efecto outfit); sobre el negro se ve crema normal. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            zIndex: 3,
            mixBlendMode: "difference",
          }}
        >
          {WORD.split("").map((ch, i) => (
            // Máscara por letra (overflow:hidden): la letra interior sube desde
            // abajo y queda recortada hasta llegar a su sitio.
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
              }}
            >
              <span
                className={`preloader-letter ${
                  exiting
                    ? "preloader-letter-exit"
                    : ready
                    ? "preloader-letter-play"
                    : "preloader-letter-idle"
                }`}
                style={{
                  paddingTop: "0.16em",
                  animationDelay: `${
                    (exiting ? EXIT_DELAY[i] : LETTER_DELAY[i]) ?? 0
                  }s`,
                  fontFamily: '"AG Schoolbook", Georgia, "Times New Roman", serif',
                  fontWeight: 500,
                  fontSize: "clamp(64px, 15vw, 230px)",
                  letterSpacing: "-0.04em",
                  color: "#F5F1E8",
                }}
              >
                {ch}
              </span>
            </span>
          ))}
          {/* Marca registrada, detalle estilo outfit */}
          <span
            ref={regRef}
            style={{
              alignSelf: "flex-start",
              marginLeft: "0.15em",
              marginTop: "0.4em",
              fontFamily:
                'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
              fontSize: "clamp(12px, 1vw, 18px)",
              color: "#F5F1E8",
              opacity: 0, // oculto en el primer pintado; GSAP lo aparece luego
            }}
          >
            ®
          </span>
        </div>

        {/* Pila de imágenes (debajo de la palabra, centrada) */}
        <div
          ref={stackRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            zIndex: 2,
          }}
        >
          {IMAGES.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "clamp(150px, 18vw, 270px)",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                boxShadow: "0 14px 40px rgba(0, 0, 0, 0.35)",
                // Ocultas desde el primer pintado para evitar el "flash" de la
                // imagen sin animar antes de que GSAP tome el control.
                opacity: 0,
                willChange: "transform, opacity",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                draggable={false}
                loading="eager"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
