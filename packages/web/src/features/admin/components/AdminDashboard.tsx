"use client";

import { useQuery } from "convex/react";
import { BarChart3 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { SkeletonStatCards } from "@/components/ui/Skeleton";
import StatsHero from "./adminDashboard/StatsHero";
import PendingActions from "./adminDashboard/PendingActions";
import ChartsRow from "./adminDashboard/ChartsRow";
import ActivityLogCard from "./adminDashboard/ActivityLogCard";

/**
 * Top-level composer for the admin landing dashboard. Owns data fetching;
 * each panel below is presentational — keep new sections in their own file
 * under ./adminDashboard.
 *
 * Layout (top-to-bottom):
 *   1. Header
 *   2. StatsHero — acceptance-rate hero + role counts
 *   3. PendingActions — only renders work that needs the admin's attention
 *   4. ChartsRow — distribution / trends / status breakdown
 *   5. ActivityLogCard — recent audit-log tail
 */
export default function AdminDashboard() {
  const stats = useQuery(api.users.admin.getAdminStats, {});
  const activityLogs = useQuery(api.activityLogs.recentLogs, { limit: 6 });
  const collegeStats = useQuery(api.users.admin.getStudentDistributionByCollege, {});
  const monthlyStats = useQuery(api.users.admin.getMonthlyRegistrationStats, {});
  const appStatusStats = useQuery(api.users.admin.getApplicationStatusStats, {});
  const upgradeRequests = useQuery(api.supervisorUpgradeRequests.listRequests, { status: "pending" });

  if (stats === undefined) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 w-52 bg-muted rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded-lg animate-pulse" />
        </div>
        <SkeletonStatCards />
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-bold text-destructive">غير مصرح — يجب أن تكون Admin</p>
      </div>
    );
  }

  const pendingUpgradeCount = upgradeRequests?.length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2 text-foreground">
          <BarChart3 className="w-7 h-7 text-primary" />
          لوحة تحكم النظام
        </h2>
        <p className="text-muted-foreground font-medium">
          نظرة شاملة على منصة حاضنة الزيتونة
        </p>
      </header>

      <StatsHero stats={stats} />

      <PendingActions
        pendingUpgrades={pendingUpgradeCount}
        underReviewApplications={stats.underReviewApplications}
      />

      <ChartsRow
        collegeStats={collegeStats}
        monthlyStats={monthlyStats}
        appStatusStats={appStatusStats}
      />

      <ActivityLogCard logs={activityLogs} />
    </div>
  );
}
