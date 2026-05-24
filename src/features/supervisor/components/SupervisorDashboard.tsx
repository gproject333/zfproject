"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, BookOpen, Inbox, FileText } from "lucide-react";
import { Card } from "@/components/ui";
import { SkeletonStatCards, Skeleton } from "@/components/ui/Skeleton";
import { ApplicationsDonut } from "@/components/charts/ApplicationsDonut";
import { useSupervisorDashboardStats } from "@/features/supervisor/hooks/useSupervisorDashboardStats";
import RecentActivity from "./RecentActivity";
import StudentAvatar from "@/features/student/components/StudentAvatar";

export default function SupervisorDashboard() {
  const router = useRouter();
  const { stats, user, statCards, loading } = useSupervisorDashboardStats();

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-52 mb-2" />
        <SkeletonStatCards />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <StudentAvatar name={user?.name} avatarId={user?.avatar} size="lg" />
        <div>
          <h2 className="text-2xl font-extrabold">
            مرحباً، {user?.name ?? "بك"}
          </h2>
        </div>
      </div>

      {/* Brand-new supervisor: zero applications in the system → replace
          the dead row of zero-count stat cards with a welcome panel. */}
      {stats.total === 0 ? (
        <Card className="p-6 sm:p-8 border-accent/30 bg-gradient-to-br from-accent/[0.05] via-accent/[0.02] to-transparent">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(36,82,55,0.5)]">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                صندوقك جاهز — لسّا ما وصلت طلبات
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1.5 leading-relaxed">
                أول ما يقدّم طالب طلب احتضان، حيظهر هنا للمراجعة. خلال انتظارك
                تقدر تجهّز محتوى للمكتبة وتضيف موارد للدليل الريادي.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/supervisor/articles"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  المقالات
                </Link>
                <Link
                  href="/supervisor/entrepreneurial-guide"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-card text-foreground font-bold text-sm ds-border hover:bg-muted transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  الدليل الريادي
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={() =>
              router.push(
                stat.filter
                  ? `/supervisor/applications?status=${stat.filter}`
                  : "/supervisor/applications"
              )
            }
            className="ds-card-interactive p-6 flex flex-col items-center text-center w-full"
          >
            <div className="w-12 h-12 rounded-xl ds-border flex items-center justify-center mb-4 bg-muted">
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/supervisor/entrepreneurial-guide" className="ds-card p-5 flex items-center gap-4 hover:ds-shadow transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/15 ds-border flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="font-extrabold text-base">الدليل الريادي</p>
            <p className="text-xs text-muted-foreground font-medium">إدارة محتوى الدليل</p>
          </div>
        </Link>
        <Link href="/supervisor/articles" className="ds-card p-5 flex items-center gap-4 hover:ds-shadow transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/15 ds-border flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-extrabold text-base">المقالات</p>
            <p className="text-xs text-muted-foreground font-medium">إدارة المقالات والنشرات</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ApplicationsDonut
          underReview={stats.underReview}
          accepted={stats.accepted}
          rejected={stats.rejected}
          needsModification={stats.needsModification}
        />
        <RecentActivity />
      </div>
    </div>
  );
}
