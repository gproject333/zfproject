"use client";

import { FileText, Video, X, Upload } from "lucide-react";
import type { useFileUpload } from "@/features/applications/hooks/useFileUpload";
import { formatFileSize } from "@/lib/formatters";

type FileUploadState = ReturnType<typeof useFileUpload>;

interface FileUploadFieldsProps {
  upload: FileUploadState;
  /** Set when editing an existing application — shows "(مرفق مسبقاً)" label. */
  existingPdfId?: string;
  existingVideoId?: string;
  /** Variant — "create" shows large detailed dropzones; "edit" shows compact ones. */
  variant?: "create" | "edit";
}

/**
 * Renders the PDF + video dropzones with file preview and clear button.
 * Used by both the create and edit application forms.
 */
export default function FileUploadFields({
  upload,
  existingPdfId,
  existingVideoId,
  variant = "create",
}: FileUploadFieldsProps) {
  const {
    pdfFile,
    videoFile,
    pdfDropzone,
    videoDropzone,
    clearPdf,
    clearVideo,
    errors,
  } = upload;

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = pdfDropzone;
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = videoDropzone;

  const isCreate = variant === "create";

  return (
    <div className={isCreate ? "" : "pt-2 border-t-2 border-foreground/10"}>
      {!isCreate && (
        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-info" />
          تحديث المرفقات <span className="text-muted-foreground font-normal">(اختياري)</span>
        </h4>
      )}
      {isCreate && (
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-info" />
          المرفقات
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF */}
        <div>
          <label className="block text-sm font-bold mb-2">
            {isCreate ? (
              <>
                ملف PDF <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground text-xs">(حد أقصى 10MB)</span>
              </>
            ) : (
              <>
                ملف PDF <span className="text-destructive">*</span>{" "}
                {existingPdfId && <span className="text-success">(مرفق مسبقاً)</span>}
              </>
            )}
          </label>
          {pdfFile ? (
            <div className={`nb-card flex items-center gap-3 ${isCreate ? "p-4" : "p-3"}`}>
              <div className={`bg-destructive/10 nb-border rounded-lg flex items-center justify-center shrink-0 ${isCreate ? "w-10 h-10" : ""}`}>
                <FileText className={`text-destructive ${isCreate ? "w-5 h-5" : "w-5 h-5"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate ${isCreate ? "text-sm" : "text-xs"}`}>{pdfFile.name}</p>
                {isCreate && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(pdfFile.size)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearPdf}
                className={`nb-border rounded flex items-center justify-center hover:bg-destructive/10 ${isCreate ? "w-8 h-8" : "w-6 h-6"}`}
              >
                <X className={isCreate ? "w-4 h-4" : "w-3 h-3"} />
              </button>
            </div>
          ) : (
            <div
              {...getPdfRootProps()}
              className={`nb-border border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                isCreate ? "p-6" : "p-4"
              } ${isPdfDragActive ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}
            >
              <input {...getPdfInputProps()} />
              {isCreate && <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />}
              <p className={`font-bold text-muted-foreground ${isCreate ? "text-sm" : "text-xs"}`}>
                {isPdfDragActive ? "أفلت الملف هنا" : isCreate ? "اسحب ملف PDF أو انقر للاختيار" : "اسحب PDF أو انقر"}
              </p>
            </div>
          )}
          {errors.pdf && <p className="text-xs font-semibold text-destructive mt-1">{errors.pdf}</p>}
          {!errors.pdf && (
            <div className="mt-2 border-r-4 border-primary/60 bg-primary/5 px-3 py-2 rounded-md">
              <p className="text-xs leading-relaxed">
                <span className="font-extrabold">نصيحة: </span>
                <span className="text-muted-foreground">
                  اجعل الملف شاملاً للفكرة ومُصاغاً بشكل جيد، أو عرض تقديمي (presentation) مفصّل وواضح.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-bold mb-2">
            {isCreate ? (
              <>
                فيديو تقديمي <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground text-xs">(حد أقصى 100MB)</span>
              </>
            ) : (
              <>
                فيديو تقديمي <span className="text-destructive">*</span>{" "}
                {existingVideoId && <span className="text-success">(مرفق مسبقاً)</span>}
              </>
            )}
          </label>
          {videoFile ? (
            <div className={`nb-card flex items-center gap-3 ${isCreate ? "p-4" : "p-3"}`}>
              <div className={`bg-info/10 nb-border rounded-lg flex items-center justify-center shrink-0 ${isCreate ? "w-10 h-10" : ""}`}>
                <Video className={`text-info ${isCreate ? "w-5 h-5" : "w-5 h-5"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate ${isCreate ? "text-sm" : "text-xs"}`}>{videoFile.name}</p>
                {isCreate && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(videoFile.size)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearVideo}
                className={`nb-border rounded flex items-center justify-center hover:bg-destructive/10 ${isCreate ? "w-8 h-8" : "w-6 h-6"}`}
              >
                <X className={isCreate ? "w-4 h-4" : "w-3 h-3"} />
              </button>
            </div>
          ) : (
            <div
              {...getVideoRootProps()}
              className={`nb-border border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                isCreate ? "p-6" : "p-4"
              } ${isVideoDragActive ? "bg-info/10 border-info" : "hover:bg-muted"}`}
            >
              <input {...getVideoInputProps()} />
              {isCreate && <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />}
              <p className={`font-bold text-muted-foreground ${isCreate ? "text-sm" : "text-xs"}`}>
                {isVideoDragActive ? "أفلت الفيديو هنا" : isCreate ? "اسحب فيديو أو انقر للاختيار" : "اسحب فيديو أو انقر"}
              </p>
            </div>
          )}
          {errors.video && <p className="text-xs font-semibold text-destructive mt-1">{errors.video}</p>}
          {!errors.video && (
            <div className="mt-2 border-r-4 border-info/60 bg-info/5 px-3 py-2 rounded-md">
              <p className="text-xs leading-relaxed">
                <span className="font-extrabold">نصيحة: </span>
                <span className="text-muted-foreground">
                  فيديو تعريفي قصير بشرح مختصر للفكرة — صياغة جيدة تجذب الانتباه وتزيد فرص القبول.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
