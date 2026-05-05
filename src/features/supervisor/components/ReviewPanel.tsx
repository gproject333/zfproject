"use client";

import { useRef } from "react";
import {ShieldCheck, Send} from "lucide-react";
import type { useReview, SupervisorStatus, SupervisorRating } from "@/features/supervisor/hooks/useReview";
import {
  SUPERVISOR_STATUS_KEYS,
  STATUS_LABELS,
} from "../../../../convex/lib/statuses";
import { RATING_CONFIG, RATING_KEYS } from "@/lib/configs/application";
import MarkdownToolbar from "@/components/ui/MarkdownToolbar";
import { Button, TextArea, Spinner} from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";

type ReviewState = ReturnType<typeof useReview>;

interface ReviewPanelProps {
  review: ReviewState;
  onSaved: () => void;
}

const STATUS_EMOJI: Record<SupervisorStatus, string> = {
  under_review: "👀",
  needs_modification: "⚠️",
  accepted: "✅",
  rejected: "❌",
};

/**
 * Right-column "لوحة التقييم" card. Status / supervisor rating / notes inputs
 * plus the save button. Stateless — all state lives in the useReview hook.
 */
export default function ReviewPanel({ review, onSaved }: ReviewPanelProps) {
  const {
    status,
    setStatus,
    rating,
    setRating,
    notes,
    setNotes,
    isSubmitting,
    isDirty,
    handleUpdate,
  } = review;

  const notesRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="nb-card p-5 border-accent border-[3px] bg-accent/5">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-accent-foreground">
        <ShieldCheck className="w-5 h-5 text-accent" />
        لوحة التقييم
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="review-status" className="block text-sm font-bold mb-2">
            حالة الطلب
          </label>
          <Select
            value={status ?? ""}
            onValueChange={(v) => setStatus((v as SupervisorStatus) || null)}
          >
            <SelectTrigger aria-labelledby="review-status">
              <SelectValue placeholder="اختر الحركة..." />
            </SelectTrigger>
            <SelectContent>
              {SUPERVISOR_STATUS_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_LABELS[key]} {STATUS_EMOJI[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="review-rating" className="block text-sm font-bold mb-2">
            تقييم المشرف
          </label>
          <Select
            value={rating ?? "none"}
            onValueChange={(v) => setRating(v === "none" ? null : (v as SupervisorRating))}
          >
            <SelectTrigger aria-labelledby="review-rating">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون تقييم</SelectItem>
              {RATING_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {RATING_CONFIG[key].selectLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="review-notes" className="block text-sm font-bold mb-2">
            ملاحظات لفريق العمل
          </label>
          <MarkdownToolbar
            textareaRef={notesRef}
            value={notes}
            onChange={setNotes}
          />
          <TextArea
            ref={notesRef}
            id="review-notes"
            fullWidth
            className="min-h-[120px] bg-card"
            placeholder="اكتب ملاحظاتك للطالب (ستظهر له في تفاصيل الطلب)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            aria-describedby="review-notes-count review-notes-help"
          />
          <p id="review-notes-help" className="text-xs text-muted-foreground mt-1">
            يدعم Markdown — استخدم الأزرار أعلاه أو اكتب الصياغة مباشرة
          </p>
          <p
            id="review-notes-count"
            className="text-xs text-muted-foreground mt-1 text-left"
            aria-live="polite"
          >
            {notes.length} / 2000
          </p>
        </div>

        {!isDirty ? (
          <Tooltip content="لا تغييرات للحفظ">
            <Button
              variant="primary"
              fullWidth
              onPress={() => void handleUpdate(onSaved)}
              isDisabled={isSubmitting || !status || !isDirty}
            >
              {isSubmitting ? <Spinner size="sm" color="current" /> : <Send className="w-5 h-5" />}
              حفظ وإرسال إشعار
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onPress={() => void handleUpdate(onSaved)}
            isDisabled={isSubmitting || !status}
          >
            {isSubmitting ? <Spinner size="sm" color="current" /> : <Send className="w-5 h-5" />}
            حفظ وإرسال إشعار
          </Button>
        )}
      </div>
    </div>
  );
}
