"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * PageTransition — estilo douglus.site
 *
 * Efecto cortina con SVG path morph (curva orgánica, no rectángulo plano):
 *   1. User hace click en un Link → interceptamos
 *   2. SVG path morphs de "debajo de la pantalla" → cubre el viewport (cortina sube)
 *   3. Aparece el texto destino con SplitText word-by-word
 *   4. Router.push a la nueva URL
 *   5. SVG path morphs de "cubriendo" → "encima de la pantalla" (cortina termina)
 *   6. Texto sale con reverse
 *
 * Para usar: envuelve tus Links con <TransitionLink href="...">Texto</TransitionLink>
 * o agrega data-transition-text="CONTACT" a un <a>.
 */

// Paths SVG con curvas BEZIER CUBIC pronunciadas (bow orgánico estilo douglus).
// viewBox: 0 0 1280 1000. Cada path tiene EXACTAMENTE la misma estructura
// (M, C, L, C, Z) para que GSAP haga morph suave entre ellos.
//
// La curtain es una "lasca" con AMBAS edges curvadas (top bow up, bottom bow up):
//   - Top edge: peak en center (-200 más arriba que los sides)
//   - Bottom edge: peak en center (también bow up)
//
// PATH_INITIAL: lasca está ENTERAMENTE debajo del viewport (invisible)
const PATH_INITIAL =
  "M 0 1100 C 426 1000 854 1000 1280 1100 L 1280 2100 C 854 2000 426 2000 0 2100 Z";
// PATH_MID: lasca cubre todo el viewport — top edge encima del viewport,
//           bottom edge debajo del viewport
const PATH_MID =
  "M 0 -100 C 426 -300 854 -300 1280 -100 L 1280 1200 C 854 1000 426 1000 0 1200 Z";
// PATH_OUT: lasca está ENTERAMENTE encima del viewport (terminó de salir)
const PATH_OUT =
  "M 0 -1100 C 426 -1300 854 -1300 1280 -1100 L 1280 -100 C 854 -300 426 -300 0 -100 Z";

export function PageTransition() {
  const pathRef = useRef<SVGPathElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const ruleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [destText, setDestText] = useState("");
  const isAnimatingRef = useRef(false);
  // Timeline activo: lo guardamos para poder matarlo si entra un click nuevo
  // antes de que termine. Sin esto, la timeline vieja seguiría ejecutándose
  // y haría router.push() al destino antiguo, sobrescribiendo al nuevo.
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  /** Dispara la animación cortina hacia una URL */
  const navigate = useCallback(
    (href: string, text?: string) => {
      // Click rápido durante una animación previa: matamos la animación
      // vieja (eso dispara onInterrupt → libera el flag) y navegamos directo
      // al nuevo destino sin animación. Esto previene 2 bugs:
      //   1. Clicks "comidos" silenciosamente (flag stuck en true).
      //   2. Timeline vieja haciendo router.push() al destino viejo después
      //      de que el usuario ya pidió otro destino.
      if (isAnimatingRef.current) {
        activeTimelineRef.current?.kill();
        activeTimelineRef.current = null;
        isAnimatingRef.current = false;
        router.push(href);
        return;
      }
      isAnimatingRef.current = true;

      const displayText = text || hrefToText(href);
      // Limpiar antes del re-render para que los callback refs vuelvan a
      // llenar el array con los <span> del nuevo texto (no quedan stale).
      wordsRef.current = [];
      // flushSync fuerza el re-render sincrónico para que los <span> existan
      // ANTES de armar la timeline. Sin esto, wordsRef.current estaría vacío
      // al construir el tween y el texto no se animaría.
      flushSync(() => setDestText(displayText));

      const path = pathRef.current;
      const stage = stageRef.current;
      const rule = ruleRef.current;
      if (!path || !stage) {
        // Refs no listos: liberar flag y navegar directo, no dejar
        // el flag colgado bloqueando futuras navegaciones.
        isAnimatingRef.current = false;
        router.push(href);
        return;
      }

      // Reset
      path.setAttribute("d", PATH_INITIAL);
      gsap.set(stage, { opacity: 0 });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });

      // Safety timeout: si la timeline falla o queda colgada por cualquier
      // motivo (navegación externa, error de GSAP, etc.), liberamos el flag
      // después de 6s (la animación dura ~4.1s, así que 6s es margen seguro).
      const safetyTimeout = setTimeout(() => {
        isAnimatingRef.current = false;
      }, 6000);

      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(safetyTimeout);
          activeTimelineRef.current = null;
          isAnimatingRef.current = false;
        },
        onInterrupt: () => {
          // Si la timeline es interrumpida (e.g. otro tween la kill),
          // también debemos liberar el flag.
          clearTimeout(safetyTimeout);
          activeTimelineRef.current = null;
          isAnimatingRef.current = false;
        },
      });
      activeTimelineRef.current = tl;

      // 1. Sube la cortina (curva orgánica de abajo a cubriendo)
      //    power4.inOut + duración mayor = sensación SUPER smooth
      tl.to(path, {
        attr: { d: PATH_MID },
        duration: 1.2,
        ease: "power4.inOut",
      });

      // 2. Aparece el texto destino con stagger word-by-word
      tl.to(stage, { opacity: 1, duration: 0.25 }, "-=0.45");
      tl.fromTo(
        wordsRef.current,
        { y: "110%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.65, stagger: 0.06, ease: "power3.out" },
        "-=0.3"
      );

      // 2b. La línea horizontal se "dibuja" de izquierda a derecha
      if (rule) {
        tl.to(
          rule,
          { scaleX: 1, duration: 0.7, ease: "power3.out" },
          "-=0.45"
        );
      }

      // 3. Pausa visible mientras se ve el texto destino
      tl.to({}, { duration: 0.55 });

      // 4. Navegar (cambio de página detrás de la cortina)
      tl.add(() => {
        router.push(href);
      });

      // 5. Sale el texto (slide up + fade) y la línea se retrae hacia la derecha
      tl.to(wordsRef.current, {
        y: "-110%",
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: "power3.in",
      });
      if (rule) {
        tl.to(
          rule,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.5,
            ease: "power3.in",
          },
          "<"
        );
      }

      // 6. La cortina sale por arriba con curva morphing
      tl.to(
        path,
        {
          attr: { d: PATH_OUT },
          duration: 1.2,
          ease: "power4.inOut",
        },
        "-=0.25"
      );
    },
    [router]
  );

  // Intercepta clicks en links con [data-transition] o cualquier <a> interno
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      const target = (e.target as Element)?.closest?.<HTMLAnchorElement>("a[data-transition], a[data-transition-text]");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;
      // Si es el mismo path, ignorar
      if (href === pathname) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      // Detener propagación: si dejamos seguir el evento, el onClick del
      // <Link> de Next.js correrá después y hará router.push() sin animación.
      e.stopPropagation();
      const text = target.dataset.transitionText;
      navigate(href, text);
    };

    // capture: true → corre ANTES que el onClick del <Link> de Next.js
    // (que ya hace e.preventDefault() para hacer router.push). Si esperáramos
    // a la fase de bubble, defaultPrevented sería true y abortaríamos.
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate, pathname]);

  const words = destText.split(" ");

  return (
    <div className="transition-overlay" aria-hidden="true">
      <svg className="overlay-svg" viewBox="0 0 1280 1000" preserveAspectRatio="none">
        <path ref={pathRef} className="overlay__path" d={PATH_INITIAL} />
      </svg>
      <div ref={stageRef} className="transition-stage">
        <div className="ts-identity">
          <div className="ts-line ts-line--dest">
            {words.map((w, i) => (
              <span
                key={`${destText}-${i}`}
                ref={(el) => {
                  if (el) wordsRef.current[i] = el;
                }}
                className="ts-word"
              >
                {w}
              </span>
            ))}
          </div>
          <div ref={ruleRef} className="ts-rule" />
        </div>
      </div>
    </div>
  );
}

/** Convierte una URL en texto legible para mostrar como destino */
function hrefToText(href: string): string {
  const clean = href.replace(/^\//, "").replace(/\/$/, "");
  if (!clean) return "HOME";
  return clean.replace(/-/g, " ").toUpperCase();
}
