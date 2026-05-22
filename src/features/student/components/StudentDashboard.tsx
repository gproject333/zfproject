"use client";

import { useRouter } from "next/navigation";
import { Plus, ArrowUpCircle, Clock, XCircle } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { Button, Card } from "@/components/ui";
import { useStudentDashboardStats } from "@/features/student/hooks/useStudentDashboardStats";
import StudentAvatar from "./StudentAvatar";
import AttentionSection from "./AttentionSection";
import RecentApplicationsCard from "./RecentApplicationsCard";
import RecentNotificationsCard from "./RecentNotificationsCard";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "@/lib/toast";

/**
 * Student dashboard: a work surface, not a second navigation menu.
 * Surfaces what needs the student's action first (AttentionSection),
 * then a compact status overview and recent activity.
 */
export default function StudentDashboard() {
  const router = useRouter();
  const { stats, user, statCards, loading } = useStudentDashboardStats();
  const upgradeRequest = useQuery(api.supervisorUpgradeRequests.getMyRequest, {});
  const submitRequest = useMutation(api.supervisorUpgradeRequests.submitRequest);

  const isZujStaff = user?.email?.endsWith("@zuj.edu.jo") ?? false;

  const handleUpgradeRequest = async () => {
    try {
      await submitRequest({});
      toast.success("تم تقديم طلب الترقية بنجاح، سيتم مراجعته قريباً");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  if (loading || !stats) return <SkeletonDashboard />;

  return (
    <div className="space-y-6">
      {/* Welcome + primary action */}
      <div className="flex flex-wrap items-center gap-4">
        <StudentAvatar name={user?.name} avatarId={user?.avatar} size="lg" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">مرحباً، {user?.name ?? "بك"}</h2>
          {user?.department && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.department}
            </p>
          )}
        </div>
        <Button
          onPress={() => router.push("/student/new")}
          variant="primary"
          className="ms-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          تقديم طلب جديد
        </Button>
      </div>

      {/* What needs the student's action */}
      {stats.needsModification > 0 && <AttentionSection />}

      {/* Compact status overview — one clickable strip, not hero cards */}
      <div className="ds-card overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-foreground/10">
          {statCards.map((stat) => (
            <button
              key={stat.label}
              onClick={() =>
                router.push(
                  stat.filter
                    ? `/student/applications?status=${stat.filter}`
                    : "/student/applications"
                )
              }
              className="bg-card px-4 py-4 flex flex-col items-center gap-1 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {stat.value}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Supervisor upgrade banner — for @zuj.edu.jo emails only */}
      {isZujStaff && (
        <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted ds-border flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">الترقية إلى مشرف</h3>
            {upgradeRequest === undefined ? null : upgradeRequest === null ? (
              <p className="text-sm text-muted-foreground mt-0.5">
                بريدك الجامعي مؤهل للترقية إلى مشرف أكاديمي. اضغط لتقديم الطلب.
              </p>
            ) : upgradeRequest.status === "pending" ? (
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-4 h-4 text-warning" />
                <p className="text-sm text-warning">طلبك قيد المراجعة من قِبل الإدارة</p>
              </div>
            ) : upgradeRequest.status === "approved" ? (
              <p className="text-sm text-success mt-0.5">تمت الموافقة على طلبك</p>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <XCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">تم رفض طلبك السابق — يمكنك إعادة التقديم</p>
              </div>
            )}
          </div>
          {(upgradeRequest === null || upgradeRequest?.status === "rejected") && (
            <Button
              onPress={handleUpgradeRequest}
              variant="primary"
              size="sm"
              className="shrink-0"
            >
              طلب الترقية
            </Button>
          )}
        </Card>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentApplicationsCard />
        <RecentNotificationsCard />
      </div>
    </div>
  );
}
