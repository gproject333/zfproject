"use client";

import { GraduationCap, TrendingUp, FileText } from "lucide-react";
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

/** Drop the redundant "كلية " prefix — the card title already says حسب الكلية. */
function collegeLabel(name: string) {
  return name.replace(/^كلية\s+/, "").trim() || name;
}

export default function ChartsRow({
  collegeStats,
  monthlyStats,
  appStatusStats,
}: {
  collegeStats: { college: string; count: number }[] | undefined;
  monthlyStats: { month: string; count: number }[] | undefined;
  appStatusStats: { status: string; count: number }[] | undefined;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar chart — students per college */}
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

      {/* Line chart — monthly student registrations */}
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

      {/* Pie chart — applications by status */}
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
                      <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? STATUS_FALLBACK} />
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
  );
}

/** Ranked horizontal bars — each college relative to the largest one. */
function CollegeDistribution({ data }: { data: { college: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(...sorted.map((c) => c.count), 1);
  return (
    <ul className="space-y-3.5">
      {sorted.map((c) => (
        <li key={c.college}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-xs font-bold leading-snug">{collegeLabel(c.college)}</span>
            <span className="text-xs font-extrabold shrink-0 tabular-nums text-info">{c.count}</span>
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
