import Link from "next/link";

export function HomeFooterCTA() {
  return (
    <section
      data-nav-theme="light"
      style={{
        backgroundColor: "#ffffff",
        padding: "0 5vw 0",
        marginTop: "-4vh",
      }}
    >
      {/* Texto centrado */}
      <p
        style={{
          margin: "0 0 28px",
          fontFamily: '"Jumper", sans-serif',
          fontSize: "clamp(16px, 1.6vw, 26px)",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "#000000",
          textAlign: "center",
        }}
      >
        (¿Y la producción? También es nuestro lenguaje del amor.)
      </p>

      {/* Botón portafolio centrado */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <Link
          href="/portafolio"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#000000",
            color: "#ffffff",
            padding: "10px 16px",
            fontFamily: '"Universo", sans-serif',
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            border: "1.5px solid #1a1a1a",
            borderRadius: "8px",
          }}
        >
          PORTAFOLIO ↗
        </Link>
      </div>

      {/* Cuadro gris — segunda cosa, a la derecha */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link
          href="/nosotros"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            backgroundColor: "#4a4a4a",
            color: "#ffffff",
            padding: "20px 100px 20px 32px",
            textDecoration: "none",
            width: "clamp(460px, 46vw, 640px)",
            border: "1.5px solid #1a1a1a",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              fontFamily: '"Universo", sans-serif',
              fontSize: "clamp(13px, 1.1vw, 16px)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            LA SEGUNDA COSA QUE DEBES SABER DE NOSOTROS
          </span>
          <span
            style={{
              fontFamily: '"Britanica", sans-serif',
              fontSize: "clamp(28px, 3vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              transform: "translateX(-20px)",
            }}
          >
            02
          </span>
        </Link>
      </div>
    </section>
  );
}
