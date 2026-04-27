import type { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

/**
 * Labeled list row with an icon badge. Used in profile / summary
 * cards where the value may be a link, phone number, or formatted
 * element (not just plain text like DetailField).
 */
export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 nb-border rounded-lg bg-muted text-primary flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-semibold break-words">{value}</p>
      </div>
    </div>
  );
}
