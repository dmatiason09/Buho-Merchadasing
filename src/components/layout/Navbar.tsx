"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SmearText } from "@/components/effects/SmearText";

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
  { href: "/contacto",   label: "Contacto",   transitionText: "CONTACTO" },
];

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

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

  const isDark = theme === "dark";
  // Inactivos: gris medio sobre el tema; activo: contrast pleno (estilo douglus)
  const inactiveColor = isDark ? "text-white/50" : "text-black/40";
  const activeColor = isDark ? "text-white" : "text-black";
  const logoSrc = isDark ? "/images/logo-white.png" : "/images/logo-black.png";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100000] flex items-center justify-between px-8 py-5">
      {/* Logo a la izquierda → vuelve al inicio */}
      <Link
        href="/"
        aria-label="Aymacode — Ir al inicio"
        data-transition
        data-transition-text="HOME"
        data-cursor-style="link"
        className="block transition-opacity hover:opacity-80"
      >
        <Image
          key={logoSrc}
          src={logoSrc}
          alt="Aymacode logo"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          priority
        />
      </Link>

      {/* Navegación al centro: Portafolio,Nosotros,Contacto — compact estilo douglus */}
      <ul
        className="flex items-center"
        style={{
          fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
          fontWeight: 700,
          fontSize: "clamp(18px, 1.4vw, 24px)",
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

      {/* Spacer derecho para mantener el flex centrado visualmente */}
      <div className="h-12 w-12" aria-hidden="true" />
    </nav>
  );
}
