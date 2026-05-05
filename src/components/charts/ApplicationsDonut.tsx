"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";
import { STATUS_CONFIG } from "@/lib/configs/application";
import { Card } from "@/components/ui";

interface Props {
  underReview: number;
  accepted: number;
  rejected: number;
  needsModification: number;
}

export function ApplicationsDonut({
  underReview,
  accepted,
  rejected,
  needsModification,
}: Props) {
  // Derive name + color from STATUS_CONFIG so the chart, badges, dashboard
  // stat cards, and recent-activity feed all stay in lock-step. Adding a
  // new status only requires a single STATUS_CONFIG entry.
  const data = [
    { name: STATUS_CONFIG.under_review.label, value: underReview, color: `var(${STATUS_CONFIG.under_review.cssVar})` },
    { name: STATUS_CONFIG.accepted.label, value: accepted, color: `var(${STATUS_CONFIG.accepted.cssVar})` },
    { name: STATUS_CONFIG.rejected.label, value: rejected, color: `var(${STATUS_CONFIG.rejected.cssVar})` },
    { name: STATUS_CONFIG.needs_modification.label, value: needsModification, color: `var(${STATUS_CONFIG.needs_modification.cssVar})` },
  ].filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5">
      <h3 className="font-extrabold mb-4 text-base" id="applications-donut-title">
        توزيع حالات الطلبات
      </h3>

      {total === 0 ? (
        <div className="aspect-square max-h-56 mx-auto flex items-center justify-center text-muted-foreground font-bold text-sm">
          لا توجد بيانات بعد
        </div>
      ) : (
        <>
          <div
            className="aspect-square max-h-56 mx-auto"
            style={{ minHeight: 180, minWidth: 180 }}
            role="img"
            aria-labelledby="applications-donut-title"
            aria-label={`توزيع حالات الطلبات: إجمالي ${total} طلب`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                  stroke="var(--border)"
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      const cx = viewBox.cx as number;
                      const cy = viewBox.cy as number;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={cx}
                            y={cy}
                            className="fill-foreground text-3xl font-black"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 22}
                            className="fill-muted-foreground text-xs font-bold"
                          >
                            طلبات
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "2px solid var(--border)",
                    borderRadius: "8px",
                    fontFamily: "Tajawal, sans-serif",
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 justify-center">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className="w-3 h-3 rounded-sm nb-border"
                  style={{ background: d.color }}
                />
                {d.name}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
