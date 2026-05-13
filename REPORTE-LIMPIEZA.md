# REPORTE DE LIMPIEZA — `aymacode-copia`

**Fecha:** 2026-05-12
**Rama:** `cleanup/auditoria-2026-05-12` (off-`master`)
**Snapshot pre-limpieza:** commit `ce1aba5`
**Backup físico:** `C:/dev/aymacode-copia-backup-2026-05-12/`

---

## 1. Cambios aplicados (8 commits, todos 🟢 seguros)

| Commit | Tipo | Resumen |
|---|---|---|
| `47e078f` | chore | Elimina hook huérfano `useParallax` (64 líneas) |
| `9fbd305` | chore | Elimina hook huérfano `useWordReveal` (93 líneas) |
| `f48bad9` | chore | Elimina `ContactSection` + `ContactForm` huérfanos (219 líneas) |
| `fa6b829` | chore | Elimina constante `LETTER_PATTERNS_LEGACY_DISABLED` muerta (178 líneas) |
| `8d1f709` | chore | Elimina constante `COLOR_ACCENT` no usada |
| `88a02e5` | chore | Elimina `stickyRef` no usado en `HandsSection` |
| `0efc73b` | docs | Actualiza README: corrige referencias a hooks inexistentes y marca roadmap |
| `25983c8` | docs | Añade `AUDITORIA.md` (reporte de la fase 1) |

### Por categoría

**Archivos eliminados (con `git rm`, recuperables desde historia):**
- `src/hooks/useParallax.ts`
- `src/hooks/useWordReveal.ts`
- `src/components/sections/ContactSection.tsx`
- `src/components/forms/ContactForm.tsx`
- *(carpeta `src/hooks/` quedó vacía y el filesystem la removió automáticamente)*

**Símbolos / código eliminado (Edit, dentro de archivos que se conservan):**
- `LETTER_PATTERNS_LEGACY_DISABLED` en [LoadingScreen.tsx](src/components/effects/LoadingScreen.tsx)
- `COLOR_ACCENT` en [ContactHero.tsx](src/components/sections/ContactHero.tsx)
- `stickyRef` en [HandsSection.tsx](src/components/sections/HandsSection.tsx)

**Documentación corregida:**
- `README.md`: quitada referencia a `useScrollFade.ts` (nunca existió) y `useWordReveal.ts` (eliminado). Roadmap actualizado con tareas ya completadas (`/servicios`, `/contacto`, HandsSection, BentoGallery).

**Bugs corregidos:** ninguno en esta pasada. Los bugs detectados se documentaron pero no se tocaron (ver sección 2).

**Carpetas movidas / renombradas:** ninguna.

### Stats

```
9 files changed, 303 insertions(+), 562 deletions(-)
```

(303 inserciones son del nuevo `AUDITORIA.md`. El balance neto de código fuente es **−562 líneas muertas**.)

### Verificación final

| Check | Baseline (antes) | Estado final |
|---|---|---|
| `npm run type-check` | ✅ 0 errores | ✅ 0 errores |
| `npm run lint` | ⚠️ 7 warnings | ⚠️ 4 warnings (−3) |
| `npm run build` | ✅ 6 rutas | ✅ 6 rutas |
| Bundle `/` | 18 kB / 166 kB First Load | 18 kB / 166 kB First Load *(idéntico)* |
| Bundle `/contacto` | 26.9 kB / 157 kB | 26.9 kB / 157 kB *(idéntico)* |
| Bundle `/servicios` | 2.32 kB / 150 kB | 2.32 kB / 150 kB *(idéntico)* |

Los 3 warnings eliminados son exactamente los 3 símbolos que se borraron. Los 4 warnings que quedan son las advertencias de `<img>` deliberadas (decisión documentada como 🟡-12 en la auditoría).

### Incidente menor durante el proceso

Tras los builds, el dev server del usuario (que estaba corriendo en paralelo) mostró un `Cannot find module './611.js'` por **cache stale en `.next/`** — no por código roto. Se resolvió borrando `.next/` y reiniciando `npm run dev`. Causa: `next dev` y `next build` escribiendo a la misma carpeta cache. Sin impacto en el código fuente.

---

## 2. Cosas que decidí NO tocar y por qué

### 🟡 Amarillos — pendientes para una segunda pasada

| Item | Por qué no se tocó |
|---|---|
| `public/images/logo.png` (88 KB) | No se confirmó si es fallback de OG/Twitter card |
| `public/images/pibble.jpg` (40 KB) | Posible archivo personal del usuario |
| `public/videos/about.mp4` (8.9 MB) | Sin confirmación de obsolescencia |
| `public/videos/bento-laptop.mp4` (6.6 MB) | Es material fuente del ffmpeg, podría querer conservarse |
| Carpetas codepen `layered-pinning-...`, `scrubbed-bento-gallery/`, `splittext-demo/` | Material de referencia, sin confirmación de descarte |
| `ApiError` interface exportada | Aunque solo se usa internamente, bajarla de `export` es cambio API menor — pendiente confirmación |
| Métodos `apiClient.get/put/patch/delete` sin uso | Son la API genérica del cliente HTTP, sirven para features futuras |
| Carpetas vacías `src/types/`, `src/components/ui/` | README las documenta como intención futura — conservar |
| Lint warnings `<img>` (4 ocurrencias) | Decisión deliberada: scrub manual es más simple con `<img>` plano. Podría silenciarse con `eslint-disable-next-line` |

### 🔴 Rojos — requieren decisión de producto, no de limpieza

| Item | Por qué no se tocó |
|---|---|
| **Link `/portafolio` en Navbar → 404** ([Navbar.tsx:19](src/components/layout/Navbar.tsx#L19)) | Es un bug real, pero la solución correcta es **crear la página**, no esconder el link. Decisión tuya |
| 7 imágenes Gemini sueltas en la raíz (~55 MB) | Material crudo personal — fuera del scope de limpieza de código |
| 3 MP4 sueltos en la raíz (~33 MB) | Idem |
| `console.log` en [api/contact/route.ts:52](src/app/api/contact/route.ts#L52) | Logging intencional de leads, marcado como placeholder hasta integrar logger estructurado |
| Anti-watermark agresivo Spline en [SplineHero.tsx:48-87](src/components/effects/SplineHero.tsx#L48) | Bandera **legal**, no técnica. Depende de tu licencia Spline |
| `.claude/launch.json` | Config de debug local |

### No revisado en absoluto (fuera del alcance acordado)

- Actualización de dependencias (`react`, `next`, `gsap`, etc.) — explícitamente fuera de alcance
- Refactor de archivos largos (`LoadingScreen.tsx` tiene ~1130 líneas tras la limpieza, antes 1306)
- Soporte de `prefers-reduced-motion` para accesibilidad
- Tests (no existen)
- Lighthouse / Core Web Vitals
- Migración de `next lint` (deprecado) a ESLint CLI

---

## 3. Cómo revertir si algo falla más adelante

### Revertir un commit específico

```bash
cd C:\dev\aymacode-copia
git log --oneline                # ver hashes
git revert <hash>                # crea un commit que deshace ese cambio
```

### Revertir el último commit (con borrado de cambios)

```bash
git reset --hard HEAD~1
```

### Volver completamente al estado pre-limpieza

```bash
git checkout master              # rama con el snapshot ce1aba5
# o
git checkout ce1aba5             # detached HEAD en el snapshot exacto
```

### Descartar la rama de limpieza entera

```bash
git checkout master
git branch -D cleanup/auditoria-2026-05-12
```

### Si el `.git/` se corrompe (último recurso)

```bash
robocopy "C:\dev\aymacode-copia-backup-2026-05-12" "C:\dev\aymacode-copia" /E /XD .git
```

### Merge a la rama principal (cuando estés satisfecho)

```bash
git checkout master
git merge cleanup/auditoria-2026-05-12
```

---

## 4. Recomendaciones de próximos pasos

Solo recomendaciones, **no se ejecutan en esta pasada**:

### Limpieza adicional (alta prioridad)

1. **Decidir los 🟡 pendientes** — especialmente los 2 mp4 huérfanos (~15.5 MB recuperables) y los 88 KB de imágenes huérfanas.
2. **Mover los binarios crudos de la raíz a `_raw-media/` gitignored** — saca ~75 MB de la raíz visible del proyecto.
3. **Eliminar las 3 carpetas codepen de referencia** (~78 KB total). Si querés conservarlas, moverlas a `_references/` gitignored.

### Bugs documentados

4. **Crear la página `/portafolio`** (o esconder el link del navbar hasta que exista) — es un 404 confirmado hoy.

### Mejoras (no urgentes)

5. **Migrar `next lint` → ESLint CLI** — `next lint` se removerá en Next 16. Comando documentado: `npx @next/codemod@canary next-lint-to-eslint-cli .`
6. **Añadir soporte `prefers-reduced-motion`** — el sitio tiene mucho motion (Lenis, GSAP, frame sequences, LoadingScreen) y nada respeta esta preferencia.
7. **Sustituir `console.log` en `api/contact/route.ts` por logger estructurado** (pino, winston, o similar) antes de producción.
8. **Romper `LoadingScreen.tsx` en módulos** — sigue siendo 1130 líneas en un solo archivo tras la limpieza. Buen candidato para refactor (no en esta pasada).
9. **Revisar licencia Spline** — confirmar si el anti-watermark está permitido por TOS.
10. **Considerar añadir `next-sitemap` o similar** para generar sitemap.xml automático (mencionado en metadata pero no implementado).

### Auditorías que NO se hicieron en esta pasada

11. **Actualizar dependencias** — `npm outdated` para ver qué está pendiente. No se hizo porque estaba explícitamente fuera de alcance.
12. **Lighthouse** — auditoría de performance, accesibilidad, SEO en navegador real.
13. **Verificación visual completa** del sitio en navegador (golden path + breakpoints + edge cases).

---

## 5. Estado final del repo

```
C:\dev\aymacode-copia\
├── .git\                                ← repo nuevo
├── (rama actual) cleanup/auditoria-2026-05-12
├── (rama base)   master  ← snapshot pre-limpieza intacto
└── AUDITORIA.md, REPORTE-LIMPIEZA.md    ← documentación del proceso

C:\dev\aymacode-copia-backup-2026-05-12\  ← backup físico (252 MB, sin node_modules/.next/.git)
```

Listo para que decidas si: (a) mergeás a `master` y borrás la rama, (b) hacés más pasadas sobre 🟡/🔴, (c) revertís alguna cosa.

— Fin del reporte.
