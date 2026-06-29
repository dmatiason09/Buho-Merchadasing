export function HeroSection() {
  return (
    <section
      data-nav-theme="light"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#0A0A0A" }}
    >
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
        <span
          style={{
            fontFamily:
              'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
            fontSize: "12px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(10, 10, 10, 0.55)",
            marginBottom: "1.75rem",
          }}
        >
          Buho · Merchandising textil · Lima, Perú
        </span>

        <h1
          style={{
            fontFamily: '"Universo", sans-serif',
            fontWeight: 900,
            fontSize: "clamp(44px, 8.5vw, 160px)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            margin: 0,
            maxWidth: "15ch",
          }}
        >
          Producimos lo que tu marca imagina
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: "clamp(16px, 1.4vw, 22px)",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            color: "rgba(10, 10, 10, 0.7)",
            marginTop: "2rem",
            maxWidth: "44ch",
          }}
        >
          Camisetas, hoodies y gorras con la identidad de tu marca — diseño y
          producción textil bajo un mismo techo.
        </p>
      </div>
    </section>
  );
}
