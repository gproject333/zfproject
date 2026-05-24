"use client";

import { useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import {
  ClipboardList,
  Search,
  User as UserIcon,
  Filter,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { Button, Card, Input, Spinner } from "@/components/ui";
import { api } from "../../../../convex/_generated/api";

const PAGE_SIZE = 40;

const ROLE_LABELS: Record<string, string> = {
  admin: "أدمن",
  supervisor: "مشرف",
  student: "طالب",
  sponsor: "راعٍ",
};

const TIME_UNITS: Array<[string, number]> = [
  ["يوم", 86_400_000],
  ["ساعة", 3_600_000],
  ["دقيقة", 60_000],
];

function relativeAr(ts: number): string {
  const diff = Date.now() - ts;
  for (const [label, ms] of TIME_UNITS) {
    const n = Math.floor(diff / ms);
    if (n >= 1) return `منذ ${n} ${label}`;
  }
  return "الآن";
}

/**
 * Full audit log viewer for the admin. Pulls the paginated feed from
 * activityLogs.listLogs and filters client-side so the admin can stack
 * filters (actor name, role, action keyword) without round-tripping for
 * every combination. The page intentionally lives outside the dashboard
 * widget — the widget shows last 6, this surface shows everything.
 */
export default function AdminLogsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.activityLogs.listLogs,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "admin" | "supervisor" | "student" | "sponsor">("");

  const filtered = useMemo(() => {
    if (!results) return [];
    const term = search.trim().toLowerCase();
    return results.filter((row) => {
      if (roleFilter && row.actorRole !== roleFilter) return false;
      if (term) {
        const haystack = `${row.actorName} ${row.action} ${row.entityType} ${row.entityId ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [results, search, roleFilter]);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </span>
          سجل النشاط
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          كل إجراء قام به مستخدم بالنظام — مرجع للمراجعة والامتثال.
        </p>
      </header>

      {/* Filters */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground pointer-events-none" />
          <Input
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المستخدم أو نوع الإجراء أو الكيان..."
            className="pe-9"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-bold text-muted-foreground inline-flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            دور المُنفّذ
          </label>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="appearance-none bg-card ds-border rounded-lg pl-8 pr-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
            >
              <option value="">الكل</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 left-2.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-0 overflow-hidden">
        {status === "LoadingFirstPage" ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" color="current" className="text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={!!search.trim() || !!roleFilter} />
        ) : (
          <ul className="divide-y divide-foreground/[0.06]">
            {filtered.map((row) => (
              <li key={row._id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-muted ds-border flex items-center justify-center shrink-0 text-foreground/70">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-extrabold text-sm truncate">
                      {row.actorName || "—"}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground">
                      {ROLE_LABELS[row.actorRole] ?? row.actorRole}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold ms-auto">
                      {relativeAr(row.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground/85 leading-relaxed">
                    {row.action}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-bold">
                    {row.entityType}
                    {row.entityId && (
                      <>
                        {" · "}
                        <span dir="ltr" className="font-mono">
                          {row.entityId}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {status === "CanLoadMore" && (
          <div className="p-4 border-t border-foreground/[0.06] text-center">
            <Button
              onPress={() => loadMore(PAGE_SIZE)}
              variant="outline"
              size="sm"
            >
              تحميل المزيد
            </Button>
          </div>
        )}

        {status === "LoadingMore" && (
          <div className="p-4 border-t border-foreground/[0.06] flex justify-center">
            <Spinner size="sm" color="current" className="text-accent" />
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="text-center py-16 px-6 space-y-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="font-extrabold text-base">
        {hasFilter ? "لا نتائج مطابقة" : "السجل فارغ"}
      </h3>
      <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
        {hasFilter
          ? "جرّب تخفيف الفلاتر أو مسح خانة البحث."
          : "ستظهر هنا كل الإجراءات الإدارية فور حدوثها."}
      </p>
    </div>
  );
}
