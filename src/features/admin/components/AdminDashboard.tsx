"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  Users,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { api } from "../../../../convex/_generated/api";
import { SkeletonStatCards } from "@/components/ui/Skeleton";

const PIE_COLORS = ["#F59E0B", "#22C55E", "#EF4444", "#6B7280"];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

function shortenCollege(name: string) {
  return name.replace("كلية ", "").slice(0, 12);
}

export default function AdminDashboard() {
  const stats = useQuery(api.users.admin.getAdminStats, {});
  const activityLogs = useQuery(api.activityLogs.recentLogs, { limit: 10 });
  const collegeStats = useQuery(api.users.admin.getStudentDistributionByCollege, {});
  const monthlyStats = useQuery(api.users.admin.getMonthlyRegistrationStats, {});
  const appStatusStats = useQuery(api.users.admin.getApplicationStatusStats, {});
  const upgradeRequests = useQuery(api.supervisorUpgradeRequests.listRequests, {
    status: "pending",
  });

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

  const STATS = [
    {
      label: "الطلاب المسجلون",
      value: stats.totalStudents,
      icon: GraduationCap,
      bg: "bg-info/10",
      iconColor: "text-info",
      border: "border-info/30",
      href: "/admin/students",
    },
    {
      label: "المشرفون الأكاديميون",
      value: stats.totalSupervisors,
      icon: Users,
      bg: "bg-accent/10",
      iconColor: "text-accent",
      border: "border-accent/30",
      href: "/admin/supervisors",
    },
    {
      label: "الرعاة",
      value: stats.totalSponsors,
      icon: Building2,
      bg: "bg-secondary/10",
      iconColor: "text-secondary",
      border: "border-secondary/30",
      href: "/admin/sponsors",
    },
    {
      label: "إجمالي الطلبات",
      value: stats.totalApplications,
      icon: FileText,
      bg: "bg-muted",
      iconColor: "text-foreground",
      border: "border-foreground/20",
      href: "/admin/students",
    },
    {
      label: "قيد المراجعة",
      value: stats.underReviewApplications,
      icon: Clock,
      bg: "bg-status-pending/20",
      iconColor: "text-warning",
      border: "border-warning/40",
      href: "/admin/students",
    },
    {
      label: "طلبات مقبولة",
      value: stats.acceptedApplications,
      icon: CheckCircle2,
      bg: "bg-success/10",
      iconColor: "text-success",
      border: "border-success/30",
      href: "/admin/students",
    },
    {
      label: "طلبات مرفوضة",
      value: stats.rejectedApplications,
      icon: XCircle,
      bg: "bg-destructive/10",
      iconColor: "text-destructive",
      border: "border-destructive/30",
      href: "/admin/students",
    },
    {
      label: "طلبات الترقية",
      value: pendingUpgradeCount,
      icon: TrendingUp,
      bg: "bg-primary/10",
      iconColor: "text-primary",
      border: "border-primary/30",
      href: "/admin/upgrade-requests",
    },
  ];

  const QUICK_LINKS = [
    {
      label: "إدارة الطلاب",
      desc: "عرض بيانات الطلاب وإدارة حساباتهم",
      href: "/admin/students",
      color: "#2563EB",
      icon: GraduationCap,
    },
    {
      label: "إنشاء حساب راعٍ",
      desc: "إضافة شركة أو جهة راعية جديدة",
      href: "/admin/sponsors",
      color: "#C9A227",
      icon: Building2,
    },
    {
      label: "إدارة الكليات",
      desc: "إضافة وتعديل الكليات والتخصصات",
      href: "/admin/colleges",
      color: "#2D7A3E",
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2">
          <BarChart3 className="w-7 h-7" style={{ color: "#DC2626" }} />
          لوحة تحكم النظام
        </h2>
        <p className="text-muted-foreground font-medium">
          نظرة شاملة على منصة حاضنة الزيتونة — جميع الإحصائيات
        </p>
      </div>

      {/* Stats Grid — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className={`nb-card-interactive p-5 flex flex-col items-center text-center ${stat.border} border-[3px] group`}
          >
            <div
              className={`w-12 h-12 rounded-xl nb-border flex items-center justify-center mb-3 ${stat.bg} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — توزيع الطلاب */}
        <div className="nb-card p-5 lg:col-span-1">
          <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-info" />
            توزيع الطلاب حسب الكلية
          </h3>
          {collegeStats && collegeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={collegeStats.map((d) => ({ ...d, college: shortenCollege(d.college) }))} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="college" width={80} tick={{ fontSize: 10, fontFamily: "inherit" }} />
                <Tooltip formatter={(v) => [`${v} طالب`, "العدد"]} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </div>

        {/* Line Chart — معدل التسجيل الشهري */}
        <div className="nb-card p-5 lg:col-span-1">
          <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            معدل التسجيل الشهري
          </h3>
          {monthlyStats && monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: "inherit" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v} طالب`, "التسجيلات"]} />
                <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </div>

        {/* Pie Chart — حالة المشاريع */}
        <div className="nb-card p-5 lg:col-span-1">
          <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-warning" />
            حالة المشاريع
          </h3>
          {appStatusStats && appStatusStats.some((d) => d.count > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={appStatusStats.filter((d) => d.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                  >
                    {appStatusStats
                      .filter((d) => d.count > 0)
                      .map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {appStatusStats
                  .filter((d) => d.count > 0)
                  .map((d, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-xs font-bold">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {d.status} ({d.count})
                    </span>
                  ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </div>
      </div>

      {/* Acceptance Rate */}
      {stats.totalApplications > 0 && (
        <div className="nb-card p-6">
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            معدل القبول
          </h3>
          <div className="space-y-3">
            <RateBar label="مقبول" labelColor="text-success" barColor="bg-success" value={stats.acceptedApplications} total={stats.totalApplications} />
            <RateBar label="مرفوض" labelColor="text-destructive" barColor="bg-destructive" value={stats.rejectedApplications} total={stats.totalApplications} />
            <RateBar label="قيد المراجعة" labelColor="text-warning" barColor="bg-status-pending" value={stats.underReviewApplications} total={stats.totalApplications} />
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="nb-card p-6">
        <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: "#DC2626" }} />
          آخر النشاطات
        </h3>
        {activityLogs === undefined ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">لا توجد نشاطات مسجّلة بعد</p>
        ) : (
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-sm">{log.actorName} </span>
                    <span className="text-sm text-muted-foreground">{log.action}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-1">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-xl font-extrabold mb-4">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map((a) => (
            <Link key={a.href} href={a.href} className="nb-card-interactive p-5 text-right group">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform"
                  style={{ background: a.color }}
                >
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">{a.label}</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{a.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RateBarProps {
  label: string;
  labelColor: string;
  barColor: string;
  value: number;
  total: number;
}

function RateBar({ label, labelColor, barColor, value, total }: RateBarProps) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-1">
        <span className={labelColor}>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full nb-border overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
