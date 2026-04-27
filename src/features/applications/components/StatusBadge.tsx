import { STATUS_CONFIG } from "@/lib/configs/application";
import type { ApplicationStatus } from "../../../../convex/lib/statuses";

interface StatusBadgeProps {
  status: ApplicationStatus;
  /** Compact variant used inline in card headers. */
  size?: "sm" | "md";
  /** Soft-UI variant: lighter border + subtle shadow, for list rows. */
  soft?: boolean;
}

/**
 * Shared status pill rendered from `STATUS_CONFIG`. Replaces inline
 * `statusCfg.bg/text/icon/label` constructions scattered across the app.
 */
export default function StatusBadge({
  status,
  size = "md",
  soft = false,
}: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const base = soft ? "nb-badge-soft" : "nb-badge";
  const sizeClass = !soft && size === "sm" ? "text-xs px-2 py-0.5" : "";
  return (
    <div className={`${base} ${cfg.bg} ${cfg.text} ${sizeClass}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </div>
  );
}
