"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const WORDS = ["Produc", "ción"];

export default function ProduccionPage() {
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const heroRef = useRef<HTMLElement>(null);

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

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {/* ===== HERO SECTION: WEB DESIGN ===== */}
      <section
        ref={heroRef}
        data-nav-theme="light"
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
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
      </section>
    </div>
  );
}
