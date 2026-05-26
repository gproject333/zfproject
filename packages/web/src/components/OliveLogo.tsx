/**
 * Monogram-style brand mark for حاضنة الزيتونة (ZUJ Incubator).
 *
 * Direct nod to cache-team.com's logo language: one oversized brand-color
 * letter, a smaller white counter-form nested inside, and a soft drop
 * shadow underneath so the mark reads as a tactile object rather than a
 * flat glyph. The chosen letter is "ز" — the leading character of
 * الزيتونة (the olive) and a recognisable hook for the brand. A tiny
 * olive replaces the diacritical dot so the icon stays unmistakably ours.
 *
 * Theme-aware via tokens: the body uses var(--primary), the inner copy
 * uses var(--background) so it inverts cleanly in dark mode, and the
 * olive accent uses var(--secondary).
 *
 * Rendered with SVG `<text>` so the Arabic glyph is always shaped
 * correctly by the system font stack — no fragile hand-drawn paths.
 */
export default function OliveLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft drop shadow under the mark */}
        <filter id="oliveLogoShadow" x="-25%" y="-15%" width="150%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" />
          <feOffset dx="0" dy="3.5" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.32" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle vertical sheen for depth on the body */}
        <linearGradient id="oliveLogoBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="55%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>

      <g filter="url(#oliveLogoShadow)">
        {/* Rounded brand-colored container */}
        <rect
          x="10"
          y="14"
          width="100"
          height="100"
          rx="28"
          fill="url(#oliveLogoBody)"
        />

        {/* Big inverted ز in the background color — the main letterform */}
        <text
          x="60"
          y="92"
          textAnchor="middle"
          fontFamily="'Cairo','Tajawal','IBM Plex Sans Arabic',system-ui,sans-serif"
          fontWeight="900"
          fontSize="78"
          fill="var(--background)"
          style={{ direction: "rtl" }}
        >
          ز
        </text>

        {/* Tiny olive sitting on top-right corner — accent that ties the
            monogram to the brand (الزيتونة = the olive). */}
        <g transform="translate(86 26)">
          <ellipse cx="0" cy="0" rx="10" ry="13" fill="var(--secondary)" />
          {/* Curling leaf off the olive */}
          <path
            d="M 7 -10 Q 18 -16, 19 -5 Q 13 -2, 6 -7 Z"
            fill="url(#oliveLogoBody)"
          />
          {/* Highlight */}
          <ellipse
            cx="-3"
            cy="-4"
            rx="2.4"
            ry="3.5"
            fill="var(--background)"
            fillOpacity="0.5"
          />
        </g>
      </g>
    </svg>
  );
}
