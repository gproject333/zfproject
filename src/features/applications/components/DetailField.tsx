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
}

/**
 * Read-only label/value row used across application detail pages.
 * Renders nothing when value is empty.
 */
export default function DetailField({ label, value, icon, dir }: DetailFieldProps) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1">
        {icon}
        {label}
      </dt>
      <dd
        dir={dir}
        className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg overflow-hidden break-words whitespace-pre-wrap"
      >
        {value}
      </dd>
    </div>
  );
}
