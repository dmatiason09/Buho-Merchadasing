"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ServiciosFooter — sección vacía con el efecto slide-pinning-overscroll
 * intacto. Lista para repoblar con contenido nuevo.
 */

// Botón social con efecto magnético — el botón se atrae al cursor dentro
// de su zona y regresa con elastic al salir (ref: codepen GreenSock/azmKBBJ,
// overwrite: "auto" para tweens limpios)
const MagneticSocial = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const btn = btnRef.current;
    const icon = iconRef.current;
    if (!zone || !btn || !icon) return;
    const strength = 0.45;
    const iconStrength = 0.24; // icon se desplaza menos que el círculo → parallax

    const onMove = (e: MouseEvent) => {
      const rect = zone.getBoundingClientRect();
      const x = gsap.utils.mapRange(
        rect.left,
        rect.right,
        -rect.width / 2,
        rect.width / 2,
        e.clientX
      );
      const y = gsap.utils.mapRange(
        rect.top,
        rect.bottom,
        -rect.height / 2,
        rect.height / 2,
        e.clientY
      );
      gsap.to(btn, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(icon, {
        x: x * iconStrength,
        y: y * iconStrength,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
      gsap.to(icon, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    zone.addEventListener("mousemove", onMove);
    zone.addEventListener("mouseleave", onLeave);
    return () => {
      zone.removeEventListener("mousemove", onMove);
      zone.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={zoneRef}
      style={{
        width: "84px",
        height: "84px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <a
        ref={btnRef}
        href={href}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: "56px",
          height: "56px",
          border: "1.5px solid #ECE5D7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ECE5D7",
          textDecoration: "none",
          willChange: "transform",
        }}
      >
        <span
          ref={iconRef}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform",
          }}
        >
          {children}
        </span>
      </a>
    </div>
  );
};

// Renderiza un texto letra por letra dentro de máscaras 1em con dos copias
// stackeadas (top + bottom). Combinado con un padre `.cta-fly`, el hover sube
// las letras en cascada izquierda → derecha
const renderFlyText = (text: string) =>
  text.split("").map((c, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        overflow: "hidden",
        lineHeight: 1,
        height: "1em",
        verticalAlign: "top",
      }}
    >
      <span
        className="cta-fly-letter"
        style={{
          display: "block",
          transitionDelay: `${i * 0.025}s`,
        }}
      >
        <span style={{ display: "block", lineHeight: 1 }}>
          {c === " " ? " " : c}
        </span>
        <span style={{ display: "block", lineHeight: 1 }}>
          {c === " " ? " " : c}
        </span>
      </span>
    </span>
  ));

export function ServiciosFooter() {
  const rootRef = useRef<HTMLElement>(null);

  // SLIDE PINNING OVERSCROLL:
  // Pin la sección anterior cuando su top toca el top del viewport.
  // pinSpacing: false → el espacio se "colapsa", así el footer (que sigue en
  // su posición natural debajo) se desliza HACIA ARRIBA sobre la pineada
  // mientras el usuario sigue scrolleando.
  useEffect(() => {
    const footer = rootRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      const previousSection =
        footer.previousElementSibling as HTMLElement | null;
      if (!previousSection) return;

      ScrollTrigger.create({
        trigger: previousSection,
        // El pin arranca solo cuando el usuario YA pasó las imágenes —
        // cuando el bottom de ServiciosFeatured llega al bottom del viewport.
        start: "bottom bottom",
        end: () => `+=${footer.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={rootRef}
      data-nav-theme="dark"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1A1A1A",
        padding: "10vh 4vw 4vh",
        overflow: "hidden",
        color: "#ECE5D7",
      }}
    >
      {/* Pregúntale a la IA — 5 logos clickables que abren cada IA con un
          prompt pre-cargado preguntando sobre Aymacode Studio */}
      {(() => {
        const aiQuery =
          "¿Qué es Aymacode Studio? Cuéntame sobre este estudio creativo peruano que diseña y construye webs, aplicaciones web, ERPs hechos a medida y automatizaciones.";
        const q = encodeURIComponent(aiQuery);
        const aiLinks = [
          {
            name: "ChatGPT",
            url: `https://chatgpt.com/?q=${q}`,
            svg: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
              </svg>
            ),
          },
          {
            name: "Claude",
            url: `https://claude.ai/new?q=${q}`,
            svg: (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19M7 3l10 18M17 3L7 21M3 7l18 10M3 17l18-10" />
              </svg>
            ),
          },
          {
            name: "Perplexity",
            url: `https://www.perplexity.ai/search?q=${q}`,
            svg: (
              <span
                style={{
                  display: "inline-block",
                  width: "22px",
                  height: "22px",
                  backgroundColor: "currentColor",
                  WebkitMaskImage: "url(/icons/perplexity.png)",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url(/icons/perplexity.png)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            ),
          },
          {
            name: "Gemini",
            url: `https://gemini.google.com/app?q=${q}`,
            svg: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 C12 7 13 11 22 12 C13 13 12 17 12 22 C12 17 11 13 2 12 C11 11 12 7 12 2 Z" />
              </svg>
            ),
          },
          {
            name: "Grok",
            url: `https://grok.com/?q=${q}`,
            svg: (
              <span
                style={{
                  display: "inline-block",
                  width: "22px",
                  height: "22px",
                  backgroundColor: "currentColor",
                  WebkitMaskImage: "url(/icons/grok.png)",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url(/icons/grok.png)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            ),
          },
        ];
        return (
          <div
            style={{
              position: "absolute",
              bottom: "44vh",
              right: "10vw",
              display: "flex",
              flexDirection: "column",
              gap: "0.7em",
              zIndex: 2,
              color: "#ECE5D7",
              fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            }}
          >
            <span
              style={{
                fontSize: "clamp(13px, 1vw, 17px)",
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              Pregúntale a la IA sobre nosotros
            </span>
            <div
              style={{
                display: "flex",
                gap: "1em",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              {aiLinks.map((ai) => (
                <a
                  key={ai.name}
                  href={ai.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ai.name}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.25s ease",
                    willChange: "transform",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "scale(1)";
                  }}
                >
                  {ai.svg}
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Bloque de redes sociales — 4 círculos con efecto magnético,
          posicionados justo arriba de "ayma" en el lado izquierdo */}
      <div
        style={{
          position: "absolute",
          bottom: "44vh",
          left: "10vw",
          display: "flex",
          gap: "0",
          zIndex: 2,
        }}
      >
        <MagneticSocial href="https://www.linkedin.com/" label="LinkedIn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
          </svg>
        </MagneticSocial>
        <MagneticSocial href="https://www.instagram.com/" label="Instagram">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </MagneticSocial>
        <MagneticSocial href="https://www.tiktok.com/" label="TikTok">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31Z" />
          </svg>
        </MagneticSocial>
        <MagneticSocial href="https://x.com/" label="X (Twitter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </MagneticSocial>
      </div>

      {/* CTA "Colaboremos" — caja con outline, texto + flecha, arriba-izquierda */}
      <a
        className="cta-fly"
        href="/contacto"
        style={{
          position: "absolute",
          top: "15vh",
          left: "4vw",
          width: "min(40vw, 620px)",
          display: "block",
          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          fontSize: "clamp(38px, 4.2vw, 76px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "#ECE5D7",
          textDecoration: "none",
          zIndex: 2,
        }}
      >
        {/* Wrapper relativo — flex row arriba + línea animable abajo */}
        <div style={{ position: "relative", paddingBottom: "0.3em" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "inline-flex" }}>
              {renderFlyText("Colaboremos")}
            </span>
            <span style={{ marginLeft: "1em", fontSize: "0.9em" }}>→</span>
          </div>
          {/* Línea inferior — 2 sub-líneas que se replazan: la original
              corre hacia la izquierda, la nueva entra desde la derecha */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "2px",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <span className="cta-fly-line cta-fly-line-orig" />
            <span className="cta-fly-line cta-fly-line-new" />
          </div>
        </div>
      </a>
      <style>{`
        .cta-fly-letter {
          transform: translateY(0);
          transition: transform 0.35s cubic-bezier(0.7, 0, 0.2, 1);
        }
        .cta-fly:hover .cta-fly-letter {
          transform: translateY(-1em);
        }
        .cta-fly-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: currentColor;
          transition: transform 0.35s cubic-bezier(0.7, 0, 0.2, 1);
        }
        .cta-fly-line-new {
          transform: translateX(100%);
        }
        .cta-fly:hover .cta-fly-line-orig {
          transform: translateX(-100%);
        }
        .cta-fly:hover .cta-fly-line-new {
          transform: translateX(0);
        }
      `}</style>

      {/* Bloque de contacto arriba-derecha: dos pares label + email */}
      <div
        style={{
          position: "absolute",
          top: "5vh",
          right: "4vw",
          display: "flex",
          flexDirection: "column",
          gap: "2.5vh",
          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          color: "#ECE5D7",
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "clamp(15px, 1.2vw, 21px)",
              fontWeight: 500,
              letterSpacing: "-0.005em",
              marginBottom: "0.55em",
              opacity: 0.9,
            }}
          >
            Consultas Comerciales
          </div>
          <a
            className="cta-fly"
            href="mailto:studio@equipo-aymacode.com"
            style={{
              display: "inline-block",
              fontSize: "clamp(24px, 2.3vw, 38px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {renderFlyText("studio@equipo-aymacode.com")}
          </a>
        </div>
        <div>
          <div
            style={{
              fontSize: "clamp(15px, 1.2vw, 21px)",
              fontWeight: 500,
              letterSpacing: "-0.005em",
              marginBottom: "0.55em",
              opacity: 0.9,
            }}
          >
            Trabaja con nosotros
          </div>
          <a
            className="cta-fly"
            href="mailto:trabajo@equipo-aymacode.com"
            style={{
              display: "inline-block",
              fontSize: "clamp(24px, 2.3vw, 38px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {renderFlyText("trabajo@equipo-aymacode.com")}
          </a>
        </div>
      </div>

      {/* Copyright — sans bold uppercase, abajo-izquierda */}
      <div
        style={{
          position: "absolute",
          bottom: "3vh",
          left: "4vw",
          fontFamily:
            'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
          fontSize: "clamp(12px, 0.95vw, 16px)",
          fontWeight: 800,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "#ECE5D7",
          zIndex: 2,
        }}
      >
        © 2026 Aymacode Studio
      </div>

      {/* Wordmark gigante — fontSize en vw para que llene el ancho del viewport */}
      <h1
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          padding: "44vh 2vw 0 2vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"ARP Display", "Universo", sans-serif',
          fontSize: "22vw",
          fontWeight: 700,
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          color: "#ECE5D7",
          textAlign: "center",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        ayma
      </h1>
    </footer>
  );
}
