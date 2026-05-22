"use client";

import { GraduationCap, Users, Building2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui";

interface AdminStatsShape {
  totalStudents: number;
  totalSupervisors: number;
  totalSponsors: number;
  totalApplications: number;
  underReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

/**
 * Admin landing's hero block. Replaces the old 8-card stat grid with a single
 * acceptance-rate hero + three role-count secondaries — see DESIGN.md's
 * "hero-metric template" Don't and "identical card grids" Don't.
 *
 * The acceptance rate is computed over *decided* applications only (accepted +
 * rejected); pending applications are surfaced separately so they don't
 * deflate the headline number.
 */
export default function StatsHero({ stats }: { stats: AdminStatsShape }) {
  const decided = stats.acceptedApplications + stats.rejectedApplications;
  const rate = decided > 0 ? Math.round((stats.acceptedApplications / decided) * 100) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <AcceptanceRateHero
        rate={rate}
        accepted={stats.acceptedApplications}
        rejected={stats.rejectedApplications}
        underReview={stats.underReviewApplications}
        totalApplications={stats.totalApplications}
      />
      <RoleCountsColumn
        students={stats.totalStudents}
        supervisors={stats.totalSupervisors}
        sponsors={stats.totalSponsors}
      />
    </div>
  );
}

function AcceptanceRateHero({
  rate,
  accepted,
  rejected,
  underReview,
  totalApplications,
}: {
  rate: number | null;
  accepted: number;
  rejected: number;
  underReview: number;
  totalApplications: number;
}) {
  if (totalApplications === 0) {
    return (
      <Card className="p-8 flex flex-col justify-center min-h-[200px]">
        <p className="text-sm font-semibold text-muted-foreground">معدل القبول</p>
        <p className="mt-2 text-base font-bold text-foreground">
          لم يصل أي طلب بعد — سيظهر هنا أوّل ما يقدّم طالب.
        </p>
      </Card>
    );
  }

  if (rate === null) {
    return (
      <Card className="p-8 flex flex-col justify-center min-h-[200px]">
        <p className="text-sm font-semibold text-muted-foreground">معدل القبول</p>
        <p className="mt-2 text-3xl font-extrabold text-foreground">— غير محسوب بعد</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {underReview} طلب قيد المعالجة، لم يُتَّخذ قرار بعد.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 lg:p-8 flex flex-col gap-5 justify-between min-h-[200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">معدل القبول</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-5xl lg:text-6xl font-extrabold text-success tabular-nums leading-none">
              {rate}%
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              من {accepted + rejected} طلب اتُّخذ فيها قرار
            </span>
          </div>
        </div>
      </div>

      {/* Decision split bar — green/red proportional to outcome */}
      <div className="flex h-3 rounded-full overflow-hidden border border-border/40">
        <div className="bg-success" style={{ width: `${rate}%` }} aria-hidden />
        <div className="bg-destructive" style={{ width: `${100 - rate}%` }} aria-hidden />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-success" />
          مقبول
          <span className="tabular-nums text-muted-foreground font-extrabold">{accepted}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-destructive" />
          مرفوض
          <span className="tabular-nums text-muted-foreground font-extrabold">{rejected}</span>
        </span>
        {underReview > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-warning" />
            قيد المراجعة
            <span className="tabular-nums text-muted-foreground font-extrabold">{underReview}</span>
          </span>
        )}
      </div>
    </Card>
  );
}

function RoleCountsColumn({
  students,
  supervisors,
  sponsors,
}: {
  students: number;
  supervisors: number;
  sponsors: number;
}) {
  const rows = [
    { label: "الطلاب المسجّلون", value: students, icon: GraduationCap, color: "text-info" },
    { label: "المشرفون الأكاديميون", value: supervisors, icon: Users, color: "text-accent" },
    { label: "الرعاة", value: sponsors, icon: Building2, color: "text-secondary" },
  ];
  return (
    <Card className="p-6 flex flex-col justify-between min-h-[200px]">
      <ul className="divide-y divide-border/30">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="flex items-center gap-2.5 text-sm font-bold text-foreground">
              <row.icon className={`w-4 h-4 ${row.color}`} />
              {row.label}
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-foreground">{row.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
