"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 147;
const BASE_URL =
  "https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/";

const frameUrl = (i: number) =>
  `${BASE_URL}${String(i + 1).padStart(4, "0")}.jpg`;

export function AirpodsSequence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Ajustar canvas al tamaño de la ventana
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawFrame(playhead.frame);
    };

    const playhead = { frame: 0 };
    const images: HTMLImageElement[] = [];

    const drawFrame = (f: number) => {
      const i = Math.round(f);
      const img = images[i];
      if (!img?.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Centrar la imagen manteniendo aspect ratio (object-fit: contain)
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // Precargar todos los frames
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      images[i] = img;
      const idx = i;
      img.onload = () => {
        if (idx === 0) {
          resize();
          drawFrame(0);
        }
        if (Math.round(playhead.frame) === idx) drawFrame(idx);
      };
    }

    resize();
    window.addEventListener("resize", resize);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    tl.to(playhead, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      snap: "frame",
      onUpdate: () => drawFrame(playhead.frame),
    });

    return () => {
      window.removeEventListener("resize", resize);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="relative w-full"
      style={{ height: "500vh", backgroundColor: "#000" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </section>
  );
}
