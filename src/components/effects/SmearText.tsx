"use client";

import { useId, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";

/**
 * SmearText — efecto "borrón horizontal" al hover (estilo douglus.site).
 *
 * Cómo funciona técnicamente:
 *   1. SVG <filter> con dos primitivas:
 *      - <feTurbulence> genera un patrón de ruido fractal con `baseFrequency="0 0.7"`,
 *        que crea variación SOLO en el eje Y (rayas horizontales).
 *      - <feDisplacementMap> usa ese ruido para empujar los píxeles del texto
 *        horizontalmente, según la intensidad del ruido en cada punto.
 *   2. En reposo, el `scale` del displacement está en 0 → el filtro es invisible.
 *   3. En hover, GSAP anima el `scale` a un valor alto (ej. 50) → los píxeles
 *      se desplazan según el ruido = borrón horizontal en franjas.
 *
 * Tunear:
 *   - `scale` prop más alto = más caótico. 20 sutil, 50 fuerte, 100 ilegible.
 *   - `baseFrequency` en X (primer valor): subirlo agrega variación horizontal
 *     (rompe en bloques verticales también). Mantener en 0 para borrón puro.
 *   - `baseFrequency` en Y (segundo valor): 0.3 = bandas anchas, 0.9 = bandas finas.
 */
export function SmearText({
  children,
  scale = 50,
  duration = 0.3,
  baseFrequency = "0 0.7",
  numOctaves = 2,
  className,
  style,
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
  baseFrequency?: string;
  numOctaves?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const filterId = useId().replace(/:/g, "_"); // useId genera ":r0:", inválido como id SVG
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const seedState = useRef({ seed: 1 });

  // Pulso: al entrar el mouse, el borrón sube → baja solo. Durante TODO el
  // pulso, el `seed` del feTurbulence se anima continuamente regenerando el
  // ruido en cada frame → las bandas horizontales "bailan" / fluyen en vez
  // de quedarse estáticas.
  const pulse = () => {
    const disp = dispRef.current;
    const turb = turbRef.current;
    if (!disp || !turb) return;
    gsap.killTweensOf([disp, seedState.current]);

    const totalDur = duration * 2 + 0.05;

    // Tween 1: intensidad del borrón (scale del displacement)
    gsap.timeline()
      .set(disp, { attr: { scale: 0 } })
      .to(disp, {
        attr: { scale },
        duration,
        ease: "power2.out",
      })
      .to(disp, {
        attr: { scale: 0 },
        duration: duration + 0.05,
        ease: "power2.inOut",
      });

    // Tween 2: movimiento de las bandas. Cambios de seed más espaciados
    // (15 en lugar de 80 sobre el mismo tiempo) → cada patrón se queda
    // visible ~45ms antes de regenerarse, así el ojo lo lee como FLUJO
    // en lugar de jitter. Ease `sine.inOut` suaviza el ritmo: cambios
    // lentos al inicio/final, más cadencia en el pico del pulso.
    gsap.to(seedState.current, {
      seed: seedState.current.seed + 15,
      duration: totalDur,
      ease: "sine.inOut",
      onUpdate: () => {
        turb.setAttribute("seed", String(Math.round(seedState.current.seed)));
      },
    });
  };

  return (
    <span
      onMouseEnter={pulse}
      className={className}
      style={{
        display: "inline-block",
        filter: `url(#smear-${filterId})`,
        ...style,
      }}
    >
      {/* SVG inline, contiene SÓLO el filtro (width/height 0 → no ocupa espacio).
          Cada instancia tiene un ID único para que no se pisen entre sí. */}
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
      >
        <defs>
          <filter id={`smear-${filterId}`}>
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </span>
  );
}
