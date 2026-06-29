"use client";

import { useEffect, useState } from "react";
import { recoverOnce, clearReloadGuard } from "@/components/effects/ChunkReloader";

// Boundary de error a nivel de TODA la app. Estrategia "el cliente NUNCA ve un
// error": ante CUALQUIER fallo intenta UNA recarga automática (resuelve los casos
// típicos — chunk desfasado tras deploy, fallo transitorio). Mientras recarga
// muestra una pantalla neutra (no un error). Si ya recargó hace poco (candado),
// muestra un mensaje calmado de marca, nunca el clásico "Application error".
// Estilos inline porque reemplaza el layout raíz (no carga Tailwind).
export default function GlobalError({
  error: _error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    if (!recoverOnce()) setRecovering(false);
  }, []);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F1E8",
          color: "#1F1F1F",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          {recovering ? (
            <p style={{ fontSize: 15, margin: 0, opacity: 0.7 }}>Un momento…</p>
          ) : (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 18px", opacity: 0.9 }}>
                Estamos haciendo unos ajustes. Vuelve a intentarlo en un momento.
              </p>
              <button
                onClick={() => {
                  clearReloadGuard();
                  window.location.reload();
                }}
                style={{
                  border: "1px solid rgba(31,31,31,0.5)",
                  background: "#0A0A0A",
                  color: "#F5F1E8",
                  padding: "10px 22px",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                }}
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
