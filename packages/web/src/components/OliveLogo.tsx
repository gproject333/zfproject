/**
 * Minimal monogram mark — bold Z (for ZUJ) with a smaller Z nested
 * inside, sitting on a soft drop shadow. Same logo language as
 * cache-team.com (one bold brand-color letter, a smaller inverted copy
 * carved into it, subtle shadow). No background tile, no extra
 * ornament — the letter is the whole identity.
 *
 * Theme-aware: outer Z uses var(--primary), inner Z uses
 * var(--background) so it inverts cleanly in dark mode.
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
        <filter id="logoZShadow" x="-15%" y="-10%" width="130%" height="135%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" />
          <feOffset dx="0" dy="3.5" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#logoZShadow)">
        {/* Outer bold Z */}
        <path
          d="
            M 16 18
            H 104
            Q 110 18, 110 24
            Q 110 30, 106 35
            L 40 95
            H 104
            Q 110 95, 110 101
            V 108
            Q 110 114, 104 114
            H 16
            Q 10 114, 10 108
            Q 10 102, 14 97
            L 80 37
            H 16
            Q 10 37, 10 31
            V 24
            Q 10 18, 16 18
            Z
          "
          fill="var(--primary)"
        />

        {/* Inner nested Z — slightly inset, in the background color */}
        <path
          d="
            M 32 38
            H 88
            Q 91 38, 91 41
            Q 91 44, 89 46
            L 48 84
            H 88
            Q 91 84, 91 87
            V 91
            Q 91 94, 88 94
            H 32
            Q 29 94, 29 91
            Q 29 88, 31 86
            L 72 48
            H 32
            Q 29 48, 29 45
            V 41
            Q 29 38, 32 38
            Z
          "
          fill="var(--background)"
          fillOpacity="0.95"
        />
      </g>
    </svg>
  );
}
