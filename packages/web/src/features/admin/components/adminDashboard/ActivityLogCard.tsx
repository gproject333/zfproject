"use client";

import { Activity } from "lucide-react";
import { Card } from "@/components/ui";

interface ActivityLog {
  _id: string;
  actorName: string;
  action: string;
  createdAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

export default function ActivityLogCard({ logs }: { logs: ActivityLog[] | undefined }) {
  return (
    <Card className="p-5">
      <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        أحدث الأنشطة
      </h3>
      {logs === undefined ? (
        <div className="space-y-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-5">لا توجد أنشطة مسجّلة بعد</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {logs.map((log) => (
            <li key={log._id} className="flex items-center justify-between gap-3 py-1.5">
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
  );
}
