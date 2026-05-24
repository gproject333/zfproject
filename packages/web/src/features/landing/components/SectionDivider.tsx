"use client";

/**
 * A minimal olive-branch divider — a thin curved stem with two leaves.
 * Used sparingly between sections to give a moment of breath. Centred
 * horizontally; respects flip for vertical mirror.
 */

interface SectionDividerProps {
  flip?: boolean;
  className?: string;
}

export default function SectionDivider({ flip = false, className = "" }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center py-3 ${className}`}
    >
      <div className="flex items-center gap-3 text-primary/40">
        {/* Left dot */}
        <div className="w-1 h-1 rounded-full bg-current" />
        {/* Branch */}
        <svg
          viewBox="0 0 120 28"
          width="120"
          height="28"
          className={flip ? "rotate-180" : ""}
        >
          {/* Curved stem */}
          <path
            d="M 5 14 Q 60 2, 115 14"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left leaf */}
          <ellipse
            cx="35"
            cy="9"
            rx="8"
            ry="3"
            transform="rotate(-30 35 9)"
            fill="currentColor"
            opacity="0.75"
          />
          {/* Right leaf */}
          <ellipse
            cx="85"
            cy="9"
            rx="8"
            ry="3"
            transform="rotate(30 85 9)"
            fill="currentColor"
            opacity="0.75"
          />
        </svg>
        {/* Right dot */}
        <div className="w-1 h-1 rounded-full bg-current" />
      </div>
    </div>
  );
}
