import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/schemas/contact.schema";

/**
 * ===================================================================
 * POST /api/contact
 * ===================================================================
 *
 * Endpoint que recibe los leads del formulario de contacto.
 *
 * Flujo:
 *   1. Rate limit por IP + honeypot anti-bot
 *   2. Valida con el MISMO schema Zod que el frontend (defense in depth)
 *   3. Loggea el lead en consola
 *   4. Entrega por los canales configurados (n8n webhook y/o email Resend)
 *   5. Respuesta honesta: solo ok:true si el lead se entregó de verdad. En
 *      producción, sin canal configurado o con fallo de entrega → error.
 *
 * Config (env): N8N_CONTACT_WEBHOOK_URL, RESEND_API_KEY, CONTACT_EMAIL_TO,
 * CONTACT_EMAIL_FROM (opcional). Pendiente: persistencia en DB, Slack/Telegram.
 * ===================================================================
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX = 5; // máx. envíos por ventana por IP
const rateLimitHits = new Map<string, number[]>();

/** IP del cliente (best-effort detrás de proxy/CDN). */
function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Rate limit en memoria por IP. En serverless multi-instancia es best-effort
 * (cada instancia tiene su propio Map); para producción seria → Upstash/Redis.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitHits.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  rateLimitHits.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // 1. Parse seguro del body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body inválido (no es JSON)" },
      { status: 400 }
    );
  }

  // 1.5 Anti-flood: rate limit por IP
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Demasiados envíos. Espera unos minutos e inténtalo de nuevo.",
      },
      { status: 429 }
    );
  }

  // 1.6 Honeypot anti-bot: campo oculto que un humano nunca llena. Si viene
  // con valor, fingimos éxito y descartamos el lead (el bot no aprende).
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { company_website?: unknown }).company_website === "string" &&
    (body as { company_website: string }).company_website.trim() !== ""
  ) {
    console.warn("[contact] honeypot activado — lead descartado", { ip });
    return NextResponse.json({
      ok: true,
      message: "Mensaje recibido. Te contactaremos pronto.",
    });
  }

  // 2. Validación con Zod
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Datos inválidos",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const data = result.data;

  // 3. Logging básico (lo veremos en la consola del servidor durante desarrollo)
  console.log("[contact] Nuevo lead recibido:", {
    name: data.name,
    email: data.email,
    company: data.company || "(sin empresa)",
    serviceType: data.serviceType,
    messageLength: data.message.length,
    timestamp: new Date().toISOString(),
  });

  // 4. Entrega del lead por los canales configurados.
  //    `delivered` solo es true si ALGÚN canal aceptó el lead → nunca
  //    fingimos éxito si el mensaje no llegó a ningún lado.
  const payload = {
    ...data,
    source: "buho.com",
    receivedAt: new Date().toISOString(),
  };
  const n8nUrl = process.env.N8N_CONTACT_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const resendTo = process.env.CONTACT_EMAIL_TO;
  const channelsConfigured = Boolean(n8nUrl) || Boolean(resendKey && resendTo);

  let delivered = false;

  // 4a. Webhook de n8n
  if (n8nUrl) {
    try {
      const r = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) delivered = true;
      else console.error("[contact] n8n respondió con status", r.status);
    } catch (err) {
      console.error("[contact] Error enviando a n8n:", err);
    }
  }

  // 4b. Email vía Resend (sin dependencia: REST API directa)
  if (resendKey && resendTo) {
    try {
      const from =
        process.env.CONTACT_EMAIL_FROM ?? "Buho <onboarding@resend.dev>";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to: resendTo,
          reply_to: data.email,
          subject: `Nuevo lead: ${data.name}${
            data.company ? ` (${data.company})` : ""
          }`,
          text:
            `Nombre: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Empresa: ${data.company || "-"}\n` +
            `Servicio: ${data.serviceType}\n\n` +
            `Mensaje:\n${data.message}`,
        }),
      });
      if (r.ok) delivered = true;
      else
        console.error(
          "[contact] Resend respondió con status",
          r.status,
          await r.text().catch(() => "")
        );
    } catch (err) {
      console.error("[contact] Error enviando email (Resend):", err);
    }
  }

  // 5. Respuesta honesta.
  if (delivered) {
    return NextResponse.json({
      ok: true,
      message: "Mensaje recibido. Te contactaremos pronto.",
    });
  }

  if (!channelsConfigured) {
    // Sin canal configurado: en producción es un error de config (no mentimos);
    // en desarrollo dejamos pasar para no bloquear pruebas locales.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[contact] SIN CANAL DE ENTREGA — configura N8N_CONTACT_WEBHOOK_URL o RESEND_API_KEY + CONTACT_EMAIL_TO"
      );
      return NextResponse.json(
        {
          ok: false,
          message:
            "El formulario no está disponible ahora mismo. Escríbenos a studio@equipo-buho.com.",
        },
        { status: 503 }
      );
    }
    console.warn(
      "[contact] DEV: lead solo logueado (configura un canal de entrega para enviarlo de verdad)."
    );
    return NextResponse.json({
      ok: true,
      message: "Mensaje recibido. Te contactaremos pronto.",
    });
  }

  // Había canal(es) configurado(s) pero todos fallaron.
  console.error("[contact] Falló la entrega del lead por todos los canales.");
  return NextResponse.json(
    {
      ok: false,
      message:
        "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a studio@equipo-buho.com.",
    },
    { status: 502 }
  );
}

/** Bloquear cualquier otro método */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Método no permitido" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
