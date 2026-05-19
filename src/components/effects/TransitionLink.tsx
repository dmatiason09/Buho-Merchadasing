"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";
import { useTransition } from "@/providers/TransitionProvider";

// Mitad de la animación: delay(0.7s) + DURATION(3.2s)/2
// El panel cubre la pantalla en ese punto.
const COVER_MS = 2300;

interface TransitionLinkProps {
  href: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function TransitionLink({
  href,
  color,
  className,
  style,
  children,
}: TransitionLinkProps) {
  const router = useRouter();
  const { start } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Modificadores → dejar comportamiento nativo (nueva pestaña, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    // Stop propagation para que el PageTransition (capture-phase) no
    // intercepte clicks en estos links.
    e.stopPropagation();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      router.push(href);
      return;
    }

    start(color);
    setTimeout(() => {
      window.scrollTo(0, 0);
      router.push(href);
    }, COVER_MS);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
