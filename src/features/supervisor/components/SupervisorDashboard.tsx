"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, BookOpen } from "lucide-react";
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
            className="nb-card-interactive p-6 flex flex-col items-center text-center w-full"
          >
            <div
              className={`w-12 h-12 rounded-xl nb-border flex items-center justify-center mb-4 ${stat.bg}`}
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/supervisor/content/guide" className="nb-card p-5 flex items-center gap-4 hover:nb-shadow transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/20 nb-border flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="font-extrabold text-base">الدليل الريادي</p>
            <p className="text-xs text-muted-foreground font-medium">إدارة محتوى الدليل</p>
          </div>
        </Link>
        <Link href="/supervisor/content/articles" className="nb-card p-5 flex items-center gap-4 hover:nb-shadow transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/10 nb-border flex items-center justify-center shrink-0">
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
