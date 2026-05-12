"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   AYMACODE — Pantalla de carga estilo Aino
   ============================================================
   Secuencia completa:
   1. Onda ASCII respirando (idle infinito hasta click)
   2. Click → explosión radial de partículas
   3. Convergencia → partículas se reagrupan formando AYMACODE
   4. Letras formadas (settled, ~600ms estable)
   5. Zoom-in (CSS scale) + fade → revela el sitio

   Patrón: todas las partículas viven en un useRef, el render
   loop usa requestAnimationFrame y escribe directo al textContent
   del <pre>. Cero re-renders de React por frame.
   ============================================================ */

type Phase = "idle" | "exploding" | "converging" | "settled" | "falling" | "revealing" | "done";

interface Particle {
  /** Posición base en espacio normalizado (-1 a 1), usada para la onda */
  bx: number;
  by: number;
  /** Posición actual en coordenadas de grilla (float) */
  x: number;
  y: number;
  /** Velocidad para fases de explosión y convergencia */
  vx: number;
  vy: number;
  /** Posición objetivo cuando hay que converger */
  targetX: number;
  targetY: number;
  /** Carácter visual */
  char: string;
  /** Carácter al que cambia cuando se asienta en una letra */
  targetChar: string;
  /** Si esta partícula tiene un objetivo en el word AYMACODE */
  hasLetterTarget: boolean;
  /** Pequeño desfase de fase para variedad en la onda */
  phase: number;
  /** 0 = núcleo de letra (chars densos), 0.35 = mid, 0.8 = halo/borde (chars ligeros) */
  densityBias: number;
  /** Posición al inicio de la fase converging (para lerp puro) */
  convergeStartX: number;
  convergeStartY: number;
  /** True si es una partícula de lluvia (cae vertical durante falling) */
  isRain?: boolean;
}

/* ----- Paletas de caracteres por densidad (de liviano a denso) ----- */
// Paleta de densidad ordenada de denso → liviano (extraída de aino.agency)
const WAVE_CHARS = "NO0A869452I3?!<>=+/:-· ".split("");
// LETTER_CHARS replica los chars de Aino al formar AINO. El `^` es dominante
// (~60% de las celdas) y se mezcla con `*`, `A`, `!` para darle el textura
// orgánica/granulada característica.
const LETTER_CHARS = ["^", "^", "^", "^", "^", "^", "*", "*", "A", "A", "!"];

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ============================================================
   OPCIÓN B — Render canvas → ASCII (estilo aino auténtico)
   ============================================================
   En vez de patrones hechos a mano, dibujamos "aymacode" en un
   canvas oculto con una fuente real, leemos los píxeles, y
   mapeamos cada celda de la grilla a un carácter según la
   oscuridad del pixel correspondiente:
     - Pixel oscuro (>60%)  → LETTER_CHARS densos (`^`, `*`, `A`, `!`)
     - Pixel medio (25-60%) → chars intermedios (`*`, `;`, `+`)
     - Pixel claro (8-25%)  → HALO_CHARS livianos (`.`, `:`, `;`)
     - Pixel <8%            → vacío
   El anti-aliasing del canvas genera el "fade" natural en los
   bordes — lo mismo que Aino logra.
   ============================================================ */
const WORD = "aymacode";

/** Caracteres intermedios (peso medio) para los píxeles parcialmente oscuros */
const MID_CHARS = ["*", "A", "+", ";", "="];
/** Caracteres ligeros para halo (píxeles muy claros, anti-alias) */
const HALO_CHARS = [".", ":", ";", "'", ",", "`", "-", "·"];

interface Target {
  x: number;
  y: number;
  char: string;
  densityBias: number;
}

/** Calca SOLAMENTE la palabra "aymacode" del hero. Usa cellPx RECTANGULAR
 *  (3 ancho × 6 alto) para que la proporción del canvas matchee con la
 *  proporción del display (chars ~6.6×12.65 → ratio ~0.52). Sin esto, el
 *  texto se estira verticalmente ~1.9× al mostrarse.
 *  - Pixels de las letras → bias 0 → chars densos (N, O, 0, A, 8, 6)
 *  - Pixels del fondo     → bias 0.85 → chars ligeros (·, -, :, +, =) */
function buildHeroBiasGrid(cols: number, rows: number): number[][] {
  const cellPxX = 3;
  const cellPxY = 6; // doble que X para compensar el aspect ratio del display
  const canvasW = cols * cellPxX;
  const canvasH = rows * cellPxY;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const FONT = `800 SIZE_PXpx "Plus Jakarta Sans", "DM Sans", "Inter", sans-serif`;
  const targetWidthRatio = 0.73; // un poco más compacto horizontalmente
  const targetW = canvasW * targetWidthRatio;

  let fontSize = Math.floor(canvasH * 0.4);
  ctx.font = FONT.replace("SIZE_PX", String(fontSize));
  const measuredW = ctx.measureText("aymacode").width;
  if (measuredW > 0) {
    fontSize = Math.floor(fontSize * (targetW / measuredW));
    ctx.font = FONT.replace("SIZE_PX", String(fontSize));
  }

  // === Renderizado letra-por-letra para poder ajustar cada una ===
  // 1. Calcular posición natural de cada letra (donde quedarían como palabra entera)
  const word = "aymacode";
  const baseY = canvasH * 0.42;
  const wordWidth = ctx.measureText(word).width;
  const wordStartX = (canvasW - wordWidth) / 2;

  const naturalPositions: { x: number; y: number }[] = [];
  let cursorX = wordStartX;
  for (const ch of word) {
    const charWidth = ctx.measureText(ch).width;
    naturalPositions.push({
      x: cursorX + charWidth / 2,
      y: baseY,
    });
    cursorX += charWidth;
  }

  // ============================================================
  // 👇 AJUSTA AQUÍ: cada letra individualmente
  // ============================================================
  // dx / dy: offset en porcentaje del canvas (0 = posición natural)
  //          dx: + derecha, - izquierda
  //          dy: + abajo,   - arriba
  // sizeMul: multiplicador del tamaño (1.0 = base, 1.2 = 20% más grande)
  const LETTER_TWEAKS = [
    { dx: 0, dy: 0, sizeMul: 1.0 }, // a
    { dx: 0, dy: 0, sizeMul: 1.0 }, // y
    { dx: 0, dy: 0, sizeMul: 1.0 }, // m
    { dx: 0, dy: 0, sizeMul: 1.0 }, // a
    { dx: 0, dy: 0, sizeMul: 1.0 }, // c
    { dx: 0, dy: 0, sizeMul: 1.0 }, // o
    { dx: 0, dy: 0, sizeMul: 1.0 }, // d
    { dx: 0, dy: 0, sizeMul: 1.0 }, // e
  ];

  // 2. Dibujar cada letra con su tweak aplicado
  for (let i = 0; i < word.length; i++) {
    const nat = naturalPositions[i];
    const tw = LETTER_TWEAKS[i] ?? { dx: 0, dy: 0, sizeMul: 1.0 };
    const x = nat.x + tw.dx * canvasW;
    const y = nat.y + tw.dy * canvasH;
    const size = Math.floor(fontSize * tw.sizeMul);
    ctx.font = `800 ${size}px "Plus Jakarta Sans", "DM Sans", "Inter", sans-serif`;
    ctx.fillText(word[i], x, y);
  }

  // === Logo flag/bookmark a la izquierda (donde estaba MENU) ===
  const navY = canvasH * 0.045;
  const navH = canvasH * 0.05;
  const fY = navY + navH / 2;
  const fW = canvasH * 0.020;
  const fH = canvasH * 0.05;
  const fX = canvasW * 0.06; // posición izquierda (donde antes estaba MENU)
  ctx.beginPath();
  ctx.moveTo(fX - fW, fY - fH / 2);
  ctx.lineTo(fX + fW, fY - fH / 2);
  ctx.lineTo(fX + fW, fY + fH / 2);
  ctx.lineTo(fX, fY + fH / 4);
  ctx.lineTo(fX - fW, fY + fH / 2);
  ctx.closePath();
  ctx.fill();

  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const pixels = imgData.data;
  const blockSize = cellPxX * cellPxY;

  // 1. Calcular darkness por celda (sampling con cellPx rectangular)
  const darkness: number[][] = [];
  for (let gy = 0; gy < rows; gy++) {
    const row: number[] = [];
    for (let gx = 0; gx < cols; gx++) {
      let sum = 0;
      for (let dy = 0; dy < cellPxY; dy++) {
        const py = gy * cellPxY + dy;
        const rowOffset = py * canvasW;
        for (let dx = 0; dx < cellPxX; dx++) {
          const px = gx * cellPxX + dx;
          sum += 255 - pixels[(rowOffset + px) * 4];
        }
      }
      row.push(sum / blockSize / 255);
    }
    darkness.push(row);
  }

  // 2. Construir grid: bias 0 = FIGURA (cualquier pixel dentro/borde de las letras),
  //    bias 1 = FONDO (puntos sparse). El render usa el bias para decidir qué char.
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const d = darkness[r][c];
      if (d > 0.15) {
        row.push(0);   // figura: char variando por fila
      } else {
        row.push(1);   // fondo: puntos sparse
      }
    }
    grid.push(row);
  }

  return grid;
}

/** Renderiza el texto en un canvas oculto, lee los píxeles, y mapea cada celda
 *  de la grilla ASCII a un carácter según la oscuridad del pixel correspondiente.
 *  Esto produce letras de calidad de fuente real (idéntico approach al de Aino). */
function buildLetterTargetsFromCanvas(
  text: string,
  centerCol: number,
  centerRow: number,
  cols: number,
  rows: number
): Target[] {
  // Dimensiones de la palabra en celdas ASCII (responsive al viewport)
  const targetWidth = Math.min(Math.floor(cols * 0.90), cols - 2);
  // El canvas resize ajusta el fontSize para que quepa, por lo que el
  // aspect ratio sólo limita la altura mínima — usar 4.0 da letras más altas
  const targetHeight = Math.min(
    Math.floor(targetWidth / 4.0),
    Math.floor(rows * 0.58)
  );

  // Pixels por celda en el canvas oculto (más alto = más detalle, más cómputo)
  const cellPx = 5;
  const canvasW = targetWidth * cellPx;
  const canvasH = targetHeight * cellPx;

  // Crear canvas oculto y dibujar el texto
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  // Fondo blanco para detectar las letras como pixels oscuros
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Tinta negra — ajustar fontSize para que el texto quepa horizontalmente
  ctx.fillStyle = "#000000";
  let fontSize = Math.floor(canvasH * 0.95);
  ctx.font = `800 ${fontSize}px "DM Sans", "Plus Jakarta Sans", "Inter", sans-serif`;
  const measuredW = ctx.measureText(text).width;
  const maxTextW = canvasW * 0.96; // 2% de margen en cada lado
  if (measuredW > maxTextW) {
    fontSize = Math.floor(fontSize * (maxTextW / measuredW));
    ctx.font = `800 ${fontSize}px "DM Sans", "Plus Jakarta Sans", "Inter", sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasW / 2, canvasH / 2);

  // Leer todos los pixels
  const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
  const pixels = imageData.data;

  // Para cada celda de la grilla ASCII, calcular la oscuridad promedio de su bloque
  const startCol = Math.floor(centerCol - targetWidth / 2);
  const startRow = Math.floor(centerRow - targetHeight / 2);
  const targets: Target[] = [];
  const blockSize = cellPx * cellPx;

  for (let gy = 0; gy < targetHeight; gy++) {
    for (let gx = 0; gx < targetWidth; gx++) {
      let sum = 0;
      for (let dy = 0; dy < cellPx; dy++) {
        const py = gy * cellPx + dy;
        const rowOffset = py * canvasW;
        for (let dx = 0; dx < cellPx; dx++) {
          const px = gx * cellPx + dx;
          // pixels[idx] es R (0=negro=tinta, 255=blanco=fondo)
          // Como el texto es negro puro y el fondo blanco puro, R es el indicador
          sum += 255 - pixels[(rowOffset + px) * 4];
        }
      }
      const darkness = sum / blockSize / 255; // 0 = vacío, 1 = sólido

      if (darkness < 0.08) continue; // celda esencialmente vacía

      let char: string;
      let densityBias: number;
      if (darkness > 0.55) { char = pickFrom(LETTER_CHARS); densityBias = 0.0; }
      else if (darkness > 0.25) { char = pickFrom(MID_CHARS); densityBias = 0.35; }
      else { char = pickFrom(HALO_CHARS); densityBias = 0.8; }

      targets.push({
        x: startCol + gx,
        y: startRow + gy,
        char,
        densityBias,
      });
    }
  }

  return targets;
}

/* ============================================================
   Inicialización de partículas en forma de onda/lente
   ============================================================ */
const WAVE_CYCLES  = 2.0;   // ciclos de la onda primaria
const WAVE_AMP     = 0.15;  // amplitud de la onda (fracción del ancho)
const RIBBON_SPREAD = 0.20; // semi-ancho del ribbon (fracción del ancho)
const RIBBON_HEIGHT = 1.0;  // altura total del ribbon (fracción del alto)

function initParticles(count: number, cols: number, rows: number): Particle[] {
  const particles: Particle[] = [];
  const cx = cols / 2;
  const cy = rows / 2;
  const baseW = cols * WAVE_AMP;
  const baseH = (rows * RIBBON_HEIGHT) / 2;
  const spreadW = cols * RIBBON_SPREAD;

  for (let i = 0; i < count; i++) {
    // by: posición uniforme a lo largo del eje vertical (-1 a 1)
    const by = Math.random() * 2 - 1;

    // bx: distribución gaussiana → ribbon denso en el centro, difuso en los bordes
    const u1 = Math.max(1e-10, Math.random());
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
    const bx = Math.max(-1, Math.min(1, gauss * 0.42));

    const waveX = Math.sin(by * WAVE_CYCLES * Math.PI);
    const x = cx + waveX * baseW + bx * spreadW;
    const y = cy + by * baseH;

    particles.push({
      bx,
      by,
      x,
      y,
      vx: 0,
      vy: 0,
      targetX: x,
      targetY: y,
      char: pickFrom(WAVE_CHARS),
      targetChar: pickFrom(WAVE_CHARS),
      hasLetterTarget: false,
      phase: Math.random() * Math.PI * 2,
      densityBias: 0,
      convergeStartX: x,
      convergeStartY: y,
    });
  }
  return particles;
}

/* ============================================================
   Asignar partículas a las celdas de AYMACODE.
   Asignación 1-a-1: cada celda activa recibe exactamente UNA partícula.
   Las partículas extra (más que celdas) se mandan fuera de pantalla
   para no contaminar la legibilidad de las letras.
   ============================================================ */
function assignLetterTargets(
  particles: Particle[],
  targets: Target[],
  cols: number,
  rows: number
) {
  // Mezclar el orden para que la asignación se vea aleatoria
  const shuffled = [...particles].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i++) {
    const p = shuffled[i];
    if (i < targets.length) {
      // 1-a-1 exacta. Sin jitter (queremos celdas crispy)
      const t = targets[i];
      p.targetX = t.x;
      p.targetY = t.y;
      p.targetChar = t.char;
      p.densityBias = t.densityBias;
      p.hasLetterTarget = true;
    } else {
      // Extras: vuelan fuera del viewport en dirección random
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.max(cols, rows) * 1.5;
      p.targetX = cols / 2 + Math.cos(angle) * distance;
      p.targetY = rows / 2 + Math.sin(angle) * distance;
      p.targetChar = " ";
      p.hasLetterTarget = false;
    }
  }
}

/* ============================================================
   Render de partículas a string (single textContent update)
   ============================================================ */
function renderParticlesToString(
  particles: Particle[],
  cols: number,
  rows: number,
  bgGrid?: string[][] | null
): string {
  // Buffer 2D inicializado con espacios
  const buffer = new Array(rows);
  for (let r = 0; r < rows; r++) {
    buffer[r] = new Array(cols).fill(" ");
  }
  // Capa de fondo (matrix rain): chars que ya cayeron y se quedaron
  if (bgGrid) {
    for (let r = 0; r < rows; r++) {
      const bgRow = bgGrid[r];
      if (!bgRow) continue;
      for (let c = 0; c < cols; c++) {
        const ch = bgRow[c];
        if (ch && ch !== " ") buffer[r][c] = ch;
      }
    }
  }
  // Partículas encima
  for (const p of particles) {
    const cx = Math.floor(p.x);
    const cy = Math.floor(p.y);
    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
      buffer[cy][cx] = p.char;
    }
  }
  const lines = new Array(rows);
  for (let r = 0; r < rows; r++) {
    lines[r] = buffer[r].join("");
  }
  return lines.join("\n");
}

/* ============================================================
   Render directo del grid de onda (idle phase)
   Cada celda recibe un carácter calculado desde la fórmula,
   garantizando cobertura total — sin huecos entre partículas.
   ============================================================ */
function renderWaveGrid(cols: number, rows: number, t: number): string {
  const buffer: string[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(" ")
  );

  const phaseShift   = t * 0.0016;
  const phaseShift2  = t * 0.0023;
  const breathe      = 1 + 0.30 * Math.sin(t * 0.00055);
  const spreadPulse  = 1 + 0.18 * Math.sin(t * 0.00070 + Math.PI / 3);
  const globalDensity = (Math.sin(t * 0.003) + 1) / 2;

  const cx      = cols / 2;
  const cy      = rows / 2;
  const baseW   = cols * WAVE_AMP;
  const halfH   = (rows * RIBBON_HEIGHT) / 2;
  const spreadW = cols * RIBBON_SPREAD * spreadPulse;

  for (let r = 0; r < rows; r++) {
    const by = (r - cy) / halfH;
    if (Math.abs(by) > 1.0) continue;

    const wave1 = Math.sin(by * WAVE_CYCLES * Math.PI + phaseShift) * breathe;
    const wave2 = 0.30 * Math.sin(by * WAVE_CYCLES * 2 * Math.PI + phaseShift2);
    const waveCenterX = cx + (wave1 + wave2) * baseW;

    const leftEdge  = Math.max(0,         Math.floor(waveCenterX - spreadW));
    const rightEdge = Math.min(cols - 1,  Math.ceil(waveCenterX  + spreadW));

    for (let c = leftEdge; c <= rightEdge; c++) {
      const distNorm = Math.abs(c - waveCenterX) / spreadW; // 0=centro, 1=borde
      if (distNorm > 1.0) continue;

      // Centro más denso, bordes más ligeros + oscilación global conjunta
      const coreBias = 1 - distNorm;
      const d = Math.max(0, Math.min(0.999,
        (1 - globalDensity) * 0.75 + (1 - coreBias) * 0.25
      ));
      buffer[r][c] = WAVE_CHARS[Math.floor(d * WAVE_CHARS.length)];
    }
  }

  return buffer.map(row => row.join("")).join("\n");
}

/* ============================================================
   Char por densidad: núcleo denso, halo ligero, ambos sincronizan
   con globalDensity para el efecto de morfeo conjunto.
   ============================================================ */
function charForDensity(globalDensity: number, densityBias: number): string {
  // WAVE_CHARS = N O 0 A 8 6 9 4 5 2 I 3 ? ! < > = + : - · (space)
  //              0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21
  let d: number;
  if (densityBias > 0.7) {
    // Halo/borde: SIEMPRE chars ligeros (=,+,:,-,·) índices 16-20
    d = 0.73 + (1 - globalDensity) * 0.19; // 0.73–0.92
  } else if (densityBias > 0.2) {
    // Medio: chars medios (9,4,5,2,I,3,?,!) índices 6-13
    d = 0.27 + (1 - globalDensity) * 0.22; // 0.27–0.49
  } else {
    // Núcleo: SIEMPRE chars densos (N,O,0,A,8,6) índices 0-5
    d = (1 - globalDensity) * 0.22;        // 0–0.22
  }
  return WAVE_CHARS[Math.floor(Math.max(0, Math.min(0.999, d)) * WAVE_CHARS.length)];
}

/* ============================================================
   Componente
   ============================================================ */
export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const cursorHintRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const phaseStartRef = useRef<number>(0);
  const dimsRef = useRef<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const rafRef = useRef<number>(0);
  const letterTargetsRef = useRef<Target[]>([]);
  // Hero ASCII: 2D array de densityBias por celda. Cubre TODO el viewport.
  // densityBias bajo (~0) = char denso (figura), alto (~0.85) = char ligero (fondo).
  const heroBiasRef = useRef<number[][]>([]);
  // Jitter aleatorio por columna para que las filas no caigan perfectamente alineadas
  const heroColJitterRef = useRef<number[]>([]);

  /* ----- Mostrar solo una vez por sesión.
       Si ya se mostró (navegación client-side desde otra página, o reload tras
       haberlo visto), saltar directo al sitio sin la pantalla de carga. ----- */
  useEffect(() => {
    const alreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem("aymacode_loader_shown") === "1";

    if (alreadyShown) {
      setHidden(true);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    // Evitar que el browser restaure posición de scroll anterior
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ----- Setup inicial: dimensiones + partículas + animation loop ----- */
  useEffect(() => {
    if (hidden) return;

    // Calcular grilla en función del viewport y el tamaño de la fuente
    const fontSize = 11;
    const charWidth = fontSize * 0.6; // aprox para mono
    const lineHeight = fontSize * 1.15;
    const cols = Math.floor(window.innerWidth / charWidth);
    const rows = Math.floor(window.innerHeight / lineHeight);
    dimsRef.current = { cols, rows };

    // Letras 19×23 con halo denso generan ~2200 celdas activas en total.
    // Bumpeamos el count para garantizar cobertura completa + extras para off-screen.
    const particleCount = Math.max(3500, Math.floor((cols * rows) / 5));
    particlesRef.current = initParticles(particleCount, cols, rows);

    // Pre-computar bias grid del hero (aymacode + elipse + scroll)
    document.fonts.ready.then(() => {
      heroBiasRef.current = buildHeroBiasGrid(cols, rows);
      // Jitter por columna (0-150ms) para que las filas no caigan perfectas
      const jitters: number[] = [];
      for (let c = 0; c < cols; c++) {
        jitters.push(Math.random() * 150);
      }
      heroColJitterRef.current = jitters;
    });

    // Pre-computar targets cuando la fuente esté disponible en el canvas.
    // document.fonts.ready garantiza que DM Sans esté cargada antes de dibujar.
    document.fonts.ready.then(() => {
      letterTargetsRef.current = buildLetterTargetsFromCanvas(
        WORD, cols / 2, rows / 2, cols, rows
      );
    });

    phaseStartRef.current = performance.now();
    phaseRef.current = "idle";

    /* --- Loop principal --- */
    const tick = (now: number) => {
      const t = now;
      const phaseElapsed = now - phaseStartRef.current;
      const particles = particlesRef.current;
      const { cols, rows } = dimsRef.current;
      const ph = phaseRef.current;

      if (ph === "idle") {
        /* === Fase 1: Ribbon de ondas interferentes ===
           Onda primaria viajera + armónico al doble de frecuencia.
           El ribbon respira en amplitud y pulsa en grosor. */
        const breathe     = 1 + 0.30 * Math.sin(t * 0.00055);
        const phaseShift  = t * 0.0016;  // viaje onda primaria
        const phaseShift2 = t * 0.0023;  // viaje armónico (velocidad distinta)
        const spreadPulse = 1 + 0.18 * Math.sin(t * 0.00070 + Math.PI / 3);

        const cx = cols / 2;
        const cy = rows / 2;
        const baseW  = cols * WAVE_AMP;
        const baseH  = (rows * RIBBON_HEIGHT) / 2;
        const spreadW = cols * RIBBON_SPREAD;

        // Oscilación global de densidad (~18s por ciclo) → toda la onda morfea junta
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2; // 0 a 1

        for (const p of particles) {
          // Onda primaria viajera
          const wave1 = Math.sin(p.by * WAVE_CYCLES * Math.PI + phaseShift) * breathe;
          // Armónico al doble → patrón de interferencia
          const wave2 = 0.30 * Math.sin(p.by * WAVE_CYCLES * 2 * Math.PI + phaseShift2);
          // Micro-oscilación individual por partícula
          const micro = Math.sin(t * 0.00080 + p.phase) * 0.45;

          p.targetX = cx + (wave1 + wave2) * baseW + p.bx * spreadW * spreadPulse;
          p.targetY = cy + p.by * baseH + micro;

          p.x += (p.targetX - p.x) * 0.09;
          p.y += (p.targetY - p.y) * 0.09;

          // Char basado en densidad: centro más denso, bordes más ligeros
          // Todo el ribbon morfea junto siguiendo globalDensity
          const coreBias = Math.max(0, 1 - Math.abs(p.bx) * 1.0);
          const d = Math.max(0, Math.min(0.999,
            (1 - globalDensity) * 0.75 + (1 - coreBias) * 0.25
          ));
          p.char = WAVE_CHARS[Math.floor(d * WAVE_CHARS.length)];
        }
      } else if (ph === "exploding") {
        /* === Fase 2: Explosión === */
        const damping = 0.96;
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2;
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= damping;
          p.vy *= damping;
          p.char = charForDensity(globalDensity, 0);
        }
        // Tras 600ms cambiamos a converging
        if (phaseElapsed > 600) {
          // Snapshot de posiciones actuales para el lerp de converging
          for (const p of particles) {
            p.convergeStartX = p.x;
            p.convergeStartY = p.y;
            p.vx = 0;
            p.vy = 0;
          }
          assignLetterTargets(particles, letterTargetsRef.current, cols, rows);
          phaseRef.current = "converging";
          phaseStartRef.current = now;
          setPhase("converging");
        }
      } else if (ph === "converging") {
        /* === Fase 3: Convergencia estilo Aino ===
           Fase A (0-60%): cubic ease-out hacia gather point (targetY - LIFT)
           Fase B (60-100%): gravedad cae desde gather point hasta targetY */
        const DURATION   = 2000; // ms total
        const GATHER_FRAC = 0.62; // fracción para fase A
        const LIFT       = 6;    // rows encima del target durante fase A
        const GRAVITY    = 0.20; // aceleración gravitacional (rows/frame²)
        const BOUNCE     = 0.30; // coeficiente de rebote
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2;

        for (const p of particles) {
          // Stagger: 0-350ms según p.phase
          const stagger = (p.phase / (Math.PI * 2)) * 350;
          const elapsed = Math.max(0, phaseElapsed - stagger);
          const rawT    = Math.min(1, elapsed / DURATION);

          if (rawT < GATHER_FRAC) {
            // Fase A: cubic ease-out hacia (targetX, targetY - LIFT)
            const t0   = rawT / GATHER_FRAC;
            const ease = 1 - Math.pow(1 - t0, 3);
            p.x = p.convergeStartX + (p.targetX - p.convergeStartX) * ease;
            p.y = p.convergeStartY + (p.targetY - LIFT - p.convergeStartY) * ease;
            p.vy = 0;
          } else {
            // Fase B: gravedad desde gather point hasta targetY
            p.x = p.targetX;
            p.vy += GRAVITY;
            p.y  += p.vy;
            if (p.y >= p.targetY) {
              p.vy *= -BOUNCE;
              p.y   = p.targetY;
              if (Math.abs(p.vy) < 0.08) p.vy = 0;
            }
          }

          p.char = charForDensity(globalDensity, p.densityBias);
        }

        // Tras 2600ms snap final y settled
        if (phaseElapsed > 2600) {
          const gd = (Math.sin(t * 0.003) + 1) / 2;
          for (const p of particles) {
            p.x  = p.targetX;
            p.y  = p.targetY;
            p.vx = 0;
            p.vy = 0;
            p.char = charForDensity(gd, p.densityBias);
          }
          phaseRef.current = "settled";
          phaseStartRef.current = now;
          setPhase("settled");
        }
      } else if (ph === "settled") {
        /* === Fase 4: Letras formadas — chars siguen ciclando ===  */
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2;
        for (const p of particles) {
          if (!p.hasLetterTarget) {
            p.x += (p.targetX - p.x) * 0.05;
            p.y += (p.targetY - p.y) * 0.05;
          } else {
            p.char = charForDensity(globalDensity, p.densityBias);
          }
        }
        if (phaseElapsed > 900) {
          for (const p of particles) {
            if (p.hasLetterTarget) {
              p.vx = (Math.random() - 0.5) * 1.2;
              p.vy = 0;
            }
          }
          phaseRef.current = "falling";
          phaseStartRef.current = now;
          setPhase("falling");
        }
      } else if (ph === "falling") {
        /* === Fase 5: Caída — pocas partículas rebotan, todas terminan en el piso ===
           Solo ~30% rebotan (rebotes altos y elegantes). El resto se asienta.
           En los últimos ~1s, se aplica una fuerza de "settle" creciente que
           va matando los rebotes residuales hasta que TODAS quedan en el piso. */
        // Crossfade termina a los 3500+1200 = 4700ms. Después el visual ya está
        // completo (hero 100% visible, chars 0% opacidad). No tiene sentido
        // mantener la fase falling más tiempo — el usuario queda bloqueado.
        const PHASE_DURATION = 4800; // termina justo después del crossfade
        const SETTLE_START   = 3400; // settle inicia un poquito antes del crossfade
        const GRAVITY      = 0.025;
        const BOUNCE       = 0.82;
        const AIR_DAMPING  = 0.997;
        const FLOOR_FRIC   = 0.85;
        const FLOOR        = rows - 1;
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2;

        // Factor de asentamiento: 0 → 1 a medida que se acerca el final
        const settleProgress = Math.max(
          0,
          Math.min(1, (phaseElapsed - SETTLE_START) / (PHASE_DURATION - SETTLE_START))
        );
        // El bounce se atenúa hasta 0 al final
        const effectiveBounce = BOUNCE * (1 - settleProgress);

        for (const p of particles) {
          if (p.hasLetterTarget) {
            const stagger = (p.phase / (Math.PI * 2)) * 800;
            const elapsed = Math.max(0, phaseElapsed - stagger);
            if (elapsed > 0) {
              const shouldBounce = Math.sin(p.phase * 1.7) > 0.4;

              p.vy += GRAVITY;
              p.vy *= AIR_DAMPING;
              p.x  += p.vx;
              p.y  += p.vy;
              p.vx *= 0.985;

              if (p.y >= FLOOR) {
                p.y = FLOOR;
                if (shouldBounce) {
                  // Rebote con coeficiente que decae al acercarse el final
                  p.vy *= -effectiveBounce;
                  p.vx *= FLOOR_FRIC;
                  if (Math.abs(p.vy) < 0.04) {
                    p.vy = 0;
                    p.vx *= 0.6;
                  }
                } else {
                  p.vy = 0;
                  p.vx *= 0.5;
                }
              }
              p.char = charForDensity(globalDensity, p.densityBias);
            }
          }
        }

        // Snap final: en los últimos 200ms forzar TODAS al piso
        if (phaseElapsed > PHASE_DURATION - 200) {
          for (const p of particles) {
            if (p.hasLetterTarget) {
              p.y = FLOOR;
              p.vy = 0;
              p.vx *= 0.7;
            }
          }
        }

        if (phaseElapsed > PHASE_DURATION) {
          // Sin clipPath: el crossfade de opacidad reemplaza al wipe top-down
          phaseRef.current = "revealing";
          phaseStartRef.current = now;
          setPhase("revealing");
        }
      } else if (ph === "revealing") {
        /* === Fase 6: Crossfade — chars terminan de desvanecerse (sin wipe) ===
           El bg ya está transparente y el hero ya se ve; aquí solo terminamos
           de bajar la opacidad de los chars hasta que desaparezcan. */
        const REVEAL_DURATION = 100; // mínimo — todo ya está invisible al entrar aquí
        const globalDensity = (Math.sin(t * 0.003) + 1) / 2;
        for (const p of particles) {
          if (p.hasLetterTarget) {
            p.char = charForDensity(globalDensity, p.densityBias);
          }
        }
        if (phaseElapsed >= REVEAL_DURATION) {
          phaseRef.current = "done";
          setPhase("done");
        }
      }

      // === Crossfade sincronizado: chars y bg fadean JUNTOS ===
      //   0 - 5500ms : llenado del ASCII (fill_end ≈ ROW_DELAY * rows = 5250ms)
      //   5500 - 9500ms : crossfade puro (4s)
      //       - bg blanco 1 → 0 (hero aparece)
      //       - chars 1 → 0 (partículas desaparecen)
      //   Las partículas terminan de formar las formas ANTES del crossfade.
      const CROSSFADE_START = 3500;
      const CROSSFADE_DURATION = 1200;
      const crossfadeProgress = Math.max(
        0,
        Math.min(1, (phaseElapsed - CROSSFADE_START) / CROSSFADE_DURATION)
      );

      if (containerRef.current) {
        let bgOpacity = 1;
        if (ph === "falling") {
          bgOpacity = 1 - crossfadeProgress;
        } else if (ph === "revealing" || ph === "done") {
          bgOpacity = 0;
        }
        containerRef.current.style.backgroundColor = `rgba(255, 255, 255, ${bgOpacity})`;
        containerRef.current.style.pointerEvents = bgOpacity < 0.6 ? "none" : "auto";
      }

      if (preRef.current) {
        let preOpacity = 1;
        if (ph === "falling") {
          preOpacity = 1 - crossfadeProgress;
        } else if (ph === "revealing" || ph === "done") {
          // Los chars ya quedaron en 0 al final de falling — mantenerlos así.
          // (antes había un bug donde phaseElapsed=0 en revealing daba opacity=1)
          preOpacity = 0;
        }
        preRef.current.style.opacity = String(preOpacity);
      }

      // Render (excepto en done, donde estamos por desmontar)
      if (ph !== "done" && preRef.current) {
        if (ph === "idle") {
          // Grid directo: garantiza cobertura total sin huecos
          preRef.current.textContent = renderWaveGrid(cols, rows, t);
        } else if (
          (ph === "falling" || ph === "revealing") &&
          heroBiasRef.current.length > 0
        ) {
          // Hero ASCII estilo AINO: char index lineal de arriba a abajo,
          // cyclando WAVE_CHARS en orden (N → O → 0 → A → 8 → 6 → 9 → 4 → 5 ...).
          // Cada char se repite en 3-4 filas seguidas antes de pasar al siguiente.
          // La figura "aymacode" usa el mismo cycle pero shifteado hacia denso.
          const heroBias = heroBiasRef.current;
          const colJitter = heroColJitterRef.current;
          const ROW_DELAY = 30;          // ms entre filas (más lento)
          const SETTLE_DURATION = 400;   // ms que tarda cada fila en "asentarse" en su char final
          const FILL_START_DELAY = 1800; // ms — esperar a que las letras reboten
          const PALETTE_LEN = WAVE_CHARS.length - 1;

          const bgGrid: string[][] = new Array(rows);
          for (let r = 0; r < rows; r++) {
            bgGrid[r] = new Array(cols).fill(" ");
          }

          // Restamos el delay inicial → la lluvia arranca cuando las letras
          // ya rebotaron un rato (efecto "después del bounce")
          const fillElapsed = ph === "revealing"
            ? Number.MAX_SAFE_INTEGER
            : Math.max(0, phaseElapsed - FILL_START_DELAY);

          for (let r = 0; r < rows; r++) {
            const rowTime = r * ROW_DELAY;
            if (fillElapsed < rowTime) continue;
            const heroRow = heroBias[r];
            if (!heroRow) continue;

            // Char FINAL al que se asienta la fila (linear por palette)
            const targetIdx = Math.min(
              PALETTE_LEN - 1,
              Math.floor((r * PALETTE_LEN) / rows)
            );
            // Smooth: la fila arranca con el char más ligero (·) y se va
            // "asentando" hacia targetIdx en SETTLE_DURATION ms
            const timeInRow = fillElapsed - rowTime;
            const settleProgress = Math.min(1, timeInRow / SETTLE_DURATION);
            const lightestIdx = PALETTE_LEN - 1;
            const currentIdx = Math.floor(
              lightestIdx + (targetIdx - lightestIdx) * settleProgress
            );
            const figureChar = WAVE_CHARS[currentIdx];

            for (let c = 0; c < cols; c++) {
              const cellTime = rowTime + (colJitter[c] ?? 0);
              if (fillElapsed >= cellTime) {
                const bias = heroRow[c];
                if (bias < 0.5) {
                  bgGrid[r][c] = figureChar; // FIGURA: char en transición
                } else {
                  bgGrid[r][c] = ".";        // FONDO: puntos sparse
                }
              }
            }
          }

          preRef.current.textContent = renderParticlesToString(
            particles, cols, rows, bgGrid
          );
        } else {
          preRef.current.textContent = renderParticlesToString(particles, cols, rows);
        }
      }

      if (phaseRef.current !== "done") {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [hidden]);

  /* ----- Cuando "done" → desmontar tras la transición ----- */
  useEffect(() => {
    if (phase === "done") {
      // Marcar que ya se mostró: no volver a aparecer en navegaciones internas
      // ni en cargas posteriores dentro de la misma sesión del navegador.
      try {
        sessionStorage.setItem("aymacode_loader_shown", "1");
      } catch {
        /* sessionStorage podría no estar disponible (incógnito estricto) */
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const timer = setTimeout(() => {
        setHidden(true);
        document.body.style.overflow = "";
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  /* ----- Bloquear scroll TOTAL mientras la pantalla de carga está activa.
       Captura wheel/touch en fase capture para vencer a Lenis y cualquier
       otro listener. Solo se libera al llegar a "done". ----- */
  useEffect(() => {
    if (hidden || phase === "done") return;

    const blockEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blockKeys = (e: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    // Forzar scroll en 0 si algo se cuela
    const forceTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", blockEvent, { passive: false, capture: true });
    window.addEventListener("touchmove", blockEvent, { passive: false, capture: true });
    window.addEventListener("keydown", blockKeys, { passive: false, capture: true });
    window.addEventListener("scroll", forceTop, { passive: true });

    return () => {
      window.removeEventListener("wheel", blockEvent, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("touchmove", blockEvent, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("keydown", blockKeys, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("scroll", forceTop);
    };
  }, [hidden, phase]);

  /* ----- Cursor "CLICK" siguiendo el mouse durante idle ----- */
  useEffect(() => {
    if (hidden) return;
    const handleMove = (e: MouseEvent) => {
      if (cursorHintRef.current) {
        cursorHintRef.current.style.transform = `translate3d(${
          e.clientX + 14
        }px, ${e.clientY - 8}px, 0)`;
      }
    };
    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [hidden]);

  /* ----- Click → trigger explosión desde el grid actual ----- */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "idle") return;
    const { cols, rows } = dimsRef.current;
    const now = performance.now();

    // 1. Calcular las celdas activas del grid en este instante
    const phaseShift   = now * 0.0016;
    const phaseShift2  = now * 0.0023;
    const breathe      = 1 + 0.30 * Math.sin(now * 0.00055);
    const spreadPulse  = 1 + 0.18 * Math.sin(now * 0.00070 + Math.PI / 3);
    const cx = cols / 2, cy = rows / 2;
    const baseW   = cols * WAVE_AMP;
    const halfH   = (rows * RIBBON_HEIGHT) / 2;
    const spreadW = cols * RIBBON_SPREAD * spreadPulse;

    const activeCells: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < rows; r++) {
      const by = (r - cy) / halfH;
      if (Math.abs(by) > 1.0) continue;
      const wave1 = Math.sin(by * WAVE_CYCLES * Math.PI + phaseShift) * breathe;
      const wave2 = 0.30 * Math.sin(by * WAVE_CYCLES * 2 * Math.PI + phaseShift2);
      const waveCenterX = cx + (wave1 + wave2) * baseW;
      const leftEdge  = Math.max(0,        Math.floor(waveCenterX - spreadW));
      const rightEdge = Math.min(cols - 1, Math.ceil(waveCenterX  + spreadW));
      for (let c = leftEdge; c <= rightEdge; c++) {
        if (Math.abs(c - waveCenterX) / spreadW <= 1.0) {
          activeCells.push({ x: c, y: r });
        }
      }
    }

    // 2. Posicionar partículas en las celdas activas del grid
    const particles = particlesRef.current;
    const shuffled  = [...activeCells].sort(() => Math.random() - 0.5);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (i < shuffled.length) {
        p.x = shuffled[i].x;
        p.y = shuffled[i].y;
      } else {
        // Extras: fuera de pantalla en dirección aleatoria
        const angle = Math.random() * Math.PI * 2;
        p.x = cx + Math.cos(angle) * cols;
        p.y = cy + Math.sin(angle) * rows;
      }
      p.char = pickFrom(WAVE_CHARS);
    }

    // 3. Velocidades de explosión radial desde el punto de click
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * cols;
    const clickY = ((e.clientY - rect.top) / rect.height) * rows;
    for (const p of particles) {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.max(0.5, Math.sqrt(dx * dx + dy * dy));
      const speed = 1.4 + Math.random() * 1.6;
      p.vx = (dx / dist) * speed + (Math.random() - 0.5) * 0.7;
      p.vy = (dy / dist) * speed + (Math.random() - 0.5) * 0.7;
    }

    phaseRef.current = "exploding";
    phaseStartRef.current = now;
    setPhase("exploding");
  };

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="loading-screen"
      role="presentation"
      aria-hidden="true"
    >
      <pre
        ref={preRef}
        className="loading-grid"
      />

      {phase === "idle" && (
        <div ref={cursorHintRef} className="loading-cursor-hint">
          CLICK
        </div>
      )}
    </div>
  );
}
