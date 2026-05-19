"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SmearText } from "@/components/effects/SmearText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Navbar adaptive: el logo y los links cambian de color según
 * el fondo de la sección sobre la que está posicionado el navbar.
 *
 * Cada sección/zona del sitio tiene un atributo `data-nav-theme`
 * ("light" o "dark"). El navbar lee qué zona está actualmente
 * detrás de su posición vertical y aplica el tema correspondiente.
 */

const NAV_LINKS = [
  { href: "/portafolio", label: "Portafolio", transitionText: "PORTAFOLIO" },
  { href: "/servicios",  label: "Servicios",  transitionText: "SERVICIOS" },
  { href: "/nosotros",   label: "Nosotros",   transitionText: "NOSOTROS"   },
  { href: "/contacto",   label: "Contacto",   transitionText: "CONTACTO"   },
];

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const NAVBAR_Y = 40;

    const updateTheme = () => {
      const zones = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
      let current: "light" | "dark" = "light";
      for (const zone of Array.from(zones)) {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= NAVBAR_Y && rect.bottom > NAVBAR_Y) {
          const t = zone.dataset.navTheme;
          if (t === "light" || t === "dark") current = t;
        }
      }
      setTheme(current);
    };

    updateTheme();
    window.addEventListener("scroll", updateTheme, { passive: true });
    window.addEventListener("resize", updateTheme);

    return () => {
      window.removeEventListener("scroll", updateTheme);
      window.removeEventListener("resize", updateTheme);
    };
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const showAnim = gsap.from(nav, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: "power2.inOut",
    }).progress(1);

    const st = ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
        } else {
          // Solo ocultar si ya scrolleamos un poco (no en el top)
          if (window.scrollY > 100) showAnim.reverse();
        }
      },
    });

    return () => {
      st.kill();
      showAnim.kill();
    };
  }, []);

  const isDark = theme === "dark";
  const isHome = pathname === "/";
  // Inactivos: gris medio sobre el tema; activo: contrast pleno (estilo douglus)
  const inactiveColor = isDark ? "text-white/50" : "text-black/40";
  const activeColor = isDark ? "text-white" : "text-black";
  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-[100000] flex items-center justify-between px-12 py-6">

      {/* Logo — solo visible fuera del home */}
      <Link
        href="/"
        aria-label="Inicio"
        data-transition
        data-transition-text="HOME"
        className={`transition-opacity duration-300 ${isHome ? "pointer-events-none opacity-0" : "opacity-100"}`}
        tabIndex={isHome ? -1 : 0}
      >
        <div style={{ position: "relative", width: "clamp(48px, 5vw, 72px)", height: "clamp(48px, 5vw, 72px)" }}>
          <Image
            src={isDark ? "/images/logo-white.webp" : "/images/logo-black.png"}
            alt="Aymacode"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      <ul
        className="flex items-center"
        style={{
          fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
          fontWeight: 700,
          fontSize: "clamp(22px, 2vw, 32px)",
          letterSpacing: "-0.01em",
        }}
      >
        {NAV_LINKS.map((link, i) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href} className="flex items-center">
              <Link
                href={link.href}
                data-transition
                data-transition-text={link.transitionText}
                data-cursor-style="link"
                className={`transition-colors hover:opacity-80 ${
                  isActive ? activeColor : inactiveColor
                }`}
              >
                <SmearText scale={50}>{link.label}</SmearText>
              </Link>
              {i < NAV_LINKS.length - 1 && (
                <span className={`${inactiveColor} select-none`}>,</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
