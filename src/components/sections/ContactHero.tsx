"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  SERVICE_TYPE_OPTIONS,
  type ContactFormData,
} from "@/lib/schemas/contact.schema";
import { contactService } from "@/services/contact.service";
import { ApiClientError } from "@/lib/api-client";

/**
 * ContactHero — fit en UN viewport, sin scroll.
 *
 * Layout grid 4 rows × 3 cols (incluida la línea separadora):
 *   Row 1 (top) → 1ra palabra grande | empty
 *   Row 2       → 2da palabra grande | eyebrow + descripción
 *   Row 3       → 3ra palabra grande | (continuación)
 *   Row 4 (bot) → 4ta palabra grande | contact info + socials
 *
 *   Footer abajo, separado del grid.
 */

const BIG_WORDS = ["Habla", "Crea", "Crece", "Conecta"];
// Indents tomados de douglus.site/contact: REACH=0, TALK=leve, BUILD=fuerte, CONNECT=vuelve
const BIG_WORD_INDENT = [0, 8, 12, 0]; // vw

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "¿Con qué tipo de clientes trabajan?",
    a: "Trabajamos con fundadores, agencias y empresas que quieren elevar su presencia digital. Desde startups buscando lanzar su primer sitio hasta marcas establecidas que necesitan rediseñar su web o automatizar procesos internos con n8n.",
  },
  {
    q: "¿Cuánto cuesta una página web?",
    a: "Depende del alcance. Una landing estática parte desde un rango accesible; un motion site con 3D y animaciones avanzadas implica más trabajo de diseño y desarrollo. Cuéntanos tu idea por el formulario y te enviamos un estimado real, no genérico.",
  },
  {
    q: "¿Cuánto tiempo toma desarrollar un sitio?",
    a: "Una landing de 1-3 secciones la entregamos en 1-2 semanas. Sitios con CMS, animaciones complejas o integraciones backend pueden tomar de 3 a 8 semanas. Te damos un cronograma claro antes de empezar.",
  },
  {
    q: "¿También hacen ERPs y automatizaciones?",
    a: "Sí. Construimos ERPs a medida con Next.js + Postgres y automatizamos procesos con n8n: leads, facturación, integraciones con WhatsApp, Notion, Google Sheets, etc. Si tienes un workflow manual que te hace perder horas, podemos automatizarlo.",
  },
  {
    q: "¿Cómo es el proceso de trabajo?",
    a: "1) Llamada inicial para entender tu visión y restricciones. 2) Propuesta con alcance, plazos y precio. 3) Diseño en figma con iteraciones. 4) Desarrollo con previews semanales. 5) Lanzamiento + transferencia. 6) Soporte continuo opcional.",
  },
  {
    q: "¿Ofrecen mantenimiento después del lanzamiento?",
    a: "Sí, con planes mensuales que incluyen actualizaciones de contenido, monitoreo de performance, correcciones y mejoras iterativas. Lo discutimos al cerrar el proyecto.",
  },
];

// Paleta tomada visualmente de douglus.site/contact
const COLOR_BG = "#EFE8D6";                           // crema/beige cálido del fondo
const COLOR_FG = "#0A0A0A";                           // negro casi puro para textos pequeños
const COLOR_BIG = "#2A2A2A";                          // negro suave (no tan oscuro) para las palabras grandes
const COLOR_MUTED = "rgba(10, 10, 10, 0.55)";          // labels EMAIL/PHONE/BASED
const COLOR_RULE = "rgba(10, 10, 10, 0.14)";           // separadores

type SubmitStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const inputBase =
  "w-full bg-transparent border-b py-3 text-[22px] font-normal tracking-[-0.02em] placeholder:text-black/35 focus:outline-none transition-colors";

const labelClass =
  "block mb-2 text-[11px] uppercase tracking-[0.18em]";
const labelStyle = {
  color: "rgba(10, 10, 10, 0.55)",
  fontFamily:
    'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
};

export function ContactHero() {
  const rootRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      serviceType: undefined,
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormData) => {
    setStatus({ state: "loading" });
    try {
      const res = await contactService.send(values);
      setStatus({ state: "success", message: res.message });
      reset();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Algo salió mal. Inténtalo de nuevo en un momento.";
      setStatus({ state: "error", message });
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const bigWords = root.querySelectorAll<HTMLElement>(".ch-big-word");
    const eyebrow = root.querySelectorAll<HTMLElement>(".ch-eyebrow-word");
    const subWords = root.querySelectorAll<HTMLElement>(".ch-sub-word");
    const infoRows = root.querySelectorAll<HTMLElement>(".ch-info-row");
    const sideText = root.querySelector<HTMLElement>(".ch-side");
    const footer = root.querySelectorAll<HTMLElement>(".ch-footer-item");
    const rule = root.querySelector<HTMLElement>(".ch-rule");

    // Palabras grandes: efecto "lines" del demo de GSAP SplitText
    // (splittext-demo/src/script.js). Cada palabra rota 100° hacia atrás en
    // el eje X con un pivot 3D 160px detrás (perspective en el wrap).
    gsap.set(bigWords, {
      rotationX: -100,
      transformOrigin: "50% 50% -160px",
      opacity: 0,
    });
    gsap.set(eyebrow, { yPercent: 110, opacity: 0 });
    gsap.set(subWords, { yPercent: 110, opacity: 0 });
    gsap.set(infoRows, { y: 24, opacity: 0 });
    if (sideText) gsap.set(sideText, { opacity: 0 });
    gsap.set(footer, { y: 16, opacity: 0 });
    if (rule) gsap.set(rule, { scaleY: 0, transformOrigin: "top center" });

    const tl = gsap.timeline({ delay: 0.45 });

    tl.to(eyebrow, {
      yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out",
    });
    tl.to(bigWords, {
      rotationX: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.25,
      ease: "power3",
    }, "-=0.45");
    if (rule) tl.to(rule, { scaleY: 1, duration: 0.9, ease: "power2.inOut" }, "-=0.7");
    tl.to(subWords, {
      yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.025, ease: "power2.out",
    }, "-=0.5");
    tl.to(infoRows, {
      y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out",
    }, "-=0.3");
    if (sideText) tl.to(sideText, { opacity: 1, duration: 0.5 }, "-=0.4");
    tl.to(footer, {
      y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out",
    }, "-=0.3");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-nav-theme="light"
      className="ch-root relative min-h-[100dvh] w-full flex flex-col"
      style={{ backgroundColor: COLOR_BG, color: COLOR_FG }}
    >
      {/* Fondo blanco-crema SOLO en la zona izquierda (palabras grandes).
          Color intermedio entre #FFFFFF y el crema del form (#EFE8D6)
          → división por color, sin línea visible.
          Ancho = padding-left (40) + columna 1 (3.5fr de 5fr) + gap completo (32). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden md:block"
        style={{
          width:
            "calc((100% - 80px - 1px - 64px) * 3.5 / 5 + 40px + 32px)",
          backgroundColor: "#F7F4EB",
          zIndex: 0,
        }}
      />

      {/* Spacer arriba para el nav fijo */}
      <div className="h-[80px] shrink-0" aria-hidden="true" />

      {/* Grid combinado: palabras + FAQ en col izq, form sticky en col der */}
      <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,3.5fr)_1px_minmax(0,1.5fr)] gap-x-8 px-6 md:px-10">
        {/* === Columna izquierda: palabras grandes + FAQ === */}
        <div style={{ gridColumn: 1 }} className="flex flex-col min-w-0">
          {/* Sub-grid de 4 rows para las palabras grandes (altura: 1 viewport) */}
          <div className="grid grid-rows-4 gap-y-5 h-[calc(100dvh-80px)] min-h-0">
            {BIG_WORDS.map((word, i) => (
              <div
                key={word}
                className="ch-word-wrap flex items-center"
                style={{
                  gridRow: i + 1,
                  marginLeft: `${BIG_WORD_INDENT[i] ?? 0}vw`,
                  overflow: "visible",
                  perspective: "500px",
                }}
              >
                <span
                  className="ch-big-word inline-block uppercase whitespace-nowrap"
                  style={{
                    fontSize: "clamp(105px, 26.5vh, 285px)",
                    lineHeight: 0.85,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: COLOR_BIG,
                    fontFamily:
                      'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* FAQ items, debajo de las palabras en la misma columna izquierda */}
          <div className="flex flex-col pt-16 pb-20">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>

        {/* Línea separadora vertical (invisible — solo división imaginaria).
            Se mantiene el div para que la animación GSAP siga teniendo target. */}
        <div
          className="ch-rule hidden md:block w-px"
          style={{ gridColumn: 2, backgroundColor: "transparent" }}
        />

        {/* Formulario — col 3, STICKY: sigue al scroll hasta el final del section */}
        <div
          className="hidden md:flex flex-col gap-5 justify-center"
          style={{
            gridColumn: 3,
            position: "sticky",
            top: "80px",
            alignSelf: "flex-start",
            height: "calc(100dvh - 80px)",
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-7"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="ch-info-row">
                <label
                  htmlFor="ch-name"
                  className={labelClass}
                  style={labelStyle}
                >
                  Nombre
                </label>
                <input
                  id="ch-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  className={inputBase}
                  style={{ borderBottomColor: COLOR_RULE, color: COLOR_FG }}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px]" style={{ color: "#B82D2D" }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="ch-info-row">
                <label
                  htmlFor="ch-company"
                  className={labelClass}
                  style={labelStyle}
                >
                  Empresa
                </label>
                <input
                  id="ch-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="(opcional)"
                  className={inputBase}
                  style={{ borderBottomColor: COLOR_RULE, color: COLOR_FG }}
                  {...register("company")}
                />
              </div>
            </div>

            <div className="ch-info-row">
              <label
                htmlFor="ch-email"
                className={labelClass}
                style={labelStyle}
              >
                Email
              </label>
              <input
                id="ch-email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className={inputBase}
                style={{ borderBottomColor: COLOR_RULE, color: COLOR_FG }}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-[11px]" style={{ color: "#B82D2D" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="ch-info-row">
              <label
                htmlFor="ch-service"
                className={labelClass}
                style={labelStyle}
              >
                Servicio
              </label>
              <select
                id="ch-service"
                defaultValue=""
                className={`${inputBase} appearance-none cursor-pointer`}
                style={{ borderBottomColor: COLOR_RULE, color: COLOR_FG }}
                {...register("serviceType")}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-[11px]" style={{ color: "#B82D2D" }}>
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            <div className="ch-info-row">
              <label
                htmlFor="ch-message"
                className={labelClass}
                style={labelStyle}
              >
                Mensaje
              </label>
              <textarea
                id="ch-message"
                rows={3}
                placeholder="Cuéntanos sobre tu proyecto"
                className={`${inputBase} resize-none`}
                style={{ borderBottomColor: COLOR_RULE, color: COLOR_FG }}
                {...register("message")}
              />
              {errors.message && (
                <p className="mt-1 text-[11px]" style={{ color: "#B82D2D" }}>
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status.state === "loading"}
              data-cursor-style="cta"
              className="ch-info-row group inline-flex items-center gap-3 self-start py-3 text-[18px] tracking-[-0.01em] disabled:opacity-50"
              style={{
                color: COLOR_FG,
                borderBottom: `1px solid ${COLOR_RULE}`,
              }}
            >
              <span>
                {status.state === "loading" ? "Enviando..." : "Enviar mensaje"}
              </span>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: COLOR_MUTED }}
              >
                →
              </span>
            </button>

            {status.state === "success" && (
              <p role="status" className="text-[12px]" style={{ color: "#2D7A3E" }}>
                ✓ {status.message}
              </p>
            )}
            {status.state === "error" && (
              <p role="alert" className="text-[12px]" style={{ color: "#B82D2D" }}>
                ✗ {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FaqItem — acordeón individual (pregunta + respuesta colapsable).
   ============================================================ */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = answerRef.current;
    if (!el) return;
    gsap.to(el, {
      height: open ? el.scrollHeight : 0,
      duration: 0.5,
      ease: "power3.inOut",
    });
  }, [open]);

  return (
    <div
      className="border-b"
      style={{ borderColor: COLOR_RULE }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-cursor-style="link"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        className="group flex w-full items-center justify-between py-6 text-left"
        style={{
          fontFamily:
            'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
        }}
      >
        <span
          className="font-medium leading-tight"
          style={{
            color: COLOR_FG,
            fontSize: "clamp(16px, 1.35vw, 22px)",
            letterSpacing: "-0.01em",
          }}
        >
          {q}
        </span>
        <span
          aria-hidden="true"
          className="ml-4 shrink-0 transition-transform duration-300"
          style={{
            color: COLOR_FG,
            fontSize: "clamp(20px, 1.5vw, 26px)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>

      <div
        ref={answerRef}
        id={`faq-answer-${index}`}
        style={{ height: 0, overflow: "hidden" }}
      >
        <p
          className="pb-6 max-w-[60ch] leading-relaxed"
          style={{
            color: COLOR_FG,
            opacity: 0.75,
            fontSize: "clamp(14px, 1vw, 16px)",
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}
