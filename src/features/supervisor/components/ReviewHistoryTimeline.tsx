"use client";

import { useQuery } from "convex/react";
import { History, Loader2, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import StatusBadge from "@/features/applications/components/StatusBadge";

interface ReviewHistoryTimelineProps {
  applicationId: Id<"applications">;
}

/**
 * Renders the chronological audit log for a single application as a
 * vertical timeline of status transitions. Reads from the
 * applicationReviews table via getReviewHistory.
 *
 * Quietly hides itself when the history is empty (e.g. the application
 * has never been reviewed yet) so the supervisor review page doesn't
 * waste vertical space on a "no history" placeholder.
 */
export default function ReviewHistoryTimeline({ applicationId }: ReviewHistoryTimelineProps) {
  const items = useQuery(api.applications.supervisor.getReviewHistory, { applicationId });

  if (items === undefined) {
    return (
      <div className="nb-card p-5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="nb-card p-5">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-accent" />
        سجل المراجعات
        <span className="nb-badge bg-muted text-xs mr-auto">{items.length}</span>
      </h3>
      <ol className="space-y-3" aria-label="سجل تغييرات الحالة">
        {items.map((item) => (
          <li key={item._id} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" aria-hidden="true" />
              <div className="w-px flex-1 bg-border mt-1" />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={item.fromStatus} size="sm" />
                <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" aria-hidden="true" />
                <StatusBadge status={item.toStatus} size="sm" />
              </div>
              <p className="text-xs font-bold text-foreground">
                {item.reviewerName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(item.createdAt).toLocaleString("ar-JO")}
              </p>
              {item.notes && (
                <div className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded break-words markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.notes}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
