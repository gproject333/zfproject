"use client";

import { useQuery } from "convex/react";
import { FileText, type LucideIcon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { STATUS_CONFIG } from "@/lib/configs/application";

export interface SupervisorStatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Color for the chip-style status text (used elsewhere). */
  color: string;
  /** Background for the chip-style status pill (used elsewhere). */
  bg: string;
  /**
   * Theme-aware icon color for the dashboard tile. Must remain legible on
   * `bg-muted`, which means we use brand-tinted tokens (text-status-*,
   * text-success, text-destructive) instead of `text-foreground` for the
   * status-bearing cards — those would otherwise blend into the muted
   * surface in dark mode.
   */
  iconColor: string;
  filter?: string;
}

/**
 * Loads the supervisor dashboard stats + current user and derives the
 * status-backed stat cards. Card visuals come from STATUS_CONFIG so a
 * single source of truth drives both the list badges and the cards.
 */
export function useSupervisorDashboardStats() {
  const stats = useQuery(api.applications.shared.applicationStats, {});
  const user = useQuery(api.users.shared.currentUser);

  const loading = stats === undefined || user === undefined;

  const statCards: SupervisorStatCard[] = stats
    ? [
        {
          label: "إجمالي الطلبات",
          value: stats.total,
          icon: FileText,
          color: "text-foreground",
          iconColor: "text-foreground",
          bg: "bg-muted",
        },
        {
          label: "قيد المراجعة",
          value: stats.underReview,
          icon: STATUS_CONFIG.under_review.icon,
          color: STATUS_CONFIG.under_review.text,
          iconColor: "text-status-pending",
          bg: STATUS_CONFIG.under_review.bg,
          filter: "under_review",
        },
        {
          label: "يحتاج تعديل",
          value: stats.needsModification,
          icon: STATUS_CONFIG.needs_modification.icon,
          color: STATUS_CONFIG.needs_modification.text,
          iconColor: "text-status-modification",
          bg: STATUS_CONFIG.needs_modification.bg,
          filter: "needs_modification",
        },
        {
          label: "مقبولة",
          value: stats.accepted,
          icon: STATUS_CONFIG.accepted.icon,
          color: STATUS_CONFIG.accepted.text,
          iconColor: "text-success",
          bg: STATUS_CONFIG.accepted.bg,
          filter: "accepted",
        },
        {
          label: "مرفوضة",
          value: stats.rejected,
          icon: STATUS_CONFIG.rejected.icon,
          color: STATUS_CONFIG.rejected.text,
          iconColor: "text-destructive",
          bg: STATUS_CONFIG.rejected.bg,
          filter: "rejected",
        },
      ]
    : [];

  return { stats, user, statCards, loading };
}
