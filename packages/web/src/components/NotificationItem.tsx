"use client";

import {
  CheckCircle2,
  MessageSquare,
  Brain,
  Info,
  Star,
  Megaphone,
  TrendingUp,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import type { Doc } from "@smart-zuj/convex";

export const NOTIFICATION_TYPE_ICONS: Record<
  Doc<"notifications">["type"] | "ai_evaluation",
  LucideIcon
> = {
  status_change: CheckCircle2,
  new_note: MessageSquare,
  new_application: Star,
  assignment: CheckCircle2,
  ai_evaluation: Brain,
  announcement: Megaphone,
  system: Info,
  upgrade_request: TrendingUp,
  meeting: CalendarClock,
};

export function notificationTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

interface NotificationItemProps {
  notification: Doc<"notifications">;
  onClick?: () => void;
  /** Tighter padding + borderless, for dashboard widget cards. */
  compact?: boolean;
}

/**
 * Shared row for a single notification — used by the bell dropdown and
 * by the recent-notifications dashboard widget. Keeps the icon/type map,
 * read/unread styling, and timestamp formatter in one place.
 */
export default function NotificationItem({
  notification: n,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_TYPE_ICONS[n.type] ?? Info;
  const padding = compact ? "px-3 py-2.5" : "px-4 py-3";
  const border = compact
    ? "border-b border-foreground/5 last:border-0"
    : "border-b border-foreground/5 last:border-0";
  return (
    <button
      onClick={onClick}
      className={`w-full text-right flex items-start gap-3 ${padding} hover:bg-muted transition-colors ${border} ${
        !n.read ? "bg-primary/5" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg ds-border flex items-center justify-center shrink-0 mt-0.5 ${
          !n.read ? "bg-primary" : "bg-muted"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold leading-tight truncate">{n.title}</p>
          {n.requireAck && !n.ackedAt && (
            <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 whitespace-nowrap">
              يستلزم تأكيدًا
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {notificationTimeAgo(n.createdAt)}
        </p>
      </div>
      {!n.read && (
        <span className="w-2 h-2 bg-destructive rounded-full shrink-0 mt-2" />
      )}
    </button>
  );
}
