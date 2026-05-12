"use client";

import { useEffect, useRef, useState } from "react";
import type { Application as SplineApp } from "@splinetool/runtime";

/**
 * Escena 3D de Spline (hero completo: fondo + logo + interacciones).
 *
 * - Carga la URL de la escena desde la env var NEXT_PUBLIC_SPLINE_SCENE_URL
 * - Tipado seguro con los tipos oficiales de @splinetool/runtime
 * - Cleanup correcto del runtime y los listeners
 * - State de loading visible para el usuario
 * - Manejo de errores con UI feedback
 * - Mata el badge "Built with Spline" de forma agresiva y permanente
 */
export function SplineHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL;
    if (!sceneUrl) {
      setError("Falta NEXT_PUBLIC_SPLINE_SCENE_URL en las env vars");
      setIsLoading(false);
      return;
    }

    let app: SplineApp | null = null;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;

    // Cargar Spline runtime dinámicamente (solo en cliente, evita errores SSR)
    (async () => {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (cancelled) return;
        app = new Application(canvas);
        await app.load(sceneUrl);
        if (cancelled) return;
        setIsLoading(false);

        // Eliminar badge "Built with Spline" — agresivo y permanente
        const styleTag = document.createElement("style");
        styleTag.textContent = `
          a[href*="spline.design"],
          a[href*="spline-watermark"],
          [class*="spline-watermark"],
          [id*="spline-badge"],
          a[target="_blank"][href*="spline"],
          div:has(> a[href*="spline.design"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -99999px !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        document.head.appendChild(styleTag);

        const killBadge = () => {
          document.querySelectorAll<HTMLAnchorElement>("a").forEach((el) => {
            if (el.href?.includes("spline.design") || el.innerText?.toLowerCase().includes("spline")) {
              el.remove();
            }
          });
          document.querySelectorAll<HTMLElement>("*").forEach((el) => {
            if (el.childElementCount === 0 && el.innerText?.trim().toLowerCase().includes("spline")) {
              el.closest("a, div")?.remove();
            }
          });
        };

        killBadge();
        // Mata el badge cada 200ms permanentemente — algunos badges reaparecen
        interval = setInterval(killBadge, 200);

        // MutationObserver detecta cuando Spline inyecta el badge en el DOM
        observer = new MutationObserver(() => killBadge());
        observer.observe(document.body, { childList: true, subtree: true });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setIsLoading(false);
        console.error("[SplineHero]", err);
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
    <>
      <canvas ref={canvasRef} className="spline-canvas" />
      {isLoading && <div className="loading-overlay">Cargando...</div>}
      {error && (
        <div className="loading-overlay" style={{ color: "#ff5757" }}>
          Error: {error}
        </div>
      )}
    </>
  );
}
