"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import {
  Activity,
  User,
  Compass,
  TrendingUp,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";

type EntityFilter = "all" | "user" | "guide" | "upgradeRequest";

interface FilterChip {
  value: EntityFilter;
  label: string;
  icon: LucideIcon;
}

const FILTER_CHIPS: FilterChip[] = [
  { value: "all", label: "الكل", icon: Activity },
  { value: "user", label: "المستخدمون", icon: User },
  { value: "guide", label: "الدليل الريادي", icon: Compass },
  { value: "upgradeRequest", label: "طلبات الترقية", icon: TrendingUp },
];

const ENTITY_META: Record<string, { label: string; icon: LucideIcon }> = {
  user: { label: "مستخدم", icon: User },
  guide: { label: "الدليل", icon: Compass },
  upgradeRequest: { label: "طلب ترقية", icon: TrendingUp },
};

const PAGE_SIZE = 30;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 30) return `منذ ${d} يوم`;
  return new Date(ts).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fullDateTime(ts: number): string {
  return new Date(ts).toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogView() {
  const [filter, setFilter] = useState<EntityFilter>("all");

  const { results, status, loadMore } = usePaginatedQuery(
    api.activityLogs.paginatedLogs,
    filter === "all" ? {} : { entityType: filter },
    { initialNumItems: PAGE_SIZE },
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-info/10 nb-border rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-info" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">سجل النشاطات</h1>
          <p className="text-sm text-muted-foreground">
            كل الإجراءات اللي عملها الأدمنز والمشرفون
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap" role="tablist" aria-label="تصفية النشاطات">
        {FILTER_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(chip.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold nb-border transition-all ${
                active
                  ? "bg-primary text-primary-foreground nb-shadow-sm"
                  : "bg-card hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {status === "LoadingFirstPage" ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="current" className="text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد نشاطات"
          description={
            filter === "all"
              ? "ما في إجراءات مسجّلة بعد"
              : "ما في نشاطات تطابق هاد الفلتر"
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-foreground/5">
            {results.map((log) => {
              const meta = ENTITY_META[log.entityType] ?? { label: log.entityType, icon: HelpCircle };
              const Icon = meta.icon;
              return (
                <li key={log._id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg nb-border bg-card flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight">
                      <span className="text-foreground">{log.actorName}</span>
                      <span className="text-muted-foreground font-medium"> — {log.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted nb-border font-bold">
                        {log.actorRole}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-info/10 nb-border font-bold">
                        {meta.label}
                      </span>
                      <span
                        className="text-[10px] text-muted-foreground"
                        title={fullDateTime(log.createdAt)}
                      >
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center mt-5">
          <Button onPress={() => loadMore(PAGE_SIZE)} variant="outline" size="sm">
            تحميل المزيد
          </Button>
        </div>
      )}
      {status === "LoadingMore" && (
        <div className="flex justify-center mt-5">
          <Spinner size="md" color="current" className="text-muted-foreground" />
        </div>
      )}
      {status === "Exhausted" && results.length > 0 && (
        <p className="text-center mt-5 text-xs text-muted-foreground">
          لا توجد سجلات أقدم. الإجراءات الأقدم من 90 يوم تُحذف تلقائياً.
        </p>
      )}
    </div>
  );
}
