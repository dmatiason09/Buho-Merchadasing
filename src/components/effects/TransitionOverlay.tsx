"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTransition } from "@/providers/TransitionProvider";

const DELAY = 0.7;
const DURATION = 3.2;
const EASING = [0.0, 0.0, 0.15, 1] as const;

export function TransitionOverlay() {
  const { phase, color, setPhase } = useTransition();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const topOffset = isMobile ? "-15vw" : "-25vw";
  const angle = isMobile ? 5 : 8;

  // Un solo movimiento continuo: -150vh → 150vh.
  // El panel baja de arriba a abajo en una sola animación.
  // router.push se dispara cuando el panel cubre la pantalla (~mitad).
  const targetY = phase === "idle" ? "-150vh" : "150vh";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: topOffset,
        left: "-10vw",
        width: "120vw",
        height: "150vh",
        rotate: `${angle}deg`,
        transformOrigin: "top left",
        pointerEvents: phase === "idle" ? "none" : "all",
        zIndex: 1000000,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ y: "-150vh" }}
        animate={{ y: targetY }}
        transition={{
          duration: phase === "idle" ? 0 : DURATION,
          ease: EASING,
          delay: phase === "covering" ? DELAY : 0,
        }}
        onAnimationComplete={() => {
          if (phase !== "idle") setPhase("idle");
        }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: color,
        }}
      />
    </div>
  );
}
