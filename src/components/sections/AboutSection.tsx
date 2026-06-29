"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CURSOR_IMAGES = [
  "/images/manifesto/01.jpg",
  "/images/manifesto/02.jpg",
  "/images/manifesto/03.jpg",
  "/images/manifesto/04.jpg",
  "/images/manifesto/05.jpg",
  "/images/manifesto/06.jpg",
  "/images/manifesto/07.jpg",
  "/images/manifesto/08.jpg",
  "/images/manifesto/09.jpg",
  "/images/manifesto/10.jpg",
];

const BIG_TEXT = "Taller textil que fusiona diseño, confección y detalle — y convierte tu marca en prendas que la gente quiere usar.";
const SMALL_TEXT =
  "Producimos merch a medida en nuestra propia fábrica: controlamos cada prenda — tela, corte, estampado y acabado — para que tu marca se vea tan bien como la imaginaste.";

export function AboutSection() {
  const headingRef = useRef<HTMLParagraphElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const logoPanelRef = useRef<HTMLDivElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const smallTextRef = useRef<HTMLDivElement>(null);

  // Word-reveal del heading principal
  useEffect(() => {
    const root = headingRef.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLSpanElement>(".about-word"));

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
      raf = requestAnimationFrame(() => { update(); ticking = false; });
    };
    const io = new IntersectionObserver(
      (entries) => { inView = entries[0].isIntersecting; if (inView) update(); },
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

  // Animación de palabras del panel del logo (scroll-triggered, una sola vez)
  useEffect(() => {
    const panel = logoPanelRef.current;
    if (!panel) return;

    const bigWords = bigTextRef.current
      ? Array.from(bigTextRef.current.querySelectorAll<HTMLElement>(".split-word"))
      : [];
    const smallWords = smallTextRef.current
      ? Array.from(smallTextRef.current.querySelectorAll<HTMLElement>(".split-word"))
      : [];

    const ctx = gsap.context(() => {
      if (bigWords.length > 0) {
        gsap.fromTo(
          bigWords,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, stagger: 0.03, duration: 0.55, ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 70%", once: true },
          }
        );
      }
      if (smallWords.length > 0) {
        gsap.fromTo(
          smallWords,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, stagger: 0.025, duration: 0.5, ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 60%", once: true },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Cursor-following images
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const THRESHOLD = 220;
    const IMG_W = 170;
    const IMG_H = 225;
    const IMPULSE_FACTOR = 14;   // mientras más rápido el mouse, más se aleja
    const MAX_THROW = 750;       // cap máximo de distancia
    const GRAVITY_HINT = 20;     // sutil caída acumulada en Y
    let currentIdx = 0;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let prevX = 0;
    let prevY = 0;

    const pool = CURSOR_IMAGES.map((src) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = `
        position:fixed; pointer-events:none; z-index:100002;
        width:${IMG_W}px; height:${IMG_H}px;
        overflow:hidden; border-radius:6px;
        opacity:0; will-change:transform,opacity;
      `;
      const img = document.createElement("img");
      img.src = src;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      return wrap;
    });

    const showImage = (x: number, y: number, vx: number, vy: number) => {
      const el = pool[currentIdx % pool.length];
      currentIdx++;

      const speed = Math.hypot(vx, vy);
      // Impulso proporcional a velocidad del mouse — más rápido = más lejos
      const throwDistance = Math.min(speed * IMPULSE_FACTOR, MAX_THROW);
      const throwX = speed > 0 ? (vx / speed) * throwDistance : 0;
      const throwY = (speed > 0 ? (vy / speed) * throwDistance : 0) + GRAVITY_HINT;

      // Rotación: empieza pequeña, gira más mientras viaja según el impulso
      const rotStart = (Math.random() - 0.5) * 8;
      const rotEnd = rotStart + (Math.random() - 0.5) * (15 + speed * 0.15);

      // Duración del impulso también proporcional — anim corta y enérgica si vas rápido
      const impulseDuration = 0.7 + Math.min(speed / 100, 0.7);

      gsap.killTweensOf(el);
      gsap.set(el, {
        left: x - IMG_W / 2,
        top: y - IMG_H / 2,
        x: 0,
        y: 0,
        rotation: rotStart,
        scale: 0.65,
        opacity: 0,
      });

      const tl = gsap.timeline();

      // Aparece casi instantánea mientras YA está siendo impulsada
      tl.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.12,
        ease: "power2.out",
      }, 0);

      // IMPULSO — comienza al mismo tiempo que aparece, decelera al final (física)
      tl.to(el, {
        x: throwX,
        y: throwY,
        rotation: rotEnd,
        duration: impulseDuration,
        ease: "power3.out", // burst inicial fuerte que se va frenando
      }, 0);

      // Fade out mientras aún se desplaza por inercia (motion blur feel)
      tl.to(el, {
        opacity: 0,
        scale: 0.88,
        duration: 0.45,
        ease: "power1.in",
      }, impulseDuration * 0.55);
    };

    const onMouseMove = (e: MouseEvent) => {
      velX = e.clientX - prevX;
      velY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      const rect = section.getBoundingClientRect();
      const inSection =
        e.clientY >= rect.top && e.clientY <= rect.bottom &&
        e.clientX >= rect.left && e.clientX <= rect.right;
      if (!inSection) return;
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > THRESHOLD) {
        showImage(e.clientX, e.clientY, velX, velY);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      pool.forEach((el) => { gsap.killTweensOf(el); el.remove(); });
    };
  }, []);

  const firstPart = "Hacemos prendas que se ven y se sienten como nadie más.";
  const secondPart =
    " Cada pedido nace de entender tu marca, tu público y lo que te hace distinto. Diseño, tela y producción como una sola pieza — sin plantillas, sin atajos, sin compromisos.";

  return (
    <section
      ref={sectionRef}
      className="relative -mt-20 z-[99999]"
      style={{ background: "#ffffff" }}
    >
      {/* Nav theme zones */}
      <div data-nav-theme="light" className="pointer-events-none absolute inset-x-0 top-0 h-[28%]" aria-hidden="true" />
      <div data-nav-theme="light" className="pointer-events-none absolute inset-x-0 top-[28%] bottom-0" aria-hidden="true" />

      {/* Why Buho heading — guardado para después
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12 pt-4 md:pt-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[0.2fr_0.8fr] gap-x-8 items-start">
          <p className="m-0 mb-6 md:mb-0 font-medium" style={{ fontSize: "clamp(14px, 1.1vw, 18px)", letterSpacing: "-0.01em", color: "#000000", fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif' }}>
            Why Buho
          </p>
          <p ref={headingRef} className="m-0 font-display font-medium" style={{ fontSize: "clamp(22px, 2.3vw, 42px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#000000" }}>
            {firstPart} {secondPart}
          </p>
        </div>
      </div>
      */}

      {/* Logo panel — pantalla completa */}
      <div
        ref={logoPanelRef}
        style={{
          position: "relative",
          height: "100vh",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Texto vertical — creative studio */}
        <div
          style={{
            position: "absolute",
            left: "22vw",
            top: "40%",
            transform: "translateY(-50%) rotate(90deg)",
            transformOrigin: "center center",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            fontSize: "clamp(11px, 1vw, 15px)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#000000",
          }}
        >
          textile lab
        </div>

        {/* Logo grande — mitad izquierda, centrado verticalmente */}
        <div
          style={{
            position: "absolute",
            left: "2vw",
            top: "38%",
            transform: "translateY(-50%)",
            width: "clamp(320px, 36vw, 520px)",
            height: "clamp(320px, 36vw, 520px)",
          }}
        >
          <Image
            src="/images/logo-black.png"
            alt="Buho"
            fill
            className="object-contain"
          />
        </div>

        {/* Texto grande — mitad derecha, tercio superior */}
        <div
          ref={bigTextRef}
          style={{
            position: "absolute",
            left: "60%",
            top: "22%",
            maxWidth: "30%",
            pointerEvents: "none",
          }}
        >
          {BIG_TEXT.split(" ").map((word, i) => (
            <span
              key={i}
              className="split-word"
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: 0,
                fontFamily: '"Jumper", sans-serif',
                fontSize: "clamp(20px, 2.2vw, 36px)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#000000",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Texto pequeño — abajo izquierda */}
        <div
          ref={smallTextRef}
          style={{
            position: "absolute",
            left: "5vw",
            bottom: "8vh",
            maxWidth: "30%",
            pointerEvents: "none",
          }}
        >
          {SMALL_TEXT.split(" ").map((word, i) => (
            <span
              key={i}
              className="split-word"
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: 0,
                fontFamily: '"Jumper", sans-serif',
                fontSize: "clamp(15px, 1.4vw, 20px)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#0A0A0A",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Botones — abajo derecha */}
        <div
          style={{
            position: "absolute",
            bottom: "6vh",
            right: "5vw",
            width: "clamp(460px, 46vw, 640px)",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <Link
              href="/nosotros"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "10px 16px",
                fontFamily: '"Universo", sans-serif',
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1.5px solid #1a1a1a",
                borderRadius: "8px",
              }}
            >
              NOSOTROS ↗
            </Link>
          </div>
          <Link
            href="/nosotros"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "32px",
              backgroundColor: "#4a4a4a",
              color: "#ffffff",
              padding: "20px 100px 20px 32px",
              textDecoration: "none",
              width: "100%",
              border: "1.5px solid #1a1a1a",
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                fontFamily: '"Universo", sans-serif',
                fontSize: "clamp(13px, 1.1vw, 16px)",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              LA PRIMERA COSA QUE DEBES SABER DE NOSOTROS
            </span>
            <span
              style={{
                fontFamily: '"Britanica", sans-serif',
                fontSize: "clamp(28px, 3vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                transform: "translateX(-20px)",
              }}
            >
              01
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
