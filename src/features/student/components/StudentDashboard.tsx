"use client";

import { useRouter } from "next/navigation";
import { Plus, TrendingUp, HelpCircle, BookOpen } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { useStudentDashboardStats } from "@/features/student/hooks/useStudentDashboardStats";
import StudentAvatar from "./StudentAvatar";
import RecentApplicationsCard from "./RecentApplicationsCard";
import RecentNotificationsCard from "./RecentNotificationsCard";

/**
 * Student dashboard: stats overview + quick action cards + recent
 * applications/notifications widgets.
 */
export default function StudentDashboard() {
  const router = useRouter();
  const { stats, user, statCards, loading } = useStudentDashboardStats();

  if (loading || !stats) return <SkeletonDashboard />;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 flex items-center gap-4">
        <StudentAvatar name={user?.name} avatarId={user?.avatar} size="lg" />
        <div>
          <h2 className="text-2xl font-extrabold">
            مرحباً، {user?.name ?? "بك"}
          </h2>
          {user?.department && (
            <p className="text-sm text-muted-foreground font-bold mt-0.5">
              {user.department}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <button
            key={stat.label}
            onClick={() =>
              router.push(
                stat.filter
                  ? `/student/applications?status=${stat.filter}`
                  : "/student/applications"
              )
            }
            className="nb-card-interactive p-5 text-right animate-slide-up"
            style={{ opacity: 0, animationDelay: `${(i + 1) * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 ${stat.color} nb-border rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black">{stat.value}</span>
            </div>
            <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => router.push("/student/new")}
          className="nb-card-interactive p-6 text-right group w-full !bg-accent"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 nb-border rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold mb-1 text-white">تقديم طلب جديد</h3>
              <p className="text-sm font-medium text-white/90">
                اختر نوع الاحتضان وقدّم فكرتك
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/student/applications")}
          className="nb-card-interactive p-6 text-right group w-full"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary nb-border rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <TrendingUp className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">متابعة طلباتي</h3>
              <p className="text-sm text-muted-foreground font-medium">
                تابع حالة طلباتك واقرأ الملاحظات
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/student/guide")}
          className="nb-card-interactive p-6 text-right group w-full"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-info nb-border rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">دليل التقديم</h3>
              <p className="text-sm text-muted-foreground font-medium">
                نصائح لرفع الفيديو والـ PDF بأفضل جودة
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/student/articles")}
          className="nb-card-interactive p-6 text-right group w-full"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/15 nb-border rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">المقالات</h3>
              <p className="text-sm text-muted-foreground font-medium">
                اقرأ المقالات التي يكتبها المشرفون
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent activity widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <RecentApplicationsCard />
        <RecentNotificationsCard />
      </div>
    </div>
  );
}
