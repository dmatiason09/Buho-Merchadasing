"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CIRCLE_COUNT = 13;
const OVERLAY_COLOR = "#FFFFFF";
const REVEAL_COLOR = "#D9DFE4";
const LEAD_RADIUS = 55;
const LERP = 0.72;

const TRAIL_COUNT = 420;
const TRAIL_RADIUS = 46;
const TRAIL_LIFETIME_MS = 7000;
const TRAIL_DROP_DISTANCE = 22;

export function NosotrosHero() {
  const svgRef = useRef<SVGSVGElement>(null);
  const leadCirclesRef = useRef<(SVGCircleElement | null)[]>([]);
  const trailCirclesRef = useRef<(SVGCircleElement | null)[]>([]);

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
          const lifeRatio = 1 - age / TRAIL_LIFETIME_MS;
          c.setAttribute("r", String(TRAIL_RADIUS * lifeRatio));
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

  return (
    <section
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: REVEAL_COLOR,
        overflow: "hidden",
      }}
    >
      <p
        style={{
          position: "absolute",
          top: "20vh",
          left: "2vw",
          right: "2vw",
          margin: 0,
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(40px, 7vw, 130px)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          pointerEvents: "none",
          zIndex: 1,
          animation:
            "nosotros-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both",
        }}
      >
        Nos brillan los ojos cuando una interfaz cobra vida.
      </p>

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
          animation:
            "nosotros-fade-up 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
        }}
      >
        Nosotros
      </h1>

      <style>{`
        @keyframes nosotros-fade-up {
          from { opacity: 0; transform: translateY(80px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nosotros-fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
