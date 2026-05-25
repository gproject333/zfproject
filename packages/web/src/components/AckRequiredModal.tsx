"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Doc } from "@smart-zuj/convex";
import { Button, Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface AckRequiredModalProps {
  notification: Doc<"notifications"> | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Confirmation modal for ack-required notifications. Opens when the user
 * clicks an unacked notification flagged `requireAck=true`. "فهمت" calls
 * `acknowledgeNotification` which sets both `read` and `ackedAt`, so the
 * badge and the unread count clear at the same time. Idempotent — clicking
 * again on an already-acked row just closes the modal.
 */
export default function AckRequiredModal({
  notification,
  open,
  onClose,
}: AckRequiredModalProps) {
  const acknowledge = useMutation(api.notifications.acknowledgeNotification);
  const [busy, setBusy] = useState(false);

  if (!notification) return null;
  const alreadyAcked = notification.ackedAt !== undefined;

  const handleAck = async () => {
    if (alreadyAcked) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await acknowledge({ id: notification._id });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent title={notification.title} className="max-w-md">
        <div className="flex items-start gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </span>
          <p className="text-sm text-foreground/85 font-medium leading-relaxed pt-1">
            {notification.message}
          </p>
        </div>
        <Button
          onPress={handleAck}
          isDisabled={busy}
          variant="primary"
          fullWidth
        >
          {busy ? (
            <Spinner size="sm" color="current" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {alreadyAcked ? "تمّ التأكيد" : "تمّ الاطّلاع"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
