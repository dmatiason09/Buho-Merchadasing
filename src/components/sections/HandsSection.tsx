"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 112;

function frameUrl(index: number) {
  return `/frames/frame_${String(index + 1).padStart(4, "0")}.webp`;
}

export function HandsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const drawFrame = (index: number) => {
      const i = Math.round(index);
      const img = framesRef.current[i];
      if (!img?.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = canvas.width, ch = canvas.height;
      // Escalar por ancho — ambas manos entran simétricamente desde los lados
      const scale = cw / img.naturalWidth;
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.drawImage(img, 0, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawFrame(stateRef.current.frame);
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      framesRef.current[i] = img;
      const idx = i;
      img.onload = () => {
        if (idx === 0) drawFrame(0);
        if (Math.round(stateRef.current.frame) === idx) drawFrame(idx);
      };
    }


    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(stateRef.current, {
      frame: TOTAL_FRAMES - 1,
      snap: "frame",
      ease: "none",
      onUpdate: () => drawFrame(stateRef.current.frame),
    });
    tl.to(stateRef.current, {
      frame: 0,
      snap: "frame",
      ease: "none",
      onUpdate: () => drawFrame(stateRef.current.frame),
    });

    /* ===== Auto-scroll coexistente con el usuario =====
       Solo desktop. Cuando entra a la sección, comienza un "soft chase"
       hacia el target. Si el usuario hace scroll manual, pausa.
       Cuando el usuario deja de hacer scroll, retoma desde donde quedó. */
    let autoScrollRaf: number | null = null;
    let downUsed = false;
    let upUsed = false;
    let isAutoScrolling = false;
    let lastUserScrollTime = 0;
    const USER_PAUSE_MS = 700;     // ms de pausa después del último input antes de retomar
    const SCROLL_SPEED = 0.85;     // px/ms = 850px/s — velocidad lineal constante

    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Detectar input REAL del usuario (no nuestro window.scrollTo)
    const markUserScroll = () => {
      lastUserScrollTime = performance.now();
    };
    const markUserKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) {
        lastUserScrollTime = performance.now();
      }
    };

    window.addEventListener("wheel", markUserScroll, { passive: true });
    window.addEventListener("touchmove", markUserScroll, { passive: true });
    window.addEventListener("keydown", markUserKey, { passive: true });

    const startAutoScroll = (direction: "down" | "up") => {
      if (!isDesktop) return;
      if (direction === "down" && downUsed) return;
      if (direction === "up" && upUsed) return;
      if (direction === "down") downUsed = true;
      else upUsed = true;

      isAutoScrolling = true;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionEnd = sectionTop + section.offsetHeight - window.innerHeight;
      const target = direction === "down" ? sectionEnd : sectionTop;

      // Si ya estamos cerca del target (o ya lo pasamos), no arrancamos:
      // evita el "jalón" hacia atrás si el usuario salió rápido de la sección.
      const currentY = window.scrollY;
      const alreadyPast =
        (direction === "down" && currentY >= target - 50) ||
        (direction === "up" && currentY <= target + 50);

      if (alreadyPast) {
        isAutoScrolling = false;
        return;
      }

      let lastFrameTime = performance.now();

      const step = (now: number) => {
        const dt = Math.min(now - lastFrameTime, 100);
        lastFrameTime = now;

        const userActive = now - lastUserScrollTime < USER_PAUSE_MS;
        const currentY = window.scrollY;
        const remaining = target - currentY;

        // Si el usuario salió de la sección en CUALQUIER dirección
        // (se pasó del final O se devolvió antes del inicio), cancelamos
        // el chase para no jalarlo de vuelta. Esto cubre los dos casos:
        //   1) Avanzó pasando sectionEnd (overshoot adelante)
        //   2) Retrocedió antes de sectionTop (huyó hacia atrás)
        const SECTION_MARGIN = 50;
        const escapedSection =
          currentY < sectionTop - SECTION_MARGIN ||
          currentY > sectionEnd + SECTION_MARGIN;
        if (escapedSection) {
          isAutoScrolling = false;
          autoScrollRaf = null;
          return;
        }

        // Llegamos suavemente al target (chase casi completado): snap al pixel
        if (
          (direction === "down" && currentY >= target - 1) ||
          (direction === "up" && currentY <= target + 1) ||
          Math.abs(remaining) < 1
        ) {
          window.scrollTo(0, target);
          isAutoScrolling = false;
          autoScrollRaf = null;
          return;
        }

        if (!userActive) {
          // Velocidad lineal constante: misma velocidad desde el inicio hasta el final
          const step = Math.min(Math.abs(remaining), SCROLL_SPEED * dt);
          const newY = currentY + Math.sign(remaining) * step;
          window.scrollTo(0, newY);
        }
        // Si userActive → no scrolleamos, dejamos al usuario en control

        autoScrollRaf = requestAnimationFrame(step);
      };
      autoScrollRaf = requestAnimationFrame(step);
    };

    // Detección precisa: dispara solo cuando el borde CRUZÓ el viewport
    let lastScrollY = window.scrollY;
    let prevSectionTop: number | null = null;
    let prevSectionBottom: number | null = null;

    const checkSectionEntry = () => {
      if (isAutoScrolling) {
        const rect = section.getBoundingClientRect();
        prevSectionTop = rect.top;
        prevSectionBottom = rect.bottom;
        lastScrollY = window.scrollY;
        return;
      }

      const current = window.scrollY;
      const dir: "up" | "down" =
        current > lastScrollY ? "down" : current < lastScrollY ? "up" : "down";
      lastScrollY = current;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // DOWN: section.top cruzó de positivo a cero/negativo (entró al viewport por arriba)
      if (
        dir === "down" &&
        !downUsed &&
        prevSectionTop !== null &&
        prevSectionTop > 0 &&
        rect.top <= 0
      ) {
        startAutoScroll("down");
      }

      // UP: section.bottom cruzó de menor a >= vh (entró al viewport por abajo)
      if (
        dir === "up" &&
        !upUsed &&
        prevSectionBottom !== null &&
        prevSectionBottom < vh &&
        rect.bottom >= vh
      ) {
        startAutoScroll("up");
      }

      prevSectionTop = rect.top;
      prevSectionBottom = rect.bottom;
    };
    window.addEventListener("scroll", checkSectionEntry, { passive: true });
    checkSectionEntry(); // baseline inicial

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", markUserScroll);
      window.removeEventListener("touchmove", markUserScroll);
      window.removeEventListener("keydown", markUserKey);
      window.removeEventListener("scroll", checkSectionEntry);
      if (autoScrollRaf !== null) cancelAnimationFrame(autoScrollRaf);
    };
  }, []);

  return (
    <section data-nav-theme="light" ref={sectionRef} className="relative h-[550vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">

        {/* Orbe radial gris pulsando suavemente detrás de todo */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            zIndex: 5,
            top: "50%",
            left: "50%",
            width: "min(80vh, 80vw)",
            height: "min(80vh, 80vw)",
            background:
              "radial-gradient(circle, rgba(100,100,100,0.75) 0%, rgba(140,140,140,0.45) 30%, rgba(170,170,170,0.2) 55%, rgba(200,200,200,0) 75%)",
            filter: "blur(20px)",
            animation: "orb-breathe 7s ease-in-out infinite",
            transformOrigin: "center",
          }}
        />

        {/* Texto detrás — visible donde no hay manos */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 10 }}>
          <h2
            className="text-center leading-[1.0] tracking-[-0.04em]"
            style={{ fontSize: "clamp(40px, 6.5vw, 96px)" }}
          >
            <span className="block font-normal text-black" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Hacemos que tengas
            </span>
            <span className="block" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              <span className="font-extrabold text-black">presencia</span>
              <span className="font-normal" style={{ color: "rgba(0,0,0,0.4)" }}> digitalmente</span>
            </span>
          </h2>
        </div>

        {/* Canvas encima — manos tapan el texto, fondo PNG transparente */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ zIndex: 20 }}
        />
      </div>
    </section>
  );
}
