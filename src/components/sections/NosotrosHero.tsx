"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CIRCLE_COUNT = 13;
const OVERLAY_COLOR = "#F5F1E8";
const REVEAL_COLOR = "#FFFFFF";
const LEAD_RADIUS = 55;
const LERP = 0.72;

const TRAIL_COUNT = 420;
const TRAIL_RADIUS = 46;
const TRAIL_LIFETIME_MS = 7000;
const TRAIL_DROP_DISTANCE = 22;
const TRAIL_PEAK_T = 0.6;
const TRAIL_PEAK_SCALE = 1.22;

const TITLE_WORDS = ["Nuestro", "Equipo"];

export function NosotrosHero() {
  const svgRef = useRef<SVGSVGElement>(null);
  const leadCirclesRef = useRef<(SVGCircleElement | null)[]>([]);
  const trailCirclesRef = useRef<(SVGCircleElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  // Letras del título agrupadas por palabra: letterRefs.current[palabra][letra]
  const letterRefs = useRef<HTMLSpanElement[][]>(
    TITLE_WORDS.map(() => [])
  );

  useEffect(() => {
    const svg = svgRef.current;
    const leadCircles = leadCirclesRef.current.filter(
      (c): c is SVGCircleElement => c !== null
    );
    const trailCircles = trailCirclesRef.current.filter(
      (c): c is SVGCircleElement => c !== null
    );
    if (!svg || leadCircles.length === 0) return;

    let svgW = 0;
    let svgH = 0;
    const center = { x: 0, y: 0 };
    const positions = leadCircles.map(() => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    let hasMoved = false;

    const trailData: ({ x: number; y: number; bornAt: number } | null)[] =
      new Array(TRAIL_COUNT).fill(null);
    const activeSlots = new Set<number>();
    let nextSlotHint = 0;
    let lastDropX = Number.NEGATIVE_INFINITY;
    let lastDropY = Number.NEGATIVE_INFINITY;
    const dropSq = TRAIL_DROP_DISTANCE * TRAIL_DROP_DISTANCE;

    const findFreeSlot = (now: number): number => {
      for (let k = 0; k < TRAIL_COUNT; k++) {
        const i = (nextSlotHint + k) % TRAIL_COUNT;
        const d = trailData[i];
        if (!d || now - d.bornAt >= TRAIL_LIFETIME_MS) {
          nextSlotHint = (i + 1) % TRAIL_COUNT;
          return i;
        }
      }
      return -1;
    };

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === svgW && h === svgH) return;
      svgW = w;
      svgH = h;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      center.x = w / 2;
      center.y = h / 2;
      if (!hasMoved) {
        target.x = center.x;
        target.y = center.y;
        positions.forEach((p) => {
          p.x = center.x;
          p.y = center.y;
        });
      }
    };
    measure();

    const handleMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.x = x;
      target.y = y;
      hasMoved = true;

      const dx = x - lastDropX;
      const dy = y - lastDropY;
      if (dx * dx + dy * dy >= dropSq) {
        const now = performance.now();
        const slot = findFreeSlot(now);
        if (slot >= 0) {
          trailData[slot] = { x, y, bornAt: now };
          activeSlots.add(slot);
          const c = trailCircles[slot];
          if (c) {
            c.setAttribute("cx", String(x));
            c.setAttribute("cy", String(y));
          }
          lastDropX = x;
          lastDropY = y;
        }
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("resize", measure);

    const ticker = () => {
      measure();

      positions[0].x += (target.x - positions[0].x) * LERP;
      positions[0].y += (target.y - positions[0].y) * LERP;
      for (let i = 1; i < leadCircles.length; i++) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * LERP;
        positions[i].y += (positions[i - 1].y - positions[i].y) * LERP;
      }
      leadCircles.forEach((c, i) => {
        c.setAttribute("cx", String(positions[i].x));
        c.setAttribute("cy", String(positions[i].y));
      });

      const now = performance.now();
      const expired: number[] = [];
      activeSlots.forEach((i) => {
        const c = trailCircles[i];
        const data = trailData[i];
        if (!c || !data) {
          expired.push(i);
          return;
        }
        const age = now - data.bornAt;
        if (age >= TRAIL_LIFETIME_MS) {
          c.setAttribute("r", "0");
          trailData[i] = null;
          expired.push(i);
        } else {
          const t = age / TRAIL_LIFETIME_MS;
          let scale: number;
          if (t < TRAIL_PEAK_T) {
            const u = t / TRAIL_PEAK_T;
            scale = 1 + (TRAIL_PEAK_SCALE - 1) * (1 - (1 - u) * (1 - u));
          } else {
            const u = (t - TRAIL_PEAK_T) / (1 - TRAIL_PEAK_T);
            const fall = 1 - u;
            scale = TRAIL_PEAK_SCALE * fall * fall;
          }
          c.setAttribute("r", String(TRAIL_RADIUS * scale));
        }
      });
      expired.forEach((i) => activeSlots.delete(i));
    };
    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", measure);
      gsap.ticker.remove(ticker);
    };
  }, []);

  // Reveal letra-por-letra del título "Nuestro Equipo", arranca cuando la
  // sección entra al 80% del viewport (no on-load). Cada palabra usa stagger
  // desde el centro hacia los costados
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const wordsLetters = letterRefs.current;

    const ctx = gsap.context(() => {
      wordsLetters.forEach((letters) => {
        gsap.set(letters, { yPercent: 110 });
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () => {
          wordsLetters.forEach((letters) => {
            gsap.to(letters, {
              yPercent: 0,
              duration: 1.0,
              ease: "power3.out",
              stagger: { each: 0.08, from: "center" },
            });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: REVEAL_COLOR,
        overflow: "hidden",
      }}
    >
      {/* Imagen de fondo — visible cuando el cursor "revela" la mancha */}
      <Image
        src="/images/nosotros/team-photo.webp"
        alt="Buho team"
        fill
        sizes="100vw"
        loading="eager"
        draggable={false}
        style={{
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <svg
        ref={svgRef}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <defs>
          <filter
            id="gooey-nosotros"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
          <mask
            id="reveal-mask-nosotros"
            style={{ maskType: "luminance" } as React.CSSProperties}
          >
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <g filter="url(#gooey-nosotros)">
              {Array.from({ length: CIRCLE_COUNT }).map((_, i) => (
                <circle
                  key={`lead-${i}`}
                  ref={(el) => {
                    leadCirclesRef.current[i] = el;
                  }}
                  cx="0"
                  cy="0"
                  r={LEAD_RADIUS}
                  fill="black"
                />
              ))}
              {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
                <circle
                  key={`trail-${i}`}
                  ref={(el) => {
                    trailCirclesRef.current[i] = el;
                  }}
                  cx="0"
                  cy="0"
                  r="0"
                  fill="black"
                />
              ))}
            </g>
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={OVERLAY_COLOR}
          mask="url(#reveal-mask-nosotros)"
        />
      </svg>

      <h1
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-1.5vh",
          margin: 0,
          padding: "0 2vw",
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(80px, 14.5vw, 280px)",
          fontWeight: 900,
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          textAlign: "center",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        {TITLE_WORDS.map((word, wi) => (
          <span
            key={word}
            style={{ display: "block", whiteSpace: "nowrap" }}
          >
            {word.split("").map((letter, li) => (
              <span
                key={li}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  paddingBottom: "0.12em",
                  marginBottom: "-0.12em",
                  verticalAlign: "top",
                }}
              >
                <span
                  ref={(el) => {
                    if (el) letterRefs.current[wi][li] = el;
                  }}
                  style={{
                    display: "inline-block",
                    willChange: "transform",
                  }}
                >
                  {letter}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>
    </section>
  );
}
