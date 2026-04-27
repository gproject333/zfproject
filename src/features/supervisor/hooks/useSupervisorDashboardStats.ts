"use client";

import { useQuery } from "convex/react";
import { FileText, type LucideIcon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { STATUS_CONFIG } from "@/lib/configs/application";

export interface SupervisorStatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
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
          bg: "bg-muted",
        },
        {
          label: "قيد المراجعة",
          value: stats.underReview,
          icon: STATUS_CONFIG.under_review.icon,
          color: STATUS_CONFIG.under_review.text,
          bg: STATUS_CONFIG.under_review.bg,
          filter: "under_review",
        },
        {
          label: "يحتاج تعديل",
          value: stats.needsModification,
          icon: STATUS_CONFIG.needs_modification.icon,
          color: STATUS_CONFIG.needs_modification.text,
          bg: STATUS_CONFIG.needs_modification.bg,
          filter: "needs_modification",
        },
        {
          label: "مقبولة",
          value: stats.accepted,
          icon: STATUS_CONFIG.accepted.icon,
          color: STATUS_CONFIG.accepted.text,
          bg: STATUS_CONFIG.accepted.bg,
          filter: "accepted",
        },
        {
          label: "مرفوضة",
          value: stats.rejected,
          icon: STATUS_CONFIG.rejected.icon,
          color: STATUS_CONFIG.rejected.text,
          bg: STATUS_CONFIG.rejected.bg,
          filter: "rejected",
        },
      ]
    : [];

  return { stats, user, statCards, loading };
}
