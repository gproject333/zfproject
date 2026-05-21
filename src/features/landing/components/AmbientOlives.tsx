"use client";

/**
 * Page-wide ambient olive leaves. Sits behind everything at low opacity,
 * fixed to the viewport so it travels with the user as they scroll. Each
 * leaf has its own drift duration/delay so the field never syncs. Hidden on
 * small screens and disabled by `prefers-reduced-motion` via globals.css.
 */

interface AmbientLeaf {
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rot: number;
}

const LEAVES: AmbientLeaf[] = [
  { top: 12, left: 6,  size: 22, duration: 9,  delay: 0,   rot: -15 },
  { top: 28, left: 88, size: 18, duration: 11, delay: 2,   rot: 20  },
  { top: 55, left: 4,  size: 26, duration: 10, delay: 4,   rot: 10  },
  { top: 70, left: 92, size: 20, duration: 12, delay: 1,   rot: -25 },
  { top: 40, left: 50, size: 16, duration: 13, delay: 3,   rot: 45  },
  { top: 85, left: 30, size: 22, duration: 9,  delay: 5,   rot: -30 },
];

export default function AmbientOlives() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 hidden md:block overflow-hidden"
    >
      {LEAVES.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 40 20"
          width={l.size}
          height={l.size * 0.5}
          className="absolute animate-float"
          style={{
            top: `${l.top}%`,
            left: `${l.left}%`,
            transform: `rotate(${l.rot}deg)`,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            opacity: 0.07,
          }}
        >
          <ellipse cx="20" cy="10" rx="18" ry="8" fill="var(--color-primary, #1F5C2E)" />
        </svg>
      ))}
    </div>
  );
}
