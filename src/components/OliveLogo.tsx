/**
 * Six-radial olive mark. The shape is read as a stylised top-down view of
 * an olive tree's leaf canopy with a single olive fruit at the centre.
 *
 * Uses theme tokens (--primary for petals, --foreground for stroke,
 * --secondary for the fruit) so the logo follows light/dark themes
 * automatically — no hardcoded hex.
 */
export default function OliveLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true">
      <g transform="translate(150 150)">
        <g
          fill="var(--primary)"
          stroke="var(--foreground)"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        >
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)" />
        </g>
        <ellipse
          cx="0"
          cy="0"
          rx="13"
          ry="17"
          fill="var(--secondary)"
          stroke="var(--foreground)"
          strokeWidth="4"
          strokeOpacity="0.85"
        />
      </g>
    </svg>
  );
}
