"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Project {
  src: string;
  title: string;
  categories: string[];
  offsetX: number; // vw, offset sutil del centro
  offsetY: number; // vh
  startT: number;  // cuándo empieza esta card dentro del scroll global (0 = inicio, 0.5 = mitad de la primera card)
  lifetimeT?: number;      // duración del lifecycle de la card (default 1.0 = 10 scrolls). 0.9 = 9 scrolls.
  driftX?: number;         // vw — magnitud del drift horizontal al crecer. + = izquierda, − = derecha. Default 44.
  driftY?: number;         // vh — magnitud del drift vertical al crecer. + = arriba, − = abajo. Default 50.
  baseBlur?: number;       // blur inicial (px). Se va perdiendo durante la entrada.
  entryDuration?: number;  // fracción de t para fade-in + des-blureo (0.4 = 4 scrolls de 10)
}

// Cada card tiene su propio startT → permite overlapping de timelines
const PROJECTS: Project[] = [
  { src: "/images/portafolio/01.jpeg", title: "Magic City", categories: ["FILM"], offsetX: -18, offsetY: -14, startT: 0, driftY: -10 },
  { src: "/images/portafolio/02.jpeg", title: "Project 02", categories: ["FILM"], offsetX: -7, offsetY: -2, startT: 0.4, baseBlur: 4, entryDuration: 0.4, driftX: -22, driftY: 20, lifetimeT: 0.9 },
  { src: "/images/portafolio/03.jpeg", title: "Project 03", categories: ["FILM"], offsetX: -14, offsetY: -7, startT: 0.9, baseBlur: 4, entryDuration: 0.4, driftX: 30, driftY: 20, lifetimeT: 0.9 },
];

const SCROLL_PER_CARD_VH = 830; // 10 scrolls = full lifecycle de UNA card
// Total span = el momento en que la última card termina (startT + lifetimeT).
const TOTAL_SPAN = Math.max(...PROJECTS.map((p) => p.startT + (p.lifetimeT ?? 1)));
// scrolls 1-7 → 100% opacity creciendo
// scroll 8 (t=0.8) → fade arranca
// scroll 10 (t=1.0) → desapareció // vh de scroll por card — más lento (4× que antes)

const YELLOW = "#DBE000";

const DECOR: { type: "square" | "circle" | "circle-outline" | "square-outline"; top: string; left: string; size: number }[] = [
  { type: "square",         top:  "8%", left: "12%", size: 22 },
  { type: "circle",         top: "14%", left: "82%", size: 16 },
  { type: "square-outline", top: "22%", left:  "6%", size: 28 },
  { type: "circle-outline", top: "30%", left: "88%", size: 24 },
  { type: "square",         top: "44%", left: "10%", size: 20 },
  { type: "circle",         top: "58%", left: "86%", size: 14 },
  { type: "square-outline", top: "68%", left:  "8%", size: 26 },
  { type: "circle",         top: "78%", left: "88%", size: 18 },
  { type: "square",         top: "86%", left: "16%", size: 22 },
];

export function Portafolio3DScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || cards.length === 0) return;

    // Estado compartido del cursor (entre scroll y ticker)
    const mouse = { x: 50, y: 50 };
    const current = { x: 50, y: 50 };
    // Estado por card (lo actualiza el scroll, lo lee el ticker)
    const tValues: number[] = new Array(cards.length).fill(0);
    const cardVisible: boolean[] = new Array(cards.length).fill(true);

    // Helper: aplica transform DIRECTO al DOM. Lee el cursor actual para tilt 3D.
    const apply = (card: HTMLDivElement, t: number, p: Project) => {
      // Entry: durante los primeros entryDuration scrolls, la card resuelve transparencia + blur base
      const entryDur = p.entryDuration ?? 0;
      const entryProgress = entryDur > 0 ? Math.min(1, t / entryDur) : 1;
      const currentBaseBlur = (p.baseBlur ?? 0) * (1 - entryProgress);

      // Fade-out window relativa al lifetimeT de la card (los últimos ~2.2 scrolls antes de morir)
      const lifetime = p.lifetimeT ?? 1;
      const fadeStart = lifetime - 0.22;
      const fadeT = t < fadeStart ? 0 : Math.min(1, (t - fadeStart) / 0.22);
      const opacity = entryProgress * Math.max(0, 1 - fadeT);
      const blur = currentBaseBlur + fadeT * 3;

      // Easing potencia 4: cada scroll acelera más que el anterior, el ÚLTIMO da el salto más grande con diferencia.
      // Durante el fade, avanzamos extra sobre el mismo tEased → la imagen sigue su MISMA ruta.
      const tEasedBase = Math.pow(t, 4);
      const tEasedBoost = fadeT * 0.5; // empuja la trayectoria 50% más allá del 1.0
      const tEased = tEasedBase + tEasedBoost;

      const scale = 0.6 + 4.4 * tEased;
      // Drift configurable por card (default: izquierda-arriba). Para drift a la derecha, usar driftX negativo.
      const xDrift = (p.driftX ?? 44) * tEased;
      const yDrift = (p.driftY ?? 50) * tEased;
      const xOffset = p.offsetX - xDrift;
      const yOffset = p.offsetY - yDrift;

      // Tilt 3D según cursor (rango ±3°, sutil) — INVERSO: la imagen se aleja del cursor
      const tiltX = (current.y - 50) * -0.06;
      const tiltY = (current.x - 50) * 0.06;

      card.style.transform = `translate(-50%, -50%) translate3d(${xOffset}vw, ${yOffset}vh, -40px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
    };

    // Estado inicial: solo las cards con startT=0 son visibles desde el principio
    cards.forEach((card, i) => {
      const p = PROJECTS[i];
      if (p.startT === 0) {
        apply(card, 0, p);
      } else {
        card.style.opacity = "0";
        cardVisible[i] = false;
      }
    });

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 100;
      mouse.y = (e.clientY / window.innerHeight) * 100;
    };
    window.addEventListener("mousemove", onMouseMove);

    const cameraTicker = () => {
      current.x += (mouse.x - current.x) * 0.015;
      current.y += (mouse.y - current.y) * 0.015;
      // Camera shift (perspective-origin) moderado — INVERSO: vanishing point opuesto al cursor
      const px = 150 - current.x * 2;
      const py = 150 - current.y * 2;
      section.style.setProperty("--px", `${px}%`);
      section.style.setProperty("--py", `${py}%`);

      // Re-aplica transforms en cada frame para que el tilt siga al cursor suavemente
      cards.forEach((card, i) => {
        if (!cardVisible[i]) return;
        apply(card, tValues[i], PROJECTS[i]);
      });
    };
    gsap.ticker.add(cameraTicker);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${TOTAL_SPAN * SCROLL_PER_CARD_VH}vh`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const globalT = self.progress * TOTAL_SPAN;

        cards.forEach((card, i) => {
          const p = PROJECTS[i];
          const localT = globalT - p.startT;
          const lifetime = p.lifetimeT ?? 1;

          if (localT < 0 || localT > lifetime) {
            card.style.opacity = "0";
            cardVisible[i] = false;
            return;
          }
          tValues[i] = localT;
          cardVisible[i] = true;
        });
      },
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(cameraTicker);
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        perspective: "950px",
        perspectiveOrigin: "var(--px, 50%) var(--py, 50%)",
      }}
    >
      {/* Decorativos amarillos flotantes */}
      {DECOR.map((d, i) => {
        const shared = {
          position: "absolute" as const,
          top: d.top,
          left: d.left,
          width: `${d.size}px`,
          height: `${d.size}px`,
          pointerEvents: "none" as const,
          zIndex: 0,
        };
        if (d.type === "square")
          return <div key={i} style={{ ...shared, backgroundColor: YELLOW }} />;
        if (d.type === "circle")
          return <div key={i} style={{ ...shared, backgroundColor: YELLOW, borderRadius: "50%" }} />;
        if (d.type === "square-outline")
          return <div key={i} style={{ ...shared, border: `1.5px solid ${YELLOW}` }} />;
        return <div key={i} style={{ ...shared, border: `1.5px solid ${YELLOW}`, borderRadius: "50%" }} />;
      })}

      {/* Cards: todas absolutamente posicionadas en el centro con offsets sutiles */}
      {PROJECTS.map((p, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "min(18vw, 320px)",
            aspectRatio: "16 / 9",
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity, filter",
            // Cards anteriores tapan a las siguientes (image 1 sobre image 2)
            zIndex: PROJECTS.length - i + 1,
          }}
        >
          {/* Imagen horizontal (sin borde ni shadow) */}
          <img
            src={p.src}
            alt={p.title}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />


          {/* Pill blanco encima del fondo de la imagen */}
          <div
            style={{
              position: "absolute",
              left: "6%",
              right: "6%",
              bottom: "6%",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.10)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
              <span style={{
                fontFamily: '"Universo", sans-serif',
                fontSize: "clamp(16px, 1.3vw, 22px)",
                fontWeight: 700,
                color: "#0A0A0A",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}>
                {p.title}
              </span>
              <span style={{
                fontFamily: '"Universo", sans-serif',
                fontSize: "10px",
                fontWeight: 600,
                color: "#F73C18",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                {p.categories.join(" · ")}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ))}

    </section>
  );
}
