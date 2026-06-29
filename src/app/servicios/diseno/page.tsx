"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const WORDS = ["Diseño"];

export default function DisenoPage() {
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

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
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingLeft: "4vw",
        paddingBottom: "8vh",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {WORDS.map((word, i) => (
        <span
          key={word}
          style={{
            display: "block",
            overflow: "hidden",
            lineHeight: 0.95,
            position: "relative",
            zIndex: 1,
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
    </main>
  );
}
