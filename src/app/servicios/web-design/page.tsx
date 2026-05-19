"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Application as SplineApp } from "@splinetool/runtime";

const WORDS = ["Web", "Design"];
const PHONE_SCENE_URL =
  "https://prod.spline.design/NQhhvRA68WLqEyAf/scene.splinecode?v=6";

export default function WebDesignPage() {
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const splineCanvasRef = useRef<HTMLCanvasElement>(null);
  const [splineLoading, setSplineLoading] = useState(true);

  // Text reveal
  useEffect(() => {
    const words = wordsRef.current.filter(Boolean) as HTMLSpanElement[];
    if (!words.length) return;
    gsap.set(words, { yPercent: 110, opacity: 0 });
    const tween = gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: "expo.out",
      delay: 0.1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  // Spline hero phone
  useEffect(() => {
    const canvas = splineCanvasRef.current;
    if (!canvas) return;
    let app: SplineApp | null = null;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;

    (async () => {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (cancelled) return;
        app = new Application(canvas);
        await app.load(PHONE_SCENE_URL);
        if (cancelled) return;
        setSplineLoading(false);

        const styleTag = document.createElement("style");
        styleTag.textContent = `
          a[href*="spline.design"],
          div:has(> a[href*="spline.design"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -99999px !important;
            width: 0 !important; height: 0 !important;
          }
        `;
        document.head.appendChild(styleTag);
        const killBadge = () => {
          document.querySelectorAll<HTMLAnchorElement>("a").forEach((el) => {
            if (el.href?.includes("spline.design")) el.remove();
          });
        };
        killBadge();
        interval = setInterval(killBadge, 200);
        observer = new MutationObserver(() => killBadge());
        observer.observe(document.body, { childList: true, subtree: true });
      } catch (err) {
        if (cancelled) return;
        console.error("[SplinePhone]", err);
        setSplineLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (observer) observer.disconnect();
      app?.dispose();
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {/* ===== HERO SECTION: WEB DESIGN + Spline ===== */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingLeft: "4vw",
          paddingRight: "2vw",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, paddingBottom: "8vh" }}>
          {WORDS.map((word, i) => (
            <span
              key={word}
              style={{
                display: "block",
                overflow: "hidden",
                lineHeight: 0.95,
              }}
            >
              <span
                ref={(el) => {
                  wordsRef.current[i] = el;
                }}
                style={{
                  display: "block",
                  fontFamily:
                    'var(--font-anton), "Anton", "Impact", "Arial Narrow", sans-serif',
                  fontSize: "clamp(64px, 14vw, 280px)",
                  lineHeight: 0.95,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  color: "#0A0A0A",
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </div>

        <div
          style={{
            position: "relative",
            width: "clamp(450px, 60vw, 950px)",
            height: "100vh",
            flexShrink: 0,
            zIndex: 1,
            alignSelf: "flex-end",
          }}
        >
          <canvas
            ref={splineCanvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
          {splineLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0A0A0A",
                opacity: 0.4,
                fontSize: "14px",
                fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
                letterSpacing: "0.1em",
              }}
            >
              LOADING 3D...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
