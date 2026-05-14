"use client";

import { useQuery } from "convex/react";
import { BarChart3 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { SkeletonStatCards } from "@/components/ui/Skeleton";
import StatsGrid from "./adminDashboard/StatsGrid";
import QuickLinks from "./adminDashboard/QuickLinks";
import ChartsRow from "./adminDashboard/ChartsRow";
import AcceptanceRateCard from "./adminDashboard/AcceptanceRateCard";
import ActivityLogCard from "./adminDashboard/ActivityLogCard";

/**
 * Top-level composer for the admin landing dashboard. Owns data fetching;
 * each panel below is presentational — keep new sections in their own file
 * under ./adminDashboard.
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
      <div>
        <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2">
          <BarChart3 className="w-7 h-7" style={{ color: "#DC2626" }} />
          لوحة تحكم النظام
        </h2>
        <p className="text-muted-foreground font-medium">
          نظرة شاملة على منصة حاضنة الزيتونة — جميع الإحصائيات
        </p>
      </div>

      <StatsGrid stats={stats} pendingUpgradeCount={pendingUpgradeCount} />
      <QuickLinks />
      <ChartsRow collegeStats={collegeStats} monthlyStats={monthlyStats} appStatusStats={appStatusStats} />

      {stats.totalApplications > 0 && (
        <AcceptanceRateCard
          accepted={stats.acceptedApplications}
          rejected={stats.rejectedApplications}
          pending={stats.totalApplications - stats.acceptedApplications - stats.rejectedApplications}
        />
      )}

      <ActivityLogCard logs={activityLogs} />
    </div>
  );
}
