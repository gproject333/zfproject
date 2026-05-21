import type { ReactNode } from "react";

interface DetailFieldProps {
  label: string;
  value: string | undefined | null;
  icon?: ReactNode;
  /**
   * Optional text direction for the value, e.g. `"ltr"` for phone numbers
   * so they render correctly in an RTL page.
   */
  dir?: "ltr" | "rtl";
  /** Span both columns in a two-column field grid (for long-form text). */
  wide?: boolean;
}

/**
 * Read-only label/value row used across application detail pages.
 * Renders nothing when value is empty.
 */
export default function DetailField({ label, value, icon, dir, wide }: DetailFieldProps) {
  if (!value) return null;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
        {icon}
        {label}
      </dt>
      <dd
        dir={dir}
        className="text-sm leading-relaxed overflow-hidden break-words whitespace-pre-wrap"
      >
        {value}
      </dd>
    </div>
  );
}
