"use client";

import { MessageSquare, AlertTriangle, Edit3, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Doc } from "@smart-zuj/convex";
import { RATING_CONFIG, type SupervisorRating } from "@/lib/configs/application";
import { Button } from "@/components/ui";

interface SupervisorFeedbackCardProps {
  app: Doc<"applications">;
  /** Show the "edit and resubmit" action (student view, editable status). */
  canEdit?: boolean;
  onEdit?: () => void;
}

const ALLOWED_MARKDOWN = [
  "p", "strong", "em", "del", "ul", "ol", "li",
  "a", "code", "pre", "blockquote", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tr", "th", "td",
  "input",
];

/**
 * The supervisor's review notes, shown to the student directly under the
 * page hero. When the application is returned for changes the card takes
 * on an "action required" treatment so the request to edit is the first
 * thing the student reads. Renders nothing when no notes were left.
 */
export default function SupervisorFeedbackCard({
  app,
  canEdit,
  onEdit,
}: SupervisorFeedbackCardProps) {
  if (!app.supervisorNotes) return null;

  const needsModification = app.status === "needs_modification";

  return (
    <div
      className={`ds-card p-5 sm:p-6 ${
        needsModification
          ? "border-2 border-status-modification/50 bg-status-modification/[0.045]"
          : ""
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            needsModification
              ? "bg-status-modification/15 text-status-modification"
              : "bg-accent/10 text-accent"
          }`}
        >
          {needsModification ? (
            <AlertTriangle className="w-[1.15rem] h-[1.15rem]" />
          ) : (
            <MessageSquare className="w-[1.15rem] h-[1.15rem]" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight">
            {needsModification ? "مطلوب تعديل على طلبك" : "ملاحظات المشرف"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {needsModification
              ? "راجع الملاحظات أدناه، ثم عدّل طلبك وأعد تقديمه."
              : "ملاحظات المشرف بعد مراجعة طلبك."}
          </p>
        </div>
        {app.supervisorRating && (
          <span className="ds-badge-soft bg-muted text-foreground shrink-0">
            {RATING_CONFIG[app.supervisorRating as SupervisorRating].label}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-foreground/[0.07] bg-background px-4 py-3.5 text-sm leading-relaxed break-words markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          allowedElements={ALLOWED_MARKDOWN}
        >
          {app.supervisorNotes}
        </ReactMarkdown>
      </div>

      {canEdit && onEdit && (
        <Button onPress={onEdit} variant="primary" size="sm" className="mt-4 group">
          <Edit3 className="w-4 h-4" />
          عدّل وأعد التقديم
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </Button>
      )}
    </div>
  );
}
