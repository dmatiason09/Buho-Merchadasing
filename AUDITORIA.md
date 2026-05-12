# AUDITORÍA — `aymacode-copia`

**Fecha:** 2026-05-12
**Auditor:** ingeniería frontend
**Rama de trabajo:** `cleanup/auditoria-2026-05-12`
**Snapshot inicial:** commit `ce1aba5` (`snapshot inicial antes de auditoria`) en `main`
**Backup físico:** `C:/dev/aymacode-copia-backup-2026-05-12/` (252 MB, sin `node_modules`/`.next`/`.git`)

---

## 0. Protocolo de seguridad — ejecutado

| Paso | Estado | Detalle |
|---|---|---|
| Repo git inicializado | ✅ | `git init` + commit `ce1aba5` con 319 archivos (respetando `.gitignore` existente) |
| Rama dedicada | ✅ | `cleanup/auditoria-2026-05-12` (off-`main`) |
| Backup físico fuera de git | ✅ | `../aymacode-copia-backup-2026-05-12/` |
| Entry points identificados | ✅ | Ver sección 2 |
| Línea base build/lint/type-check | ✅ | Ver sección 3 — **toda verde** |

**Nota sobre el backup:** robocopy excluyó `node_modules/` (regenerable con `npm install` desde `package-lock.json`) y `.next/` (cache de build). Si querés un backup 100% bit-exacto incluyéndolos, decime y lo añado.

**Nota sobre el snapshot:** `.env.local` (192 B, contiene config local) **NO** se commiteó porque `.gitignore` lo excluye correctamente; sigue intacto en disco. Tampoco se commiteó `node_modules/`, `.next/`, ni `tsconfig.tsbuildinfo`.

---

## 1. Estructura actual

```
aymacode-copia/
├── public/                     ← assets estáticos servidos por Next
│   ├── frames/                  112 PNG (HandsSection scrub)
│   │   └── bento-laptop/        120 JPG (BentoGallery laptop scrub)
│   ├── images/
│   │   ├── bento/               7 PNGs del bento gallery
│   │   ├── logo-black.png       ✓ usado (Navbar tema light)
│   │   ├── logo-white.png       ✓ usado (Navbar tema dark)
│   │   ├── logo.png             ✗ huérfano (88 KB)
│   │   └── pibble.jpg           ✗ huérfano (40 KB)
│   ├── scenes/
│   │   └── hero-aymacode.splinecode   ← cargado por SplineHero
│   └── videos/
│       ├── about-wide.mp4       ✓ usado en AboutSection (15 MB)
│       ├── about.mp4            ✗ huérfano (8.9 MB)
│       └── bento-laptop.mp4     ✗ huérfano (6.6 MB) — solo fuente ffmpeg
│
├── src/
│   ├── app/                    App Router de Next.js 15
│   │   ├── layout.tsx           layout raíz (fonts, metadata SEO)
│   │   ├── page.tsx             homepage = Hero+About+Hands+Bento
│   │   ├── globals.css          Tailwind v4 + CSS custom (377 líneas)
│   │   ├── icon.png             favicon
│   │   ├── api/contact/route.ts POST /api/contact
│   │   ├── contacto/page.tsx
│   │   └── servicios/page.tsx
│   ├── components/
│   │   ├── layout/              Navbar, SmoothScrollProvider
│   │   ├── effects/             Spline, LoadingScreen, CustomCursor, PageTransition, SmearText, ScrollResetOnMount
│   │   ├── sections/            Hero/About/Hands/Bento + Contact* + Servicios*
│   │   ├── forms/               ContactForm        ← huérfano
│   │   └── ui/                  vacío (placeholder, README lo menciona como "futuro")
│   ├── hooks/                   useParallax + useWordReveal  ← AMBOS huérfanos
│   ├── lib/
│   │   ├── api-client.ts        cliente HTTP centralizado
│   │   └── schemas/contact.schema.ts  Zod source-of-truth
│   ├── services/                contact.service
│   └── types/                   vacío (placeholder)
│
├── .claude/launch.json          config de debug local (no afecta build)
├── .env.example                 plantilla versionada
├── .env.local                   tus valores reales (gitignored)
├── .gitignore                   ✓ correcto
├── eslint.config.mjs            ESLint flat config (next/core-web-vitals + next/typescript)
├── next.config.ts               reactStrictMode + AVIF/WebP + optimizePackageImports
├── package.json                 React 19 + Next 15.5 + gsap + lenis + RHF + Zod
├── postcss.config.mjs           Tailwind v4
├── tsconfig.json                strict + paths @/*
├── README.md                    documentación (parcialmente desactualizada)
│
├── layered-pinning-with-infinite-loopingscrolltrigger/   ← demo codepen
├── scrubbed-bento-gallery/                              ← demo codepen
├── splittext-demo/                                       ← demo codepen
│
├── 202605120018.mp4              ← binarios sueltos en raíz
├── 202605120956.mp4
├── Video Project 2.mp4
├── Gemini_Generated_Image_*.png  (7 archivos)
└── (siguen) tsconfig.tsbuildinfo, next-env.d.ts, package-lock.json
```

---

## 2. Stack detectado

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 15.5.16** (App Router) | RSC + `"use client"` puntual |
| Runtime | **React 19** | |
| Lenguaje | **TypeScript 5.7** | `strict: true`, `paths: { "@/*": ["./src/*"] }` |
| Estilos | **Tailwind v4** + `globals.css` custom | `@tailwindcss/postcss` |
| Animación | **gsap 3.15** (ScrollTrigger + Flip) | |
| Smooth scroll | **lenis 1.3** | |
| 3D | **@splinetool/runtime 1.9** | carga dinámica client-side |
| Forms | **react-hook-form 7 + zod 3** | esquema compartido cliente/servidor |
| Fonts | **next/font/google** | Plus Jakarta Sans, DM Sans, IBM Plex Mono, Anton |
| Linter | **ESLint 9** (flat config) | `next/core-web-vitals` + `next/typescript` |

**Entry points / cómo correrlo:**

| Comando | Qué hace |
|---|---|
| `npm run dev` | Next dev server en `localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint via `next lint` (deprecado en Next 16) |
| `npm run type-check` | `tsc --noEmit` |

**Rutas del sitio:**

| URL | Archivo | Tipo |
|---|---|---|
| `/` | `src/app/page.tsx` | static |
| `/contacto` | `src/app/contacto/page.tsx` | static |
| `/servicios` | `src/app/servicios/page.tsx` | static |
| `POST /api/contact` | `src/app/api/contact/route.ts` | dynamic |

---

## 3. Línea base (estado pre-cambios)

| Verificación | Resultado | Observación |
|---|---|---|
| `npm run type-check` | ✅ exit 0 | sin errores |
| `npm run lint` | ✅ exit 0 | 7 warnings (no errores) — listados en sección 4 🟢 |
| `npm run build` | ✅ exit 0 | 6 rutas, First Load JS shared = 103 kB |

**Output completo del build:**

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      18 kB         166 kB
├ ○ /_not-found                            996 B         104 kB
├ ƒ /api/contact                           123 B         103 kB
├ ○ /contacto                            26.9 kB         157 kB
├ ○ /icon.png                                0 B            0 B
└ ○ /servicios                           2.32 kB         150 kB
+ First Load JS shared by all             103 kB
```

**Política:** cualquier cambio que rompa esta línea base se revierte (`git reset --hard HEAD~1`).

---

## 4. Hallazgos clasificados por riesgo

### 🟢 SEGURO — eliminación inmediata sin riesgo

Estos archivos / símbolos están definidos pero **ningún otro archivo del proyecto los importa o referencia**. Confirmado con grep global.

| # | Item | Ubicación | Justificación |
|---|---|---|---|
| 🟢-1 | Hook `useParallax` | [src/hooks/useParallax.ts](src/hooks/useParallax.ts) (64 líneas) | Sin imports en todo el repo |
| 🟢-2 | Hook `useWordReveal` | [src/hooks/useWordReveal.ts](src/hooks/useWordReveal.ts) (93 líneas) | Sin imports. `AboutSection` re-implementa el efecto inline |
| 🟢-3 | `ContactSection` | [src/components/sections/ContactSection.tsx](src/components/sections/ContactSection.tsx) (23 líneas) | Sin imports. `ContactHero` la reemplaza en `/contacto` |
| 🟢-4 | `ContactForm` | [src/components/forms/ContactForm.tsx](src/components/forms/ContactForm.tsx) (196 líneas) | Solo importado por `ContactSection` (también huérfano). El form que se usa en producción está inline en `ContactHero` |
| 🟢-5 | `LETTER_PATTERNS_LEGACY_DISABLED` | [src/components/effects/LoadingScreen.tsx:79-255](src/components/effects/LoadingScreen.tsx#L79) | 177 líneas, comentario propio dice "Patrones legacy desactivados". Lint warning explícito |
| 🟢-6 | `COLOR_ACCENT` const | [src/components/sections/ContactHero.tsx:62](src/components/sections/ContactHero.tsx#L62) | Definido, nunca usado. Lint warning |
| 🟢-7 | `stickyRef` | [src/components/sections/HandsSection.tsx:17](src/components/sections/HandsSection.tsx#L17) | `useRef` asignado, nunca usado. Lint warning |

Subtotal 🟢 al borrar: ~553 líneas de TS/TSX muerto + 2 archivos hook orfanados + 2 archivos contact orfanados.

---

### 🟡 PROBABLE / VERIFICABLE — bajo riesgo, mejor confirmar caso a caso

Estos elementos parecen no usarse pero ameritan que vos confirmes antes de borrar.

| # | Item | Tamaño / Ubicación | Por qué dudo |
|---|---|---|---|
| 🟡-1 | `public/images/logo.png` | 88 KB | Superado por `logo-black.png` + `logo-white.png`. Podría ser fallback de OG/Twitter card que no quisiste activar todavía |
| 🟡-2 | `public/images/pibble.jpg` | 40 KB | Sin referencias. Parece un archivo personal (Pibble = raza de pitbull) — borrable, pero querés conservarlo? |
| 🟡-3 | `public/videos/about.mp4` | **8.9 MB** | Sin referencias en src. Probablemente versión anterior de `about-wide.mp4` |
| 🟡-4 | `public/videos/bento-laptop.mp4` | **6.6 MB** | Sin referencias en src. Comentario en BentoGallery dice "Frame sequence generado con ffmpeg a partir del mp4" → es el material fuente, no se sirve. Podés moverlo fuera de `public/` |
| 🟡-5 | Carpeta `layered-pinning-with-infinite-loopingscrolltrigger/` | 21 KB | Descarga de codepen, solo referencia. No la usa el build |
| 🟡-6 | Carpeta `scrubbed-bento-gallery/` | 37 KB | Descarga de codepen referenciada en comentario de `globals.css:311`. Inspiración del BentoGallery final, no se usa en runtime |
| 🟡-7 | Carpeta `splittext-demo/` | 20 KB | Descarga de codepen, referenciada en comentario de `ContactHero.tsx:131`. Inspiración del rotationX hero, no se usa en runtime |
| 🟡-8 | `ApiError` interface | [src/lib/api-client.ts:27](src/lib/api-client.ts#L27) | Exportado, nunca importado externamente. Solo lo consume el constructor de `ApiClientError` en el mismo archivo. Bajar de `export` a privado, no eliminar |
| 🟡-9 | `apiClient.get/put/patch/delete` | [src/lib/api-client.ts:107-122](src/lib/api-client.ts#L107) | Métodos definidos pero nunca llamados (solo `.post`). Son la API genérica del cliente HTTP, **recomiendo conservar** — sirven para features futuras (blog, casos, suscripciones). No eliminar |
| 🟡-10 | Carpetas vacías `src/types/`, `src/components/ui/` | 0 archivos | README declara como "futuro". Conservar como placeholder de intención |
| 🟡-11 | README desincronizado | [README.md:53](README.md#L53) | Menciona `useScrollFade.ts` (no existe). Sección "Roadmap" tiene tareas marcadas no que el código sí cumplió. Doc-fix, no código |
| 🟡-12 | Comentario huérfano `useScrollFade` | [src/hooks/useParallax.ts:16](src/hooks/useParallax.ts#L16) | "Mismo patrón que useScrollFade" — referencia a hook que ya no existe. Tachar comentario |
| 🟡-13 | Lint warnings `<img>` (4 ocurrencias) | BentoGallery×2, ServiciosList, ServiciosManifesto | Deliberado: el control de scrub manual es más simple con `<img>` que con `next/image`. **No tocar**, pero podés añadir `// eslint-disable-next-line @next/next/no-img-element` para silenciar |

Total bytes recuperables si confirmás 🟡-1..🟡-7: ~15.6 MB (la mayor parte son los 2 mp4 huérfanos).

---

### 🔴 RIESGOSO — NO TOCAR sin tu OK explícito

Cosas que *parecen* limpieza pero podrían romper algo, requerir contexto que no tengo, o ser intencionales.

| # | Item | Ubicación | Por qué no tocar |
|---|---|---|---|
| 🔴-1 | Link `/portafolio` en Navbar | [src/components/layout/Navbar.tsx:19](src/components/layout/Navbar.tsx#L19) | La ruta `/portafolio` **no existe** → cualquier click va a 404. El README roadmap menciona "CMS para casos de estudio" → seguramente lo pensás agregar. **Bug real pero la solución es agregar la página, no eliminar el link.** Tu llamada |
| 🔴-2 | 7 imágenes Gemini en raíz | `Gemini_Generated_Image_*.png` (~55 MB total) | Material crudo, parece work-in-progress tuyo. NO lo borro. Recomiendo moverlo fuera del proyecto o a una carpeta `_raw-media/` gitignored |
| 🔴-3 | 3 videos sueltos en raíz | `202605120018.mp4` (13 MB), `202605120956.mp4` (6.6 MB), `Video Project 2.mp4` (14 MB) | Lo mismo. Material crudo personal en la raíz del repo |
| 🔴-4 | `console.log` en API route | [src/app/api/contact/route.ts:52](src/app/api/contact/route.ts#L52) | Logging intencional de leads. El comentario lo declara como "placeholder visible en consola del servidor durante desarrollo". Para prod habría que reemplazar por logger estructurado — **fuera de scope de limpieza**, es decisión de producto |
| 🔴-5 | SplineHero anti-watermark agresivo | [src/components/effects/SplineHero.tsx:48-87](src/components/effects/SplineHero.tsx#L48) | El componente inyecta CSS + `setInterval` + `MutationObserver` para eliminar el badge "Built with Spline". Si tu licencia Spline es Free, esto puede violar TOS. **Bandera ética/legal, no técnica.** Lo dejo intacto |
| 🔴-6 | `.claude/launch.json` | proyecto-local | Config personal de debug. Conservar |

---

### Bugs detectados (no relacionados con limpieza)

| Severidad | Bug | Ubicación |
|---|---|---|
| 🟠 medio | `<Link href="/portafolio">` lleva a 404 | [Navbar.tsx:19](src/components/layout/Navbar.tsx#L19) |
| 🟢 menor | README menciona hook `useScrollFade.ts` que no existe | [README.md:53](README.md#L53) |
| 🟢 menor | README roadmap dice "Sección de servicios" pending pero `/servicios` existe | [README.md:128](README.md#L128) |
| 🟢 informativo | `next lint` está deprecado, se removerá en Next 16 | output de lint |

### Seguridad

✅ **Ninguna API key hardcoded en `src/`**.
✅ `.env.local` correctamente excluido por `.gitignore`.
✅ `contactSchema.safeParse` server-side previene injection vía body malformado.
⚠️ Notar 🔴-5 (watermark Spline) como riesgo legal, no técnico.

### Accesibilidad

Esto no es de "limpieza" pero lo apunto para tu roadmap (no tocar ahora):
- Ningún componente respeta `prefers-reduced-motion`. Para un sitio con tanto motion es relevante.
- `CustomCursor` se desactiva en touch pero no en `prefers-reduced-motion`.
- LoadingScreen tarda varios segundos en `idle → revealing` y no tiene escape para usuarios con motion-sensitivity.

---

## 5. Propuesta de reorganización — NO EJECUTAR aún

Si aprobás Fase 2, esto sería la fase opcional posterior:

1. **Mover binarios sueltos de la raíz a `_raw-media/`** y añadir `_raw-media/` al `.gitignore`. Saca ~75 MB de la raíz visible.
2. **Eliminar carpetas codepen `layered-pinning-...`, `scrubbed-bento-gallery/`, `splittext-demo/`** (~78 KB). Si querés conservarlas como referencia, mover a `_references/` y gitignorear, o dejarlas — pesan poco.
3. **Crear `docs/` y mover README** ahí (futuro). Por ahora dejar el README en raíz pero **actualizarlo** (corregir useScrollFade, marcar tareas del roadmap completadas).
4. **Carpetas `src/types/` y `src/components/ui/` vacías**: conservar — son intención documentada.

**No propongo** cambios estructurales más profundos (renaming, splits de archivos grandes como `LoadingScreen.tsx` de 1306 líneas). Eso es refactor, no limpieza.

---

## 6. Plan de ejecución sugerido (si aprobás Fase 2)

Orden estricto: 🟢 → verificar build/lint/type-check → 🟡 (caso a caso con tu OK) → 🔴 (sólo si lo pedís explícitamente).

**Commits planificados** (uno por cambio lógico):

| # | Commit | Tipo |
|---|---|---|
| 1 | `chore: elimina hook huérfano useParallax` | 🟢 |
| 2 | `chore: elimina hook huérfano useWordReveal` | 🟢 |
| 3 | `chore: elimina ContactSection y ContactForm huérfanos` (un commit por la dependencia entre ellos) | 🟢 |
| 4 | `chore: elimina constante LETTER_PATTERNS_LEGACY_DISABLED muerta` | 🟢 |
| 5 | `chore: elimina COLOR_ACCENT no usado` | 🟢 |
| 6 | `chore: elimina stickyRef no usado` | 🟢 |
| 7 | `chore: actualiza README — corrige referencia a useScrollFade y refleja estado actual` | 🟡 doc-fix |
| (8...) | Resto de 🟡 — **pregunto antes de cada uno** | 🟡 |
| (?) | 🔴 — **no se tocan sin OK explícito tuyo caso a caso** | 🔴 |

Tras cada commit: `npm run lint && npm run type-check && npm run build` para confirmar que la línea base sigue intacta.

---

## 7. Cómo abortar si algo sale mal

```bash
# revertir el último commit (mantiene el código previo)
git reset --hard HEAD~1

# volver al estado pre-auditoría completamente
git checkout main

# o restaurar desde el backup físico
# (si por algún motivo perdés la rama)
robocopy "C:\dev\aymacode-copia-backup-2026-05-12" "C:\dev\aymacode-copia" /E /XD .git
```

---

## 8. Decisión que necesito de vos antes de Fase 2

1. **¿OK para ejecutar los 7 items 🟢?** (responde "sí 🟢" o equivalente)
2. **De los 🟡:** ¿algún caso que querés discutir? Si no, los reviso uno por uno preguntando antes de cada borrado.
3. **🔴-1 (`/portafolio` 404):** ¿lo dejo como está, lo escondo del nav, o lo dejás para cuando lo construyas?
4. **🔴-2 y 🔴-3 (binarios crudos en raíz):** ¿los muevo a `_raw-media/` + gitignore, o no los toco?

Cuando me confirmes, ejecuto Fase 2 con commits atómicos y verificación tras cada uno.
