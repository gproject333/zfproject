"use client";

/**
 * Subtle olive leaves drifting upward through the hero column. Pure CSS —
 * each leaf has its own duration/delay/x-drift baked in via inline custom
 * properties so they don't sync. Hidden on small screens (where space is
 * already tight) and suppressed via the global reduced-motion media query.
 */

interface LeafParticlesProps {
  /** Number of leaves to render. Default 6. */
  count?: number;
  /** Optional className for the container. */
  className?: string;
}

interface Leaf {
  left: number;     // percentage horizontal start position
  size: number;     // px
  duration: number; // s
  delay: number;    // s
  driftX: number;   // px horizontal drift over the lifetime
  rot: number;      // deg total rotation
}

/** Hand-tuned, evenly distributed leaves — deterministic so SSR + CSR match. */
const LEAVES: Leaf[] = [
  { left: 10, size: 14, duration: 14, delay: 0,    driftX: 30,  rot: 200 },
  { left: 28, size: 11, duration: 18, delay: 4,    driftX: -25, rot: -180 },
  { left: 45, size: 16, duration: 16, delay: 1.5,  driftX: 20,  rot: 220 },
  { left: 62, size: 10, duration: 20, delay: 6,    driftX: -35, rot: -150 },
  { left: 78, size: 13, duration: 15, delay: 2.5,  driftX: 25,  rot: 190 },
  { left: 90, size: 12, duration: 17, delay: 8,    driftX: -20, rot: -200 },
];

export default function LeafParticles({ count = 6, className = "" }: LeafParticlesProps) {
  const leaves = LEAVES.slice(0, count);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden hidden md:block ${className}`}
    >
      {leaves.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 24 12"
          width={l.size}
          height={l.size * 0.5}
          className="absolute animate-leaf-drift will-change-transform"
          style={
            {
              left: `${l.left}%`,
              bottom: 0,
              "--drift-duration": `${l.duration}s`,
              "--drift-delay": `${l.delay}s`,
              "--drift-x": `${l.driftX}px`,
              "--drift-rot": `${l.rot}deg`,
            } as React.CSSProperties
          }
        >
          <ellipse
            cx="12"
            cy="6"
            rx="11"
            ry="5"
            fill="var(--color-primary, #1F5C2E)"
            opacity="0.55"
          />
        </svg>
      ))}
    </div>
  );
}
