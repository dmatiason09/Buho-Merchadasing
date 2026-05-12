# Aymacode — Sitio web

Sitio de la agencia, construido con **Next.js 15** + **TypeScript** + **Tailwind CSS v4**.

Stack diseñado para escalabilidad, SEO y motion/3D performance.

## 🚀 Cómo correrlo

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar las variables de entorno (ya viene una .env.local con defaults)
cp .env.example .env.local

# 3. Arrancar en desarrollo (Turbopack — muy rápido)
npm run dev

# 4. Abrir http://localhost:3000
```

Para producción:

```bash
npm run build
npm run start
```

## 📁 Estructura

```
aymacode/
├── public/
│   └── images/              ← Assets estáticos (logo, fotos)
│
├── src/
│   ├── app/                 ← App Router de Next.js 15
│   │   ├── layout.tsx       ← Layout raíz: <html>, fonts, metadata SEO
│   │   ├── page.tsx         ← Homepage (compone las secciones)
│   │   ├── globals.css      ← Estilos globales + Tailwind v4
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts ← BACKEND: POST /api/contact
│   │
│   ├── components/
│   │   ├── layout/          ← Navbar, Footer
│   │   ├── effects/         ← MatrixCanvas, SplineHero (3D, motion)
│   │   ├── sections/        ← HeroSection, AboutSection, ContactSection
│   │   ├── forms/           ← ContactForm (con RHF + Zod)
│   │   └── ui/              ← Botones, inputs reutilizables (futuro)
│   │
│   │                        (hooks específicos: viven inline en cada sección)
│   │
│   ├── lib/
│   │   ├── api-client.ts    ← ⭐ Cliente HTTP centralizado
│   │   └── schemas/
│   │       └── contact.schema.ts ← Validación Zod (compartido cliente/servidor)
│   │
│   ├── services/
│   │   └── contact.service.ts ← Métodos de API por dominio
│   │
│   └── types/               ← Tipos TypeScript globales (futuro)
│
├── .env.example             ← Plantilla versionada
├── .env.local               ← Tus valores reales (NO se sube a git)
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 Filosofía de la arquitectura

### Separación de responsabilidades

```
Componente UI  →  Service  →  API Client  →  API Route (o backend externo)
   (qué ve)      (qué pide)   (cómo pide)      (qué responde)
```

Si mañana migramos de Next.js API Routes a un backend externo (NestJS, Express, FastAPI...), **solo cambia `api-client.ts`**. Todo lo demás sigue funcionando.

### Validación compartida con Zod

El schema de `contact.schema.ts` se usa en:

- **Frontend**: React Hook Form lo usa con `zodResolver` para validar antes de enviar
- **Backend**: La API Route lo usa con `safeParse` para revalidar (defensa en profundidad)

Una sola fuente de verdad para el contrato de datos.

### Variables de entorno

- `NEXT_PUBLIC_*` → accesibles desde el cliente (URL de Spline, URL del sitio)
- Sin prefijo → solo en servidor (API keys, webhooks privados)

Nunca pongas API keys en variables `NEXT_PUBLIC_*`.

## 🔌 Cómo se conecta el frontend al backend (flujo completo)

Ejemplo: cuando el usuario envía el formulario de contacto:

1. **`ContactForm.tsx`** valida con Zod en cliente y llama a `contactService.send(data)`
2. **`contact.service.ts`** llama a `apiClient.post('/api/contact', data)`
3. **`api-client.ts`** hace `fetch('/api/contact', { method: 'POST', body: JSON.stringify(data), ... })`
4. **`app/api/contact/route.ts`** recibe el request, revalida con Zod, loggea, opcionalmente envía a n8n
5. La respuesta JSON sube por la misma cadena hasta el componente, que muestra ✓ o ✗

Este patrón se replica para CADA feature futura: blog, casos de estudio, suscripciones, etc.

## 🔐 Variables de entorno disponibles

| Variable | Tipo | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SPLINE_SCENE_URL` | público | URL de la escena 3D en Spline |
| `NEXT_PUBLIC_SITE_URL` | público | URL pública del sitio (para metadatos) |
| `N8N_CONTACT_WEBHOOK_URL` | privado | Webhook de n8n para recibir leads |
| `RESEND_API_KEY` | privado | API key de Resend (envío de emails) |
| `CONTACT_EMAIL_TO` | privado | Email destino de los leads |

## 📋 Roadmap

- [x] Hero con Spline 3D
- [x] About con word reveal
- [x] HandsSection (frame-by-frame scrub)
- [x] BentoGallery (GSAP Flip + scrub sincronizado con frames de laptop)
- [x] Formulario de contacto con validación
- [x] API Route para recibir leads
- [x] Página /servicios (Hero + Manifesto + Lista interactiva)
- [x] Página /contacto (Hero + form sticky + FAQ)
- [ ] Página /portafolio (link en navbar ya existe, ruta pendiente)
- [ ] Sección de ERPs
- [ ] Sección de automatizaciones n8n
- [ ] CMS para casos de estudio (Sanity)
- [ ] Deploy a Vercel
- [ ] Integración con Resend para email
- [ ] Webhook real de n8n

## 🧪 Performance optimizations (vs versión original)

- ✅ `requestAnimationFrame` en lugar de `setInterval` (matrix canvas)
- ✅ `IntersectionObserver` para pausar lógica cuando elementos están fuera de pantalla (word reveal)
- ✅ Cleanup correcto de event listeners (no leaks)
- ✅ Image optimization automática con `next/image`
- ✅ Font loading con `preconnect` y `display=swap`
- ✅ Server-Side Rendering para SEO

---

**Mantenido por Aymacode.** Para preguntas o features, abre un issue.
