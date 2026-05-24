"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarClock, MapPin, FileText, Send, CheckCircle2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { Button, Input, Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface ScheduleMeetingButtonProps {
  studentId: Id<"users">;
  applicationId?: Id<"applications">;
  studentName?: string | null;
}

/**
 * Button + dialog the supervisor uses to send a student a meeting
 * invitation at any time. Not tied to sponsor-interest flow — supervisors
 * can drop this in wherever they need it (currently the application review
 * page, but the prop shape lets us reuse anywhere we know the studentId).
 */
export default function ScheduleMeetingButton({
  studentId,
  applicationId,
  studentName,
}: ScheduleMeetingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ds-card-interactive w-full p-4 flex items-center gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <CalendarClock className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-sm">إرسال موعد لقاء</span>
          <span className="block text-xs text-muted-foreground">
            حدّد للطالب وقت ومكان للقاء حضوري أو افتراضي
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="إرسال موعد لقاء"
          description={
            studentName ? `الطالب: ${studentName}` : undefined
          }
          className="max-w-md"
        >
          <MeetingForm
            studentId={studentId}
            applicationId={applicationId}
            onDone={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function MeetingForm({
  studentId,
  applicationId,
  onDone,
}: {
  studentId: Id<"users">;
  applicationId?: Id<"applications">;
  onDone: () => void;
}) {
  const scheduleMeeting = useMutation(api.meetings.scheduleMeeting);
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    setError(null);
    if (!date || !time) {
      setError("اختر التاريخ والوقت");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`).getTime();
    if (!Number.isFinite(scheduledAt)) {
      setError("تاريخ غير صالح");
      return;
    }
    if (scheduledAt < Date.now()) {
      setError("الوقت يجب أن يكون مستقبلياً");
      return;
    }
    setBusy(true);
    try {
      await scheduleMeeting({
        studentId,
        applicationId,
        scheduledAt,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(onDone, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال الموعد");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-success">
        <CheckCircle2 className="w-12 h-12" />
        <p className="font-extrabold">تم إرسال الموعد للطالب</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" />
            التاريخ
          </label>
          <Input
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={defaultDate()}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">الوقت</label>
          <Input
            type="time"
            fullWidth
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          المكان أو الرابط
        </label>
        <Input
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="مثال: مكتب الكلية الطابق الثاني — أو رابط Zoom"
        />
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          ملاحظات (اختياري)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="جدول الأعمال، ما يجب إحضاره، ..."
          className="w-full min-h-[90px] rounded-lg border border-foreground/15 bg-background p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          maxLength={1000}
        />
      </div>

      {error && <p className="text-xs font-bold text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button onPress={onDone} variant="outline" size="sm" isDisabled={busy}>
          إلغاء
        </Button>
        <Button
          onPress={() => void submit()}
          variant="secondary"
          size="sm"
          isDisabled={busy}
        >
          {busy ? <Spinner size="sm" color="current" /> : <Send className="w-4 h-4" />}
          إرسال للطالب
        </Button>
      </div>
    </div>
  );
}

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate());
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
