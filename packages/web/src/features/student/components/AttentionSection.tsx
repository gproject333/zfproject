"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { useAttentionApplications } from "@/features/student/hooks/useAttentionApplications";

/**
 * Dashboard section that surfaces applications a supervisor sent back
 * for changes (`needs_modification`). It is the single most important
 * thing a student can act on, so it sits at the top of the dashboard.
 * Renders nothing when there is nothing to act on.
 */
export default function AttentionSection() {
  const router = useRouter();
  const { applications, loading } = useAttentionApplications();

  if (loading || applications.length === 0) return null;

  return (
    <section className="ds-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-status-modification/10 border-b border-foreground/10">
        <AlertTriangle className="w-5 h-5 text-status-modification shrink-0" />
        <div>
          <h2 className="font-bold text-sm">طلبات تستوجب الانتباه</h2>
          <p className="text-xs text-muted-foreground">
            {applications.length === 1
              ? "طلب واحد يستوجب التعديل قبل إعادة تقديمه."
              : `${applications.length} طلبات تستوجب التعديل قبل إعادة تقديمها.`}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-foreground/10">
        {applications.map((app) => (
          <li key={app._id}>
            <button
              onClick={() => router.push(`/student/applications/${app._id}`)}
              className="w-full flex items-center gap-3 px-5 py-3 text-start hover:bg-muted/40 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-status-modification/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-status-modification" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{app.projectName}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_CONFIG[app.type].label}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
