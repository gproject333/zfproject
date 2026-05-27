"use client";

/**
 * Olive-branded loading spinner — the same six-petal mark used on the
 * post-login waiting room, packaged as a reusable component so every
 * loading state across the app rotates the same olive instead of a
 * generic ring. Size scales with the parent's font / w-h utilities.
 */
export default function OliveSpinner({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dimension =
    size === "xs"
      ? "w-4 h-4"
      : size === "sm"
        ? "w-6 h-6"
        : size === "md"
          ? "w-9 h-9"
          : size === "lg"
            ? "w-14 h-14"
            : "w-20 h-20";

  return (
    <svg
      viewBox="0 0 300 300"
      className={`${dimension} ${className}`}
      style={{ animation: "olive-spin 2.4s linear infinite" }}
      aria-hidden="true"
      role="img"
    >
      <style>{`
        @keyframes olive-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <g transform="translate(150 150)">
        <g
          fill="currentColor"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="3.5"
          strokeLinejoin="round"
        >
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(60)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(120)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(180)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(240)" />
          <path d="M 0 -20 Q 14 -54, 0 -90 Q -14 -54, 0 -20 Z" transform="rotate(300)" />
        </g>
        <ellipse cx="0" cy="0" rx="13" ry="17" fill="currentColor" fillOpacity="0.85" />
      </g>
    </svg>
  );
}
