"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import {
  MessageCircle,
  Filter,
  ChevronDown,
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button, Card, Spinner } from "@/components/ui";
import { api } from "@smart-zuj/convex";

const PAGE_SIZE = 40;

const KIND_LABELS: Record<string, string> = {
  otp: "رمز تحقق",
  meeting: "لقاء",
  status_change: "تغيير حالة طلب",
};

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  queued: {
    label: "في الانتظار",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    icon: Clock,
  },
  sent: {
    label: "تم الإرسال",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  failed: {
    label: "فشل",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
    icon: AlertTriangle,
  },
};

type StatusFilter = "" | "queued" | "sent" | "failed";

function relativeAr(ts: number): string {
  const diff = Date.now() - ts;
  const units: Array<[string, number]> = [
    ["يوم", 86_400_000],
    ["ساعة", 3_600_000],
    ["دقيقة", 60_000],
  ];
  for (const [label, ms] of units) {
    const n = Math.floor(diff / ms);
    if (n >= 1) return `منذ ${n} ${label}`;
  }
  return "الآن";
}

export default function AdminWhatsappLogPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const { results, status, loadMore } = usePaginatedQuery(
    api.whatsapp.admin.listOutbox,
    statusFilter === "" ? {} : { status: statusFilter },
    { initialNumItems: PAGE_SIZE },
  );

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </span>
          سجل رسائل الواتساب
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          سجل جميع رسائل الواتساب التي أرسلها النظام للطلاب (رموز التحقق، اللقاءات، تحديثات الطلبات). الأرقام مُخفّاة جزئياً.
        </p>
      </header>

      {/* Filter */}
      <Card className="p-4 flex items-center justify-end gap-2">
        <label className="text-xs font-bold text-muted-foreground inline-flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          الحالة
        </label>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none bg-card ds-border rounded-lg pl-8 pr-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
          >
            <option value="">الكل</option>
            <option value="queued">في الانتظار</option>
            <option value="sent">تم الإرسال</option>
            <option value="failed">فشل</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 left-2.5 text-muted-foreground pointer-events-none" />
        </div>
      </Card>

      {/* Results */}
      <Card className="p-0 overflow-hidden">
        {status === "LoadingFirstPage" ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" color="current" className="text-accent" />
          </div>
        ) : results.length === 0 ? (
          <EmptyState filtered={statusFilter !== ""} />
        ) : (
          <ul className="divide-y divide-foreground/[0.06]">
            {results.map((row) => {
              const meta = STATUS_META[row.status];
              const Icon = meta.icon;
              return (
                <li
                  key={row._id}
                  className="p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted ds-border flex items-center justify-center shrink-0 text-foreground/70">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-extrabold text-sm truncate">
                        {row.userName}
                      </span>
                      <span
                        dir="ltr"
                        className="font-mono text-xs text-muted-foreground"
                      >
                        {row.maskedPhone}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold ms-auto">
                        {relativeAr(row.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground">
                        {KIND_LABELS[row.kind] ?? row.kind}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.className}`}
                      >
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      {row.attempts > 1 && (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {row.attempts} محاولات
                        </span>
                      )}
                    </div>
                    {row.errorMessage && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold truncate">
                        {row.errorMessage}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
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

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="text-center py-16 px-6 space-y-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="font-extrabold text-base">
        {filtered ? "لا نتائج مطابقة" : "لا توجد رسائل بعد"}
      </h3>
      <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
        {filtered
          ? "حاول تخفيف الفلتر لرؤية المزيد."
          : "ستظهر هنا كل رسائل الواتساب التي يرسلها النظام للطلاب."}
      </p>
    </div>
  );
}
