"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

interface FollowImageProps {
  src: string;
  width?: number;
  height?: number;
}

export function FollowImage({ src, width = 320, height = 420 }: FollowImageProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const bounds = useRef({ left: 0, top: 0 });

  const updateBounds = useCallback(() => {
    const parent = imgRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    bounds.current = { left: rect.left, top: rect.top };
  }, []);

  useEffect(() => {
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [updateBounds]);

  useEffect(() => {
    const parent = imgRef.current?.parentElement;
    const img = imgRef.current;
    if (!parent || !img) return;

    const onEnter = () => {
      gsap.to(img, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(img, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" });
    };

    const onMove = (e: MouseEvent) => {
      updateBounds();
      const x = e.clientX - bounds.current.left;
      const y = e.clientY - bounds.current.top;
      gsap.to(img, {
        x: x - width / 2,
        y: y - height / 2,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    parent.addEventListener("mousemove", onMove);

    return () => {
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
      parent.removeEventListener("mousemove", onMove);
    };
  }, [updateBounds, width, height]);

  return (
    <div
      ref={imgRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        opacity: 0,
        scale: 0.9,
        zIndex: 0,
        borderRadius: "8px",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
