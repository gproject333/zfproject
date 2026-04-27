"use client";

import { useQuery } from "convex/react";
import {
  Users,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Link2,
  BarChart3,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { SkeletonStatCards } from "@/components/ui/Skeleton";

/**
 * Admin dashboard: top-level stats grid + acceptance rate chart + quick action links.
 */
export default function AdminDashboard() {
  const stats = useQuery(api.users.admin.getAdminStats, {});

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

  const STATS = [
    { label: "الطلاب المسجلون", value: stats.totalStudents, icon: Users, bg: "bg-info/10", iconColor: "text-info", border: "border-info/30" },
    { label: "المشرفون الأكاديميون", value: stats.totalSupervisors, icon: Users, bg: "bg-accent/10", iconColor: "text-accent", border: "border-accent/30" },
    { label: "الرعاة", value: stats.totalSponsors, icon: Building2, bg: "bg-secondary/10", iconColor: "text-secondary", border: "border-secondary/30" },
    { label: "إجمالي الطلبات", value: stats.totalApplications, icon: FileText, bg: "bg-muted", iconColor: "text-foreground", border: "border-foreground/20" },
    { label: "قيد المراجعة", value: stats.underReviewApplications, icon: Clock, bg: "bg-status-pending/20", iconColor: "text-warning", border: "border-warning/40" },
    { label: "طلبات مقبولة", value: stats.acceptedApplications, icon: CheckCircle2, bg: "bg-success/10", iconColor: "text-success", border: "border-success/30" },
    { label: "طلبات مرفوضة", value: stats.rejectedApplications, icon: XCircle, bg: "bg-destructive/10", iconColor: "text-destructive", border: "border-destructive/30" },
    { label: "روابط سبونسر", value: stats.totalAssignments, icon: Link2, bg: "bg-primary/10", iconColor: "text-primary", border: "border-primary/30" },
  ];

  const QUICK_LINKS = [
    { label: "إنشاء حساب مشرف", desc: "إضافة مشرف أكاديمي جديد للمنصة", href: "/admin/supervisors", color: "#2D7A3E", icon: Users },
    { label: "إنشاء حساب راعٍ", desc: "إضافة شركة أو جهة راعية جديدة", href: "/admin/sponsors", color: "#C9A227", icon: Building2 },
    { label: "ربط مشاريع بالرعاة", desc: "تعيين المشاريع المقبولة للرعاة", href: "/admin/assignments", color: "#2563EB", icon: Link2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className={`nb-card p-5 flex flex-col items-center text-center ${stat.border} border-[3px]`}
          >
            <div className={`w-12 h-12 rounded-xl nb-border flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          </div>
        ))}
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

      {/* Quick Links */}
      <h3 className="text-xl font-extrabold mt-6 mb-4">الإجراءات السريعة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((a) => (
          <a key={a.href} href={a.href} className="nb-card-interactive p-5 text-right group">
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
          </a>
        ))}
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
