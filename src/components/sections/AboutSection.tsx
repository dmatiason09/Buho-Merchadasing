"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AboutSection() {
  const videoRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);

  // Curtain reveal del video (clip-path) cuando entra al viewport.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          gsap.fromTo(
            el,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 2.6,
              ease: "power2.inOut",
            }
          );
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Word-reveal del heading: cada palabra arranca opacidad baja y se revela
  // conforme su centro vertical cruza una banda del viewport (efecto Refokus).
  useEffect(() => {
    const root = headingRef.current;
    if (!root) return;
    const words = Array.from(
      root.querySelectorAll<HTMLSpanElement>(".about-word")
    );

    let raf = 0;
    let ticking = false;
    let inView = false;

    const update = () => {
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.4;
      for (const w of words) {
        const rect = w.getBoundingClientRect();
        const cy = rect.top + rect.height / 2;
        let op = 0.2;
        if (cy < end) op = 1;
        else if (cy < start) op = 0.2 + ((start - cy) / (start - end)) * 0.8;
        w.style.opacity = op.toFixed(2);
      }
    };
    const onScroll = () => {
      if (!inView || ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        if (inView) update();
      },
      { threshold: 0, rootMargin: "100px" }
    );
    io.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const firstPart =
    "Hacemos sitios que se ven y se sienten como nadie más.";
  const secondPart =
    " Cada proyecto nace de entender tu visión, tu mercado y lo que te hace distinto. Diseño, código y motion como una sola pieza — sin plantillas, sin atajos, sin compromisos.";

  return (
    <section
      className="relative -mt-20 z-[99999] pb-24 pt-32 md:pt-40"
      style={{
        background:
          "linear-gradient(to bottom, #ffffff 0%, #ffffff 8%, #f0f0f0 12%, #c8c8c8 18%, #888888 24%, #404040 32%, #000000 42%, #000000 100%)",
      }}
    >
      {/* Zonas para el navbar adaptive: top claro, bottom oscuro */}
      <div
        data-nav-theme="light"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28%]"
        aria-hidden="true"
      />
      <div
        data-nav-theme="dark"
        className="pointer-events-none absolute inset-x-0 top-[28%] bottom-0"
        aria-hidden="true"
      />

      {/* Heading arriba — eyebrow "Why Aymacode" a la izquierda + texto medio a la derecha
          (estilo findrealestate.com: primera frase en blanco, continuación en gris). */}
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12 mt-48 md:mt-72">
        <div className="grid grid-cols-1 md:grid-cols-[0.2fr_0.8fr] gap-x-8 items-start">
          <p
            className="m-0 mb-6 md:mb-0 font-medium"
            style={{
              fontSize: "clamp(14px, 1.1vw, 18px)",
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              fontFamily:
                'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            }}
          >
            Why Aymacode
          </p>
          <p
            ref={headingRef}
            className="m-0 font-display font-medium"
            style={{
              fontSize: "clamp(22px, 2.3vw, 42px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {firstPart.split(/\s+/).map((w, i) => (
              <span
                key={`a-${i}`}
                className="about-word inline-block transition-opacity duration-300"
                style={{ marginRight: "0.28em", opacity: 0.2 }}
              >
                {w}
              </span>
            ))}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>
              {secondPart.split(/\s+/).map((w, i) => (
                <span
                  key={`b-${i}`}
                  className="about-word inline-block transition-opacity duration-300"
                  style={{ marginRight: "0.28em", opacity: 0.2 }}
                >
                  {w}
                </span>
              ))}
            </span>
          </p>
        </div>
      </div>

      {/* Video full-width debajo */}
      <div className="relative mt-20 md:mt-28 px-6 md:px-12">
        <div
          ref={videoRef}
          className="relative mx-auto w-full max-w-[1800px] overflow-hidden rounded-[10px]"
          style={{
            aspectRatio: "16 / 9",
            clipPath: "inset(0% 0% 100% 0%)",
          }}
        >
          <video
            src="/videos/about-wide.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Aymacode"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
