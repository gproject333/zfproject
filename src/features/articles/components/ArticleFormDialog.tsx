"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import MarkdownToolbar from "@/components/ui/MarkdownToolbar";
import type { ArticleAudience, ArticleFormState } from "../hooks/useArticleAdmin";

interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  saving: boolean;
  formError: string | null;
  formState: ArticleFormState;
  setFormField: <K extends keyof ArticleFormState>(
    field: K,
    value: ArticleFormState[K],
  ) => void;
  onSubmit: () => void;
}

/**
 * Supervisor-facing create/edit dialog for articles. Wraps the
 * existing shared Dialog, Select, and MarkdownToolbar primitives.
 */
export default function ArticleFormDialog({
  open,
  onOpenChange,
  editing,
  saving,
  formError,
  formState,
  setFormField,
  onSubmit,
}: ArticleFormDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const previewSrc =
    (formState.coverFile &&
      typeof window !== "undefined" &&
      URL.createObjectURL(formState.coverFile)) ||
    formState.existingCoverUrl ||
    null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={editing ? "تعديل المقالة" : "مقالة جديدة"}
        className="!max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label className="text-xs font-extrabold mb-1 block">العنوان *</label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => setFormField("title", e.target.value)}
              className="nb-input text-sm"
              placeholder="عنوان المقالة"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs font-extrabold mb-1 block">
              الملخص (اختياري)
            </label>
            <input
              type="text"
              value={formState.summary}
              onChange={(e) => setFormField("summary", e.target.value)}
              className="nb-input text-sm"
              placeholder="جملة مختصرة تظهر في بطاقة المعاينة"
            />
          </div>

          {/* Body (markdown) */}
          <div>
            <label className="text-xs font-extrabold mb-1 block">
              المحتوى (Markdown) *
            </label>
            <MarkdownToolbar
              textareaRef={textareaRef}
              value={formState.body}
              onChange={(v) => setFormField("body", v)}
            />
            <textarea
              ref={textareaRef}
              value={formState.body}
              onChange={(e) => setFormField("body", e.target.value)}
              className="nb-input text-sm min-h-56 font-mono"
              placeholder="اكتب المحتوى بصيغة Markdown..."
              required
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="text-xs font-extrabold mb-1 block">
              صورة الغلاف (اختيارية)
            </label>
            <div className="flex items-center gap-3">
              <label className="nb-btn nb-btn-outline text-xs py-2 px-3 cursor-pointer">
                <Upload className="w-4 h-4" />
                {formState.coverFile ? "تغيير" : "رفع صورة"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormField("coverFile", e.target.files?.[0] ?? null)
                  }
                />
              </label>
              {previewSrc && (
                <div className="relative w-24 h-16 nb-border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  {formState.coverFile && (
                    <button
                      type="button"
                      onClick={() => setFormField("coverFile", null)}
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      aria-label="إزالة الصورة"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-extrabold mb-1 block">
              الوسوم (افصل بفاصلة)
            </label>
            <input
              type="text"
              value={formState.tagsInput}
              onChange={(e) => setFormField("tagsInput", e.target.value)}
              className="nb-input text-sm"
              placeholder="ريادة, تقنية, دليل"
            />
          </div>

          {/* Audience + Publish */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold mb-1 block">الجمهور</label>
              <Select
                value={formState.audience}
                onValueChange={(v) =>
                  setFormField("audience", v as ArticleAudience)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">الطلاب</SelectItem>
                  <SelectItem value="supervisor">المشرفون</SelectItem>
                  <SelectItem value="all">الجميع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-extrabold mb-1 block">الحالة</label>
              <label className="nb-border rounded-lg px-3 py-2.5 flex items-center gap-2 text-sm font-bold bg-card cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.isPublished}
                  onChange={(e) =>
                    setFormField("isPublished", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                منشورة
              </label>
            </div>
          </div>

          {formError && (
            <div className="nb-border border-destructive bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm font-bold">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="nb-btn nb-btn-outline text-sm"
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="nb-btn nb-btn-primary text-sm"
              disabled={saving}
            >
              {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "نشر المقالة"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
