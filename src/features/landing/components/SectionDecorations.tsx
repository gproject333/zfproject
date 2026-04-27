"use client";

/**
 * Geometric decorative shapes for section backgrounds.
 * Inspired by modern Arabic/tech landing pages — rotated squares,
 * dotted grids, and diamond shapes on the sides.
 */

/** Dotted diamond shape */
function DottedDiamond({
  className = "",
  size = 80,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Diamond outline */}
        <rect
          x="12"
          y="12"
          width="56"
          height="56"
          rx="4"
          transform="rotate(45 40 40)"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.25"
        />
        {/* Inner dots grid */}
        {[24, 34, 44, 54].map((x) =>
          [24, 34, 44, 54].map((y) => {
            const dx = x - 40;
            const dy = y - 40;
            const inside = Math.abs(dx) + Math.abs(dy) <= 32;
            if (!inside) return null;
            return (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="2"
                fill="currentColor"
                opacity="0.2"
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

/** Simple rotated square outline */
function RotatedSquare({
  className = "",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="3"
          transform="rotate(45 24 24)"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

/** Corner bracket decoration */
function CornerBracket({
  className = "",
  size = 60,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path
          d="M4 20V8a4 4 0 014-4h12M40 4h12a4 4 0 014 4v12M56 40v12a4 4 0 01-4 4H40M20 56H8a4 4 0 01-4-4V40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}

/**
 * Ready-made decoration sets for sections.
 * Place inside a `relative overflow-hidden` container.
 */

export function DecorationsA() {
  return (
    <>
      <DottedDiamond
        className="absolute top-8 right-4 md:right-12 text-primary animate-float hidden md:block"
        size={90}
      />
      <RotatedSquare
        className="absolute bottom-12 left-4 md:left-16 text-secondary animate-float hidden md:block"
        size={50}
        />
      <CornerBracket
        className="absolute top-1/3 left-4 md:left-8 text-accent hidden lg:block"
        size={50}
      />
    </>
  );
}

export function DecorationsB() {
  return (
    <>
      <DottedDiamond
        className="absolute bottom-8 right-4 md:right-16 text-secondary animate-float hidden md:block"
        size={70}
      />
      <RotatedSquare
        className="absolute top-10 left-4 md:left-12 text-primary animate-float hidden md:block"
        size={55}
      />
      <CornerBracket
        className="absolute bottom-1/4 left-4 md:left-6 text-primary/70 hidden lg:block"
        size={60}
      />
    </>
  );
}

export function DecorationsC() {
  return (
    <>
      <CornerBracket
        className="absolute top-6 right-4 md:right-10 text-accent hidden md:block"
        size={65}
      />
      <DottedDiamond
        className="absolute bottom-6 left-4 md:left-10 text-primary animate-float hidden md:block"
        size={80}
      />
    </>
  );
}
