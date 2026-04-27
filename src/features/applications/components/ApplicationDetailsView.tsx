"use client";

import { FileText, MessageSquare, AlertTriangle, User, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { RATING_CONFIG, type SupervisorRating } from "@/lib/configs/application";
import DetailField from "./DetailField";
import AttachmentsSection from "./AttachmentsSection";

interface ApplicationDetailsViewProps {
  app: Doc<"applications">;
  pdfUrl: string | null | undefined;
  videoUrl: string | null | undefined;
  onShowPdf: () => void;
  canEdit: boolean;
  /**
   * Hide the "supervisor notes" read-only card. Set this on the supervisor
   * review page where the supervisor is already editing those values in
   * the ReviewPanel and a duplicate read-only copy would be confusing.
   */
  hideSupervisorFeedback?: boolean;
}

/**
 * Shared read-only details view for an application. Rendered on both the
 * student "my application" page and the supervisor review page so that the
 * layout and fields stay in sync.
 */
export default function ApplicationDetailsView({
  app,
  pdfUrl,
  videoUrl,
  onShowPdf,
  canEdit,
  hideSupervisorFeedback = false,
}: ApplicationDetailsViewProps) {
  return (
    <>
      {/* Supervisor feedback — chat-bubble variant */}
      {!hideSupervisorFeedback && app.supervisorNotes && (
        <div
          className={`nb-card p-5 ${
            app.status === "needs_modification" ? "border-status-modification border-[3px]" : ""
          }`}
        >
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            ملاحظات المشرف
            {app.supervisorRating && (
              <span className="nb-badge bg-muted text-xs mr-auto">
                تقييم: {RATING_CONFIG[app.supervisorRating as SupervisorRating].label}
              </span>
            )}
          </h3>

          {/* Chat bubble: avatar + bubble body */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full nb-border bg-accent text-accent-foreground flex items-center justify-center shrink-0 nb-shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted-foreground mb-1.5">
                المشرف
              </p>
              <div
                className={`relative nb-border rounded-lg rounded-tr-sm p-4 text-sm leading-relaxed break-words markdown-body bg-muted/50`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  allowedElements={[
                    "p", "strong", "em", "del", "ul", "ol", "li",
                    "a", "code", "pre", "blockquote", "br", "hr",
                    "h1", "h2", "h3", "h4", "h5", "h6",
                    "table", "thead", "tbody", "tr", "th", "td",
                    "input",
                  ]}
                >
                  {app.supervisorNotes}
                </ReactMarkdown>
              </div>

              {canEdit && (
                <div className="mt-3 flex items-center gap-2 text-sm text-accent font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  عدّل طلبك بناءً على الملاحظات أعلاه ثم أعد التقديم
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Read-only details */}
      <div className="nb-card p-5">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          تفاصيل المشروع
        </h3>
        <div className="space-y-4">
          <DetailField label="وصف المشروع" value={app.description} />
          <DetailField label="المشكلة" value={app.problemStatement} />
          <DetailField label="الجمهور المستهدف" value={app.targetAudience} />
          <DetailField label="رقم الهاتف" value={app.phone} dir="ltr" />
          {app.projectCategory && app.projectCategory.length > 0 && (
            <div>
              <dt className="text-xs font-bold text-muted-foreground mb-1">نوع المشروع</dt>
              <dd className="flex flex-wrap gap-1.5">
                {app.projectCategory.map((cat) => (
                  <span key={cat} className="nb-badge bg-muted text-xs px-2 py-1">
                    {cat}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <DetailField label="أهداف المشروع" value={app.projectGoals} />

          {app.teamMembers && app.teamMembers.length > 0 && (
            <div>
              <dt className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="w-4 h-4" />
                أعضاء الفريق
              </dt>
              <dd className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg space-y-1">
                {app.teamMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <span dir="ltr">{m.phone}</span>
                  </div>
                ))}
              </dd>
            </div>
          )}

          {app.type === "it_graduation" && (
            <DetailField
              label="المشرف الأكاديمي"
              value={app.supervisor}
              icon={<User className="w-4 h-4" />}
            />
          )}

          {app.type === "university_entrepreneurial" && (
            <>
              <DetailField label="الفائدة للجامعة" value={app.universityBenefit} />
              <DetailField label="المكان المستهدف" value={app.targetLocation} />
            </>
          )}
        </div>
      </div>

      {/* Attachments */}
      <AttachmentsSection
        pdfFileId={app.pdfFileId}
        videoFileId={app.videoFileId}
        pdfUrl={pdfUrl}
        videoUrl={videoUrl}
        onShowPdf={onShowPdf}
      />
    </>
  );
}
