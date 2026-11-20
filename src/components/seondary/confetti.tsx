
import React, { useEffect, useRef, useState } from "react";

/**
 * FallingConfetti — lightweight, canvas-based confetti component
 * --------------------------------------------------------------
 * Usage:
 * <FallingConfetti
 *   pieces={200}
 *   colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#a855f7"]}
 *   duration={5000}
 *   recycle={false}
 *   fadeOut
 * />
 *
 * Props:
 * - pieces: number of confetti pieces (default 150)
 * - colors: array of CSS color strings (default nice rainbow)
 * - duration: how long to emit pieces in ms (default 3000ms)
 * - recycle: keep emitting indefinitely (default false)
 * - fadeOut: fade & slow pieces after duration (default true)
 * - zIndex: z-index for canvas overlay (default 50)
 * - className: extra classnames (e.g., fixed inset-0 pointer-events-none)
 */

export type FallingConfettiProps = {
  pieces?: number;
  colors?: string[];
  duration?: number;
  recycle?: boolean;
  fadeOut?: boolean;
  zIndex?: number;
  className?: string;
};

// Helper for random ranges
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Confetti piece type
interface Piece {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  r: number; // rotation
  vr: number; // rotation velocity
  color: string;
  tilt: number; // oscillation
  vt: number; // tilt speed
  opacity: number;
}

const DEFAULT_COLORS = [
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#a855f7", // violet-500
  "#ec4899", // pink-500
];

const createPiece = (width: number, height: number, colors: string[]): Piece => {
  const size = rand(6, 12);
  return {
    x: rand(0, width),
    y: rand(-height * 0.2, -10),
    w: size * rand(0.8, 1.4),
    h: size * rand(0.6, 1.2),
    vx: rand(-0.8, 0.8),
    vy: rand(1.2, 2.4),
    r: rand(0, Math.PI * 2),
    vr: rand(-0.1, 0.1),
    color: colors[(Math.random() * colors.length) | 0],
    tilt: rand(0, Math.PI * 2),
    vt: rand(0.02, 0.05),
    opacity: 1,
  };
};

const FallingConfetti: React.FC<FallingConfettiProps> = ({
  pieces = 150,
  colors = DEFAULT_COLORS,
  duration = 13000,
  recycle = false,
  fadeOut = true,
  zIndex = 50,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize & handle device pixel ratio
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Create pieces
    let pool: Piece[] = Array.from({ length: pieces }, () => createPiece(canvas.width, canvas.height, colors));

    const tick = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;

      // After duration, either stop or fade out
      if (!recycle && elapsed > duration) {
        setRunning(false);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill more pieces if recycling
      if (recycle && pool.length < pieces) {
        pool.push(createPiece(canvas.width, canvas.height, colors));
      }

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];

        // motion
        p.tilt += p.vt;
        p.x += p.vx + Math.sin(p.tilt) * 0.6; // sway
        p.y += p.vy;
        p.r += p.vr;

        // fade out at the end
        if (!recycle && fadeOut && elapsed > duration) {
          p.opacity = Math.max(0, p.opacity - 0.02);
        }

        // recycle piece when off-screen or fully transparent
        const outOfBounds = p.y - p.h > canvas.height || p.x < -20 || p.x > canvas.width + 20 || p.opacity <= 0.01;
        if (outOfBounds) {
          if (recycle || (elapsed <= duration)) {
            pool[i] = createPiece(canvas.width, canvas.height, colors);
            continue;
          }
        }

        // draw
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (running || (fadeOut && pool.some(p => p.opacity > 0.01))) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pieces, colors, duration, recycle, fadeOut, running]);

  return (
    <div className={`pointer-events-none fixed inset-0 ${className ?? ""}`} style={{ zIndex }}>
      <canvas ref={canvasRef} className="h-screen w-screen" />
    </div>
  );
};

export default FallingConfetti;

/**
 * Optional: Quick demo component (uncomment to preview)
 *
 * export default function Demo() {
 *   const [show, setShow] = useState(false);
 *   return (
 *     <div className="min-h-screen grid place-items-center bg-slate-900 text-white">
 *       <button
 *         onClick={() => setShow(s => !s)}
 *         className="px-4 py-2 rounded-2xl shadow bg-white/10 hover:bg-white/20 transition"
 *       >
 *         {show ? "Stop" : "Celebrate"}
 *       </button>
 *       {show && <FallingConfetti pieces={220} duration={4000} recycle={false} fadeOut zIndex={60} />}
 *     </div>
 *   );
 * }
 */
