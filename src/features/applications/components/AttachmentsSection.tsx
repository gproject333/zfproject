"use client";

import { FileText, Video, Download, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";

interface AttachmentsSectionProps {
  pdfFileId?: string;
  videoFileId?: string;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  onShowPdf?: () => void;
}

/**
 * Attachment tiles — two cards (PDF / video) with large colored icon
 * containers. Uses the project's nb-* utility classes and status colors.
 */
export default function AttachmentsSection({
  pdfFileId,
  videoFileId,
  pdfUrl,
  videoUrl,
  onShowPdf,
}: AttachmentsSectionProps) {
  return (
    <Card className="p-5">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-info" />
        المرفقات
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
  const iconBg = isPdf ? "bg-destructive" : "bg-info";
  const iconText = isPdf ? "text-destructive-foreground" : "text-info-foreground";

  if (!present) {
    return (
      <div className="nb-border rounded-lg p-4 flex items-center gap-3 bg-muted/50">
        <div className="w-12 h-12 nb-border rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-muted-foreground">{missingLabel}</p>
          <p className="text-xs text-muted-foreground">اختياري</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-border rounded-lg p-4 flex items-center gap-3 bg-card">
      <div
        className={`w-12 h-12 nb-border rounded-lg ${iconBg} ${iconText} flex items-center justify-center shrink-0 nb-shadow-sm`}
      >
        <Icon className="w-6 h-6" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{title}</p>
        <p className="text-xs text-muted-foreground">
          {isPdf ? "اعرض أو حمّل الملف" : "اعرض الفيديو التقديمي"}
        </p>
        {url && (
          <div className="flex items-center gap-1.5 mt-2">
            {isPdf ? (
              <>
                {onPreview && (
                  <button
                    onClick={onPreview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 nb-border rounded-lg text-xs font-bold bg-card hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    عرض
                  </button>
                )}
                <a
                  href={url}
                  download
                  title="تحميل"
                  className="inline-flex items-center gap-1 px-2.5 py-1 nb-border rounded-lg text-xs font-bold bg-card hover:bg-muted transition-colors"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 nb-border rounded-lg text-xs font-bold bg-card hover:bg-muted transition-colors"
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
