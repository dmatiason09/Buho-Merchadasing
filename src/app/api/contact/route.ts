import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/schemas/contact.schema";

/**
 * ===================================================================
 * POST /api/contact
 * ===================================================================
 *
 * Endpoint que recibe los leads del formulario de contacto.
 *
 * Por ahora hace 3 cosas:
 *   1. Valida los datos con el MISMO schema Zod que usa el frontend
 *      (defense in depth: jamás confíes en la validación del cliente)
 *   2. Loggea el lead en consola (placeholder)
 *   3. Envía al webhook de n8n si está configurado
 *
 * En la fase de automatizaciones agregaremos:
 *   - Envío de email con Resend
 *   - Persistencia en Postgres (vía Supabase/Prisma)
 *   - Notificación a Slack/Telegram
 * ===================================================================
 */

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

  // 4. Envío a n8n webhook si está configurado (opcional por ahora)
  const n8nUrl = process.env.N8N_CONTACT_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "aymacode.com",
          receivedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // No rompemos la respuesta al usuario si n8n falla; lo logueamos
      console.error("[contact] Error enviando a n8n:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Mensaje recibido. Te contactaremos pronto.",
  });
}

/** Bloquear cualquier otro método */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Método no permitido" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
