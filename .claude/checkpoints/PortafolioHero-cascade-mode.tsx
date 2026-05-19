type ImgSpec = {
  src: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  height: string;
};

const IMAGES: ImgSpec[] = [
  {
    src: "/images/portafolio/01.jpeg",
    left: "0",
    bottom: "0",
    width: "6vw",
    height: "6vw",
  },
  {
    src: "/images/portafolio/02.jpeg",
    left: "6vw",
    bottom: "0",
    width: "12vw",
    height: "12vw",
  },
  {
    src: "/images/portafolio/03.jpeg",
    left: "18vw",
    bottom: "0",
    width: "19vw",
    height: "19vw",
  },
  {
    src: "/images/portafolio/04.jpeg",
    left: "37vw",
    bottom: "0",
    width: "25vw",
    height: "25vw",
  },
  {
    src: "/images/portafolio/05.jpeg",
    left: "62vw",
    bottom: "0",
    width: "38vw",
    height: "38vw",
  },
];

export function PortafolioHero() {
  const line = (delay: number): React.CSSProperties => ({
    display: "block",
    animation: `portafolio-rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
  });

  return (
    <section
      data-nav-theme="light"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "22vh 4vw 10vh",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          margin: 0,
          maxWidth: "1100px",
          fontFamily: '"Universo", sans-serif',
          fontSize: "clamp(38px, 6.5vw, 120px)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.035em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          position: "relative",
          zIndex: 2,
        }}
      >
        <span style={line(0.1)}>Dejamos que nuestro</span>
        <span style={line(0.25)}>
          <span
            style={{
              fontFamily: '"Heatwood", cursive',
              fontWeight: 400,
              fontSize: "1.05em",
              color: "#F73C18",
              textTransform: "none",
              letterSpacing: "0",
              display: "inline-block",
              transform: "rotate(-3deg)",
              verticalAlign: "baseline",
            }}
          >
            Trabajo
          </span>{" "}
          Hable por
        </span>
        <span style={line(0.4)}>Nosotros</span>
      </h1>

      {IMAGES.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt=""
          style={{
            position: "absolute",
            top: img.top,
            bottom: img.bottom,
            left: img.left,
            right: img.right,
            width: img.width,
            height: img.height,
            objectFit: "cover",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <style>{`
        @keyframes portafolio-rise {
          from { opacity: 0; transform: translateY(70px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
