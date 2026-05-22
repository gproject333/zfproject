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
import { Card } from "@/components/ui";

/**
 * Each project status keyed to its own semantic color. Looking the
 * color up by status (not by array index) keeps green=accepted and
 * red=rejected fixed — previously a zero-count slice being filtered
 * out shifted every remaining color by one.
 */
const STATUS_COLORS: Record<string, string> = {
  "قيد المراجعة": "#F59E0B",
  "مقبول": "#22C55E",
  "مرفوض": "#EF4444",
  "يحتاج تعديل": "#64748B",
};
const STATUS_FALLBACK = "#94A3B8";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

/** Drop the redundant "كلية " prefix — the card title already says حسب الكلية. */
function collegeLabel(name: string) {
  return name.replace(/^كلية\s+/, "").trim() || name;
}

export default function AdminDashboard() {
  const stats = useQuery(api.users.admin.getAdminStats, {});
  const activityLogs = useQuery(api.activityLogs.recentLogs, { limit: 6 });
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
      label: "إدارة المشرفين",
      desc: "متابعة المشرفين الأكاديميين وصلاحياتهم",
      href: "/admin/supervisors",
      color: "#7C3AED",
      icon: Users,
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
              className="w-12 h-12 rounded-xl nb-border flex items-center justify-center mb-3 bg-white group-hover:scale-110 transition-transform"
            >
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-extrabold mb-4">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((a) => (
            <Link key={a.href} href={a.href} className="nb-card-interactive p-5 text-right group">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform bg-white"
                >
                  <a.icon className="w-5 h-5" style={{ color: a.color }} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-base">{a.label}</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{a.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — توزيع الطلاب */}
        <Card className="p-5 lg:col-span-1">
          <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-info" />
            توزيع الطلاب حسب الكلية
          </h3>
          {collegeStats && collegeStats.length > 0 ? (
            <CollegeDistribution data={collegeStats} />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </Card>

        {/* Line Chart — معدل التسجيل الشهري */}
        <Card className="p-5 lg:col-span-1">
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
        </Card>

        {/* Pie Chart — حالة المشاريع */}
        <Card className="p-5 lg:col-span-1">
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
                      .map((d) => (
                        <Cell
                          key={d.status}
                          fill={STATUS_COLORS[d.status] ?? STATUS_FALLBACK}
                        />
                      ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
                {appStatusStats
                  .filter((d) => d.count > 0)
                  .map((d) => (
                    <span key={d.status} className="flex items-center gap-1.5 text-xs font-bold">
                      <span
                        className="w-3 h-3 rounded-full inline-block nb-border"
                        style={{ background: STATUS_COLORS[d.status] ?? STATUS_FALLBACK }}
                      />
                      {d.status} ({d.count})
                    </span>
                  ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </Card>
      </div>

      {/* Acceptance Rate — accepted / (accepted + rejected). Applications
          still under review, needing changes, or in draft have no decision
          yet, so they stay out of the denominator. */}
      {stats.totalApplications > 0 && (
        <Card className="p-6">
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            معدل القبول
          </h3>
          <AcceptanceRate
            accepted={stats.acceptedApplications}
            rejected={stats.rejectedApplications}
            pending={
              stats.totalApplications -
              stats.acceptedApplications -
              stats.rejectedApplications
            }
          />
        </Card>
      )}

      {/* Activity Log — compact, one line per entry */}
      <Card className="p-5">
        <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color: "#DC2626" }} />
          آخر النشاطات
        </h3>
        {activityLogs === undefined ? (
          <div className="space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-5">لا توجد نشاطات مسجّلة بعد</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {activityLogs.map((log) => (
              <li
                key={log._id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate text-xs min-w-0">
                    <span className="font-bold">{log.actorName}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {timeAgo(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/** Ranked horizontal bars — each college relative to the largest one. */
function CollegeDistribution({
  data,
}: {
  data: { college: string; count: number }[];
}) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(...sorted.map((c) => c.count), 1);
  return (
    <ul className="space-y-3.5">
      {sorted.map((c) => (
        <li key={c.college}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-xs font-bold leading-snug">{collegeLabel(c.college)}</span>
            <span className="text-xs font-extrabold shrink-0 tabular-nums text-info">
              {c.count}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full nb-border overflow-hidden">
            <div
              className="h-full w-full bg-info origin-right transition-transform duration-500"
              style={{ transform: `scaleX(${c.count / max})` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Acceptance rate over *decided* applications only — accepted vs.
 * rejected. Pending applications (under review / needs changes / draft)
 * have no verdict yet and would deflate the rate if counted, so they
 * are reported separately instead.
 */
function AcceptanceRate({
  accepted,
  rejected,
  pending,
}: {
  accepted: number;
  rejected: number;
  pending: number;
}) {
  const decided = accepted + rejected;

  if (decided === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        لم يُتَّخذ قرار في أي طلب بعد
        {pending > 0 ? ` — ${pending} طلب قيد المعالجة.` : "."}
      </p>
    );
  }

  const rate = Math.round((accepted / decided) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-4xl font-extrabold text-success tabular-nums leading-none">
          {rate}%
        </span>
        <span className="text-sm font-bold text-muted-foreground">
          من {decided} طلبًا اتُّخذ فيها قرار
        </span>
      </div>

      {/* Decision split — green accepted, red rejected, summing to 100% */}
      <div className="flex h-8 rounded-lg nb-border overflow-hidden">
        <div className="bg-success" style={{ width: `${rate}%` }} />
        <div className="bg-destructive" style={{ width: `${100 - rate}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-success nb-border inline-block" />
          مقبول
          <span className="tabular-nums text-muted-foreground">{accepted}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-destructive nb-border inline-block" />
          مرفوض
          <span className="tabular-nums text-muted-foreground">{rejected}</span>
        </span>
      </div>

      {pending > 0 && (
        <p className="text-xs text-muted-foreground">
          {pending} طلب لم يُقيَّم بعد، غير محتسب ضمن المعدل.
        </p>
      )}
    </div>
  );
}
