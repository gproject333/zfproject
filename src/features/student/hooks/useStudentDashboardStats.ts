"use client";

import { useQuery } from "convex/react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";

export interface StudentStatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  filter?: string;
}

/**
 * Loads the student dashboard stats + current user and builds the
 * quick-stats card array. Component layer remains concerned only with
 * rendering the grid and wiring onClick navigation.
 */
export function useStudentDashboardStats() {
  const stats = useQuery(api.applications.shared.applicationStats, {});
  const user = useQuery(api.users.shared.currentUser);

  const loading =
    stats === undefined || stats === null || user === undefined;

  const statCards: StudentStatCard[] = stats
    ? [
        {
          label: "إجمالي الطلبات",
          value: stats.total,
          icon: FileText,
          color: "bg-primary",
        },
        {
          label: "قيد المراجعة",
          value: stats.underReview,
          icon: Clock,
          color: "bg-status-pending",
          filter: "under_review",
        },
        {
          label: "مقبولة",
          value: stats.accepted,
          icon: CheckCircle2,
          color: "bg-success",
          filter: "accepted",
        },
        {
          label: "تحتاج تعديل",
          value: stats.needsModification,
          icon: AlertTriangle,
          color: "bg-status-modification",
          filter: "needs_modification",
        },
      ]
    : [];

  return { stats, user, statCards, loading };
}
