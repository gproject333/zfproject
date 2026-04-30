"use client";

import {
  CheckCircle2,
  MessageSquare,
  Brain,
  Info,
  Star,
  Megaphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

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
        className={`w-8 h-8 rounded-lg nb-border flex items-center justify-center shrink-0 mt-0.5 ${
          !n.read ? "bg-primary" : "bg-muted"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight mb-0.5">{n.title}</p>
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
