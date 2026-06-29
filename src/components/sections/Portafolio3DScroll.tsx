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
  exitBlur?: number;       // blur máximo en el último scroll (px). Default 3.
}

// Cada card tiene su propio startT → permite overlapping de timelines
const PROJECTS: Project[] = [
  { src: "/images/portafolio/01.jpeg", title: "Magic City", categories: ["MERCH"], offsetX: -18, offsetY: -14, startT: 0, driftY: -10 },
  { src: "/images/portafolio/02.jpeg", title: "Project 02", categories: ["MERCH"], offsetX: -7, offsetY: -2, startT: 0.4, baseBlur: 4, entryDuration: 0.4, driftX: -22, driftY: 20, lifetimeT: 0.9 },
  { src: "/images/portafolio/03.jpeg", title: "Project 03", categories: ["MERCH"], offsetX: -14, offsetY: -7, startT: 0.9, baseBlur: 4, entryDuration: 0.4, driftX: 30, driftY: 20, lifetimeT: 0.9, exitBlur: 10 },
  { src: "/images/portafolio/04.jpeg", title: "Project 04", categories: ["MERCH"], offsetX: 2, offsetY: -2, startT: 1.2, baseBlur: 4, entryDuration: 0.4, driftX: -20, driftY: -10, lifetimeT: 0.9 },
  { src: "/images/portafolio/05.jpeg", title: "Project 05", categories: ["MERCH"], offsetX: 10, offsetY: -10, startT: 1.5, baseBlur: 4, entryDuration: 0.4, driftX: 25, driftY: -18, lifetimeT: 0.9 },
  { src: "/images/portafolio/01.jpeg", title: "Project 06", categories: ["MERCH"], offsetX: 18, offsetY: 8, startT: 1.8, baseBlur: 4, entryDuration: 0.4, driftX: -30, driftY: -15, lifetimeT: 0.9 },
  { src: "/images/portafolio/02.jpeg", title: "Project 07", categories: ["MERCH"], offsetX: -6, offsetY: -3, startT: 2.1, baseBlur: 4, entryDuration: 0.4, driftX: 32, driftY: 12, lifetimeT: 0.9 },
  { src: "/images/portafolio/03.jpeg", title: "Project 08", categories: ["MERCH"], offsetX: 6, offsetY: -13, startT: 2.4, baseBlur: 4, entryDuration: 0.4, driftX: -18, driftY: 24, lifetimeT: 0.9 },
];

const SCROLL_PER_CARD_VH = 830; // 10 scrolls = full lifecycle de UNA card
// Total span = el momento en que la última card termina (startT + lifetimeT).
const TOTAL_SPAN = Math.max(...PROJECTS.map((p) => p.startT + (p.lifetimeT ?? 1)));
// scrolls 1-7 → 100% opacity creciendo
// scroll 8 (t=0.8) → fade arranca
// scroll 10 (t=1.0) → desapareció // vh de scroll por card — más lento (4× que antes)

const YELLOW = "#DBE000";

type Decor = {
  type: "square" | "circle" | "circle-outline" | "square-outline";
  size: number;            // px (a la escala base de la card)
  projectIndex: number;    // a qué imagen está vinculada
  offsetX: number;         // vw — desplazamiento desde el CENTRO de la card vinculada
  offsetY: number;         // vh — desplazamiento desde el CENTRO de la card vinculada
};

// DECOR ACTIVAS — cada una anclada al CENTRO de su card. Posiciones y tamaños
// completamente aleatorios, sin patrón repetido entre imágenes.
const DECOR: Decor[] = [
  // Imagen 1 (Magic City)
  { type: "square",         size: 22, projectIndex: 0, offsetX: -18, offsetY: -18 },
  { type: "circle",         size: 16, projectIndex: 0, offsetX: 5.5, offsetY:   0 },
  // Imagen 2 (Project 02)
  { type: "circle-outline", size: 24, projectIndex: 1, offsetX: -13, offsetY: -11 },
  { type: "square",         size: 12, projectIndex: 1, offsetX:   4, offsetY:   9 },
  // Imagen 3 (Project 03)
  { type: "square-outline", size: 18, projectIndex: 2, offsetX:  -2, offsetY:  10 },
  { type: "circle",         size: 14, projectIndex: 2, offsetX:  11, offsetY:  -4 },
  // Imagen 4 (Project 04)
  { type: "circle",         size: 20, projectIndex: 3, offsetX:  -9, offsetY:   3 },
  { type: "square-outline", size: 26, projectIndex: 3, offsetX:   2, offsetY: -12 },
  // Imagen 5 (Project 05)
  { type: "square",         size: 14, projectIndex: 4, offsetX:  -4, offsetY:  -8 },
  { type: "circle-outline", size: 22, projectIndex: 4, offsetX:  13, offsetY:   2 },
  // Imagen 6 (Project 06)
  { type: "circle-outline", size: 16, projectIndex: 5, offsetX: -11, offsetY:   8 },
  { type: "square",         size: 20, projectIndex: 5, offsetX:   9, offsetY:  -9 },
  // Imagen 7 (Project 07)
  { type: "square-outline", size: 14, projectIndex: 6, offsetX:   3, offsetY:  -3 },
  { type: "circle",         size: 18, projectIndex: 6, offsetX:  -8, offsetY:  10 },
  // Imagen 8 (Project 08)
  { type: "circle",         size: 12, projectIndex: 7, offsetX:  -3, offsetY: -11 },
  { type: "square-outline", size: 24, projectIndex: 7, offsetX:  11, offsetY:   5 },
];

// DECOR RESERVADAS — guardadas para activar más adelante.
const DECOR_RESERVED: Omit<Decor, "projectIndex" | "offsetX" | "offsetY">[] = [
  { type: "square-outline", size: 28 },
  { type: "circle-outline", size: 24 },
  { type: "square",         size: 20 },
  { type: "circle",         size: 14 },
  { type: "square-outline", size: 26 },
  { type: "circle",         size: 18 },
  { type: "square",         size: 22 },
];
void DECOR_RESERVED;

export function Portafolio3DScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const decorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || cards.length === 0) return;

    // Helper: aplica scale + opacity + blur + posición + tilt 3D a una decoración.
    // Hereda EXACTAMENTE el mismo comportamiento que la card: entry (blur+fade in),
    // drift, scale, tilt del cursor y fade-out final.
    const applyDecor = (decorEl: HTMLDivElement, t: number, p: Project, d: Decor) => {
      const entryDur = p.entryDuration ?? 0;
      const entryProgress = entryDur > 0 ? Math.min(1, t / entryDur) : 1;
      const lifetime = p.lifetimeT ?? 1;
      const fadeStart = lifetime - 0.22;
      const fadeT = t < fadeStart ? 0 : Math.min(1, (t - fadeStart) / 0.22);
      const opacity = entryProgress * Math.max(0, 1 - fadeT);

      // Blur idéntico al de la card: base blur durante entry, exit blur durante fade
      const currentBaseBlur = (p.baseBlur ?? 0) * (1 - entryProgress);
      const blur = currentBaseBlur + fadeT * (p.exitBlur ?? 3);

      // Mismo tEased que las cards
      const tEasedBase = Math.pow(t, 4);
      const tEasedBoost = fadeT * 0.5;
      const tEased = tEasedBase + tEasedBoost;

      // Card scale: 0.6 → 5.0 (factor de crecimiento 8.33×)
      const cardScale = 0.6 + 4.4 * tEased;
      const growthRatio = cardScale / 0.6; // 1 → 8.33

      // Card position (con drift) + offset relativo escalado
      const xDrift = (p.driftX ?? 44) * tEased;
      const yDrift = (p.driftY ?? 50) * tEased;
      const cardX = p.offsetX - xDrift;
      const cardY = p.offsetY - yDrift;
      const decorX = cardX + d.offsetX * growthRatio;
      const decorY = cardY + d.offsetY * growthRatio;

      // MISMO tilt 3D que las cards — la decoración rota con el cursor
      const tiltX = (current.y - 50) * -0.10;
      const tiltY = (current.x - 50) * 0.10;

      decorEl.style.transform = `translate(-50%, -50%) translate3d(${decorX}vw, ${decorY}vh, -40px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${growthRatio})`;
      decorEl.style.opacity = String(opacity);
      decorEl.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
    };

    // Estado compartido del cursor (entre scroll y ticker)
    const mouse = { x: 50, y: 50 };
    const current = { x: 50, y: 50 };
    // Estado por card (lo actualiza el scroll, lo lee el ticker)
    const tValues: number[] = new Array(cards.length).fill(0);
    const cardVisible: boolean[] = new Array(cards.length).fill(true);
    // Estado por decoración (paralelo a las cards)
    const decorVisible: boolean[] = new Array(DECOR.length).fill(true);

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
      const blur = currentBaseBlur + fadeT * (p.exitBlur ?? 3);

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

      // Tilt 3D según cursor (rango ±5°, más notorio) — INVERSO: la imagen se aleja del cursor
      const tiltX = (current.y - 50) * -0.10;
      const tiltY = (current.x - 50) * 0.10;

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

    // Estado inicial de decoraciones: solo las vinculadas a proyectos con startT=0 visibles
    DECOR.forEach((d, i) => {
      const decorEl = decorRefs.current[i];
      if (!decorEl) return;
      const p = PROJECTS[d.projectIndex];
      if (p.startT === 0) {
        applyDecor(decorEl, 0, p, d);
      } else {
        decorEl.style.opacity = "0";
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
      // Camera shift (perspective-origin) más fuerte — INVERSO: vanishing point opuesto al cursor
      const px = 175 - current.x * 2.5;
      const py = 175 - current.y * 2.5;
      section.style.setProperty("--px", `${px}%`);
      section.style.setProperty("--py", `${py}%`);

      // Re-aplica transforms en cada frame para que el tilt siga al cursor suavemente
      cards.forEach((card, i) => {
        if (!cardVisible[i]) return;
        apply(card, tValues[i], PROJECTS[i]);
      });
      // Mismo re-apply para decoraciones (también heredan el tilt del cursor)
      DECOR.forEach((d, i) => {
        if (!decorVisible[i]) return;
        const decorEl = decorRefs.current[i];
        if (!decorEl) return;
        applyDecor(decorEl, tValues[d.projectIndex], PROJECTS[d.projectIndex], d);
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

        // Sincroniza decoraciones con el lifecycle de su proyecto asociado
        DECOR.forEach((d, i) => {
          const decorEl = decorRefs.current[i];
          if (!decorEl) return;
          const p = PROJECTS[d.projectIndex];
          const localT = globalT - p.startT;
          const lifetime = p.lifetimeT ?? 1;

          if (localT < 0 || localT > lifetime) {
            decorEl.style.opacity = "0";
            decorVisible[i] = false;
            return;
          }
          decorVisible[i] = true;
          applyDecor(decorEl, localT, p, d);
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
      {/* Decorativos amarillos — anclados al centro de su card vinculada */}
      {DECOR.map((d, i) => {
        const shared = {
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          width: `${d.size}px`,
          height: `${d.size}px`,
          pointerEvents: "none" as const,
          // Un nivel por encima de la card vinculada → la decoración SIEMPRE
          // queda visible incluso cuando se solapa con su propia imagen
          zIndex: PROJECTS.length - d.projectIndex + 2,
          opacity: 0,
          transformOrigin: "center center" as const,
          transformStyle: "preserve-3d" as const,
          willChange: "transform, opacity, filter" as const,
        };
        const refCallback = (el: HTMLDivElement | null) => {
          decorRefs.current[i] = el;
        };
        if (d.type === "square")
          return <div key={i} ref={refCallback} style={{ ...shared, backgroundColor: YELLOW }} />;
        if (d.type === "circle")
          return <div key={i} ref={refCallback} style={{ ...shared, backgroundColor: YELLOW, borderRadius: "50%" }} />;
        if (d.type === "square-outline")
          return <div key={i} ref={refCallback} style={{ ...shared, border: `1.5px solid ${YELLOW}` }} />;
        return <div key={i} ref={refCallback} style={{ ...shared, border: `1.5px solid ${YELLOW}`, borderRadius: "50%" }} />;
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
                color: "#5b3a27",
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
