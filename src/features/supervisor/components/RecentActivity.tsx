"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {Activity} from "lucide-react";
import { Spinner, Card} from "@/components/ui";
import { api } from "../../../../convex/_generated/api";
import { STATUS_CONFIG } from "@/lib/configs/application";
import { STATUS_LABELS } from "../../../../convex/lib/statuses";

type StatusKey = keyof typeof STATUS_CONFIG;

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
}

function actionLabel(app: {
  status: string;
  submittedAt?: number;
  updatedAt: number;
  reviewedAt?: number;
}): string {
  if (app.status === "accepted") return "تم قبول الطلب";
  if (app.status === "rejected") return "تم رفض الطلب";
  if (app.status === "needs_modification") return "طُلب تعديل الطلب";
  if (app.status === "under_review") return "بدأت مراجعة الطلب";
  // pending:
  if (app.submittedAt && app.submittedAt === app.updatedAt) return "قدّم طلباً جديداً";
  return "أعاد تقديم الطلب";
}

export default function RecentActivity() {
  const router = useRouter();
  const items = useQuery(api.applications.supervisor.recentActivity, { limit: 3 });

  return (
    <Card className="p-5">
      <h3 className="font-extrabold mb-4 text-base flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent" />
        آخر النشاطات
      </h3>

      {items === undefined ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" color="current" className="text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground font-bold text-center py-8">
          لا توجد نشاطات حديثة
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => {
            const cfg = STATUS_CONFIG[a.status as StatusKey];
            const Icon = cfg.icon;
            return (
              <li key={a._id}>
                <button
                  onClick={() => router.push(`/supervisor/applications/${a._id}`)}
                  className="w-full text-right flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-foreground/20"
                >
                  <div
                    className={`w-8 h-8 rounded-lg nb-border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}
                    role="img"
                    aria-label={STATUS_LABELS[a.status as StatusKey]}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight">
                      <span className="text-foreground">{a.studentName}</span>
                      <span className="text-muted-foreground"> — {actionLabel(a)}</span>
                      {a.reviewerName && (
                        <span className="text-muted-foreground">
                          {" "}
                          بواسطة <span className="text-foreground">{a.reviewerName}</span>
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {a.projectName}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo(a.updatedAt)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
