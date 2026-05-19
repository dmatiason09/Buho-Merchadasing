"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const GIANT_TEXT =
  "LLEVAMOS AÑOS HACIENDO LO QUE LA INDUSTRIA RECIÉN ESTÁ APRENDIENDO";

const STUDIO_TEXT =
  "A creative studio merging design, motion and code into one inevitable piece.";

const HEADER_TEXT =
  "Led by a hyper-proactive perfectionist, PR Strategist turned Producer turned Creative Director who refuses to stay in a single lane.";

const SCATTERED_IMAGES = [
  { src: "/images/scroll-01.jpg", left: "8%",  top: "8%",  w: 370, rot: -3, z: 1 },
  { src: "/images/scroll-02.jpg", left: "68%", top: "22%", w: 340, rot: 4,  z: 3 },
  { src: "/images/scroll-03.jpg", left: "12%", top: "47%", w: 370, rot: 2,  z: 1 },
  { src: "/images/scroll-04.jpg", left: "67%", top: "62%", w: 320, rot: -4, z: 3 },
];

const LINE_VH = 0.45; // línea a 45% del viewport desde el top

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: '"Universo", sans-serif',
  fontSize: "clamp(36px, 7vw, 120px)",
  lineHeight: 0.92,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  textTransform: "uppercase",
  margin: 0,
  textAlign: "center",
};

export function ScrollTextReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const blackLayerRef = useRef<HTMLParagraphElement>(null);
  const grayLayerRef = useRef<HTMLParagraphElement>(null);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Wobble 2D en imágenes al scrollear
  useEffect(() => {
    const imgs = imgRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!imgs.length) return;

    // Rotaciones base de cada imagen (las del array SCATTERED_IMAGES)
    const baseRots = SCATTERED_IMAGES.map(img => img.rot);

    let lastY = window.scrollY;
    let raf = 0;
    let ticking = false;
    let stopTimer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;
        lastY = currentY;

        const wobble = gsap.utils.clamp(-18, 18, delta * 0.6);

        imgs.forEach((el, i) => {
          gsap.to(el, {
            rotation: baseRots[i] + wobble,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        // Volver a la rotación base cuando para el scroll
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
          imgs.forEach((el, i) => {
            gsap.to(el, {
              rotation: baseRots[i],
              duration: 0.8,
              ease: "elastic.out(1, 0.4)",
              overwrite: "auto",
            });
          });
        }, 80);

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(stopTimer);
    };
  }, []);

  useEffect(() => {
    const blackLayer = blackLayerRef.current;
    if (!blackLayer) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      const rect = blackLayer.getBoundingClientRect();
      const lineY = window.innerHeight * LINE_VH;
      // Capa NEGRA: clip todo lo que está POR DEBAJO de la línea
      const clipBottom = Math.max(0, rect.bottom - lineY);
      blackLayer.style.clipPath = `inset(0 0 ${clipBottom}px 0)`;
      // Capa GRIS: clip complementario — todo lo que está POR ENCIMA de la línea
      const grayLayer = grayLayerRef.current;
      if (grayLayer) {
        const gRect = grayLayer.getBoundingClientRect();
        const clipTop = Math.max(0, lineY - gRect.top);
        grayLayer.style.clipPath = `inset(${clipTop}px 0 0 0)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const words = GIANT_TEXT.split(" ");

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      className="relative w-full"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Header — guardado para después
      Led by text + buttons aquí
      */}

      {/* Contenedor del texto — scrollea normalmente */}
      <div
        style={{
          position: "relative",
          padding: "15vh 18vw 40vh",
          isolation: "isolate",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Scattered images */}
        {SCATTERED_IMAGES.map((img, i) => (
          <div
            key={i}
            ref={el => { imgRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: img.left,
              top: img.top,
              width: `clamp(${img.w * 0.5}px, ${img.w / 14}vw, ${img.w}px)`,
              transform: `rotate(${img.rot}deg)`,
              zIndex: img.z,
              borderRadius: "6px",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <img
              src={img.src}
              alt=""
              style={{ width: "100%", height: "auto", display: "block" }}
              loading="lazy"
            />
          </div>
        ))}

        {/* CAPA 1 — Texto gris, clipeado a SOLO mostrarse DEBAJO de la línea (complemento del negro) */}
        <p ref={grayLayerRef} style={{ ...TEXT_STYLE, color: "#655c4f", position: "relative", zIndex: 10, mixBlendMode: "difference" }}>
          {words.map((word, i) => (
            <span key={i} className="reveal-word" style={{ display: "inline-block", marginRight: "0.22em" }}>
              {word}
            </span>
          ))}
        </p>

        {/* CAPA 2 — Texto negro, recortado exactamente en la línea de 45vh
            clip-path se actualiza en cada scroll para que el corte quede fijo en el viewport */}
        <p
          ref={blackLayerRef}
          aria-hidden
          style={{
            ...TEXT_STYLE,
            color: "#ffffff",
            position: "absolute",
            top: "15vh",
            left: "18vw",
            right: "18vw",
            zIndex: 11,
            pointerEvents: "none",
            mixBlendMode: "difference",
          }}
        >
          {words.map((word, i) => (
            <span key={i} style={{ display: "inline-block", marginRight: "0.22em" }}>
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* Decorative tab — guardado para después
      <div style={{ position: "fixed", right: 0, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "center center", backgroundColor: "#E8530E", color: "#ffffff", padding: "6px 18px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", zIndex: 100, whiteSpace: "nowrap", pointerEvents: "none" }}>
        Site of the Day W.
      </div>
      */}
    </section>
  );
}
