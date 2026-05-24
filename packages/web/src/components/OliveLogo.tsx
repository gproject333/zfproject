/**
 * Olive branch mark — two leaves growing from a central stem with an
 * olive fruit at the base. Theme-aware via tokens: leaves use
 * var(--primary), the olive fruit uses var(--secondary), and the
 * stem + outline use var(--foreground) at low opacity so the mark
 * follows light and dark themes automatically.
 *
 * Designed to read at all sizes, from a 24px navbar tile to a 96px
 * footer hero.
 */
export default function OliveLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <radialGradient id="oliveGradient" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--secondary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      {/* Central stem */}
      <path
        d="M 60 22 Q 60 50, 60 85"
        stroke="var(--foreground)"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaf — tilts upward, pointed tip away from stem */}
      <g>
        <path
          d="M 60 42 Q 28 30, 18 50 Q 28 64, 60 52 Z"
          fill="url(#leafGradient)"
          stroke="var(--foreground)"
          strokeOpacity="0.7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Leaf vein */}
        <path
          d="M 58 47 Q 38 47, 22 50"
          stroke="var(--foreground)"
          strokeOpacity="0.25"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Right leaf — mirror, sits slightly lower for natural look */}
      <g>
        <path
          d="M 60 56 Q 92 44, 102 64 Q 92 78, 60 66 Z"
          fill="url(#leafGradient)"
          stroke="var(--foreground)"
          strokeOpacity="0.7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 62 61 Q 82 61, 98 64"
          stroke="var(--foreground)"
          strokeOpacity="0.25"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Olive fruit at the base of the stem */}
      <g>
        <ellipse
          cx="60"
          cy="90"
          rx="13"
          ry="17"
          fill="url(#oliveGradient)"
          stroke="var(--foreground)"
          strokeOpacity="0.75"
          strokeWidth="2.5"
        />
        {/* Small highlight on the fruit — adds depth */}
        <ellipse
          cx="55"
          cy="83"
          rx="3.5"
          ry="5"
          fill="var(--background)"
          fillOpacity="0.35"
        />
      </g>
    </svg>
  );
}
