export function HomeLocationFooter() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "0 5vw 4vh",
        marginTop: "-8vh",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {/* Flecha */}
        <svg
          width="80"
          height="20"
          viewBox="0 0 80 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line x1="0" y1="10" x2="72" y2="10" stroke="#0A0A0A" strokeWidth="2" />
          <polyline points="64,2 78,10 64,18" stroke="#0A0A0A" strokeWidth="2" fill="none" strokeLinejoin="miter" />
        </svg>

        {/* Texto */}
        <div
          style={{
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            fontSize: "clamp(11px, 0.9vw, 14px)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#0A0A0A",
            lineHeight: 1.5,
          }}
        >
          <div>Basados en</div>
          <div>Lima, Perú,</div>
          <div>Apasionados por el diseño & código</div>
        </div>
      </div>
    </div>
  );
}
