"use client";

import Link from "next/link";
import { Users, Building2, FileText, CheckCircle2, Clock, XCircle, GraduationCap, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdminStatsShape {
  totalStudents: number;
  totalSupervisors: number;
  totalSponsors: number;
  totalApplications: number;
  underReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  border: string;
  href: string;
}

export default function StatsGrid({
  stats,
  pendingUpgradeCount,
}: {
  stats: AdminStatsShape;
  pendingUpgradeCount: number;
}) {
  const cards: StatCard[] = [
    { label: "الطلاب المسجلون", value: stats.totalStudents, icon: GraduationCap, bg: "bg-info/10", iconColor: "text-info", border: "border-info/30", href: "/admin/students" },
    { label: "المشرفون الأكاديميون", value: stats.totalSupervisors, icon: Users, bg: "bg-accent/10", iconColor: "text-accent", border: "border-accent/30", href: "/admin/supervisors" },
    { label: "الرعاة", value: stats.totalSponsors, icon: Building2, bg: "bg-secondary/10", iconColor: "text-secondary", border: "border-secondary/30", href: "/admin/sponsors" },
    { label: "إجمالي الطلبات", value: stats.totalApplications, icon: FileText, bg: "bg-muted", iconColor: "text-foreground", border: "border-foreground/20", href: "/admin/students" },
    { label: "قيد المراجعة", value: stats.underReviewApplications, icon: Clock, bg: "bg-status-pending/20", iconColor: "text-warning", border: "border-warning/40", href: "/admin/students" },
    { label: "طلبات مقبولة", value: stats.acceptedApplications, icon: CheckCircle2, bg: "bg-success/10", iconColor: "text-success", border: "border-success/30", href: "/admin/students" },
    { label: "طلبات مرفوضة", value: stats.rejectedApplications, icon: XCircle, bg: "bg-destructive/10", iconColor: "text-destructive", border: "border-destructive/30", href: "/admin/students" },
    { label: "طلبات الترقية", value: pendingUpgradeCount, icon: TrendingUp, bg: "bg-primary/10", iconColor: "text-primary", border: "border-primary/30", href: "/admin/upgrade-requests" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <Link
          key={i}
          href={stat.href}
          className={`nb-card-interactive p-5 flex flex-col items-center text-center ${stat.border} border-[3px] group`}
        >
          <div className="w-12 h-12 rounded-xl nb-border flex items-center justify-center mb-3 bg-white group-hover:scale-110 transition-transform">
            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
          </div>
          <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
        </Link>
      ))}
    </div>
  );
}
