"use client";

import { type ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Short bold title, shown next to the icon. */
  title: string;
  /** Smaller gray text shown under the title. */
  description?: string;
  /** Optional leading icon — e.g. <CheckCircle2 className="w-6 h-6 text-success" />. */
  icon?: ReactNode;
  /** Destructive confirm button (red). Defaults to the accent color. */
  destructive?: boolean;
  /** Label on the confirm button. Defaults to "تأكيد". */
  confirmLabel?: string;
  /** Label on the cancel button. Defaults to "إلغاء". */
  cancelLabel?: string;
  /** When true, show a <textarea> and require/pass it back in onConfirm(notes). */
  withNotes?: boolean;
  /** When true AND withNotes is true, block confirm until the textarea is non-empty. */
  notesRequired?: boolean;
  /** Placeholder for the notes textarea. */
  notesPlaceholder?: string;
  /** Max length on the notes textarea — defaults to 2000 to match backend cap. */
  notesMaxLength?: number;
  /** Disable the confirm button while the caller's mutation is pending. */
  isSubmitting?: boolean;
  /** Invoked when the user confirms. If withNotes is true, the textarea value is passed. */
  onConfirm: (notes?: string) => void;
}

/**
 * Generic confirm modal built on the existing Dialog primitive. Used by
 * supervisor quick actions and bulk actions — anywhere you need a
 * "title / description / optional reason / confirm" flow.
 *
 * Local state resets whenever the dialog closes so reusing the same
 * instance for different actions does not leak notes between opens.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  destructive = false,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  withNotes = false,
  notesRequired = false,
  notesPlaceholder = "اكتب السبب أو الملاحظة...",
  notesMaxLength = 2000,
  isSubmitting = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * Inner content is its own component so its useState resets every
       * time the dialog opens — Radix unmounts the Portal contents when
       * `open` is false, so a fresh ConfirmDialogBody instance (with an
       * empty notes state) is created on every open. No useEffect needed.
       */}
      {open && (
        <ConfirmDialogBody
          title={title}
          description={description}
          icon={icon}
          destructive={destructive}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          withNotes={withNotes}
          notesRequired={notesRequired}
          notesPlaceholder={notesPlaceholder}
          notesMaxLength={notesMaxLength}
          isSubmitting={isSubmitting}
          onConfirm={onConfirm}
        />
      )}
    </Dialog>
  );
}

type ConfirmDialogBodyProps = Omit<ConfirmDialogProps, "open" | "onOpenChange">;

function ConfirmDialogBody({
  title,
  description,
  icon,
  destructive = false,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  withNotes = false,
  notesRequired = false,
  notesPlaceholder = "اكتب السبب أو الملاحظة...",
  notesMaxLength = 2000,
  isSubmitting = false,
  onConfirm,
}: ConfirmDialogBodyProps) {
  const [notes, setNotes] = useState("");

  const canConfirm = !isSubmitting && (!withNotes || !notesRequired || notes.trim().length > 0);

  return (
    <DialogContent showClose={false}>
        <div className="flex items-start gap-3 mb-4">
          {icon && (
            <div
              className={`w-12 h-12 nb-border rounded-xl flex items-center justify-center shrink-0 ${
                destructive ? "bg-destructive/10" : "bg-accent/10"
              }`}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-extrabold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>

        {withNotes && (
          <div className="mb-4">
            <label
              htmlFor="confirm-dialog-notes"
              className="block text-xs font-bold text-muted-foreground mb-1"
            >
              {notesRequired ? "السبب (مطلوب)" : "ملاحظة (اختياري)"}
            </label>
            <textarea
              id="confirm-dialog-notes"
              className="nb-input w-full min-h-[100px]"
              placeholder={notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={notesMaxLength}
              aria-describedby="confirm-dialog-notes-count"
              autoFocus
            />
            <p
              id="confirm-dialog-notes-count"
              className="text-xs text-muted-foreground mt-1 text-left"
              aria-live="polite"
            >
              {notes.length} / {notesMaxLength}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <DialogClose asChild>
            <button className="nb-btn nb-btn-outline flex-1" disabled={isSubmitting}>
              {cancelLabel}
            </button>
          </DialogClose>
          <Button
            onPress={() => onConfirm(withNotes ? notes : undefined)}
            isDisabled={!canConfirm}
            variant={destructive ? "danger" : "primary"}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
  );
}
