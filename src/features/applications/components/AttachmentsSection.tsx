"use client";

import { FileText, Video, Download, ExternalLink, Paperclip } from "lucide-react";
import { Card } from "@/components/ui";

interface AttachmentsSectionProps {
  pdfFileId?: string;
  videoFileId?: string;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  onShowPdf?: () => void;
  /** Stack tiles vertically — for narrow sidebar placement. */
  stack?: boolean;
}

/**
 * Attachment tiles — a PDF tile and a video tile, each with a colored
 * icon and inline actions. `stack` lays them out in a single column for
 * the student detail sidebar; the default two-up grid suits full width.
 */
export default function AttachmentsSection({
  pdfFileId,
  videoFileId,
  pdfUrl,
  videoUrl,
  onShowPdf,
  stack = false,
}: AttachmentsSectionProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
          <Paperclip className="w-4 h-4" />
        </span>
        <h3 className="font-semibold text-base">المرفقات</h3>
      </div>

      <div
        className={
          stack ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"
        }
      >
        <AttachmentTile
          kind="pdf"
          present={!!pdfFileId}
          url={pdfUrl}
          onPreview={onShowPdf}
        />
        <AttachmentTile kind="video" present={!!videoFileId} url={videoUrl} />
      </div>
    </Card>
  );
}

interface TileProps {
  kind: "pdf" | "video";
  present: boolean;
  url?: string | null;
  onPreview?: () => void;
}

function AttachmentTile({ kind, present, url, onPreview }: TileProps) {
  const isPdf = kind === "pdf";
  const Icon = isPdf ? FileText : Video;
  const title = isPdf ? "ملف PDF" : "فيديو تقديمي";
  const missingLabel = isPdf ? "لا يوجد ملف PDF" : "لا يوجد فيديو";
  const iconBg = isPdf ? "bg-primary" : "bg-info";

  if (!present) {
    return (
      <div className="rounded-xl border border-dashed border-foreground/15 p-4 flex items-center gap-3 bg-background">
        <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {missingLabel}
          </p>
          <p className="text-xs text-muted-foreground/70">مرفق اختياري</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-foreground/[0.08] p-4 flex items-center gap-3 bg-card">
      <div
        className={`w-11 h-11 rounded-lg ${iconBg} text-white flex items-center justify-center shrink-0 nb-shadow-sm`}
      >
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {isPdf ? "اعرض الملف أو حمّله" : "شاهد العرض التقديمي"}
        </p>
        {url && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {isPdf ? (
              <>
                {onPreview && (
                  <button
                    onClick={onPreview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-foreground/[0.12] rounded-lg text-xs font-semibold bg-background hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    عرض
                  </button>
                )}
                <a
                  href={url}
                  download
                  title="تحميل الملف"
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-foreground/[0.12] rounded-lg text-xs font-semibold bg-background hover:bg-muted transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل
                </a>
              </>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 border border-foreground/[0.12] rounded-lg text-xs font-semibold bg-background hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                مشاهدة
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
