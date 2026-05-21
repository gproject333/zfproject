import type { SVGProps, ReactNode } from "react";

/**
 * Hand-drawn line-art icon set for the landing page — one consistent
 * stroke weight, `currentColor` so the theme drives the colour, and
 * olive-incubator motifs (a sprout in the idea bulb, a flag on the
 * campus). Drop-in compatible with the lucide icon API:
 * `<IdeaIcon className="w-7 h-7" />`.
 */
function Base({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** فكرة ريادية — a lightbulb whose filament is an olive sprout (idea + growth). */
export function IdeaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      {/* spark rays */}
      <path d="M12 1.6V2.7M6.4 4.7l.8.8M17.6 4.7l-.8.8" />
      {/* bulb glass */}
      <circle cx="12" cy="9.5" r="6" />
      {/* screw base */}
      <path d="M9.6 16.3 10.2 18.8M14.4 16.3 13.8 18.8M9.6 16.3h4.8M10.2 18.8h3.6M11 21.3h2" />
      {/* olive sprout */}
      <path d="M12 14V8" />
      <path d="M12 11Q9.7 10.8 9.3 8.4Q11.6 8.8 12 11Z" />
      <path d="M12 9.6Q14.3 9.4 14.7 7.1Q12.4 7.5 12 9.6Z" />
    </Base>
  );
}

/** مشروع IT — a monitor window with code chevrons. */
export function CodeProjectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="4.5" width="18" height="13" rx="2" />
      <path d="M3 8.5h18" />
      <circle cx="5.6" cy="6.5" r=".55" fill="currentColor" stroke="none" />
      <circle cx="7.7" cy="6.5" r=".55" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="6.5" r=".55" fill="currentColor" stroke="none" />
      <path d="M10 11.4 8 13.2l2 1.8M14 11.4l2 1.8-2 1.8" />
      <path d="M9 21h6M12 17.5V21" />
    </Base>
  );
}

/** مشروع يخدم الجامعة — a columned campus building with a flag. */
export function CampusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      {/* flag */}
      <path d="M12 4.6V1.8M12 2.2h2.3l-.7.9.7.9H12" />
      {/* pediment roof */}
      <path d="M3.5 9.7 12 4.8l8.5 4.9" />
      {/* walls + columns */}
      <path d="M5 9.7v7.6M19 9.7v7.6M9 12v5.3M12 12v5.3M15 12v5.3" />
      {/* steps */}
      <path d="M5 17.3h14M3.3 20.4h17.4" />
    </Base>
  );
}

/** انضمّ إلينا — two people with a plus. */
export function JoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      {/* front person */}
      <circle cx="9.3" cy="8" r="3.2" />
      <path d="M3.8 19v-.4a5.5 5.5 0 0 1 11 0v.4" />
      {/* second person, partly behind */}
      <path d="M15.4 5.3a3 3 0 0 1 .25 5.5" />
      <path d="M16.6 13.5a5.5 5.5 0 0 1 3.6 5.1v.4" />
      {/* plus */}
      <path d="M19 3.4v3.1M17.45 4.95h3.1" />
    </Base>
  );
}
