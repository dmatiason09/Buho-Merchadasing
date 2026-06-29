"use client";

import { useEffect, useState } from "react";
import { recoverOnce, clearReloadGuard } from "@/components/effects/ChunkReloader";

// Boundary de error a nivel de SECCIÓN/ruta (se renderiza dentro del layout, así
// que el menú y el pie siguen ahí). Misma estrategia que global-error: ante
// cualquier fallo intenta una recarga automática; si ya recargó, muestra un
// mensaje calmado de marca. El cliente nunca ve un "error" técnico.
export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    if (!recoverOnce()) setRecovering(false);
  }, []);

  if (recovering) {
    return (
      <main
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F1E8",
          color: "#1F1F1F",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>Un momento…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        background: "#F5F1E8",
        color: "#1F1F1F",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <p style={{ maxWidth: "34ch", fontSize: 16, lineHeight: 1.6, opacity: 0.85, margin: 0 }}>
        Estamos haciendo unos ajustes. Vuelve a intentarlo en un momento.
      </p>
      <button
        type="button"
        onClick={() => {
          clearReloadGuard();
          reset();
        }}
        style={{
          background: "#0A0A0A",
          color: "#F5F1E8",
          border: "none",
          padding: "12px 28px",
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
    </main>
  );
}
